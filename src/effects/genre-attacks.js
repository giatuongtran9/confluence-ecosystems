import { routePoint } from '../battlefield.js';
import { additiveGlow, bezierPt, emitParticle } from './core.js';
import { FLAME, chainPts, drawFlameLine, drawHex, drawPhoenixWings, fxProg, fxTime, onceEach } from './elements.js';
import { addDecal, smoke, vfxShake } from './environment.js';
import { burstColors, easeOut, trackPoint, visualTrackP } from './formation-ink.js';
import { S } from '../state.js';

// ==== Bigger set pieces ====
// Spectral black tortoise with its serpent, for Xuanwu's channel and toxin lob.
export function drawSpiritTortoise(ctx, x, y, s, alpha, time) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, 90 * s, '45, 212, 191', 0.3 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(15, 50, 40, 0.85)';
  for (const [lx, ly] of [[-34, 14], [34, 14], [-26, 26], [26, 26]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); }   // legs
  ctx.beginPath(); ctx.ellipse(48, 4 + Math.sin(time * 2) * 2, 12, 9, 0.2, 0, Math.PI * 2); ctx.fill();                                            // head
  const g = ctx.createRadialGradient(-8, -14, 4, 0, 0, 46); g.addColorStop(0, 'rgba(45, 212, 191, 0.9)'); g.addColorStop(1, 'rgba(6, 40, 30, 0.95)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 44, 30, 0, Math.PI, 0); ctx.lineTo(44, 6); ctx.quadraticCurveTo(0, 16, -44, 6); ctx.closePath(); ctx.fill();   // shell
  ctx.strokeStyle = 'rgba(167, 243, 208, 0.75)'; ctx.lineWidth = 1.4;
  drawHex(ctx, 0, -12, 12); ctx.stroke(); drawHex(ctx, -22, -4, 10); ctx.stroke(); drawHex(ctx, 22, -4, 10); ctx.stroke();
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round';                                                       // serpent coiling over the shell
  ctx.beginPath(); for (let i = 0; i <= 28; i++) { const u = i / 28, ang = Math.PI * (0.1 + 1.6 * u) + time * 1.5; const px = Math.cos(ang) * (40 - u * 6), py = -10 + Math.sin(ang) * 22; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
  ctx.restore();
}
// Rebirth Inferno: the phoenix soars to the top of the board, bursts at schedule.burstAt, and fire rains on all
// 16 tiles at once (the tiles ignite together in the engine).
export function drawPhoenixInferno(ctx, f, size) {
  const t = fxTime(f), burst = f.schedule?.burstAt ?? 0.6, o = routePoint(f.x, f.y, size), top = { x: size / 2, y: size * 0.22 };
  if (t < burst) {
    const k = easeOut(t / burst), x = o.x + (top.x - o.x) * k, y = o.y - 30 + (top.y - (o.y - 30)) * k;
    for (let i = 1; i <= 8; i++) { const kk = Math.max(0, k - i * 0.05), tx = o.x + (top.x - o.x) * kk, ty = o.y - 30 + (top.y - (o.y - 30)) * kk; additiveGlow(ctx, tx, ty + i * 4, 26 - i * 2, FLAME, 0.5 - i * 0.05); }   // fire trail
    additiveGlow(ctx, x, y, 90 * (0.6 + k * 0.6), FLAME, 0.7);
    drawPhoenixWings(ctx, x, y, 70 + 70 * k, 1, Math.sin(S.battle.time * 10));
    additiveGlow(ctx, x, y, 14, '254, 240, 138', 1);
    return;
  }
  const since = t - burst;
  onceEach(f, 'burst', () => {
    vfxShake(7); burstColors(top.x, top.y, 40, ['#fde047', '#fb923c', '#ffffff', '#dc2626'], 2.2, 0.7);
    for (let i = 0; i < 16; i++) { const c = trackPoint(i + 0.5, size); addDecal('scorch', c.x, c.y + 8, 1.1, 5.6); smoke(c.x, c.y, 2, '68, 64, 60', 1); }
  });
  if (since < 0.25) additiveGlow(ctx, top.x, top.y, 260 * (0.6 + since), '254, 240, 138', 0.9 * (1 - since / 0.25));
  if (since < 0.5) {                                                         // shockwave ring and fire raining onto every tile
    const k = since / 0.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(253, 186, 116, ${0.8 * (1 - k)})`; ctx.lineWidth = 5 * (1 - k); ctx.beginPath(); ctx.ellipse(top.x, top.y, 40 + k * 320, 20 + k * 160, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 16; i++) { const c = trackPoint(i + 0.5, size), q = Math.min(1, since / 0.18), x = top.x + (c.x - top.x) * q, y = top.y + (c.y - top.y) * q; drawFlameLine(ctx, [{ x: top.x + (c.x - top.x) * Math.max(0, q - 0.35), y: top.y + (c.y - top.y) * Math.max(0, q - 0.35) }, { x, y }], 1, 1 - k); }
  }
}
// Firestorm Tempest normal attack: three crescent blades of fire-wrapped wind sweep along the quadrant,
// cutting through each enemy; enemies pushed back are blown away with a gust.
export function drawFireGust(ctx, f, size) {
  const prog = fxProg(f), q0 = f.schedule?.quad ?? 0, time = S.battle.time;
  for (let b = 0; b < 3; b++) {
    const k = Math.min(1, Math.max(0, (prog - b * 0.1) / 0.55)), fade = prog < 0.75 ? 1 : 1 - (prog - 0.75) / 0.25;
    if (k <= 0 || k >= 1) continue;
    const p = q0 + 4 * k, c = trackPoint(Math.min(15.999, p), size), n = trackPoint(Math.min(15.999, p + 0.1), size), ang = Math.atan2(n.y - c.y, n.x - c.x);
    ctx.save(); ctx.translate(c.x, c.y - 12 - b * 3); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [w, col] of [[11, `rgba(220, 38, 38, ${0.35 * fade})`], [5, `rgba(${FLAME}, ${0.85 * fade})`], [1.6, `rgba(254, 243, 199, ${fade})`]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(-14, 0, 22 + b * 3, -1.15, 1.15); ctx.stroke(); }
    ctx.strokeStyle = `rgba(241, 245, 249, ${0.5 * fade})`; ctx.lineWidth = 1;            // wind trailing behind the blade
    for (let s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(-30, s * 9); ctx.lineTo(-60 - Math.random() * 10, s * 9 + 2); ctx.stroke(); }
    ctx.restore();
    if (Math.random() < 0.6) emitParticle(0, c.x, c.y - 12, (Math.random() - 0.5) * 40, -40 - Math.random() * 40, 0.4, 1.2, Math.random() < 0.5 ? '#fb923c' : '#fde047');
  }
  for (const pt of chainPts(f, size)) {
    const e = S.battle.enemies.find(v => v.uid === pt.uid), cut = Math.min(1, prog / 0.55) * 4 + q0 >= (e ? visualTrackP(e) : 99);
    if (!cut) continue;
    onceEach(f, 'cut' + pt.uid, () => { burstColors(pt.x, pt.y - 10, 8, ['#fb923c', '#fde047', '#ffffff'], 1, 0.3); vfxShake(1.2); });
    if (e?.warpFx && time - e.warpFx.at < 0.5) {                               // pushed back: a gust blows the runner away
      const a = 1 - (time - e.warpFx.at) / 0.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(241, 245, 249, ${0.6 * a})`; ctx.lineWidth = 1.4;
      for (let s = 0; s < 4; s++) { ctx.beginPath(); ctx.moveTo(pt.x - 26, pt.y - 20 + s * 6); ctx.quadraticCurveTo(pt.x, pt.y - 24 + s * 6, pt.x + 26, pt.y - 20 + s * 6); ctx.stroke(); }
      ctx.restore();
    }
  }
}

export function drawCultivationSword(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.22);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.24 - 30;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));
  const tailT = Math.max(0, headT - 0.28);

  ctx.save();
  // Talisman ribbon trail with rune dashes
  ctx.lineCap = 'round';
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = pal.trail;
  ctx.lineWidth = 3.5 * (1 - prog * 0.4);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.3);
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const t = tailT + (headT - tailT) * (i / 6);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Flying Sword Blade oriented along tangent
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Sword Blade
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, 0);       // tip
  ctx.lineTo(-6, -3.5);   // left edge
  ctx.lineTo(-8, 0);      // hilt
  ctx.lineTo(-6, 3.5);    // right edge
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Crossguard & Bagua Ring
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -7); ctx.lineTo(-6, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, 0, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// --- 2. BLOODLINE: TRIPLE CLAW TEARS & SNAPPING BEAST FANGS ---
export function drawBloodlineClaws(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.5);

  // 3 Jagged Crimson Claw Tears
  const spread = 0.88;
  const r = 26 + prog * 16;
  for (let c = -1; c <= 1; c++) {
    ctx.save();
    ctx.translate(c * 6, c * 8);
    ctx.strokeStyle = c === 0 ? pal.primary : pal.secondary;
    ctx.lineWidth = 6 * (1 - prog * 0.45);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-10, 0, r, -spread, spread);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-9, 0, r, -spread * 0.7, spread * 0.7);
    ctx.stroke();
    ctx.restore();
  }

  // Snapping Beast Fangs (close shut at impact)
  const jawClose = Math.max(0, 1 - prog * 1.8) * 12;
  ctx.fillStyle = '#fff4ea';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -10 - jawClose); ctx.lineTo(4, -jawClose); ctx.lineTo(-12, -4 - jawClose);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, 10 + jawClose); ctx.lineTo(4, jawClose); ctx.lineTo(-12, 4 + jawClose);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// --- 3. SCRAPWORK: SPINNING ARTILLERY SHELL WITH EXHAUST PUFFS ---
export function drawScrapworkShell(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || -0.2);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 28;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));

  ctx.save();
  // Trailing grey exhaust smoke puffs
  for (let i = 1; i <= 4; i++) {
    const t = Math.max(0, headT - i * 0.08);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    ctx.globalAlpha = Math.max(0, (1 - prog) * (0.65 - i * 0.12));
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 + i * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spinning Artillery Shell
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Shell Body
  ctx.fillStyle = '#c89d5c';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(11, 0);        // conical nose
  ctx.lineTo(4, -4.5);
  ctx.lineTo(-7, -4.5);     // body
  ctx.lineTo(-7, 4.5);
  ctx.lineTo(4, 4.5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Stabilizer Fins & Orange Rocket Plume
  ctx.fillStyle = pal.secondary;
  ctx.fillRect(-12, -2, 5, 4);
  ctx.restore();
}

// --- 4. CYBER MATRIX: ZIG-ZAG DIGITAL MONOWIRE WHIP ---
export function drawCyberMonowire(ctx, x0, y0, tx, ty, prog, pal) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);
  const segments = 8;
  const dx = tx - x0, dy = ty - y0;

  // Chromatic Aberration Underlayer
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, y0 - 2);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const jitter = Math.sin(t * 14 + prog * 18) * 8 * (1 - t * 0.4);
    ctx.lineTo(x0 + dx * t + 3, y0 + dy * t + jitter - 2);
  }
  ctx.stroke();

  // Primary High-Voltage Cyan Monowire
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const jitter = Math.sin(t * 14 + prog * 18) * 8 * (1 - t * 0.4);
    ctx.lineTo(x0 + dx * t, y0 + dy * t + jitter);
  }
  ctx.stroke();

  // White High-Intensity Laser Core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

// --- 5. ARCANE LOOM: DUAL-HELIX ORBITING ELEMENTAL SPHERES ---
export function drawArcaneRunes(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.24);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 28;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));

  ctx.save();
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const ang = Math.atan2(head.y - y0, head.x - x0);

  // Trailing violet aether ribbon
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 3;
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.2);
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const t = Math.max(0, headT - i * 0.05);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Two Orbiting Elemental Spheres (Fire Orange & Ice Cyan)
  const orbitR = 8;
  const spin = prog * Math.PI * 8;
  const o1x = head.x + Math.cos(spin) * orbitR;
  const o1y = head.y + Math.sin(spin) * orbitR * 0.6;
  const o2x = head.x - Math.cos(spin) * orbitR;
  const o2y = head.y - Math.sin(spin) * orbitR * 0.6;

  ctx.fillStyle = '#f97316'; // Fire Orb
  ctx.beginPath(); ctx.arc(o1x, o1y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; // Ice Orb
  ctx.beginPath(); ctx.arc(o2x, o2y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// --- 6. HAUNTED: CURSED BLOOD SCISSOR SHEARS & VHS TEAR LINES ---
export function drawHauntedScissors(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.5);

  // Horizontal VHS Glitch Scanlines
  ctx.strokeStyle = '#ffffff88';
  ctx.lineWidth = 1.5;
  for (let g = -1; g <= 1; g++) {
    const gy = g * 12 + Math.sin(prog * 15) * 4;
    ctx.beginPath();
    ctx.moveTo(-35, gy); ctx.lineTo(35, gy);
    ctx.stroke();
  }

  // Dual Scissor Blades slicing inward in X-Shear
  const snipAngle = Math.max(0.12, (1 - prog * 2.2) * 0.75);
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.rotate(side * snipAngle);
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, -side * 6);
    ctx.lineTo(18, 0);          // point
    ctx.lineTo(-14, side * 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Finger loop handle
    ctx.beginPath();
    ctx.arc(-22, -side * 7, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// --- 7. FORBIDDEN TEXTS: WRITHING SINE-WAVE TENTACLE & VOID EYE ---
export function drawCosmicTentacle(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const segments = 10;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Writhing Sine-Wave Spine
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 7 * (1 - prog * 0.4);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(t * 8 + prog * 16) * 10 * (1 - t * 0.3);
    const px = x0 + dx * t + wave * (dy / (Math.hypot(dx, dy) || 1));
    const py = y0 + dy * t - wave * (dx / (Math.hypot(dx, dy) || 1));
    ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Dark Abyssal Core
  ctx.strokeStyle = pal.trail;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Opening Void Eye Pupil at target
  if (prog > 0.45) {
    const ep = Math.min(1, (prog - 0.45) / 0.55);
    ctx.translate(tx, ty);
    ctx.fillStyle = '#06020c';
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * ep, 7 * ep, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff2a6d';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 * ep, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// --- 8. ECLIPSE HUNT: 180° MOONLIGHT-SILVER BROADSWORD WAVE ---
export function drawHuntBroadsword(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Massive 180° Silver Arc
  const r = 36 + prog * 18;
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 8 * (1 - prog * 0.45);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-12, 0, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.stroke();

  // Razor-sharp inner white core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-10, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Black Iron Sparks
  ctx.fillStyle = pal.secondary;
  for (let s = -2; s <= 2; s++) {
    const a = s * 0.35;
    const sx = Math.cos(a) * (r + 8 * prog) - 12;
    const sy = Math.sin(a) * (r + 8 * prog);
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.restore();
}

// --- 9. ORBITAL XENO-LAB: NEEDLE SPIKE & ROTATING BIOMETRIC RETICLE ---
export function drawScifiNeedle(ctx, x0, y0, tx, ty, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Rotating Triangular Biometric Target-Lock Reticle on Runner
  const lockR = Math.max(12, 28 * (1 - prog * 0.8));
  const spin = prog * Math.PI * 4;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(spin);
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const px = Math.cos(a) * lockR, py = Math.sin(a) * lockR;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Needle Spike Projectile
  const curX = x0 + dx * prog, curY = y0 + dy * prog;
  const ang = Math.atan2(dy, dx);
  ctx.translate(curX, curY);
  ctx.rotate(ang);
  ctx.fillStyle = pal.primary;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-8, -2.5);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 2.5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Acid droplet trail
  ctx.fillStyle = pal.primary;
  ctx.beginPath(); ctx.arc(-14, -1, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-22, 1, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
