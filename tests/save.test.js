'use strict';
// Versioned save envelope: legacy migration, corrupt-save quarantine, newer-build saves left untouched.
const test = require('node:test'), assert = require('node:assert/strict');
const G = require('../engine');
const { loadSave, writeSave, SAVE_KEY, SAVE_VERSION, LEGACY_KEY, CORRUPT_KEY } = require('../src/save.js');

const store = (entries = []) => {
  const values = new Map(entries);
  return { values, getItem: k => values.has(k) ? values.get(k) : null, get length() { return values.size }, key: i => [...values.keys()][i], removeItem: k => values.delete(k), setItem: (k, v) => values.set(k, String(v)) };
};

test('a round-trip keeps the run inside a versioned envelope', () => {
  const s = store(), run = G.newRun('none', 7);
  writeSave(s, run);
  assert.equal(JSON.parse(s.values.get(SAVE_KEY)).version, SAVE_VERSION);
  const loaded = loadSave(s, G);
  assert.equal(loaded.reset, false); assert.equal(loaded.run.seed, run.seed); assert.equal(loaded.run.leader, 'none');
});

test('the pre-envelope run key migrates once into the envelope', () => {
  const run = G.newRun('none', 3), s = store([[LEGACY_KEY, JSON.stringify(run)]]);
  const loaded = loadSave(s, G);
  assert.equal(loaded.run.seed, run.seed); assert.equal(loaded.reset, false);
  assert.equal(s.values.has(LEGACY_KEY), false); assert.equal(JSON.parse(s.values.get(SAVE_KEY)).run.seed, run.seed);
});

test('a corrupt save is quarantined, not lost, and the player is told', () => {
  const s = store([[SAVE_KEY, '{"version":1,"run":{trunc']]);
  const loaded = loadSave(s, G);
  assert.equal(loaded.run, null); assert.equal(loaded.reset, true);
  assert.equal(s.values.get(CORRUPT_KEY), '{"version":1,"run":{trunc'); assert.equal(s.values.has(SAVE_KEY), false);
});

test('a save from a newer build is left untouched', () => {
  const raw = JSON.stringify({ version: SAVE_VERSION + 1, run: { version: 9 } }), s = store([[SAVE_KEY, raw]]);
  const loaded = loadSave(s, G);
  assert.equal(loaded.run, null); assert.equal(loaded.reset, false); assert.equal(s.values.get(SAVE_KEY), raw);
});

test('an incompatible run format is cleared with a notice; unavailable storage does not throw', () => {
  const s = store([[SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, run: { version: 4 } })]]);
  assert.deepEqual(loadSave(s, G), { run: null, reset: true }); assert.equal(s.values.has(SAVE_KEY), false);
  const broken = { get length() { throw new Error('SecurityError') } };
  assert.deepEqual(loadSave(broken, G), { run: null, reset: false });
});
