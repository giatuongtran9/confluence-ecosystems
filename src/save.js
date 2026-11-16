// Versioned save. The run is stored in one envelope, { version, run }. When the envelope's shape changes, bump
// SAVE_VERSION and add MIGRATIONS[old] (old envelope -> next one), so existing runs upgrade instead of being wiped.
// Pure functions over a Storage-like object, so tests can drive them with a Map.
export const SAVE_KEY = 'confluence-save', SAVE_VERSION = 1;
export const LEGACY_KEY = 'confluence-run-v5', CORRUPT_KEY = 'confluence-save-corrupt';
const RUN_VERSION = 5; // engine run format (Game.newRun); older runs are incompatible
const MIGRATIONS = {};

const parse = raw => { if (raw == null) return null; try { return JSON.parse(raw) } catch { return undefined } }; // undefined: corrupt

export function writeSave(storage, run) {
  storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, run }));
}

// -> { run, reset }: reset is true when a saved run had to be discarded (the UI tells the player once).
export function loadSave(storage, Game) {
  let reset = false;
  const quarantine = raw => { try { storage.setItem(CORRUPT_KEY, raw) } catch {} storage.removeItem(SAVE_KEY); reset = true; }; // keep the bytes
  try {
    // Saves and meta-progression from before run version 5 are gone; clear them once.
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
    for (const k of keys) if (k && k !== LEGACY_KEY && /^confluence-(run|meta|save-reset)-/.test(k)) { if (k.startsWith('confluence-run-')) reset = true; storage.removeItem(k); }

    const raw = storage.getItem(SAVE_KEY);
    let save = parse(raw);
    if (save === undefined || (save && typeof save !== 'object')) { quarantine(raw); save = null; }
    if (!save) {                                                   // the pre-envelope save: a bare run under its own key
      const legacy = parse(storage.getItem(LEGACY_KEY));
      storage.removeItem(LEGACY_KEY);
      if (legacy) { save = { version: 1, run: legacy }; writeSave(storage, legacy); }
    }
    if (!save) return { run: null, reset };
    if (save.version > SAVE_VERSION) return { run: null, reset: false }; // written by a newer build: leave it untouched
    while (save && save.version < SAVE_VERSION) save = MIGRATIONS[save.version]?.(save) ?? null;
    const run = save?.run;
    if (!run || typeof run !== 'object' || run.version !== RUN_VERSION) { storage.removeItem(SAVE_KEY); return { run: null, reset: true }; }
    try { if (Game.migrateRun(run)) writeSave(storage, run); } catch { quarantine(storage.getItem(SAVE_KEY)); return { run: null, reset }; }
    return { run, reset };
  } catch { return { run: null, reset }; } // storage unavailable (private mode, blocked cookies)
}
