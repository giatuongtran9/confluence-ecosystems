import { routePoint } from '../battlefield.js';
import { NOTE_GLYPHS, additiveGlow, burstImpact, burstShatter, dimFocus, emitParticle, hash01, stampSwordTip, swordSprite } from './core.js';
import { Game } from '../lib.js';
import { S } from '../state.js';
import { VFX } from '../vfx.js';

// Gather (the 1.2s channel): board dims around the unit, a ring of swords forms pointing up and draws in.
export function drawSwordGather(ctx, cx, cy, prog, size) {
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25));
  additiveGlow(ctx, cx, cy, 50 + 46 * prog, '110, 231, 183', 0.22 + 0.55 * prog);
  const count = 12, radius = 76 - 36 * prog, lift = 6 + 14 * prog;
  for (let i = 0; i < count; i++) {
    const appear = Math.min(1, Math.max(0, (prog - (i / count) * 0.4) / 0.12));
    if (appear <= 0) continue;
    const a = (i / count) * Math.PI * 2 + prog * 1.6;
    const sx = cx + Math.cos(a) * radius, sy = cy + Math.sin(a) * radius * 0.45 - lift;
    const tremble = prog > 0.8 ? Math.sin(performance.now() * 0.09 + i * 1.7) * (prog - 0.8) * 10 : 0;
    // Pointing up, fanned slightly outward; swords behind the unit are drawn fainter
    const ang = -Math.PI / 2 + Math.cos(a) * 0.18;
    const depth = 0.65 + 0.35 * (Math.sin(a) + 1) / 2;
    stampSwordTip(ctx, sx + tremble, sy - 26, ang, 1.0, appear * depth, false);
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('⚡ VẠN KIẾM QUY TÔNG', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

function swordTorrentTarget(f, uid, size, fallback) {
  f._pos ??= {};
  const e = uid != null && S.battle.enemies.find(v => v.uid === uid && !v.gone && v.hp > 0);
  if (e) { const p = Game.track(e.p); f._pos[uid] = routePoint(p.x, p.y, size); }
  return f._pos[uid] || fallback;
}
export function nudgeEnemy(uid, dx, dy, squash) {
  const e = S.battle.enemies.find(v => v.uid === uid);
  if (!e) return;
  e.recoilX = (e.recoilX || 0) + dx; e.recoilY = (e.recoilY || 0) + dy;
  e.hitSquash = Math.max(e.hitSquash || 0, squash);
}
// Visual-only shockwave: runners near the impact snap away from it (no gameplay knockback).
function shockwavePush(x, y, size, radius, skipUid) {
  for (const e of S.battle.enemies) {
    if (e.gone || e.hp <= 0 || e.uid === skipUid) continue;
    const tp = Game.track(e.p), p = routePoint(tp.x, tp.y, size);
    const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
    if (d > radius) continue;
    const push = 16 * (1 - d / radius);
    nudgeEnemy(e.uid, (dx / d) * push, (dy / d) * push, 0.4 * (1 - d / radius));
  }
}
// Ground crack with jade light glowing inside it. glow 0..1 scales the inner light.
function drawGroundCrack(ctx, x, y, seed, alpha, glow, t) {
  if (alpha <= 0) return;
  const paths = [];
  for (let i = 0; i < 10; i++) {
    let a = (i / 10) * Math.PI * 2 + hash01(seed + i) * 0.5, px = x, py = y;
    const pts = [[px, py]], segs = 3 + Math.floor(hash01(seed + i * 7) * 3);
    for (let s = 0; s < segs; s++) {
      a += (hash01(seed + i * 13 + s) - 0.5) * 0.9;
      const step = 11 + hash01(seed + i * 17 + s) * 14;
      px += Math.cos(a) * step; py += Math.sin(a) * step * 0.42;
      pts.push([px, py]);
    }
    paths.push(pts);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  // Faint scorch only: this pass draws above the runners, so a dark disc would hide the target
  ctx.fillStyle = 'rgba(12, 10, 8, 0.28)';
  ctx.beginPath(); ctx.ellipse(x, y, 36, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#120d09'; ctx.lineWidth = 4;
  for (const pts of paths) { ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  if (glow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha * glow * (0.65 + 0.35 * Math.sin(t * 22));
    ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.6;
    for (const pts of paths) { ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  }
  ctx.restore();
  if (glow > 0) additiveGlow(ctx, x, y, 46, '52, 211, 153', 0.5 * glow * alpha);
}
// Lock-on sigil on the ground under the Colossal Sword: rotating rings and trigram ticks, squashed to the floor.
function drawLockSigil(ctx, x, y, prog, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.scale(1, 0.42);
  const r = 24 + 40 * prog;
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2); ctx.stroke();
  ctx.rotate(prog * 2.4);
  ctx.strokeStyle = '#ecfdf5';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74);
    ctx.lineTo(Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94);
    ctx.stroke();
  }
  ctx.restore();
}

// Rain waves: each later wave has more swords landing closer together, so the cadence speeds up.
const RAIN_WAVES = [{ n: 6, start: 0.15, span: 0.16 }, { n: 10, start: 0.34, span: 0.14 }, { n: 16, start: 0.5, span: 0.13 }];
const RAIN_DROPS = RAIN_WAVES.flatMap((w, wi) => Array.from({ length: w.n }, (_, i) => {
  const seed = wi * 97 + i * 7.3 + 5;
  return { key: 'w' + wi + '-' + i, tile: Math.floor(hash01(seed) * 16), at: w.start + w.span * Math.sqrt(i / (w.n - 1)), seed };
}));

export function drawSwordTorrent(ctx, f, size) {
  const t = (f.maxTtl || 2) - f.ttl;               // seconds since release, engine time
  const sch = f.schedule || { rain: [], colossalAt: 0.95, colossalUid: null };
  const origin = routePoint(f.x, f.y, size);
  f._landed ??= {};
  const impactAt = sch.colossalAt, hangAt = impactAt - 0.25, slamAt = impactAt - 0.1;
  const cp = swordTorrentTarget(f, sch.colossalUid, size, routePoint(f.tx, f.ty, size));
  const cGround = cp.y + 6;

  // Dim with the bright spot on the unit, sliding to the Colossal target while it hangs; lifts after impact
  const toTarget = Math.min(1, Math.max(0, (t - hangAt) / 0.2));
  const fx = origin.x + (cp.x - origin.x) * toTarget, fy = origin.y + (cGround - origin.y) * toTarget;
  dimFocus(ctx, size, fx, fy, t < impactAt ? 0.5 : 0.5 * Math.max(0, 1 - (t - impactAt) / 0.35));

  // Release: the ring swords shoot up off-screen with short trails
  if (t < 0.2) {
    const k = Math.min(1, t / 0.15), ease = k * k;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 1.6;
      const sx = origin.x + Math.cos(a) * 38, sy0 = origin.y + Math.sin(a) * 17 - 46;
      const sy = sy0 - ease * (sy0 + 80);
      ctx.strokeStyle = `rgba(110, 231, 183, ${0.6 * (1 - k * 0.5)})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(sx, Math.min(sy0, sy + 80)); ctx.lineTo(sx, sy); ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 1.6;
      const sx = origin.x + Math.cos(a) * 38, sy0 = origin.y + Math.sin(a) * 17 - 46;
      stampSwordTip(ctx, sx, sy0 - ease * (sy0 + 80), -Math.PI / 2, 1.0, 1 - k * 0.3, false);
    }
  }

  // Rain: one sword per enemy (timed to its damage) plus three waves over the track tiles
  const drops = [];
  for (const r of sch.rain) drops.push({ key: 'e' + r.uid, uid: r.uid, at: r.at, seed: r.uid * 3.7, enemy: true });
  for (const d of RAIN_DROPS) drops.push({ ...d, enemy: false });
  const FALL = 0.2;
  for (const d of drops) {
    if (t < d.at - FALL) continue;
    let p;
    if (d.enemy) p = swordTorrentTarget(f, d.uid, size, null);
    else { const tp = Game.track(d.tile + 0.5); p = routePoint(tp.x, tp.y, size); }
    if (!p) continue;
    const jx = (hash01(d.seed + 0.5) - 0.5) * (d.enemy ? 14 : 40), jy = (hash01(d.seed + 1) - 0.5) * (d.enemy ? 8 : 22);
    const gx = p.x + jx, gy = p.y + jy + (d.enemy ? 4 : 0);
    const lean = (hash01(d.seed + 2) - 0.5) * 0.5;                    // angle variation
    const k = d.enemy ? 1.15 + hash01(d.seed + 3) * 0.15 : 0.95 + hash01(d.seed + 3) * 0.3; // size variation
    const ang = Math.PI / 2 + lean;
    const sx = gx - Math.cos(ang) * 280, sy = gy - Math.sin(ang) * 280;
    if (t < d.at) {
      const q = (t - (d.at - FALL)) / FALL, e2 = q * q;            // accelerating fall
      const tx = sx + (gx - sx) * e2, ty = sy + (gy - sy) * e2;
      ctx.save();                                                   // ground shadow grows as it nears
      ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + 0.32 * q})`;
      ctx.beginPath(); ctx.ellipse(gx, gy + 2, 3 + 10 * q * k, (1.5 + 3.8 * q) * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(110, 231, 183, ${0.25 + 0.45 * q})`;
      ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round';
      const trail = 34 + 70 * q;
      ctx.beginPath();
      ctx.moveTo(tx - Math.cos(ang) * (trail + 30 * k), ty - Math.sin(ang) * (trail + 30 * k));
      ctx.lineTo(tx - Math.cos(ang) * 20 * k, ty - Math.sin(ang) * 20 * k);
      ctx.stroke();
      ctx.restore();
      stampSwordTip(ctx, tx, ty, ang, k, 1, false);
      continue;
    }
    if (!f._landed[d.key]) {
      f._landed[d.key] = true;
      if (d.enemy) { burstImpact(gx, gy, 9, 4, 3, 1); nudgeEnemy(d.uid, Math.cos(ang) * 4, 5, 0.35); }
      else burstImpact(gx, gy, 4, 1, 1, 0.8);
    }
    // Stuck in the ground until it shatters into jade shards near the end of the linger
    const shatterAt = 1.3 + hash01(d.seed + 4) * 0.4;
    if (t >= shatterAt) {
      if (!f._landed[d.key + 'x']) { f._landed[d.key + 'x'] = true; burstShatter(gx, gy, ang, swordSprite(false).len * k * 0.7, d.enemy ? 8 : 5); }
      continue;
    }
    const since = t - d.at;
    additiveGlow(ctx, gx, gy, 20 * k, '110, 231, 183', since < 0.15 ? 0.75 : 0.35);
    if (since < 0.25) {
      const rq = since / 0.25;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(167, 243, 208, ${(1 - rq) * 0.8})`;
      ctx.lineWidth = 2 * (1 - rq);
      ctx.beginPath(); ctx.ellipse(gx, gy, 4 + rq * 22, 2 + rq * 9, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    stampSwordTip(ctx, gx, gy, ang, k, 1, false, 0.28);
  }

  // Colossal Sword: lock-on sigil, hangs high above the target, slams, cracks the ground, then shatters
  if (t >= hangAt) {
    const high = Math.max(cGround - 330, Math.min(cGround - 90, 70)); // stay on the board for top-row targets
    let tipY;
    if (t < slamAt) tipY = high + ((t - hangAt) / (slamAt - hangAt)) * 8;   // nearly still
    else if (t < impactAt) { const q = (t - slamAt) / (impactAt - slamAt); tipY = high + 8 + (cGround - high - 8) * q * q * q; }
    else tipY = cGround;
    const inA = Math.min(1, (t - hangAt) / 0.06);
    const near = Math.min(1, Math.max(0, (tipY - high) / Math.max(1, cGround - high)));
    const sigilProg = Math.min(1, (t - hangAt) / (impactAt - hangAt));
    drawLockSigil(ctx, cp.x, cGround, sigilProg, t < impactAt ? inA * 0.9 : 0.9 * Math.max(0, 1 - (t - impactAt) / 0.3));
    if (t < impactAt) {
      ctx.save();                                                         // shadow spreads as it falls
      ctx.fillStyle = `rgba(0, 0, 0, ${0.18 + 0.45 * near})`;
      ctx.beginPath(); ctx.ellipse(cp.x, cGround + 2, 14 + 44 * Math.max(near, sigilProg * 0.5), 5 + 15 * Math.max(near, sigilProg * 0.5), 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      additiveGlow(ctx, cp.x, cGround, 50, '110, 231, 183', 0.3 * inA);
    }
    const shatterAt = 1.75;
    if (t >= impactAt) {
      if (!f._landed.colossal) {
        f._landed.colossal = true;
        burstImpact(cp.x, cGround, 30, 16, 40, 1.5);
        nudgeEnemy(sch.colossalUid, 0, 14, 0.7);
        shockwavePush(cp.x, cGround, size, 190, sch.colossalUid);
      }
      const crackFade = t > 1.5 ? Math.max(0, 1 - (t - 1.5) / 0.5) : 1;
      drawGroundCrack(ctx, cp.x, cGround, (sch.colossalUid || 1) * 5.3, crackFade, t < shatterAt ? 1 : 0.4, t);
      const since = t - impactAt;
      for (let r = 0; r < 3; r++) {                                       // shockwave rings
        const rq = Math.min(1, Math.max(0, (since - r * 0.06) / 0.4));
        if (rq <= 0 || rq >= 1) continue;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = r === 0 ? `rgba(236, 253, 245, ${(1 - rq) * 0.9})` : `rgba(110, 231, 183, ${(1 - rq) * 0.7})`;
        ctx.lineWidth = (5 - r) * (1 - rq);
        ctx.beginPath(); ctx.ellipse(cp.x, cGround, 12 + rq * 165, 5 + rq * 64, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (t < shatterAt) additiveGlow(ctx, cp.x, cGround - 50, 90, '167, 243, 208', 0.4);
    }
    if (t < shatterAt) stampSwordTip(ctx, cp.x, tipY, Math.PI / 2, 1, inA, true, t >= impactAt ? 0.12 : 0);
    else if (!f._landed.colossalShatter) {
      f._landed.colossalShatter = true;
      burstShatter(cp.x, cGround, Math.PI / 2, swordSprite(true).len * 0.85, 40);
      additiveGlow(ctx, cp.x, cGround - 60, 110, '167, 243, 208', 0.6);
    }
    if (t >= impactAt && t < impactAt + 0.12) {                           // short radial flash at the impact
      const a = 1 - (t - impactAt) / 0.12;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const r = 300 * (0.75 + 0.25 * (1 - a));
      const g = ctx.createRadialGradient(cp.x, cGround, 0, cp.x, cGround, r);
      g.addColorStop(0, `rgba(255, 255, 255, ${a})`);
      g.addColorStop(0.25, `rgba(167, 243, 208, ${0.6 * a})`);
      g.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = `rgba(110, 231, 183, ${0.1 * a})`;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
  }
}
// Big gold number for the Colossal hit: pops in, then rises slowly.
export function drawColossalNumber(ctx, x, y, f) {
  const age = (f.maxTtl || 1.1) - f.ttl;
  const pop = age < 0.12 ? 1.7 - 0.7 * (age / 0.12) : 1;
  const alpha = f.ttl < 0.3 ? f.ttl / 0.3 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y - 74 - age * 30);
  ctx.scale(pop, pop);
  ctx.font = '900 34px Cinzel, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a1205';
  ctx.lineWidth = 7;
  ctx.strokeText(f.text, 0, 0);
  const g = ctx.createLinearGradient(0, -16, 0, 16);
  g.addColorStop(0, '#fffbe0');
  g.addColorStop(0.5, '#fde68a');
  g.addColorStop(1, '#f59e0b');
  ctx.fillStyle = g;
  ctx.fillText(f.text, 0, 0);
  ctx.restore();
}

// ---- Melodic Saint · Celestial Resonance (Thiên Lãi Cộng Hưởng) ----
// Gather: seven guqin strings vibrate harder as the 1.2s channel fills, sound rings contract, notes orbit.
// Release (seconds after channel end, engine time; see engine melodic-resonance branch): 0–0.12 pluck,
// then a sound wave spreads at schedule.waveSpeed tiles/s. Each enemy is hit and stunned when the wave
// reaches it; notes circle its head while the 1.5s stun lasts.
const MELODIC_RGB = '129, 140, 248', MELODIC_CORE = '199, 210, 254';
function guqinStrings(ctx, cx, cy, width, amp, alpha, time, snap = 0) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let s = 0; s < 7; s++) {
    const y0 = cy + 14 + (s - 3) * 6.5;
    const freq = 26 + s * 5;                               // higher strings vibrate faster
    const a = amp * (0.6 + 0.4 * Math.sin(time * 3 + s));
    ctx.strokeStyle = s % 3 === 0 ? `rgba(${MELODIC_CORE}, ${alpha})` : `rgba(${MELODIC_RGB}, ${alpha * 0.85})`;
    ctx.lineWidth = 1.2 + snap * 0.7;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, x = cx - width / 2 + u * width;
      const bow = -Math.sin(u * Math.PI) * 6;              // strings arc gently between the bridges
      const vib = Math.sin(u * Math.PI) * a * Math.sin(time * freq + u * 9 + s);
      if (i) ctx.lineTo(x, y0 + bow + vib); else ctx.moveTo(x, y0 + bow + vib);
    }
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(${MELODIC_CORE}, ${alpha})`;      // bridges at both ends
  ctx.fillRect(cx - width / 2 - 2, cy - 8, 3, 44);
  ctx.fillRect(cx + width / 2 - 1, cy - 8, 3, 44);
  ctx.restore();
}
function drawNoteGlyphs(ctx, pts, alpha) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.font = '700 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [x, y, glyph, color, a] of pts) {
    ctx.globalAlpha = Math.min(1, alpha * a);
    ctx.fillStyle = color;
    ctx.fillText(NOTE_GLYPHS[glyph % NOTE_GLYPHS.length], x, y);
  }
  ctx.restore();
}

export function drawMelodicGather(ctx, cx, cy, prog, size) {
  const now = S.battle.time, appear = Math.min(1, prog / 0.2);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25));
  additiveGlow(ctx, cx, cy, 48 + 44 * prog, MELODIC_RGB, 0.2 + 0.5 * prog);
  VFX.sprite(ctx, 'light_02', MELODIC_RGB, cx, cy + 8, 170 * (.6 + .4 * prog), 74 * (.6 + .4 * prog), .25 + .35 * prog); // aura pooling under the Saint
  for (let r = 0; r < 3; r++) {                             // sound rings contracting toward the Saint
    const ph = (now * 1.4 + r / 3) % 1, rad = 130 - ph * 105;
    VFX.melodic.soundRing(ctx, cx, cy + 10, rad, rad * 0.45, ph * 0.6 * appear);
  }
  if (Math.random() < 0.5 + prog) {                         // motes of light drawn in by the music
    const a = Math.random() * Math.PI * 2, r0 = 120 + Math.random() * 40, x0 = cx + Math.cos(a) * r0, y0 = cy + 6 + Math.sin(a) * r0 * 0.45;
    VFX.emit({ x: x0, y: y0, vx: (cx - x0) * 2.2, vy: (cy - 10 - y0) * 2.2, drag: 0.5, tex: 'star_06', rgb: Math.random() < 0.3 ? VFX.melodic.GOLD : MELODIC_CORE, s0: 9, s1: 3, a0: 0.9, life: 0.45 });
  }
  guqinStrings(ctx, cx, cy, 150, 1 + prog * 6, appear * 0.9, now);
  const notes = [];                                         // notes orbiting, drawing in and rising
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + now * 1.8;
    notes.push([cx + Math.cos(a) * (62 - prog * 14), cy - 6 + Math.sin(a) * 24 - prog * 10 + Math.sin(now * 5 + i) * 3, i, i % 2 ? '#c7d2fe' : '#fde68a', 0.55 + 0.45 * (Math.sin(a) + 1) / 2]);
  }
  drawNoteGlyphs(ctx, notes, appear);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#a5b4fc';
  ctx.fillText('🎵 THIÊN LÃI CỘNG HƯỞNG', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#818cf8';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

export function drawMelodicResonance(ctx, f, size) {
  const t = (f.maxTtl || 2.4) - f.ttl;                      // seconds since release, engine time
  const sch = f.schedule || { hits: [], start: 0.12, waveSpeed: 5 };
  const o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
  const pxX = ox1.x - o.x, pxY = oy1.y - o.y;               // pixels per grid tile, so the wave meets enemies on time
  const now = S.battle.time;
  f._landed ??= {};
  const waveR = Math.max(0, (t - sch.start) * sch.waveSpeed), maxR = 4.6;

  // Dim lifts once the wave passes the edge of the track
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, waveR - 2.2) / 2.4));

  // Pluck: the strings snap bright and settle
  if (!f._pluck) { f._pluck = true; VFX.melodic.pluck(o.x, o.y); }
  if (t < 0.5) {
    const k = Math.min(1, t / 0.12), fade = 1 - t / 0.5;
    guqinStrings(ctx, o.x, o.y, 150, 8 * fade, fade, now, 1 - k);
    additiveGlow(ctx, o.x, o.y, 70 + 60 * k, MELODIC_CORE, 0.85 * fade);
  }

  // The sound wave: a rippling front with three fading echoes behind it
  if (waveR > 0 && waveR < maxR + 1.1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    const ring = (r, wob) => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const th = (i / 120) * Math.PI * 2, rr = r * (1 + wob * Math.sin(th * 26 + t * 40));
        const x = o.x + Math.cos(th) * rr * pxX, y = o.y + Math.sin(th) * rr * pxY;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
    };
    for (let e = 0; e < 4; e++) {
      const r = waveR - e * 0.35;
      if (r <= 0.05 || r > maxR) continue;
      const fade = Math.max(0, 1 - r / maxR);
      if (e === 0) {
        VFX.melodic.soundRing(ctx, o.x, o.y, r * pxX, r * pxY, 0.95 * fade); // the front: textured glow ring...
        if (Math.random() < 0.9) VFX.melodic.waveMotes(o.x, o.y, r * pxX, r * pxY, 3);
        ring(r, 0.022);                                                   // ...with its rippling bright core
        ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${0.5 * fade})`; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = `rgba(${MELODIC_CORE}, ${0.95 * fade})`; ctx.lineWidth = 1.8; ctx.stroke();
      } else {
        ring(r, 0.012);
        ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${(0.5 / e) * fade})`; ctx.lineWidth = 2.5; ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Hits: a burst of notes where the wave meets each enemy, then notes circle its head while stunned
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = swordTorrentTarget(f, h.uid, size, null);
    if (!p) continue;
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      VFX.melodic.resonanceHit(p.x, p.y);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * (0.15 + Math.random() * 0.7), v = 50 + Math.random() * 70;
        const n = emitParticle(4, p.x, p.y - 10, Math.cos(a) * v, Math.sin(a) * v, 0.8 + Math.random() * 0.5, 0.7 + Math.random() * 0.5, i % 3 ? '#c7d2fe' : '#fde68a');
        if (n) n.glyph = i % NOTE_GLYPHS.length;
      }
      const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy) || 1;
      nudgeEnemy(h.uid, (dx / d) * 7, (dy / d) * 7, 0.45);
    }
    const since = t - h.at;
    if (since < 0.35) {                                      // resonance ring on the enemy
      const q = since / 0.35;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${MELODIC_CORE}, ${(1 - q) * 0.9})`;
      ctx.lineWidth = 2.5 * (1 - q);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + q * 26, 3 + q * 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      additiveGlow(ctx, p.x, p.y - 6, 26, MELODIC_RGB, 0.6 * (1 - q));
    }
    const e = S.battle.enemies.find(v => v.uid === h.uid);
    if (e && !e.gone && e.hp > 0 && (e.frozenUntil || 0) > S.battle.time) {
      VFX.melodic.stunHalo(ctx, p.x, p.y, now);
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const a = now * 4 + i * 2.094;
        pts.push([p.x + Math.cos(a) * 15, p.y - 32 + Math.sin(a) * 5, i + h.uid, i === 1 ? '#fde68a' : '#c7d2fe', 0.55 + 0.45 * (Math.sin(a) + 1) / 2]);
      }
      drawNoteGlyphs(ctx, pts, 0.95);
      ctx.save();                                              // faint bell ring at the feet
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${0.35 + 0.2 * Math.sin(now * 8)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 15, 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}
