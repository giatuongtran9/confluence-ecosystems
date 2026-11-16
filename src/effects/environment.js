import { additiveGlow, burstImpact, emitParticle, hash01 } from './core.js';
import { fxTime, onceEach, softPuff } from './elements.js';
import { enemyPt, ringTile } from './formation-ink.js';
import { rdDecal } from './mythic.js';
import { S } from '../state.js';

// ==== Realism layer for the Bloodline + Arcane Mythic channels and ultimates ====
// Environment: the whole board reacts (storm, wind, toxin, fire, gold light, steam, mud, frost).
// Impact: renderer camera shake, flashes, debris, smoke, and ground decals (scorch, cracks, frost, mud, toxin).
export const VFX_SHAKE = { ttl: 0, max: 0.25, mag: 0, x: null, y: null };
export function vfxShake(mag, gx = null, gy = null, ttl = 0.22) { if (mag >= VFX_SHAKE.mag * (VFX_SHAKE.ttl / (VFX_SHAKE.max || 1))) { VFX_SHAKE.ttl = ttl; VFX_SHAKE.max = ttl; VFX_SHAKE.mag = mag; VFX_SHAKE.x = gx; VFX_SHAKE.y = gy; } }
export function smoke(x, y, n, rgb = '68, 64, 60', scale = 1) {
  for (let i = 0; i < n; i++) emitParticle(1, x + (Math.random() - 0.5) * 16 * scale, y, (Math.random() - 0.5) * 30, -30 - Math.random() * 40, 0.9 + Math.random() * 0.6, (8 + Math.random() * 8) * scale, `rgb(${rgb})`);
}
// Ground decals: drawn in the ground pass under the runners and faded out over their life.
export const DECALS = [];
export function addDecal(kind, x, y, s = 1, life = 3) { if (DECALS.length > 80) DECALS.shift(); DECALS.push({ kind, x, y, s, life, born: S.battle.time, owner: S.battle, seed: Math.random() * 100 }); }
export function drawDecals(ctx, size) {
  const time = S.battle.time;
  for (let i = DECALS.length - 1; i >= 0; i--) { const d = DECALS[i]; if (d.owner !== S.battle || time - d.born > d.life || time < d.born) DECALS.splice(i, 1); }
  for (const d of DECALS) {
    const age = time - d.born, a = Math.min(1, age / 0.08) * Math.min(1, (d.life - age) / Math.min(1, d.life * 0.4)), s = d.s;
    ctx.save();
    if (d.kind === 'flash') { ctx.restore(); additiveGlow(ctx, d.x, d.y, 60 * s, d.rgb || '255, 255, 255', 0.8 * (1 - age / d.life)); continue; }
    if (d.kind === 'scorch') {
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 26 * s); g.addColorStop(0, `rgba(20, 12, 8, ${0.6 * a})`); g.addColorStop(1, 'rgba(20, 12, 8, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(d.x, d.y, 26 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
      if (age < 1.2) { ctx.restore(); additiveGlow(ctx, d.x, d.y, 16 * s, '249, 115, 22', 0.5 * a * (1 - age / 1.2)); continue; }
    } else if (d.kind === 'crack' || d.kind === 'gold') {
      ctx.strokeStyle = `rgba(28, 25, 23, ${0.75 * a})`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) { let ang = hash01(d.seed + k) * 6.28, px = d.x, py = d.y; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 3; j++) { ang += (hash01(d.seed + k * 5 + j) - 0.5); px += Math.cos(ang) * 9 * s; py += Math.sin(ang) * 3.5 * s; ctx.lineTo(px, py); } ctx.stroke(); }
      if (d.kind === 'gold' && age < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(250, 204, 21, ${0.6 * (1 - age)})`; ctx.lineWidth = 1; ctx.stroke(); }
    } else if (d.kind === 'frost') {
      ctx.fillStyle = `rgba(224, 242, 254, ${0.35 * a})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, 24 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * a})`; ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) { const ang = k / 6 * 6.28 + d.seed; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(ang) * 20 * s, d.y + Math.sin(ang) * 7 * s); ctx.stroke(); }
    } else if (d.kind === 'icespike') {
      const rise = Math.min(1, age / 0.1);
      for (let k = 0; k < 5; k++) {
        const ox = (k - 2) * 7 * s, h = (22 + hash01(d.seed + k) * 22) * s * rise, lean = (k - 2) * 0.12;
        ctx.fillStyle = `rgba(186, 230, 253, ${0.8 * a})`; ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * a})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(d.x + ox - 4 * s, d.y + 4); ctx.lineTo(d.x + ox + lean * h, d.y + 4 - h); ctx.lineTo(d.x + ox + 4 * s, d.y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (d.kind === 'mud') {
      ctx.fillStyle = `rgba(74, 50, 24, ${0.6 * a})`;
      for (let k = 0; k < 5; k++) { const ang = hash01(d.seed + k) * 6.28, r = 8 + hash01(d.seed + k * 3) * 10; ctx.beginPath(); ctx.ellipse(d.x + Math.cos(ang) * r * s, d.y + Math.sin(ang) * r * 0.4 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (d.kind === 'toxic') {
      ctx.fillStyle = `rgba(20, 83, 45, ${0.45 * a})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, 28 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
    } else rdDecal(ctx, d, a, age);
    ctx.restore();
  }
}

// Environment overlays. a = 0..1 envelope.
export function drawEnvironment(ctx, size, kind, a) {
  if (!kind || a <= 0) return;
  const time = S.battle.time;
  ctx.save();
  if (kind === 'storm') {
    ctx.fillStyle = `rgba(8, 20, 45, ${0.32 * a})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(191, 219, 254, ${0.35 * a})`; ctx.lineWidth = 1; ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const x = (hash01(i) * (size + 80) + time * 140) % (size + 80) - 40, y = (hash01(i * 3.7) * size + time * 700) % size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 18); ctx.stroke(); }
    if (hash01(Math.floor(time * 3)) > 0.82) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(191, 219, 254, ${0.14 * a})`; ctx.fillRect(0, 0, size, size); }
  } else if (kind === 'wind') {
    ctx.fillStyle = `rgba(203, 213, 225, ${0.1 * a})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(241, 245, 249, ${0.35 * a})`; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const y = hash01(i * 2.3) * size, x = (hash01(i) * (size + 200) + time * (500 + hash01(i) * 300)) % (size + 200) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 4, x + 60, y); ctx.stroke(); }
  } else if (kind === 'toxic') {
    const g = ctx.createLinearGradient(0, size, 0, 0); g.addColorStop(0, `rgba(20, 83, 45, ${0.35 * a})`); g.addColorStop(1, `rgba(20, 83, 45, ${0.08 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) { const ph = (time * 0.15 + hash01(i)) % 1; ctx.fillStyle = `rgba(134, 239, 172, ${0.35 * a * Math.sin(ph * Math.PI)})`; ctx.beginPath(); ctx.arc(hash01(i * 5) * size, size - ph * size, 2 + hash01(i * 7) * 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'fire') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(234, 88, 12, ${(0.09 + 0.03 * Math.sin(time * 17)) * a})`; ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, 0, size * 0.4); g.addColorStop(0, `rgba(28, 25, 23, ${0.35 * a})`); g.addColorStop(1, 'rgba(28, 25, 23, 0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size * 0.4);
    if (Math.random() < 0.8 * a) emitParticle(0, Math.random() * size, size * (0.6 + Math.random() * 0.4), (Math.random() - 0.5) * 20, -60 - Math.random() * 60, 1.2, 1.2, Math.random() < 0.5 ? '#fdba74' : '#fde047');
  } else if (kind === 'golden') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x = size * (0.1 + i * 0.2) + Math.sin(time * 0.5 + i) * 20, g = ctx.createLinearGradient(x, 0, x + 120, size);
      g.addColorStop(0, `rgba(253, 230, 138, ${0.14 * a})`); g.addColorStop(1, 'rgba(253, 230, 138, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 200, size); ctx.lineTo(x + 110, size); ctx.closePath(); ctx.fill();
    }
  } else if (kind === 'steam') {
    for (let i = 0; i < 7; i++) softPuff(ctx, (hash01(i) * size + time * 25) % (size + 160) - 80, hash01(i * 3) * size, 120, '226, 232, 240', 0.22 * a);
  } else if (kind === 'mud') {
    ctx.fillStyle = `rgba(66, 46, 20, ${0.16 * a})`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6; i++) { const ph = (time * 0.7 + hash01(i)) % 1, c = ringTile(Math.floor(hash01(i * 9 + Math.floor(time * 0.7 + hash01(i))) * 16), size); ctx.strokeStyle = `rgba(190, 242, 100, ${0.3 * a * (1 - ph)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 6 + ph * 26, 2 + ph * 9, 0, 0, Math.PI * 2); ctx.stroke(); }
  } else if (kind === 'frost') {
    ctx.fillStyle = `rgba(186, 230, 253, ${0.12 * a})`; ctx.fillRect(0, 0, size, size);
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72); g.addColorStop(0, 'rgba(240, 249, 255, 0)'); g.addColorStop(1, `rgba(240, 249, 255, ${0.45 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * a})`;
    for (let i = 0; i < 70; i++) { const x = (hash01(i) * size + time * 40 + Math.sin(time + i) * 10) % size, y = (hash01(i * 6.1) * size + time * 70) % size; ctx.beginPath(); ctx.arc(x, y, 1 + hash01(i * 2) * 1.4, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
export const CHANNEL_ENV = { 'azure-dragon': 'storm', 'white-tiger': 'wind', 'xuanwu-toxin': 'toxic', 'phoenix-inferno': 'fire', 'great-sage-staff': 'golden', magmaLord: 'fire', tempestArchon: 'fire', steamSovereign: 'steam', quagmireColossus: 'mud', blizzardArchon: 'frost' };
export const ULT_ENV = { 'azure-wrath': 'storm', 'tiger-roar': 'wind', 'xuanwu-lob': 'toxic', 'phoenix-inferno': 'fire', 'sage-staff': 'golden', 'magma-eruption': 'fire', 'fire-tornado': 'fire', 'steam-eruption': 'steam', 'mud-wave': 'mud', 'blizzard': 'frost' };
// Per-hit impact profile for each staggered ultimate.
export const ULT_IMPACT = {
  'azure-wrath': { shake: 4, flash: '191, 219, 254', decal: 'scorch', s: 0.8 },
  'tiger-roar': { shake: 1.5 },
  'magma-eruption': { shake: 3, flash: '253, 186, 116', decal: 'scorch', smoke: '41, 37, 36', s: 1 },
  'fire-tornado': { shake: 2, decal: 'scorch', smoke: '68, 64, 60', s: 0.8 },
  'mud-wave': { shake: 2, decal: 'mud', s: 1 },
  'blizzard': { shake: 2.5, flash: '224, 242, 254', decal: 'frost', spikes: true, s: 1 },
  'sage-staff': { shake: 0, decal: 'gold', s: 0.9 }
};
// Environment envelope and per-hit impacts for an ultimate effect; called by draw() before its drawer.
export function drawUltRealism(ctx, f, size) {
  const t = fxTime(f), env = ULT_ENV[f.type];
  if (env) drawEnvironment(ctx, size, env, Math.min(1, t / 0.15) * Math.min(1, f.ttl / 0.5));
  const prof = ULT_IMPACT[f.type], sch = f.schedule || {};
  if (prof && sch.hits) for (const h of sch.hits) {
    if (t < h.at) continue;
    onceEach(f, 'real' + h.uid, () => {
      const p = enemyPt(f, h.uid, size); if (!p) return;
      if (prof.shake) vfxShake(prof.shake);
      if (prof.flash) { addDecal('flash', p.x, p.y - 10, 0.8, 0.25); DECALS[DECALS.length - 1].rgb = prof.flash; }
      if (prof.decal) addDecal(prof.decal, p.x, p.y + 8, prof.s || 1, 3);
      if (prof.spikes) addDecal('icespike', p.x, p.y + 8, 1, 1.4);
      if (prof.smoke) smoke(p.x, p.y, 4, prof.smoke, 1);
      if (f.type !== 'tiger-roar') burstImpact(p.x, p.y + 6, 0, 2, 5, 0.8);
    });
  }
  if (f.type === 'sage-staff' && t >= (sch.impactAt || 0.55)) onceEach(f, 'realStaff', () => { vfxShake(8); for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); addDecal('gold', c.x, c.y + 8, 1.2, 3.5); smoke(c.x, c.y, 3, '120, 113, 108', 1.2); } });
  if (f.type === 'xuanwu-lob' && t >= (sch.landAt || 0.5)) onceEach(f, 'realLob', () => { vfxShake(3); for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); addDecal('toxic', c.x, c.y + 8, 1, 5.5); } });
  if (f.type === 'steam-eruption') onceEach(f, 'realSteam', () => vfxShake(3));
}
