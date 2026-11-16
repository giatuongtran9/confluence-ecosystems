import { routePoint } from '../battlefield.js';
import { additiveGlow, burstImpact, dimFocus, emitParticle, hash01 } from './core.js';
import { AZURE_PAL, INK_PAL, burstColors, channelLabel, channelRing, drawInkDragon, drawTalismanPaper, droplets, easeOut, enemyPt, quadPt, ringTile, trackPoint, visualTrackP } from './formation-ink.js';
import { drawFireGust, drawPhoenixInferno, drawSpiritTortoise } from './genre-attacks.js';
import { nudgeEnemy } from './sword-music.js';
import { Game } from '../lib.js';
import { S } from '../state.js';

// Marks that stay on enemies between effects: talisman while Vulnerable, blood drips from Blood-Fiend bleeds.
export function drawPersistentMarks(ctx, size) {
  const fiends = new Set(S.battle.units.filter(v => !v.removed && v.id === 'bloodFiendMaster').map(v => v.uid));
  for (const e of S.battle.enemies) {
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(visualTrackP(e), size);
    const left = (e.talismanMarkUntil || 0) - S.battle.time;
    if (left > 0) drawTalismanPaper(ctx, p.x + 12, p.y - 30 + Math.sin(S.battle.time * 4 + e.uid) * 1.5, 0.15 + Math.sin(S.battle.time * 3 + e.uid) * 0.12, 0.85, Math.min(1, left / 0.3));
    if (fiends.size && (e.bleeds || []).some(bl => bl.until > S.battle.time && fiends.has(bl.owner))) {
      if (S.battle.time - (e._dripAt || 0) > 0.22) {
        e._dripAt = S.battle.time;
        emitParticle(2, p.x + (Math.random() - 0.5) * 12, p.y - 6, (Math.random() - 0.5) * 10, 20, 0.5, 1.4, '#b91c1c');
      }
    }
  }
}

// ==== Bloodline + Arcane Mythic effects (normal attacks, channels, ultimates, ground zones) ====
// Shared helpers
export const fxProg = f => Math.min(1, Math.max(0, 1 - f.ttl / (f.maxTtl || 1)));
export const fxTime = f => (f.maxTtl || 1) - f.ttl;
export function tilePx(size) { const a = routePoint(1, 1, size), b = routePoint(2, 2, size); return { x: b.x - a.x, y: b.y - a.y }; }
function tileGrid(i) { const [x, y] = Game.ring[((i % 16) + 16) % 16]; return { x, y }; }
export function chainPts(f, size) { return (f.schedule?.chain || []).map(uid => { const p = enemyPt(f, uid, size); return p && { x: p.x, y: p.y, uid }; }).filter(Boolean); }
export function onceEach(f, key, fn) { f._once ??= {}; if (!f._once[key]) { f._once[key] = true; fn(); } }
// A flickering lightning bolt: jagged polyline with a wide glow and a white core.
export function drawBolt(ctx, x0, y0, x1, y1, seed, rgb, alpha, width = 2) {
  if (alpha <= 0) return;
  const n = 10, dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n, j = (i === 0 || i === n) ? 0 : (hash01(seed + i * 3.1) - 0.5) * d * 0.16; pts.push([x0 + dx * k + nx * j, y0 + dy * k + ny * j]); }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [w, c] of [[width * 4, `rgba(${rgb}, ${0.3 * alpha})`], [width, `rgba(255, 255, 255, ${0.95 * alpha})`]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
    pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  }
  ctx.restore();
}
export function softPuff(ctx, x, y, r, rgb, alpha, additive = false) {
  if (alpha <= 0 || r <= 0) return;
  if (additive) { additiveGlow(ctx, x, y, r, rgb, alpha); return; }
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`); g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A radial "wave reaches each enemy" ring in tiles from grid origin (gx, gy), drawn as an ellipse on screen.
function waveRing(ctx, size, gx, gy, rTiles, draw) {
  const o = routePoint(gx, gy, size), px = tilePx(size);
  draw(o.x, o.y, rTiles * px.x, rTiles * px.y);
}

// ==== Primordial Azure Dragon (Thanh Long) — azure lightning ====
const AZURE = '125, 211, 252';
function drawAzureBolts(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size), a = prog < 0.7 ? 1 - prog / 0.7 : 0;
  pts.forEach((p, i) => {
    drawBolt(ctx, o.x, o.y - 24, p.x, p.y - 10, Math.floor(S.battle.time * 40) + i * 17, AZURE, a, 1.8);
    additiveGlow(ctx, p.x, p.y - 10, 20, AZURE, 0.8 * a);
    onceEach(f, 'h' + i, () => burstColors(p.x, p.y - 10, 6, ['#e0f2fe', '#7dd3fc'], 0.8, 0.3));
  });
}
function lightningDragonPts(cx, cy, len, amp, phase) {
  const pts = [];
  for (let i = 0; i <= 44; i++) { const u = i / 44; pts.push({ x: cx - len / 2 + len * u, y: cy + Math.sin(u * Math.PI * 3 + phase) * amp * (0.5 + 0.5 * u) }); }
  return pts;
}
function drawGlowPath(ctx, pts, rgb, alpha, width) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, a] of [[width * 3, 0.25], [width, 0.7], [width * 0.35, 1]]) {
    ctx.strokeStyle = a === 1 ? `rgba(255, 255, 255, ${alpha})` : `rgba(${rgb}, ${a * alpha})`; ctx.lineWidth = w;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  }
  ctx.restore();
  const h = pts[pts.length - 1]; additiveGlow(ctx, h.x, h.y, width * 4, rgb, alpha);
}
function drawAzureGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time, top = Math.max(40, cy - 120);
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25), '2, 6, 20');
  for (let i = 0; i < 7; i++) softPuff(ctx, cx - 90 + i * 30 + Math.sin(time + i) * 6, top + Math.sin(i * 2.1) * 10, 34, '30, 41, 59', 0.75 * Math.min(1, prog * 2));   // storm clouds
  if (hash01(Math.floor(time * 7)) > 0.55) drawBolt(ctx, cx - 60 + hash01(Math.floor(time * 7) + 1) * 120, top, cx, cy - 20, Math.floor(time * 30), AZURE, 0.9 * prog, 1.6);
  const pts = [];                                                     // lightning dragon coiling round the unit
  for (let s = 0; s <= 50; s++) { const a = s * 0.26 + time * 4, r = 72 - 30 * prog; pts.push({ x: cx + Math.cos(a) * r, y: cy - 6 + Math.sin(a) * r * 0.45 - s * 1.1 * prog }); }
  drawGlowPath(ctx, pts.slice(0, Math.max(2, Math.floor(pts.length * Math.min(1, prog * 1.3)))), AZURE, 0.9, 3);
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, AZURE, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '⚡ THANH LONG BẠO NỘ', prog, '#7dd3fc', '#082f49');
}
function drawAzureWrath(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size), time = S.battle.time, sch = f.schedule || { hits: [] };
  dimFocus(ctx, size, o.x, o.y, 0.5 * Math.max(0, 1 - Math.max(0, t - 1.0) / 0.5), '2, 6, 20');
  if (t < 1.1) {                                                     // a full azure dragon spirit, lit by its own lightning
    const a = Math.min(1, t / 0.15) * (t > 0.8 ? 1 - (t - 0.8) / 0.3 : 1), pts = lightningDragonPts(o.x, Math.max(70, o.y - 125), 360, 30, time * 3);
    additiveGlow(ctx, o.x, Math.max(70, o.y - 125), 200, AZURE, 0.35 * a);
    S.DRAGON_PAL = AZURE_PAL; drawInkDragon(ctx, pts, 1, a, time, 1.45); S.DRAGON_PAL = INK_PAL;
    drawGlowPath(ctx, pts, AZURE, 0.45 * a, 2);
  }
  if (t > 0.08 && t < 0.5) { const k = (t - 0.08) / 0.42; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${AZURE}, ${0.8 * (1 - k)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(o.x, o.y, 30 + k * 260, 12 + k * 110, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }   // the roar
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size); if (!p) continue;
    const since = t - h.at;
    if (since < 0.14) drawBolt(ctx, p.x + (hash01(h.uid) - 0.5) * 60, 0, p.x, p.y - 8, Math.floor(time * 50) + h.uid, AZURE, 1, 2.6);
    onceEach(f, 'h' + h.uid, () => { burstColors(p.x, p.y - 8, 14, ['#ffffff', '#7dd3fc', '#38bdf8'], 1.2, 0.4); nudgeEnemy(h.uid, 0, 6, 0.5); });
    if (since < 0.3) additiveGlow(ctx, p.x, p.y - 8, 34, AZURE, 0.9 * (1 - since / 0.3));
  }
}

// ==== White Tiger God of Slaughter (Bạch Hổ) — white steel, crimson edge ====
export function drawClawMarks(ctx, x, y, k, alpha, ang = -0.7, len = 30) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    for (const [w, c] of [[5, `rgba(248, 113, 113, ${0.45 * alpha})`], [1.8, `rgba(255, 255, 255, ${alpha})`]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
      ctx.moveTo(-len / 2, i * 7); ctx.quadraticCurveTo(0, i * 7 - 4, -len / 2 + len * k, i * 7 + 2 * k); ctx.stroke();
    }
  }
  ctx.restore();
}
function drawTigerClaw(ctx, tx, ty, prog, f) {
  drawClawMarks(ctx, tx, ty - 12, Math.min(1, prog / 0.35), prog < 0.35 ? 1 : 1 - (prog - 0.35) / 0.65);
  if (prog > 0.25) onceEach(f, 'blood', () => droplets(tx, ty - 10, 6, '#b91c1c', 0.7));
}
function drawTigerGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '8, 8, 10');
  additiveGlow(ctx, cx, cy, 50 + 44 * prog, '241, 245, 249', 0.22 + 0.45 * prog);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';               // wind streaks
  for (let i = 0; i < 10; i++) { const y = cy - 60 + i * 12, x = cx - 130 + ((time * 220 + hash01(i) * 260) % 260); ctx.strokeStyle = `rgba(226, 232, 240, ${0.25 * prog})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y - 3); ctx.stroke(); }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 82, 46, (x, y, i, depth, appear) => drawClawMarks(ctx, x, y - 10, 1, appear * depth, -0.9 + i * 0.3, 22));
  channelLabel(ctx, cx, cy + 150, '🐯 BẠCH HỔ THẦN HỐNG', prog, '#f1f5f9', '#1f2937');
}
function drawTigerHead(ctx, x, y, s, alpha, roar) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, 90 * s, '241, 245, 249', 0.45 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(241, 245, 249, 0.82)';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 28, -30); ctx.lineTo(sx * 46, -58); ctx.lineTo(sx * 50, -22); ctx.closePath(); ctx.fill(); }   // ears
  ctx.beginPath(); ctx.ellipse(0, 0, 54, 46, 0, 0, Math.PI * 2); ctx.fill();                                                                                 // face
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 4; ctx.lineCap = 'round';                                                                                     // stripes and 王 brow
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sx * 52, -16 + i * 12); ctx.quadraticCurveTo(sx * 40, -12 + i * 12, sx * 30, -8 + i * 13); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(10, -34); ctx.moveTo(-8, -27); ctx.lineTo(8, -27); ctx.moveTo(-11, -20); ctx.lineTo(11, -20); ctx.moveTo(0, -36); ctx.lineTo(0, -18); ctx.stroke();
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, 22, 18, 6 + 16 * roar, 0, 0, Math.PI * 2); ctx.fill();                                          // roaring mouth
  ctx.fillStyle = '#f8fafc'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 10, 14); ctx.lineTo(sx * 6, 14 + 10 * roar + 4); ctx.lineTo(sx * 3, 14); ctx.fill(); }
  ctx.restore();
  for (const sx of [-1, 1]) additiveGlow(ctx, x + sx * 20 * s, y - 8 * s, 10 * s, '56, 189, 248', alpha);                                                    // eyes
}
function drawTigerRoar(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size), sch = f.schedule || { hits: [] };
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.5), '8, 8, 10');
  // (the roar itself is drawn by the storyboard layer)
  const R = Math.max(0, (t - 0.25) * 6);
  if (R > 0 && R < 5) waveRing(ctx, size, f.x, f.y, R, (x, y, rx, ry) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 3; r++) { const k = Math.max(0, 1 - r * 0.12); ctx.strokeStyle = `rgba(241, 245, 249, ${(0.8 - r * 0.25) * (1 - R / 5)})`; ctx.lineWidth = 4 - r; ctx.beginPath(); ctx.ellipse(x, y, rx * k, ry * k, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  });
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (!p) continue; onceEach(f, 'h' + h.uid, () => { nudgeEnemy(h.uid, 0, -8, 0.6); burstColors(p.x, p.y - 10, 6, ['#ffffff', '#e2e8f0'], 0.8, 0.3); }); }
}

// ==== Xuanwu Divine Heaven-Bearer (Huyền Vũ) — black tortoise, venom green ====
const VENOM = '74, 222, 128';
function drawVenomStrike(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size), reach = Math.min(1, prog / 0.45), fade = prog < 0.45 ? 1 : 1 - (prog - 0.45) / 0.55;
  pts.forEach((p, idx) => {
    const x0 = o.x, y0 = o.y - 16, dx = p.x - x0, dy = p.y - 10 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, path = [];
    for (let i = 0; i <= 24; i++) { const k = (i / 24) * reach, w = Math.sin(k * Math.PI * 4 + S.battle.time * 18 + idx) * 7 * (1 - k * 0.5); path.push({ x: x0 + dx * k + nx * w, y: y0 + dy * k + ny * w }); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(${VENOM}, ${0.75 * fade})`; ctx.lineWidth = 4; ctx.beginPath(); path.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
    const h = path[path.length - 1]; ctx.fillStyle = `rgba(187, 247, 208, ${fade})`; ctx.beginPath(); ctx.arc(h.x, h.y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (reach >= 1) onceEach(f, 'h' + idx, () => droplets(p.x, p.y - 10, 7, '#22c55e', 0.7));
  });
}
export function drawHex(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; if (i) ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6); else ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6); } ctx.closePath(); }
function drawXuanwuGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time, a = Math.min(1, prog / 0.3);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '2, 12, 8');
  drawSpiritTortoise(ctx, cx, Math.max(70, cy - 110), 1.35, Math.min(1, prog / 0.4), time);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';                // tortoise-shell hex barrier
  const R = 22;
  const cells = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * R * 1.73, Math.sin(i * Math.PI / 3) * R * 1.73])];
  cells.forEach(([dx, dy], i) => {
    const on = Math.min(1, Math.max(0, (prog - i * 0.06) / 0.15));
    ctx.strokeStyle = `rgba(45, 212, 191, ${0.75 * on})`; ctx.lineWidth = 2; drawHex(ctx, cx + dx, cy - 6 + dy * 0.6, R); ctx.stroke();
    ctx.fillStyle = `rgba(20, 83, 45, ${0.25 * on})`; ctx.fill();
  });
  ctx.lineCap = 'round';                                                // the snake circling
  const head = time * 2.4;
  ctx.strokeStyle = `rgba(${VENOM}, ${0.9 * a})`; ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) { const ang = head - i * 0.09, r = 70 - 18 * prog + Math.sin(i * 0.8 + time * 8) * 4; const x = cx + Math.cos(ang) * r, y = cy - 6 + Math.sin(ang) * r * 0.5; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.restore();
  additiveGlow(ctx, cx + Math.cos(head) * (70 - 18 * prog), cy - 6 + Math.sin(head) * (70 - 18 * prog) * 0.5, 9, VENOM, a);
  channelLabel(ctx, cx, cy + 150, '🐢 HUYỀN VŨ ĐỘC ĐỊA', prog, '#86efac', '#052e16');
}
function drawXuanwuLob(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { quadrant: 0, landAt: 0.5 }, o = routePoint(f.x, f.y, size), q = trackPoint(sch.quadrant * 4 + 2, size);
  if (t < 0.6) drawSpiritTortoise(ctx, o.x, Math.max(70, o.y - 110), 1.35, 1 - t / 0.6, S.battle.time);
  if (t < sch.landAt) {
    const k = t / sch.landAt, p = quadPt(o.x, o.y - 20, (o.x + q.x) / 2, Math.min(o.y, q.y) - 140, q.x, q.y, k);
    additiveGlow(ctx, p.x, p.y, 26, VENOM, 0.9);
    ctx.save(); ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (Math.random() < 0.6) emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 30, 20, 0.4, 1.4, '#22c55e');
  } else onceEach(f, 'splash', () => { droplets(q.x, q.y, 24, '#16a34a', 1.3); burstColors(q.x, q.y, 12, ['#bbf7d0', '#4ade80'], 1, 0.4); });
}

// ==== Immortal Vermilion Phoenix (Chu Tước) — vermilion fire and gold ====
export const FLAME = '249, 115, 22';
function drawFeather(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, alpha);
  const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#dc2626'); g.addColorStop(0.6, '#f97316'); g.addColorStop(1, '#fde047');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(0, -6, -14, -1); ctx.quadraticCurveTo(0, 6, 14, 0); ctx.fill();
  ctx.strokeStyle = '#fff7ed'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
  ctx.restore();
}
function drawPhoenixFeather(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.6;
  if (prog < FLY) {
    const k = prog / FLY, px = x + (tx - x) * k, py = y - 18 + (ty - 8 - (y - 18)) * k - Math.sin(k * Math.PI) * 18, ang = Math.atan2(ty - y, tx - x);
    additiveGlow(ctx, px, py, 16, FLAME, 0.7);
    drawFeather(ctx, px, py, ang, 1.1, 1);
    if (Math.random() < 0.7) emitParticle(0, px, py, (Math.random() - 0.5) * 30, -20 - Math.random() * 30, 0.3, 1.3, Math.random() < 0.5 ? '#fdba74' : '#fde047');
    return;
  }
  onceEach(f, 'hit', () => { for (let i = 0; i < 10; i++) emitParticle(0, tx, ty - 8, (Math.random() - 0.5) * 70, -60 - Math.random() * 90, 0.4, 1.5, Math.random() < 0.5 ? '#fb923c' : '#fde047'); });
  additiveGlow(ctx, tx, ty - 8, 26, FLAME, 0.8 * (1 - (prog - FLY) / (1 - FLY)));
}
export function drawFlameLine(ctx, pts, reach, alpha) {
  if (alpha <= 0 || pts.length < 2) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    const k = Math.min(1, Math.max(0, reach * (pts.length - 1) - (i - 1)));
    if (k <= 0) break;
    const a = pts[i - 1], b = pts[i], ex = a.x + (b.x - a.x) * k, ey = a.y + (b.y - a.y) * k;
    for (const [w, c] of [[10, `rgba(220, 38, 38, ${0.35 * alpha})`], [4, `rgba(${FLAME}, ${0.8 * alpha})`], [1.5, `rgba(253, 224, 71, ${alpha})`]]) { ctx.strokeStyle = c; ctx.lineWidth = w + Math.sin(S.battle.time * 30 + i) * 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ex, ey); ctx.stroke(); }
  }
  ctx.restore();
}
function drawFlameSpread(ctx, f, size) {
  const prog = fxProg(f), pts = chainPts(f, size).map(p => ({ x: p.x, y: p.y - 6, uid: p.uid })), reach = Math.min(1, prog / 0.5);
  drawFlameLine(ctx, pts, reach, prog < 0.5 ? 1 : 1 - (prog - 0.5) / 0.5);
  pts.forEach((p, i) => { if (i && reach * (pts.length - 1) >= i) onceEach(f, 'ig' + i, () => burstColors(p.x, p.y, 8, ['#fb923c', '#fde047'], 0.8, 0.35, true)); });
}
export function drawPhoenixWings(ctx, x, y, span, alpha, flap) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, alpha);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
    const a = -0.25 - i * 0.22 + flap * 0.25, len = span * (1 - i * 0.09);
    const g = ctx.createLinearGradient(x, y, x + sx * Math.cos(a) * len, y + Math.sin(a) * len);
    g.addColorStop(0, 'rgba(253, 224, 71, 0.9)'); g.addColorStop(0.5, 'rgba(249, 115, 22, 0.7)'); g.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.strokeStyle = g; ctx.lineWidth = 7 - i * 0.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sx * Math.cos(a - 0.3) * len * 0.6, y + Math.sin(a - 0.3) * len * 0.6, x + sx * Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  }
  ctx.restore();
}
function drawPhoenixGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 6, 2');
  drawPhoenixWings(ctx, cx, cy - 22, 40 + 80 * easeOut(Math.min(1, prog / 0.7)), Math.min(1, prog * 2), Math.sin(time * 6) * 0.5);
  channelRing(cx, cy, prog, 8, 82, 46, (x, y, i, depth, appear, a) => { additiveGlow(ctx, x, y, 14, FLAME, 0.5 * appear); drawFeather(ctx, x, y, -Math.PI / 2 + Math.cos(a) * 0.3, 0.9, appear * depth); });
  additiveGlow(ctx, cx, cy, 48 + 44 * prog, FLAME, 0.22 + 0.5 * prog);
  if (Math.random() < 0.6) emitParticle(0, cx + (Math.random() - 0.5) * 60, cy, (Math.random() - 0.5) * 20, -60 - Math.random() * 60, 0.6, 1.4, Math.random() < 0.5 ? '#fdba74' : '#fde047');
  channelLabel(ctx, cx, cy + 150, '🔥 BẤT DIỆT HỎA PHƯỢNG', prog, '#fdba74', '#431407');
}
// ==== Great Sage Equal to Heaven (Tề Thiên) — golden staff and clouds ====
const GOLDEN = '250, 204, 21';
function drawStaff(ctx, x0, y0, x1, y1, w, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.lineCap = 'butt';
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#b91c1c'); g.addColorStop(0.08, '#facc15'); g.addColorStop(0.5, '#fde68a'); g.addColorStop(0.92, '#facc15'); g.addColorStop(1, '#b91c1c');
  ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}
function drawStaffStrike(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size);
  if (!pts.length) return;
  const p = pts[0], ext = prog < 0.3 ? easeOut(prog / 0.3) : prog < 0.6 ? 1 : 1 - (prog - 0.6) / 0.4;
  drawStaff(ctx, o.x, o.y - 18, o.x + (p.x - o.x) * ext, o.y - 18 + (p.y - 10 - (o.y - 18)) * ext, 5, 1);
  additiveGlow(ctx, o.x + (p.x - o.x) * ext, o.y - 18 + (p.y - 10 - (o.y - 18)) * ext, 16, GOLDEN, 0.7);
  if (pts.length > 1 && prog > 0.25) {                                  // cleave arc sweeping through the runners behind
    const k = Math.min(1, (prog - 0.25) / 0.3), fade = prog < 0.7 ? 1 : 1 - (prog - 0.7) / 0.3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${GOLDEN}, ${0.7 * fade})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 12);
    const last = Math.max(1, Math.floor(k * (pts.length - 1)));
    for (let i = 1; i <= last; i++) ctx.lineTo(pts[i].x, pts[i].y - 12);
    ctx.stroke(); ctx.restore();
  }
  pts.forEach((q, i) => { if (prog > 0.25 + i * 0.1) onceEach(f, 'h' + i, () => burstColors(q.x, q.y - 10, 7, ['#fde68a', '#facc15', '#ffffff'], 0.9, 0.3)); });
}
function drawCloudPuffs(ctx, x, y, s, alpha) { for (let i = 0; i < 5; i++) softPuff(ctx, x + (i - 2) * 12 * s, y + Math.sin(i * 1.7) * 4 * s, 16 * s, '254, 249, 195', 0.7 * alpha); additiveGlow(ctx, x, y, 30 * s, GOLDEN, 0.35 * alpha); }
function drawCloneCloud(ctx, f, size) { const prog = fxProg(f), o = routePoint(f.x, f.y, size); drawCloudPuffs(ctx, o.x, o.y + 4, 0.8 + prog * 0.8, 1 - prog); onceEach(f, 'spark', () => burstColors(o.x, o.y, 10, ['#fde68a', '#ffffff'], 0.8, 0.4)); }
function drawSageGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time, len = 40 + 130 * easeOut(Math.min(1, prog / 0.8)), top = Math.max(30, cy - 24 - len);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '18, 12, 2');
  drawStaff(ctx, cx, cy - 20, cx, top, 7 + 3 * prog, 1);
  additiveGlow(ctx, cx, top, 22 + 10 * Math.sin(time * 10), GOLDEN, 0.8);
  channelRing(cx, cy, prog, 6, 84, 50, (x, y, i, depth, appear) => drawCloudPuffs(ctx, x, y, 0.55, appear * depth));
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, GOLDEN, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '🐒 ĐỊNH HẢI THẦN CHÂM', prog, '#fde047', '#422006');
}
function drawSageStaff(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { quadrant: 0, impactAt: 0.55, hits: [] }, Q = trackPoint(sch.quadrant * 4 + 2, size), I = sch.impactAt;
  dimFocus(ctx, size, Q.x, Q.y, 0.4 * Math.max(0, 1 - Math.max(0, t - I) / 0.6), '18, 12, 2');
  const high = Math.max(Q.y - 320, Math.min(Q.y - 120, 40));
  let tip = high;
  if (t >= I) tip = Q.y + 6; else if (t > I - 0.15) { const k = (t - (I - 0.15)) / 0.15; tip = high + (Q.y + 6 - high) * k * k * k; }
  const a = Math.min(1, Math.max(0, (t - 0.1) / 0.1)) * (t > 1.15 ? Math.max(0, 1 - (t - 1.15) / 0.35) : 1);
  if (t < I) { ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + 0.35 * a})`; ctx.beginPath(); ctx.ellipse(Q.x, Q.y + 6, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  drawStaff(ctx, Q.x, tip - 380, Q.x, tip, 24, a);
  additiveGlow(ctx, Q.x, tip - 190, 95, GOLDEN, 0.4 * a);
  if (t >= I) {
    onceEach(f, 'impact', () => { burstImpact(Q.x, Q.y + 6, 26, 14, 30, 1.4); burstColors(Q.x, Q.y, 20, ['#fde68a', '#facc15', '#ffffff'], 1.5, 0.5); });
    const since = t - I;
    ctx.save(); ctx.strokeStyle = `rgba(28, 25, 23, ${0.8 * a})`; ctx.lineWidth = 3; ctx.lineCap = 'round';   // cracks across the quadrant
    for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); ctx.beginPath(); ctx.moveTo(Q.x, Q.y + 6); ctx.lineTo((Q.x + c.x) / 2 + (hash01(i) - 0.5) * 16, (Q.y + c.y) / 2 + 4); ctx.lineTo(c.x, c.y + 6); ctx.stroke(); }
    ctx.restore();
    for (let r = 0; r < 2; r++) { const k = Math.min(1, Math.max(0, (since - r * 0.06) / 0.4)); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${GOLDEN}, ${0.85 * (1 - k)})`; ctx.lineWidth = 4 * (1 - k); ctx.beginPath(); ctx.ellipse(Q.x, Q.y + 6, 12 + k * 150, 5 + k * 56, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    if (since < 0.12) additiveGlow(ctx, Q.x, Q.y, 160, '254, 249, 195', 0.8 * (1 - since / 0.12));
  }
}

// ==== Magma Lord — earth and fire ====
const LAVA = '249, 115, 22';
function drawMoltenRock(ctx, x, y, r, alpha) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 2.4, LAVA, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = '#292524';
  ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, rr = r * (0.8 + hash01(i + r) * 0.3); if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.2); ctx.lineTo(x, y + r * 0.1); ctx.lineTo(x + r * 0.4, y - r * 0.3); ctx.stroke();
  ctx.restore();
}
function drawMagmaRock(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.55;
  if (prog < FLY) { const k = prog / FLY, p = quadPt(x, y - 16, (x + tx) / 2, Math.min(y, ty) - 70, tx, ty, k); drawMoltenRock(ctx, p.x, p.y, 7, 1); if (Math.random() < 0.6) emitParticle(0, p.x, p.y, (Math.random() - 0.5) * 30, 10, 0.3, 1.2, '#fb923c'); return; }
  onceEach(f, 'splash', () => { droplets(tx, ty, 12, '#f97316', 1); burstColors(tx, ty, 8, ['#fde047', '#fb923c'], 0.9, 0.35, true); });
  additiveGlow(ctx, tx, ty, 30, LAVA, 0.8 * (1 - (prog - FLY) / (1 - FLY)));
}
function drawLavaCracks(ctx, x, y, seed, scale, alpha, time) {
  if (alpha <= 0) return;
  ctx.save(); ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
    ctx.strokeStyle = pass ? `rgba(253, 186, 116, ${alpha * (0.6 + 0.4 * Math.sin(time * 6 + seed))})` : `rgba(28, 10, 4, ${0.8 * alpha})`;
    ctx.lineWidth = pass ? 1.6 : 4;
    for (let i = 0; i < 5; i++) { let a = hash01(seed + i) * 6.28, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 3; s++) { a += (hash01(seed + i * 7 + s) - 0.5) * 1.2; px += Math.cos(a) * 10 * scale; py += Math.sin(a) * 4 * scale; ctx.lineTo(px, py); } ctx.stroke(); }
  }
  ctx.restore();
  additiveGlow(ctx, x, y, 22 * scale, LAVA, 0.35 * alpha);
}
function drawMagmaGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 6, 2');
  ctx.save(); ctx.lineCap = 'round';                                     // glowing cracks spreading from the unit
  for (let i = 0; i < 8; i++) { let a = i / 8 * 6.28 + 0.3, px = cx, py = cy + 10; const len = 110 * prog; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 1; s <= 4; s++) { a += (hash01(i * 9 + s) - 0.5) * 0.7; px = cx + Math.cos(a) * len * s / 4; py = cy + 10 + Math.sin(a) * len * 0.45 * s / 4; ctx.lineTo(px, py); } ctx.strokeStyle = 'rgba(28, 10, 4, 0.8)'; ctx.lineWidth = 4; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(253, 186, 116, ${0.5 + 0.4 * Math.sin(time * 8 + i)})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 84, 48, (x, y, i, depth, appear) => drawMoltenRock(ctx, x, y, 7, appear * depth));
  additiveGlow(ctx, cx, cy, 50 + 44 * prog, LAVA, 0.22 + 0.5 * prog);
  channelLabel(ctx, cx, cy + 150, '🌋 MOLTEN FISSURE', prog, '#fdba74', '#431407');
}
function drawMagmaEruption(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5 }, R = Math.max(0, (t - sch.start) * sch.speed);
  const o = routePoint(f.x, f.y, size);
  dimFocus(ctx, size, o.x, o.y, 0.35 * Math.max(0, 1 - Math.max(0, t - 1.0) / 0.5), '20, 6, 2');
  for (let i = 0; i < 16; i++) {                                          // a lava geyser at each tile as the eruption reaches it
    const g = tileGrid(i), d = Math.hypot(g.x - f.x, g.y - f.y);
    if (R < d) continue;
    const since = (R - d) / sch.speed, c = ringTile(i, size);
    onceEach(f, 't' + i, () => { for (let k = 0; k < 6; k++) emitParticle(2, c.x, c.y, (Math.random() - 0.5) * 60, -180 - Math.random() * 150, 0.6, 1.8 + Math.random() * 1.6, Math.random() < 0.5 ? '#f97316' : '#fde047'); });
    if (since < 0.45) { const h = 120 * Math.sin(Math.min(1, since / 0.45) * Math.PI); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createLinearGradient(c.x, c.y - h, c.x, c.y); gg.addColorStop(0, 'rgba(253, 224, 71, 0)'); gg.addColorStop(0.4, 'rgba(249, 115, 22, 0.8)'); gg.addColorStop(1, 'rgba(220, 38, 38, 0.9)'); ctx.fillStyle = gg; ctx.fillRect(c.x - 9, c.y - h, 18, h); ctx.restore(); }
  }
}

// ==== Firestorm Tempest — fire and wind ====
function drawTempestGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 8, 2');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';   // fiery whirlwind
  for (let i = 0; i < 14; i++) { const r = 28 + (i % 7) * 9, a = time * (6 + i * 0.3) + i, y = cy - 10 - (i % 7) * 9 * prog; ctx.strokeStyle = i % 2 ? `rgba(${LAVA}, ${0.7 * prog})` : `rgba(254, 243, 199, ${0.45 * prog})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cx, y, r * (1.1 - prog * 0.3), r * 0.35, 0, a, a + 2.2); ctx.stroke(); }
  ctx.restore();
  if (Math.random() < 0.7) emitParticle(0, cx + (Math.random() - 0.5) * 70, cy, (Math.random() - 0.5) * 60, -80 - Math.random() * 60, 0.5, 1.3, Math.random() < 0.5 ? '#fb923c' : '#fde047');
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, LAVA, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '🌪️ FIRESTORM TORNADO', prog, '#fdba74', '#431407');
}
function drawTornado(ctx, x, y, h, alpha, time) {
  if (alpha <= 0) return;
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const k = i / 8, yy = y - k * h, w = 14 + k * 48, off = Math.sin(time * 9 + i * 0.8) * 6 * k;
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(41, 37, 36, ${0.35 * alpha * (1 - k * 0.5)})`; ctx.beginPath(); ctx.ellipse(x + off, yy, w, w * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${LAVA}, ${0.75 * alpha})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x + off, yy, w, w * 0.3, 0, time * 12 + i, time * 12 + i + 3.6); ctx.stroke();
  }
  ctx.restore();
  additiveGlow(ctx, x, y - h * 0.4, h * 0.6, LAVA, 0.4 * alpha);
}
function drawFireTornado(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 20 }, head = 16 - Math.max(0, t - sch.start) * sch.speed;
  if (t < sch.start) return;
  const a = head < 0 ? Math.max(0, 1 + head / 2) : 1, q = trackPoint(Math.max(0, Math.min(15.999, head)), size);
  const trail = [];
  for (let p = Math.min(15.999, Math.max(0, head) + 2); p >= Math.max(0, head); p -= 0.15) { const c = trackPoint(p, size); trail.push({ x: c.x, y: c.y - 4 }); }
  drawFlameLine(ctx, trail, 1, 0.6 * a);
  drawTornado(ctx, q.x, q.y + 8, 170, a, S.battle.time);
  if (a > 0 && Math.random() < 0.8) emitParticle(2, q.x + (Math.random() - 0.5) * 30, q.y - Math.random() * 60, (Math.random() - 0.5) * 160, -40, 0.5, 1.6, Math.random() < 0.5 ? '#57534e' : '#fb923c');
}

// ==== Scalding Vapor Sovereign — fire and water ====
const STEAM = '241, 245, 249';
function drawSteamJets(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), reach = Math.min(1, prog / 0.45), fade = prog < 0.45 ? 1 : 1 - (prog - 0.45) / 0.55;
  chainPts(f, size).forEach((p, idx) => {
    for (let i = 0; i < 9; i++) { const k = (i / 8) * reach; softPuff(ctx, o.x + (p.x - o.x) * k, o.y - 16 + (p.y - 10 - (o.y - 16)) * k, 6 + k * 10, STEAM, 0.35 * fade); }
    if (prog < 0.3) drawFlameLine(ctx, [{ x: o.x, y: o.y - 16 }, { x: o.x + (p.x - o.x) * reach, y: o.y - 16 + (p.y - 10 - (o.y - 16)) * reach }], 1, 0.5);
    if (reach >= 1) onceEach(f, 'h' + idx, () => burstColors(p.x, p.y - 10, 6, ['#ffffff', '#7dd3fc'], 0.7, 0.35));
  });
}
function drawScaldPop(ctx, tx, ty, prog, f) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const a = hash01(i * 3.3) * 6.28, d = 8 + prog * 16, r = 3 + prog * 5; ctx.strokeStyle = `rgba(186, 230, 253, ${0.9 * (1 - prog)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(tx + Math.cos(a) * d, ty - 12 + Math.sin(a) * d * 0.6, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  softPuff(ctx, tx, ty - 18 - prog * 16, 18 + prog * 12, STEAM, 0.45 * (1 - prog));
  onceEach(f, 'pop', () => burstColors(tx, ty - 12, 8, ['#ffffff', '#7dd3fc', '#fb923c'], 0.8, 0.35));
}
function drawSteamGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time, r = 72 * (1 - prog) + 8;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '6, 12, 18');
  for (const [sgn, rgb] of [[1, LAVA], [-1, '56, 189, 248']]) {             // fire and water orbs spiral in and merge
    for (let k = 0; k < 6; k++) { const a = sgn * (time * 5 - k * 0.18); additiveGlow(ctx, cx + Math.cos(a) * r, cy - 10 + Math.sin(a) * r * 0.5, 13 - k * 1.6, rgb, 0.8 - k * 0.12); }
  }
  if (prog > 0.45) for (let i = 0; i < 4; i++) { const ph = (time * 0.9 + i / 4) % 1; softPuff(ctx, cx + Math.sin(i * 2 + time) * 14, cy - 18 - ph * 70, 14 + ph * 22, STEAM, 0.5 * (1 - ph) * (prog - 0.45) * 2); }
  channelLabel(ctx, cx, cy + 150, '💨 SCALDING VAPOR MIST', prog, '#bae6fd', '#082f49');
}
function drawSteamEruption(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size);
  if (t < 0.7) { const h = 280 * Math.sin(Math.min(1, t / 0.7) * Math.PI); ctx.save(); const g = ctx.createLinearGradient(o.x, o.y - h, o.x, o.y); g.addColorStop(0, 'rgba(241, 245, 249, 0)'); g.addColorStop(1, 'rgba(241, 245, 249, 0.75)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x - 12, o.y); ctx.lineTo(o.x - 34, o.y - h); ctx.lineTo(o.x + 34, o.y - h); ctx.lineTo(o.x + 12, o.y); ctx.fill(); ctx.restore(); }
  const R = Math.min(3.4, t * 4), px = tilePx(size);                        // steam rolls outward
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; softPuff(ctx, o.x + Math.cos(a) * R * px.x, o.y + Math.sin(a) * R * px.y, 26 + R * 6, STEAM, 0.35 * Math.max(0, 1 - t / 1.4)); }
}

// ==== Quagmire Colossus — earth and water ====
const MUD = '120, 83, 45';
function drawMudBoulder(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.55;
  if (prog < FLY) { const k = prog / FLY, p = quadPt(x, y - 16, (x + tx) / 2, Math.min(y, ty) - 70, tx, ty, k); ctx.save(); ctx.fillStyle = '#57381d'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#7c5a32'; ctx.beginPath(); ctx.arc(p.x - 2, p.y - 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
  const q = (prog - FLY) / (1 - FLY);
  onceEach(f, 'splat', () => droplets(tx, ty, 12, '#6b4423', 1));
  ctx.save(); ctx.globalAlpha = 0.8 * (1 - q); ctx.fillStyle = '#5b3a1e'; ctx.beginPath(); ctx.ellipse(tx, ty + 6, 12 + q * 14, 4 + q * 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawQuagmireGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '10, 8, 2');
  ctx.save(); ctx.lineCap = 'round';                                     // mud tendrils rising from a ring
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + time * 0.3, bx = cx + Math.cos(a) * 66, by = cy + 10 + Math.sin(a) * 28, h = 70 * prog; ctx.strokeStyle = `rgba(${MUD}, 0.9)`; ctx.lineWidth = 7 - 3 * prog; ctx.beginPath(); ctx.moveTo(bx, by); for (let s = 1; s <= 8; s++) ctx.lineTo(bx + Math.sin(s * 0.9 + time * 4 + i) * 6, by - h * s / 8); ctx.stroke(); }
  ctx.restore();
  channelRing(cx, cy, prog, 5, 80, 46, (x, y, i, depth, appear) => { ctx.save(); ctx.globalAlpha = appear * depth; ctx.fillStyle = '#57534e'; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, rr = 8 * (0.8 + hash01(i * 6 + k) * 0.35); if (k) ctx.lineTo(x + Math.cos(a) * rr, y - 10 + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y - 10 + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); });
  additiveGlow(ctx, cx, cy, 44 + 36 * prog, '101, 163, 13', 0.18 + 0.4 * prog);
  channelLabel(ctx, cx, cy + 150, '🌿 PRIMORDIAL QUAGMIRE', prog, '#bef264', '#1a2e05');
}
function drawMudWave(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5, hits: [] }, R = Math.max(0, (t - sch.start) * sch.speed);
  if (R > 0 && R < 4.8) waveRing(ctx, size, f.x, f.y, R, (x, y, rx, ry) => {
    ctx.save(); ctx.strokeStyle = `rgba(${MUD}, ${0.7 * (1 - R / 4.8)})`; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(x, y + 8, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.35 * (1 - R / 4.8)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    if (Math.random() < 0.9) { const a = Math.random() * 6.28; emitParticle(2, x + Math.cos(a) * rx, y + 8 + Math.sin(a) * ry, (Math.random() - 0.5) * 40, -80 - Math.random() * 60, 0.45, 1.8, '#6b4423'); }
  });
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (p) onceEach(f, 'h' + h.uid, () => droplets(p.x, p.y, 10, '#5b3a1e', 1)); }
}

// ==== Glacial Typhoon — water and wind ====
const ICE = '186, 230, 253';
function drawIceShard(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(0, -4); ctx.lineTo(-10, 0); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  additiveGlow(ctx, x, y, 10 * k, ICE, 0.6 * alpha);
}
function drawIceShards(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), FLY = 0.55;
  chainPts(f, size).forEach((p, idx) => {
    if (prog < FLY) { const k = prog / FLY, x = o.x + (p.x - o.x) * k, y = o.y - 16 + (p.y - 10 - (o.y - 16)) * k; drawIceShard(ctx, x, y, Math.atan2(p.y - o.y, p.x - o.x), 1.1, 1); return; }
    onceEach(f, 'h' + idx, () => { for (let i = 0; i < 8; i++) { const a = Math.random() * 6.28, v = 50 + Math.random() * 90; emitParticle(3, p.x, p.y - 10, Math.cos(a) * v, Math.sin(a) * v - 30, 0.45, 1.6, Math.random() < 0.5 ? '#e0f2fe' : '#7dd3fc'); } droplets(p.x, p.y - 6, 4, '#38bdf8', 0.5); });
  });
}
function drawSnowflake(ctx, x, y, r, alpha, rot) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); ctx.lineTo(Math.cos(a + 0.5) * r * 0.8, Math.sin(a + 0.5) * r * 0.8); ctx.stroke(); }
  ctx.restore();
}
function drawBlizzardGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '4, 10, 18');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#f0f9ff';   // snow vortex
  for (let i = 0; i < 46; i++) { const r = 20 + hash01(i) * 90 * (1 - prog * 0.4), a = time * (2 + hash01(i * 2) * 3) + i; ctx.globalAlpha = 0.4 + 0.5 * hash01(i * 5); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy - 8 + Math.sin(a) * r * 0.45, 1 + hash01(i * 3) * 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 82, 46, (x, y, i, depth, appear) => drawSnowflake(ctx, x, y - 8, 9, appear * depth, S.battle.time * 2 + i));
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, ICE, 0.22 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '❄️ GLACIAL BLIZZARD', prog, '#bae6fd', '#082f49');
}
function drawBlizzard(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5, hits: [] }, R = Math.max(0, Math.min(5, (t - sch.start) * sch.speed));
  const o = routePoint(f.x, f.y, size), px = tilePx(size), fade = Math.max(0, 1 - Math.max(0, t - 1.0) / 0.6);
  dimFocus(ctx, size, o.x, o.y, 0.35 * fade, '4, 10, 18');
  if (R > 0) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(o.x, o.y, R * px.x, R * px.y, 0, 0, Math.PI * 2); ctx.clip();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${ICE}, ${0.1 * fade})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(240, 249, 255, ${0.75 * fade})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (let i = 0; i < 140; i++) { const x = (hash01(i) * size + S.battle.time * 260) % size, y = (hash01(i * 7.1) * size + S.battle.time * 120) % size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y - 4); ctx.stroke(); }
    ctx.restore();
  }
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (p) onceEach(f, 'h' + h.uid, () => burstColors(p.x, p.y - 10, 10, ['#ffffff', '#bae6fd', '#7dd3fc'], 1, 0.4)); }
}

// ==== Sandstorm Titan — earth and wind ====
const SAND = '217, 119, 6';
function drawSandLance(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = [{ x: o.x, y: o.y - 18 }, ...chainPts(f, size).map(p => ({ x: p.x, y: p.y - 10 }))];
  if (pts.length < 2) return;
  const reach = Math.min(1, prog / 0.35), fade = prog < 0.35 ? 1 : 1 - (prog - 0.35) / 0.65, last = reach * (pts.length - 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, c] of [[10, `rgba(${SAND}, ${0.3 * fade})`], [3, `rgba(253, 230, 138, ${0.85 * fade})`]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) { const k = Math.min(1, last - (i - 1)); if (k <= 0) break; ctx.lineTo(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k); }
    ctx.stroke();
  }
  ctx.restore();
  pts.forEach((p, i) => { if (i && last >= i) onceEach(f, 'h' + i, () => { for (let k = 0; k < 7; k++) emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 120, -40 - Math.random() * 80, 0.4, 1.3, Math.random() < 0.5 ? '#d6d3d1' : '#d97706'); }); });
}
// The Titan's 10s channel is the ability: an amber storm over the whole board for its duration.
function drawSandstormChannel(ctx, cx, cy, prog, size, u) {
  const time = S.battle.time, dur = u?.channeling?.duration || 10, elapsed = prog * dur, left = dur - elapsed;
  const a = Math.min(1, elapsed / 0.6) * Math.min(1, left / 0.6);
  dimFocus(ctx, size, cx, cy, 0.3 * a, '24, 14, 2');
  ctx.save(); ctx.fillStyle = `rgba(180, 120, 40, ${0.16 * a})`; ctx.fillRect(0, 0, size, size); ctx.restore();
  for (let i = 0; i < 6; i++) softPuff(ctx, (hash01(i) * size + time * 60) % (size + 200) - 100, hash01(i * 3) * size, 110, '161, 98, 7', 0.18 * a);   // dust clouds
  ctx.save(); ctx.lineCap = 'round';                                     // blowing sand streaks
  for (let i = 0; i < 110; i++) { const sp = 260 + hash01(i * 2) * 240, x = (hash01(i) * (size + 120) + time * sp) % (size + 120) - 60, y = (hash01(i * 5.3) * size + time * sp * 0.25) % size; ctx.strokeStyle = i % 3 ? `rgba(253, 230, 138, ${0.45 * a})` : `rgba(${SAND}, ${0.55 * a})`; ctx.lineWidth = 1 + hash01(i * 7) * 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y - 4); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';   // vortex around the Titan
  for (let i = 0; i < 8; i++) { const r = 34 + i * 7, s = time * (5 - i * 0.3) + i; ctx.strokeStyle = `rgba(253, 230, 138, ${0.4 * a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy - i * 6, r, r * 0.32, 0, s, s + 2.4); ctx.stroke(); }
  ctx.restore();
  channelLabel(ctx, cx, cy + 150, `🏜️ SANDSTORM · ${Math.max(0, left).toFixed(1)}s`, prog, '#fde68a', '#422006');
}
function drawSandPulse(ctx, f, size) {
  const prog = fxProg(f);
  for (const uid of f.schedule?.hits || []) {
    const p = enemyPt(f, uid, size); if (!p) continue;
    onceEach(f, 'h' + uid, () => { for (let k = 0; k < 6; k++) emitParticle(2, p.x, p.y - 8, (Math.random() - 0.5) * 90, -30 - Math.random() * 50, 0.4, 1.2, Math.random() < 0.5 ? '#d6d3d1' : '#b45309'); });
    ctx.save(); ctx.globalAlpha = 1 - prog; ctx.translate(p.x + 14, p.y - 30);   // cracked-armour mark
    ctx.fillStyle = 'rgba(120, 113, 108, 0.85)'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(6, -4); ctx.lineTo(5, 3); ctx.lineTo(0, 7); ctx.lineTo(-5, 3); ctx.lineTo(-6, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -6); ctx.lineTo(1, -1); ctx.lineTo(-2, 2); ctx.lineTo(1, 6); ctx.stroke();
    ctx.restore();
  }
}

// ==== Ground zones: magma fissures, vapor mist, swamp, Xuanwu toxin, Rebirth Inferno flames ====
export function drawElementalZones(ctx, size) {
  const time = S.battle.time;
  for (const z of S.battle.arcaneZones || []) {
    const left = z.until - time, born = time - (z.at ?? time - 1), a = Math.min(1, born / 0.25) * Math.min(1, left / 0.4);
    if (a <= 0) continue;
    if (z.type === 'magma') { const c = trackPoint(Math.floor(z.p) % 16 + 0.5, size); drawLavaCracks(ctx, c.x, c.y + 6, Math.floor(z.p) * 3.7, 1, a, time); }
    else if (z.type === 'magmaFissure16') {
      const owner = S.battle.units.find(v => v.uid === z.owner), ox = owner ? owner.x + 1 : 2, oy = owner ? owner.y + 1 : 2;
      for (let i = 0; i < 16; i++) { const g = tileGrid(i), reach = (born - 0.15) * 5 - Math.hypot(g.x - ox, g.y - oy); if (reach < 0) continue; const c = ringTile(i, size); drawLavaCracks(ctx, c.x, c.y + 6, i * 5.1, 1.2, a * Math.min(1, reach), time); }
    } else if (z.type === 'vaporMist') {
      for (let i = 0; i < 16; i++) { const c = ringTile(i, size); for (let k = 0; k < 2; k++) { const ph = (time * 0.35 + hash01(i * 4 + k)) % 1; softPuff(ctx, c.x + Math.sin(time + i + k) * 10, c.y - ph * 26, 26 + ph * 10, STEAM, 0.28 * a * Math.sin(ph * Math.PI)); } }
    } else if (z.type === 'swamp') {
      const q0 = (z.wall ?? Math.floor((z.p || 0) / 4)) * 4;           // the swamp covers the whole quadrant (4 tiles)
      for (let i = 0; i < 4; i++) {
        const c = ringTile(q0 + i, size);
        ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.fillStyle = '#3f3a12'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 34, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4d5a16'; ctx.beginPath(); ctx.ellipse(c.x + 6, c.y + 6, 20, 7, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        for (let k = 0; k < 3; k++) { const ph = (time * 0.8 + hash01(i * 9 + k + q0)) % 1, bx = c.x + (hash01(i * 3 + k) - 0.5) * 40, by = c.y + 8 + (hash01(i * 5 + k) - 0.5) * 12; ctx.save(); ctx.strokeStyle = `rgba(190, 242, 100, ${0.45 * a * (1 - ph)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, by, 1 + ph * 3.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }
    }
  }
  for (const z of S.battle.xuanwuToxins || []) {                             // Xuanwu toxic pool over the quadrant
    const left = z.until - time, a = Math.min(1, (time - (z.at ?? time - 1)) / 0.25) * Math.min(1, left / 0.4);
    if (a <= 0) continue;
    for (let i = 0; i < 4; i++) {
      const c = ringTile(z.quadrant * 4 + i, size);
      ctx.save(); ctx.globalAlpha = 0.55 * a; ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 34, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      softPuff(ctx, c.x, c.y + 6, 30, VENOM, 0.3 * a, true);
      for (let k = 0; k < 3; k++) { const ph = (time * 0.7 + hash01(i * 7 + k)) % 1; softPuff(ctx, c.x + (hash01(i + k * 3) - 0.5) * 30, c.y - ph * 30, 8 + ph * 8, VENOM, 0.35 * a * (1 - ph), true); }
    }
  }
  for (const z of S.battle.phoenixFlames || []) {                            // Rebirth Inferno: flames on each ignited tile
    for (let i = 0; i < 16; i++) {
      const ignite = z.start + (16 - (i + 0.5)) / z.speed, since = time - ignite;
      if (since < 0 || since > z.dur) continue;
      const a = Math.min(1, since / 0.15) * Math.min(1, (z.dur - since) / 0.5), c = trackPoint(i + 0.5, size);
      additiveGlow(ctx, c.x, c.y + 4, 30, FLAME, 0.45 * a);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        const fx0 = c.x + (k - 1) * 11, h = (16 + 8 * Math.sin(time * 14 + i * 3 + k * 2)) * a;
        const g = ctx.createLinearGradient(fx0, c.y + 6 - h, fx0, c.y + 6); g.addColorStop(0, 'rgba(253, 224, 71, 0)'); g.addColorStop(0.5, `rgba(249, 115, 22, ${0.7 * a})`); g.addColorStop(1, `rgba(220, 38, 38, ${0.8 * a})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx0 - 6, c.y + 6); ctx.quadraticCurveTo(fx0 - 4, c.y + 6 - h * 0.6, fx0, c.y + 6 - h); ctx.quadraticCurveTo(fx0 + 4, c.y + 6 - h * 0.6, fx0 + 6, c.y + 6); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// Status marks drawn on enemies by these units: fear, ice block, mud sink, lightning stun crackle.
export function drawElementalMarks(ctx, size) {
  const time = S.battle.time;
  for (const e of S.battle.enemies) {
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(visualTrackP(e), size);
    if ((e.fearUntil || 0) > time) {
      ctx.save(); ctx.font = '900 16px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#7f1d1d'; ctx.fillStyle = '#ffffff';
      const y = p.y - 34 + Math.sin(time * 10 + e.uid) * 2; ctx.strokeText('!', p.x, y); ctx.fillText('!', p.x, y); ctx.restore();
    }
    if ((e.iceBlockUntil || 0) > time) {
      const a = Math.min(1, (e.iceBlockUntil - time) / 0.3);
      ctx.save(); ctx.globalAlpha = 0.75 * a; ctx.fillStyle = 'rgba(186, 230, 253, 0.45)'; ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x - 13, p.y + 8); ctx.lineTo(p.x - 15, p.y - 14); ctx.lineTo(p.x - 6, p.y - 26); ctx.lineTo(p.x + 8, p.y - 24); ctx.lineTo(p.x + 15, p.y - 10); ctx.lineTo(p.x + 12, p.y + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - 6, p.y - 20); ctx.lineTo(p.x - 2, p.y - 6); ctx.stroke(); ctx.restore();
    }
    if ((e.mudSinkUntil || 0) > time) {
      const a = Math.min(1, (e.mudSinkUntil - time) / 0.3);
      ctx.save(); ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#4a3218'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.ellipse(p.x - 4, p.y + 1, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    if ((e.azureStunUntil || 0) > time && hash01(Math.floor(time * 20) + e.uid) > 0.4) {
      drawBolt(ctx, p.x - 12, p.y - 22, p.x + 10, p.y - 4, Math.floor(time * 30) + e.uid, AZURE, 0.8, 1.2);
    }
  }
}
// Channel type → gather drawer (draw() live channel pass); called as (ctx, cx, cy, prog, size, unit).
export const ELEMENT_GATHER = { 'azure-dragon': drawAzureGather, 'white-tiger': drawTigerGather, 'xuanwu-toxin': drawXuanwuGather, 'phoenix-inferno': drawPhoenixGather, 'great-sage-staff': drawSageGather, magmaLord: drawMagmaGather, tempestArchon: drawTempestGather, steamSovereign: drawSteamGather, quagmireColossus: drawQuagmireGather, blizzardArchon: drawBlizzardGather, sandstormTitan: drawSandstormChannel };
// Effect type or vfxKind → drawer (draw() effects pass); called as (ctx, f, size, x, y, tx, ty, prog).
export const ELEMENT_FX = {
  'azure-bolts': (c, f, s) => drawAzureBolts(c, f, s), 'azure-wrath': (c, f, s) => drawAzureWrath(c, f, s),
  'tiger-claw': (c, f, s, x, y, tx, ty, p) => drawTigerClaw(c, tx, ty, p, f), 'tiger-roar': (c, f, s) => drawTigerRoar(c, f, s),
  'venom-strike': (c, f, s) => drawVenomStrike(c, f, s), 'xuanwu-lob': (c, f, s) => drawXuanwuLob(c, f, s),
  'phoenix-feather': (c, f, s, x, y, tx, ty, p) => drawPhoenixFeather(c, x, y, tx, ty, p, f), 'flame-spread': (c, f, s) => drawFlameSpread(c, f, s), 'phoenix-inferno': (c, f, s) => drawPhoenixInferno(c, f, s),
  'staff-strike': (c, f, s) => drawStaffStrike(c, f, s), 'clone-cloud': (c, f, s) => drawCloneCloud(c, f, s), 'sage-staff': (c, f, s) => drawSageStaff(c, f, s),
  'magma-rock': (c, f, s, x, y, tx, ty, p) => drawMagmaRock(c, x, y, tx, ty, p, f), 'magma-eruption': (c, f, s) => drawMagmaEruption(c, f, s),
  'fire-gust': (c, f, s) => drawFireGust(c, f, s), 'fire-tornado': (c, f, s) => drawFireTornado(c, f, s),
  'steam-jets': (c, f, s) => drawSteamJets(c, f, s), 'scald-pop': (c, f, s, x, y, tx, ty, p) => drawScaldPop(c, tx, ty, p, f), 'steam-eruption': (c, f, s) => drawSteamEruption(c, f, s),
  'mud-boulder': (c, f, s, x, y, tx, ty, p) => drawMudBoulder(c, x, y, tx, ty, p, f), 'mud-wave': (c, f, s) => drawMudWave(c, f, s),
  'ice-shards': (c, f, s) => drawIceShards(c, f, s), 'blizzard': (c, f, s) => drawBlizzard(c, f, s),
  'sand-lance': (c, f, s) => drawSandLance(c, f, s), 'sand-pulse': (c, f, s) => drawSandPulse(c, f, s)
};
// Ultimate effects whose engine text label is replaced by the visual itself.
export const ELEMENT_ULTS = ['azure-wrath', 'tiger-roar', 'xuanwu-lob', 'sage-staff', 'phoenix-inferno', 'magma-eruption', 'fire-tornado', 'steam-eruption', 'mud-wave', 'blizzard'];
