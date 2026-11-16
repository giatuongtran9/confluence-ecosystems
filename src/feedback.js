// Tiered combat feedback: one event -> one consistent bundle, picked by tier.
//   small  = a normal hit:  3 sparks; the faintest shake (shake is trauma², so 0.1 trauma barely moves)
//   medium = a critical:    flash + ring + 9 sparks, light shake (no freeze)
//   large  = an ultimate:   flare + shock rings + 30 sparks, heavy shake (~8 px) with a punch-in, 50 ms hit-stop, screen flash
// Only ultimates freeze, and ultimates released
// within 0.5 s of a freeze share it.
// Renderer only: the camera, freezes and particles never change the simulation's results. Shake and freezes run on
// real time; screen flashes are capped at 3 per second. With the OS "reduce motion" setting, shake and flashes drop.
import { routePoint } from './battlefield.js';
import { RD_ULTS } from './effects/mythic.js';
import { vfxPaletteFor } from './effects/core.js';
import { CARD } from './lib.js';
import { VFX } from './vfx.js';

const TIER = {
  small:  { trauma: 0.10, cap: 0.10, stop: 0 },
  medium: { trauma: 0.20, cap: 0.50, stop: 0 },
  large:  { trauma: 0.75, cap: 1.00, stop: 0.05, gap: 0.5, flash: 0.55 },   // storyboards: 0.05 s hit-stop, ~8 px shake
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const cam = { trauma: 0, t: 0, stop: 0, lastStop: -1, flash: 0, flashRgb: '255, 255, 255', flashes: [], fx: 350, fy: 350 };
const now = () => performance.now() / 1000;

// Raise trauma by `amount`, but never past `cap` (small and medium events cannot build up into a heavy shake).
export function addTrauma(amount, cap = 1) { cam.trauma = Math.max(cam.trauma, Math.min(cap, cam.trauma + amount)); }

export function feedback(tier, x, y, rgb, hot) {
  const T = TIER[tier], t = now();
  addTrauma(T.trauma, T.cap);
  if (tier === 'large') { cam.fx = x; cam.fy = y; }
  if (T.stop && t - cam.lastStop > T.gap) { cam.stop = Math.max(cam.stop, T.stop); cam.lastStop = t; }
  if (T.flash && !reduceMotion.matches) {
    cam.flashes = cam.flashes.filter(s => t - s < 1);
    if (cam.flashes.length < 3) { cam.flashes.push(t); cam.flash = T.flash; cam.flashRgb = hot || rgb; }
  }
  VFX.burst(tier, x, y, rgb, hot);
}

// Called once per frame by the game loop: true while a freeze is running (the loop skips simulation steps).
export function frozen(realDt) { if (cam.stop <= 0) return false; cam.stop = Math.max(0, cam.stop - realDt); return true; }
export const isFrozen = () => cam.stop > 0;

// Camera shake + punch-in for this frame (inside the arena's ctx.save/restore). Summed sines, not per-frame noise.
export function applyCamera(ctx, realDt) {
  cam.trauma = Math.max(0, cam.trauma - 1.4 * realDt);
  cam.t += realDt;
  const s = cam.trauma * cam.trauma * (reduceMotion.matches ? 0.25 : 1);
  if (s < 0.002) return;
  const z = 1 + 0.035 * s;
  ctx.translate(cam.fx, cam.fy); ctx.scale(z, z); ctx.translate(-cam.fx, -cam.fy);
  ctx.translate(14 * s * Math.sin(cam.t * 51), 10 * s * Math.sin(cam.t * 69 + 1.3));
}

// Full-arena flash for ultimates, drawn after the camera transform is restored.
export function drawFlash(ctx, size, realDt) {
  if (cam.flash <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(${cam.flashRgb}, ${cam.flash * 0.32})`; ctx.fillRect(0, 0, size, size);
  ctx.restore();
  cam.flash = Math.max(0, cam.flash - realDt * 4);
}

// Colours: a Mythic's own palette when it has one, else its genre's.
const MYTHIC_TINT = {
  swordImmortal: ['92, 225, 230', '220, 255, 250'], melodicSaint: ['129, 140, 248', '253, 230, 138'], formationMaster: ['203, 213, 225', '255, 255, 255'],
  talismanSovereign: ['250, 204, 21', '255, 247, 210'], landscapeSage: ['110, 231, 183', '236, 253, 245'], soulReapingDemon: ['134, 239, 172', '240, 253, 244'],
  bloodFiendMaster: ['239, 68, 68', '254, 202, 202'], dragonCubApex: ['56, 189, 248', '224, 242, 254'], tigerCubApex: ['226, 232, 240', '255, 255, 255'],
  xuanwuCubApex: ['74, 222, 128', '220, 252, 231'], phoenixCubApex: ['251, 146, 60', '254, 240, 138'], monkeyCubApex: ['250, 204, 21', '254, 249, 195'],
  magmaLord: ['249, 115, 22', '254, 215, 170'], tempestArchon: ['251, 113, 133', '255, 228, 230'], steamSovereign: ['203, 213, 225', '255, 255, 255'],
  quagmireColossus: ['163, 230, 53', '236, 252, 203'], blizzardArchon: ['165, 243, 252', '255, 255, 255'], sandstormTitan: ['253, 186, 116', '255, 237, 213'],
};
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ');
const tintCache = new Map();
export function tintOf(id) {
  if (tintCache.has(id)) return tintCache.get(id);
  const rd = RD_ULTS[id], my = MYTHIC_TINT[id], pal = vfxPaletteFor(CARD[id]?.genre);
  const tint = rd ? { rgb: rd.rgb, hot: rd.hot } : my ? { rgb: my[0], hot: my[1] } : { rgb: hexRgb(pal.primary), hot: hexRgb(pal.trail) };
  tintCache.set(id, tint);
  return tint;
}

// Per battle: which effects already fired feedback, and who was channelling last frame.
const scan = { battle: null, seen: new WeakSet(), channel: new Map(), shake: null };
// These draw their own storyboarded charge (effects/storyboard.js); they still get the large release bundle.
const OWN_CHANNEL = new Set(['melodicSaint', 'bloodFiendMaster', 'soulReapingDemon', 'formationMaster', 'landscapeSage', 'vajraBody', 'bodhisattva']);

// Turns this frame's engine events into feedback, and draws the textured channel of every Mythic.
export function combatFeedback(ctx, b, size) {
  if (scan.battle !== b) { scan.battle = b; scan.seen = new WeakSet(); scan.channel = new Map(); scan.shake = null; }
  if (b.shake && b.shake !== scan.shake) { scan.shake = b.shake; addTrauma(Math.min(1, b.shake.mag / 10), 0.6); } // engine impact shakes join the one camera
  const byUid = new Map(b.units.map(u => [u.uid, u]));
  for (const f of b.effects || []) {
    if (scan.seen.has(f)) continue;
    const u = byUid.get(f.uid);
    if (f.type === 'impact' && f.crit) {                        // the moment a critical hit lands
      scan.seen.add(f);
      const p = routePoint(f.tx, f.ty, size), c = tintOf(u?.id);
      feedback('medium', p.x, p.y, c.rgb, c.hot);
    } else if (u && (f.text === '' || f.text === 'CRIT') && (f.tx !== f.x || f.ty !== f.y)) { // a basic attack: wait for it to arrive
      if (1 - f.ttl / (f.maxTtl || 1) < 0.55) continue;
      scan.seen.add(f);
      if (f.crit) continue;                                      // its critical 'impact' carries the feedback
      const p = routePoint(f.tx, f.ty, size), c = tintOf(u.id);
      feedback('small', p.x, p.y, c.rgb, c.hot);
    } else scan.seen.add(f);
  }
  const t = now();
  for (const u of b.units) {
    const ch = !u.removed && u.channeling && u.channeling.remaining > 0, was = scan.channel.get(u.uid);
    scan.channel.set(u.uid, ch);
    if (CARD[u.id]?.rarity !== 'Mythic') continue;
    const p = routePoint(u.x + 1, u.y + 1, size), c = tintOf(u.id);
    if (ch && !OWN_CHANNEL.has(u.id)) VFX.mythicChannel(ctx, p.x, p.y, c.rgb, c.hot, 1 - u.channeling.remaining / (u.channeling.duration || 1.2), t);
    if (was && !ch && !u.removed) feedback('large', p.x, p.y, c.rgb, c.hot); // the 10th attack is released
  }
}
