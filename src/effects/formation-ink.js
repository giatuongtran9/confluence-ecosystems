import { routePoint } from '../battlefield.js';
import { additiveGlow, dimFocus, emitParticle, hash01 } from './core.js';
import { nudgeEnemy } from './sword-music.js';
import { Game } from '../lib.js';
import { S } from '../state.js';

// ---- Formation Master · Star-River Weiqi Board (Tinh Hà Kỳ Trận) ----
// Gather: night falls, silver Go-board lines spread from the Master, the four corner tiles glow as star
// points and black/white stones snap onto enemies as the grid reaches them.
// Release (seconds after channel end, engine time; see engine formation-star-river branch): after a 0.15s
// opening a star river flows backward along the track from the exit end at schedule.sweep tiles/s. Each enemy
// is warped back and hit as it arrives (e.warpFx drives the slide); corner landings get a starburst.
const NIGHT_RGB = '3, 7, 22', SILVER_RGB = '226, 232, 240', RIVER_RGB = '147, 197, 253';
const FORMATION_CORNERS = [0, 4, 8, 12];
const STARFIELD = Array.from({ length: 70 }, (_, i) => ({ x: hash01(i * 3.1 + 1), y: hash01(i * 7.7 + 2), s: 0.6 + hash01(i * 1.3) * 1.5, ph: hash01(i * 9.9) * 6.28 }));
export const easeOut = k => 1 - (1 - k) * (1 - k);

// Visual track position: after a Star-River warp the enemy slides back over 0.45s instead of jumping.
export function visualTrackP(e) {
  const w = e.warpFx;
  if (!w || !S.battle) return e.p;
  const k = (S.battle.time - w.at) / 0.45;
  if (k >= 1 || k < 0) return e.p;
  return e.p + (w.from - w.to) * (1 - easeOut(k));
}
export function trackPoint(p, size) { const tp = Game.track(Math.max(0, Math.min(15.999, p))); return routePoint(tp.x, tp.y, size); }
export function ringTile(i, size) { const [x, y] = Game.ring[i]; return routePoint(x, y, size); }

function drawStarfield(ctx, size, alpha, time) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgb(${SILVER_RGB})`;
  for (const s of STARFIELD) {
    ctx.globalAlpha = alpha * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 3 + s.ph)));
    ctx.beginPath(); ctx.arc(s.x * size, s.y * size, s.s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// 9x9 Go grid through the tile centres (every half tile across the 5x5 board), revealed within radius r of (cx, cy).
function drawWeiqiGrid(ctx, size, cx, cy, r, alpha) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${SILVER_RGB}, ${0.32 * alpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const v = i * 0.5, a = routePoint(v, 0, size), b = routePoint(v, 4, size), c = routePoint(0, v, size), d = routePoint(4, v, size);
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  }
  ctx.stroke();
  ctx.restore();
}
export function drawStarPoint(ctx, x, y, r, alpha, rgb = SILVER_RGB) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 2.2, RIVER_RGB, 0.45 * alpha);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {                       // four-pointed star
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r;
    if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
export function drawGoStoneDisc(ctx, x, y, r, white, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath(); ctx.ellipse(x + 1.5, y + r * 0.45, r, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  if (white) { g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e2e8f0'); g.addColorStop(1, '#94a3b8'); }
  else { g.addColorStop(0, '#64748b'); g.addColorStop(0.35, '#1e293b'); g.addColorStop(1, '#020617'); }
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = white ? 'rgba(148, 163, 184, 0.8)' : 'rgba(147, 197, 253, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export function drawFormationGather(ctx, cx, cy, prog, size) {
  const time = S.battle.time, maxR = size * 0.95, R = maxR * easeOut(Math.min(1, prog / 0.4));   // grid projected in 0-0.4s
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25), NIGHT_RGB);
  drawStarfield(ctx, size, Math.min(1, prog / 0.3), time);
  drawWeiqiGrid(ctx, size, cx, cy, R, 1);
  ctx.save();                                              // leading edge of the spreading grid
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.45 * (1 - prog)})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  for (const i of FORMATION_CORNERS) {                     // star points light up when the grid reaches them
    const p = ringTile(i, size), d = Math.hypot(p.x - cx, p.y - cy);
    const on = Math.min(1, Math.max(0, (R - d) / 40));
    drawStarPoint(ctx, p.x, p.y, 9 + 2 * Math.sin(time * 6 + i), on);
  }
  for (const e of S.battle.enemies) {                        // stones snap onto enemies under the grid
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(e.p, size), d = Math.hypot(p.x - cx, p.y - cy), k = Math.min(1, Math.max(0, (R - d) / 30));
    if (k <= 0) continue;
    drawGoStoneDisc(ctx, p.x, p.y + 8, 7 * (1.5 - 0.5 * k), e.uid % 2 === 1, k);
  }
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, RIVER_RGB, 0.2 + 0.45 * prog);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#bfdbfe';
  ctx.fillText('✦ TINH HÀ KỲ TRẬN', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

export function drawFormationRiver(ctx, f, size) {
  const t = (f.maxTtl || 2) - f.ttl;                       // seconds since release, engine time
  const sch = f.schedule || { hits: [], start: 0.15, sweep: 16 / 0.6 };
  const o = routePoint(f.x, f.y, size), time = S.battle.time;
  const riverEnd = sch.start + 16 / sch.sweep, TAIL = 0.5;  // tail: how long a passed stretch stays lit
  const after = Math.max(0, t - riverEnd);
  f._landed ??= {};

  dimFocus(ctx, size, o.x, o.y, 0.55 * Math.max(0, 1 - after / 0.5), NIGHT_RGB);
  drawStarfield(ctx, size, Math.max(0, 1 - after / 0.6), time);
  drawWeiqiGrid(ctx, size, o.x, o.y, size * 0.95, Math.max(0, 1 - Math.max(0, t - 0.9) / 0.6));
  for (const i of FORMATION_CORNERS) {
    const p = ringTile(i, size);
    drawStarPoint(ctx, p.x, p.y, 10 + 2 * Math.sin(time * 6 + i), Math.max(0, 1 - after / 0.8));
  }

  // Stones stay on enemies the river hasn't reached yet
  const hitAt = {};
  for (const h of sch.hits) hitAt[h.uid] = h.at;
  for (const e of S.battle.enemies) {
    if (e.gone || e.hp <= 0 || hitAt[e.uid] == null || t >= hitAt[e.uid]) continue;
    const p = trackPoint(visualTrackP(e), size);
    drawGoStoneDisc(ctx, p.x, p.y + 8, 7, e.uid % 2 === 1, 1);
  }

  // The star river: lit stretch of track from the front back toward the exit, fading over TAIL seconds
  const front = 16 - Math.max(0, t - sch.start) * sch.sweep;
  if (t >= sch.start && t < riverEnd + TAIL) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const STEP = 0.2;
    for (let p = Math.max(0, front); p < 16; p += STEP) {
      const passedAt = sch.start + (16 - p) / sch.sweep, age = t - passedAt;
      const a = Math.max(0, 1 - age / TAIL);
      if (a <= 0) continue;
      const p0 = trackPoint(p, size), p1 = trackPoint(Math.min(15.999, p + STEP), size);
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.18 * a})`; ctx.lineWidth = 30;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.45 * a})`; ctx.lineWidth = 10;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${SILVER_RGB}, ${0.8 * a})`; ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    // Stars drifting in the river, flowing backward with it
    const tailTiles = TAIL * sch.sweep;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgb(${SILVER_RGB})`;
    for (let k = 0; k < 46; k++) {
      const p = front + ((hash01(k * 5.3) * tailTiles + time * 3) % tailTiles);
      if (p < 0 || p >= 16) continue;
      const age = t - (sch.start + (16 - p) / sch.sweep), a = Math.max(0, 1 - age / TAIL);
      const q = trackPoint(p, size), off = (hash01(k * 2.9) - 0.5) * 22;
      ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(time * 9 + k));
      ctx.beginPath(); ctx.arc(q.x + off, q.y + off * 0.5, 1 + hash01(k) * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (front > 0) { const q = trackPoint(front, size); additiveGlow(ctx, q.x, q.y, 46, SILVER_RGB, 0.7); }
  }

  // Hits: a starburst where the river meets each enemy, a star trail while it slides back, corner flares
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const e = S.battle.enemies.find(v => v.uid === h.uid);
    const w = e?.warpFx;
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      if (e && w) {
        const p = trackPoint(w.from, size);
        for (let i = 0; i < (w.corner ? 22 : 10); i++) {
          const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 140) * (w.corner ? 1.4 : 1);
          emitParticle(0, p.x, p.y, Math.cos(a) * v, Math.sin(a) * v, 0.3 + Math.random() * 0.3, 1.2 + Math.random() * 1.4, w.corner ? (Math.random() < 0.5 ? '#fde68a' : '#ffffff') : (Math.random() < 0.5 ? '#e2e8f0' : '#93c5fd'));
        }
      }
    }
    if (!e || !w || e.gone) continue;
    const since = time - w.at;
    if (since < 0.6) {                                     // trail from where it was hit to where it is now
      const vp = visualTrackP(e), a = Math.max(0, 1 - since / 0.6);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.7 * a})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let p = vp, i = 0; p <= w.from + 0.001; p += 0.15, i++) { const q = trackPoint(p, size); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.stroke();
      ctx.restore();
    }
    if (w.corner && since < 0.7) {                         // corner: expanding star and gold flare on the star point
      const q = trackPoint(w.to, size), k = since / 0.7;
      drawStarPoint(ctx, q.x, q.y - 4, 14 + 40 * easeOut(k), 1 - k, '253, 230, 138');
      additiveGlow(ctx, q.x, q.y, 60 * (1 - k * 0.5), '253, 230, 138', 0.7 * (1 - k));
    }
  }
}

// Black Stone / White Stone: a Go stone arcs from the Master and lands on the target with a click and a ripple.
export function drawGoStoneShot(ctx, x, y, tx, ty, prog, white, f) {
  const FLIGHT = 0.55;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, mx = (x + tx) / 2, my = Math.min(y, ty) - 60;
    const px = (1 - k) * (1 - k) * x + 2 * (1 - k) * k * mx + k * k * tx, py = (1 - k) * (1 - k) * y + 2 * (1 - k) * k * my + k * k * ty;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = white ? 'rgba(226, 232, 240, 0.35)' : 'rgba(147, 197, 253, 0.35)';
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const kk = Math.max(0, k - 0.25 + (i / 8) * 0.25);
      const qx = (1 - kk) * (1 - kk) * x + 2 * (1 - kk) * kk * mx + kk * kk * tx, qy = (1 - kk) * (1 - kk) * y + 2 * (1 - kk) * kk * my + kk * kk * ty;
      if (i) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy);
    }
    ctx.stroke();
    ctx.restore();
    drawGoStoneDisc(ctx, px, py, 7, white, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._clicked) {
    f._clicked = true;
    for (let i = 0; i < 6; i++) { const a = -Math.PI * Math.random(), v = 50 + Math.random() * 80; emitParticle(0, tx, ty, Math.cos(a) * v, Math.sin(a) * v, 0.2 + Math.random() * 0.15, 1.1, white ? '#ffffff' : '#93c5fd'); }
  }
  drawGoStoneDisc(ctx, tx, ty, 7, white, 1 - q);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = white ? `rgba(226, 232, 240, ${0.8 * (1 - q)})` : `rgba(147, 197, 253, ${0.8 * (1 - q)})`;
  ctx.lineWidth = 2 * (1 - q);
  ctx.beginPath(); ctx.ellipse(tx, ty + 4, 6 + q * 22, 2.5 + q * 8, 0, 0, Math.PI * 2); ctx.stroke();
  if (white) {                                             // slow: a pale ring settles around the target
    ctx.strokeStyle = `rgba(191, 219, 254, ${0.5 * (1 - q * 0.5)})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.ellipse(tx, ty + 6, 15, 5.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

// Channel type → CSS class that lifts and tints the channelling unit's card (see style.css).
export const CHANNEL_GLOW = { 'sword-torrent': 'channeling-sword', 'melodic-resonance': 'channeling-melodic', 'formation-star-river': 'channeling-formation', 'talisman-decree': 'channeling-talisman', 'landscape-dragon': 'channeling-landscape', 'soul-reap-detonation': 'channeling-soul', 'blood-domain': 'channeling-blood',
  'azure-dragon': 'channeling-azure', 'white-tiger': 'channeling-tiger', 'xuanwu-toxin': 'channeling-xuanwu', 'phoenix-inferno': 'channeling-phoenix', 'great-sage-staff': 'channeling-sage',
  magmaLord: 'channeling-magma', tempestArchon: 'channeling-tempest', steamSovereign: 'channeling-steam', quagmireColossus: 'channeling-quagmire', blizzardArchon: 'channeling-blizzard', sandstormTitan: 'channeling-sandstorm' };

// ==== Shared helpers for the Cultivation apex effects below ====
// Current on-screen point of an enemy (follows slide-backs); remembers the last point after it dies.
export function enemyPt(f, uid, size) {
  f._pos ??= {};
  const e = S.battle.enemies.find(v => v.uid === uid && !v.gone && v.hp > 0);
  if (e) f._pos[uid] = trackPoint(visualTrackP(e), size);
  return f._pos[uid] || null;
}
export function burstColors(x, y, n, colors, speed = 1, life = 0.4, up = false) {
  for (let i = 0; i < n; i++) {
    const a = up ? -Math.PI * (0.15 + Math.random() * 0.7) : Math.random() * Math.PI * 2, v = (60 + Math.random() * 140) * speed;
    emitParticle(0, x, y, Math.cos(a) * v, Math.sin(a) * v, life * (0.7 + Math.random() * 0.6), 1.1 + Math.random() * 1.4, colors[i % colors.length]);
  }
}
export function droplets(x, y, n, color, speed = 1) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), v = (80 + Math.random() * 150) * speed;
    emitParticle(2, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.45 + Math.random() * 0.35, 1.2 + Math.random() * 1.6, color);
  }
}
export function channelLabel(ctx, cx, cy, text, prog, fg, bg) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = fg;
  ctx.fillText(text, cx, cy - 80);
  ctx.fillStyle = bg;
  ctx.fillRect(cx - 48, cy - 72, 96, 5);
  ctx.fillStyle = fg;
  ctx.fillRect(cx - 48, cy - 72, 96 * Math.min(1, prog), 5);
  ctx.restore();
}
export const quadPt = (x0, y0, cx, cy, x1, y1, k) => ({ x: (1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * cx + k * k * x1, y: (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * cy + k * k * y1 });
// Unit-centred channel ring (like Sword Immortal's): count items orbit (cx, cy), drawing in and rising as prog grows.
// draw(x, y, i, depth, appear, angle) renders one item; depth 0.65 (behind) .. 1 (in front).
export function channelRing(cx, cy, prog, count, r0, r1, draw) {
  const radius = r0 - (r0 - r1) * prog, lift = 6 + 14 * prog, now = S.battle.time;
  for (let i = 0; i < count; i++) {
    const appear = Math.min(1, Math.max(0, (prog - (i / count) * 0.4) / 0.12));
    if (appear <= 0) continue;
    const a = (i / count) * Math.PI * 2 + prog * 1.6 + now * 0.6;
    const tremble = prog > 0.8 ? Math.sin(now * 90 + i * 1.7) * (prog - 0.8) * 8 : 0;
    draw(cx + Math.cos(a) * radius + tremble, cy + Math.sin(a) * radius * 0.45 - lift, i, 0.65 + 0.35 * (Math.sin(a) + 1) / 2, appear, a);
  }
}

// ==== Talisman Sovereign · Imperial Ink Decree (Hoàng Kim Thánh Chỉ) ====
// Gather: a ring of talismans orbits and tightens around the Sovereign while a golden imperial scroll unrolls
// above and golden script is written column by column (right to left), sealed with a red imperial stamp.
// Release: talismans fly from the scroll and seal onto enemies one by one (schedule.hits); executes burn in gold.
const GOLD_RGB = '250, 204, 21';
export function drawTalismanPaper(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-6, -10, 12, 20);
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.2;
  ctx.strokeRect(-5, -9, 10, 18);
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';   // abstract talisman sigil strokes
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.moveTo(0, -7); ctx.lineTo(0, 6); ctx.moveTo(-3, -1); ctx.quadraticCurveTo(0, 2, 3, -1); ctx.moveTo(-2, 4); ctx.lineTo(2, 4); ctx.stroke();
  ctx.restore();
}
// Golden script: brush strokes in 6 vertical columns, generated once (normalised 0..1 scroll coordinates).
const SCRIPT_STROKES = (() => {
  const out = [];
  for (let c = 0; c < 6; c++) {
    const x = 0.86 - c * 0.14;                     // columns from right to left
    for (let s = 0; s < 6; s++) {
      const seed = c * 31 + s * 7.7, y0 = 0.16 + s * 0.12 + (hash01(seed) - 0.5) * 0.04, kind = Math.floor(hash01(seed + 1) * 4);
      const dx = (hash01(seed + 2) - 0.5) * 0.06, len = 0.06 + hash01(seed + 3) * 0.05;
      const st = kind === 0 ? [x - 0.035, y0, x + dx, y0 - 0.02, x + 0.035, y0 + 0.01]          // horizontal
        : kind === 1 ? [x + dx * 0.3, y0 - 0.02, x + dx, y0 + len * 0.5, x - dx * 0.4, y0 + len]  // vertical
        : kind === 2 ? [x + 0.02, y0, x - 0.01, y0 + 0.03, x - 0.035, y0 + len]                  // left-falling
        : [x - 0.01, y0, x + 0.01, y0 + 0.03, x + 0.035, y0 + len];                               // right-falling
      out.push({ st, w: 1.6 + hash01(seed + 4) * 1.8, order: (c + s / 6) / 6 });
    }
  }
  return out;
})();
function scrollGeom(cx, cy) { return { x: cx, y: Math.max(52, cy - 128), w: 230, h: 64 }; }
function drawImperialSeal(ctx, x, y, s, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.06);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-12, -12, 24, 24);
  ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 1.4;     // carved border and a square-spiral seal pattern
  ctx.strokeRect(-10, -10, 20, 20);
  ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, -7); ctx.lineTo(7, 7); ctx.lineTo(-4, 7); ctx.lineTo(-4, -4); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.lineTo(-1, 4); ctx.lineTo(-1, -1); ctx.stroke();
  ctx.restore();
}
function drawImperialScroll(ctx, g, open, write, glow, alpha, time, seal = 0) {
  if (alpha <= 0 || open <= 0) return;
  const w = g.w * open, x0 = g.x - w / 2, y0 = g.y - g.h / 2;
  additiveGlow(ctx, g.x, g.y, 95 + 40 * glow, GOLD_RGB, (0.22 + 0.4 * glow) * alpha);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const bg = ctx.createLinearGradient(0, y0, 0, y0 + g.h);
  bg.addColorStop(0, '#f6e4b8'); bg.addColorStop(0.5, '#fbeccc'); bg.addColorStop(1, '#e3c78a');
  ctx.fillStyle = bg;
  ctx.fillRect(x0, y0, w, g.h);
  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2;
  ctx.strokeRect(x0 + 3, y0 + 3, w - 6, g.h - 6);
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)'; ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 6, y0 + 6, w - 12, g.h - 12);
  // Golden script written right to left; each stroke appears once the brush reaches its place in the order
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, w, g.h); ctx.clip();
  ctx.lineCap = 'round';
  for (const s of SCRIPT_STROKES) {
    const k = Math.min(1, Math.max(0, (write - s.order) * 8));
    if (k <= 0) continue;
    const [ax, ay, bx, by, cx2, cy2] = s.st, px = v => g.x - g.w / 2 + v * g.w, py = v => y0 + v * g.h;
    const end = quadPt(px(ax), py(ay), px(bx), py(by), px(cx2), py(cy2), k);
    ctx.strokeStyle = '#a16207'; ctx.lineWidth = s.w;
    ctx.beginPath(); ctx.moveTo(px(ax), py(ay));
    ctx.quadraticCurveTo(px(ax) + (px(bx) - px(ax)) * k, py(ay) + (py(by) - py(ay)) * k, end.x, end.y);
    ctx.stroke();
  }
  ctx.restore();
  if (glow > 0.2 && write > 0) {                               // gold sheen over the script
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${GOLD_RGB}, ${0.12 * glow})`;
    ctx.fillRect(x0, y0, w, g.h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (write > 0 && write < 1) {                                 // brush tip at the writing front
    const s = SCRIPT_STROKES.reduce((best, v) => Math.abs(v.order - write) < Math.abs(best.order - write) ? v : best);
    const bx = g.x - g.w / 2 + s.st[4] * g.w, by = y0 + s.st[5] * g.h;
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.ellipse(bx, by - 6 + Math.sin(time * 30) * 2, 2.6, 7, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx + 2, by - 12); ctx.lineTo(bx + 12, by - 34); ctx.stroke();
  }
  for (const sx of [x0, x0 + w]) {                              // rollers
    ctx.fillStyle = '#5b3a1a';
    ctx.fillRect(sx - 4, y0 - 7, 8, g.h + 14);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(sx - 5, y0 - 10, 10, 4);
    ctx.fillRect(sx - 5, y0 + g.h + 6, 10, 4);
  }
  ctx.restore();
  if (seal > 0) drawImperialSeal(ctx, x0 + 26, g.y + 8, 1 + 0.6 * (1 - seal), Math.min(1, seal * 2) * alpha);
}
export function drawTalismanGather(ctx, cx, cy, prog, size) {
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '24, 14, 4');
  const g = scrollGeom(cx, cy), write = Math.min(1, Math.max(0, (prog - 0.3) / 0.55));
  drawImperialScroll(ctx, g, easeOut(Math.min(1, prog / 0.35)), write, prog, 1, S.battle.time, Math.max(0, (prog - 0.88) / 0.12));
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, GOLD_RGB, 0.2 + 0.45 * prog);
  channelRing(cx, cy, prog, 10, 80, 44, (x, y, i, depth, appear, a) => {
    additiveGlow(ctx, x, y, 14, GOLD_RGB, 0.45 * appear);
    drawTalismanPaper(ctx, x, y + Math.sin(S.battle.time * 5 + i) * 2, Math.cos(a) * 0.3, 1.25, appear * depth);
  });
  channelLabel(ctx, cx, cy + 150, '📜 HOÀNG KIM THÁNH CHỈ', prog, '#fde047', '#451a03');
}
export function drawTalismanDecree(ctx, f, size) {
  const t = (f.maxTtl || 1.6) - f.ttl, sch = f.schedule || { hits: [] };
  const o = routePoint(f.x, f.y, size), g = scrollGeom(o.x, o.y), FLIGHT = 0.25;
  f._landed ??= {};
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.4), '24, 14, 4');
  drawImperialScroll(ctx, g, 1, 1, t < 0.2 ? 1.6 : 1, Math.max(0, 1 - Math.max(0, t - 0.95) / 0.4), S.battle.time, 1);
  if (t < 0.25) additiveGlow(ctx, g.x - g.w / 2 + 26, g.y + 8, 40, '248, 113, 113', 0.8 * (1 - t / 0.25));   // the seal flares
  for (const h of sch.hits) {
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (t < h.at) {
      if (t < h.at - FLIGHT) continue;
      const k = (t - (h.at - FLIGHT)) / FLIGHT, side = (hash01(h.uid) - 0.5) * 140;
      const q = quadPt(g.x, g.y, (g.x + p.x) / 2 + side, Math.min(g.y, p.y) - 40, p.x, p.y - 26, k * k);
      additiveGlow(ctx, q.x, q.y, 16, GOLD_RGB, 0.7);
      drawTalismanPaper(ctx, q.x, q.y, k * 9 + h.uid, 1.3, 1);
      continue;
    }
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; burstColors(p.x, p.y - 20, 12, ['#fde047', '#ffffff', '#f87171'], 1, 0.4); }
    const since = t - h.at;
    if (since < 0.35) {                                         // seal: a red-gold stamp ring
      const q = since / 0.35;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(248, 113, 113, ${0.9 * (1 - q)})`; ctx.lineWidth = 3 * (1 - q);
      ctx.strokeRect(p.x - 8 - q * 14, p.y - 30 - q * 14, 16 + q * 28, 22 + q * 28);
      ctx.restore();
      additiveGlow(ctx, p.x, p.y - 20, 30, GOLD_RGB, 0.7 * (1 - q));
    }
  }
}
export function drawTalismanShot(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.6;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, px = x + (tx - x) * k, py = y + (ty - 26 - y) * k - Math.sin(k * Math.PI) * 20;
    additiveGlow(ctx, px, py, 12, GOLD_RGB, 0.5);
    drawTalismanPaper(ctx, px, py, k * 12, 1, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._hit) { f._hit = true; burstColors(tx, ty - 20, 6, ['#fde047', '#ffffff'], 0.7, 0.3); }
  additiveGlow(ctx, tx, ty - 22, 20, GOLD_RGB, 0.6 * (1 - q));
}
export function drawTalismanBurn(ctx, tx, ty, prog, f) {
  if (!f._burnt) {
    f._burnt = true;
    for (let i = 0; i < 18; i++) emitParticle(0, tx + (Math.random() - 0.5) * 16, ty - 10, (Math.random() - 0.5) * 60, -80 - Math.random() * 140, 0.4 + Math.random() * 0.4, 1.4 + Math.random() * 1.6, Math.random() < 0.5 ? '#fde047' : '#fb923c');
  }
  additiveGlow(ctx, tx, ty - 14, 40 * (1 - prog * 0.5), '251, 146, 60', 0.8 * (1 - prog));
  drawTalismanPaper(ctx, tx, ty - 26 - prog * 10, prog * 2, 1.2 * (1 - prog), 1 - prog);
}

// ==== Landscape Sage · Mountain-River Ink Dragon (Sơn Hà Mực Long) ====
// Gather: ink strokes spiral in around the Sage while the board takes an ink-wash look and a large dragon is
// painted stroke by stroke above. Release: the dragon flies counter-clockwise along the track from the exit
// end; enemies are struck, stunned (ink swirl) and bosses dragged back as its head passes (schedule.hits).
const INK = '#0c0c0e';
function drawInkWash(ctx, size, cx, cy, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(236, 232, 220, ${0.2 * alpha})`;        // rice-paper wash
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  dimFocus(ctx, size, cx, cy, 0.35 * alpha, '10, 10, 12');
}
// pts run tail → head; W scales body thickness. reveal 0..1 paints from the tail; the head appears at the end.
export const INK_PAL = { ink: INK, halo: 'rgba(55, 55, 60, 0.22)', belly: 'rgba(120, 120, 126, 0.55)', streak: 'rgba(160, 160, 166, 0.35)', scale: 'rgba(205, 205, 212, 0.5)', eye: '110, 231, 183' };
export const AZURE_PAL = { ink: '#0c4a6e', halo: 'rgba(56, 189, 248, 0.35)', belly: 'rgba(186, 230, 253, 0.75)', streak: 'rgba(224, 242, 254, 0.5)', scale: 'rgba(224, 242, 254, 0.8)', eye: '255, 255, 255' };
S.DRAGON_PAL = INK_PAL;   // drawInkDragon colours; swapped for the Azure Dragon spirit
export function drawInkDragon(ctx, pts, reveal, alpha, time, W = 1) {
  if (alpha <= 0 || pts.length < 3) return;
  const N = pts.length, n = Math.max(2, Math.floor(N * reveal));
  const width = u => W * (5 + 17 * Math.sin(Math.min(1, u * 1.05) * Math.PI * 0.95 + 0.05));
  const nrm = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1; return { x: -dy / d, y: dx / d, tx: dx / d, ty: dy / d }; };
  const off = (i, k) => { const m = nrm(i); return { x: pts[i].x + m.x * k, y: pts[i].y + m.y * k }; };
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = (i, w, style, dx = 0) => { const a = off(i - 1, dx), b = off(i, dx); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  for (let i = 1; i < n; i++) seg(i, width(i / (N - 1)) + 16, S.DRAGON_PAL.halo);           // wash halo
  // Legs (behind the body): front pair near the head, back pair mid-body; they paddle while flying
  for (const [u, ph] of [[0.42, 0], [0.47, 1.4], [0.8, 0.7], [0.85, 2.1]]) {
    const i = Math.floor(u * (N - 1));
    if (i >= n - 1 || i < 1) continue;
    const m = nrm(i), w = width(u), swing = Math.sin(time * 7 + ph) * 0.5;
    const hip = off(i, w * 0.35), knee = { x: hip.x + (m.x * 0.9 - m.tx * (0.4 + swing)) * 16 * W, y: hip.y + (m.y * 0.9 - m.ty * (0.4 + swing)) * 16 * W };
    const foot = { x: knee.x + (m.x * 0.5 + m.tx * 0.7) * 13 * W, y: knee.y + (m.y * 0.5 + m.ty * 0.7) * 13 * W };
    ctx.strokeStyle = S.DRAGON_PAL.ink; ctx.lineWidth = 5 * W;
    ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); ctx.stroke();
    ctx.lineWidth = 1.6 * W;                                                  // three claws
    for (let c = -1; c <= 1; c++) { ctx.beginPath(); ctx.moveTo(foot.x, foot.y); ctx.lineTo(foot.x + (m.tx + c * m.x * 0.6) * 7 * W, foot.y + (m.ty + c * m.y * 0.6) * 7 * W); ctx.stroke(); }
  }
  // Dorsal mane: flame-like spikes along the back
  ctx.fillStyle = S.DRAGON_PAL.ink;
  for (let i = 4; i < n - 3; i += 3) {
    const u = i / (N - 1), m = nrm(i), w = width(u), base = off(i, -w * 0.45), len = (6 + w * 0.5) * (0.8 + 0.4 * Math.sin(time * 4 + i));
    ctx.beginPath();
    ctx.moveTo(base.x - m.tx * 4 * W, base.y - m.ty * 4 * W);
    ctx.quadraticCurveTo(base.x - m.x * len * 0.6 + m.tx * 2, base.y - m.y * len * 0.6 + m.ty * 2, base.x - m.x * len - m.tx * len * 0.5, base.y - m.y * len - m.ty * len * 0.5);
    ctx.lineTo(base.x + m.tx * 4 * W, base.y + m.ty * 4 * W);
    ctx.fill();
  }
  for (let i = 1; i < n; i++) seg(i, width(i / (N - 1)), S.DRAGON_PAL.ink);                                       // body
  for (let i = 2; i < n; i++) seg(i, width(i / (N - 1)) * 0.32, S.DRAGON_PAL.belly, width(i / (N - 1)) * 0.28);   // belly band
  ctx.setLineDash([7, 5]);                                                                           // dry-brush streaks
  for (let i = 2; i < n; i += 2) for (const k of [-0.25, 0.05]) seg(i, 1, S.DRAGON_PAL.streak, width(i / (N - 1)) * k);
  ctx.setLineDash([]);
  ctx.strokeStyle = S.DRAGON_PAL.scale; ctx.lineWidth = 1;                                 // scale rows
  for (let i = 3; i < n - 2; i += 2) {
    const u = i / (N - 1), m = nrm(i), w = width(u), ang = Math.atan2(m.ty, m.tx);
    for (const k of [-0.18, 0.1]) { const p = off(i, w * k); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, w * 0.16), ang + Math.PI * 0.55, ang + Math.PI * 1.45); ctx.stroke(); }
  }
  if (reveal > 0.05) {                                                                              // brushy tail fin
    const m = nrm(0), t0 = pts[0];
    ctx.strokeStyle = S.DRAGON_PAL.ink; ctx.lineWidth = 2 * W;
    for (let k = -2; k <= 2; k++) {
      const sp = k * 0.35 + Math.sin(time * 5 + k) * 0.08;
      ctx.beginPath(); ctx.moveTo(t0.x, t0.y);
      ctx.quadraticCurveTo(t0.x - m.tx * 12 * W + m.x * k * 6 * W, t0.y - m.ty * 12 * W + m.y * k * 6 * W, t0.x - (m.tx * Math.cos(sp) - m.x * Math.sin(sp)) * 24 * W, t0.y - (m.ty * Math.cos(sp) - m.y * Math.sin(sp)) * 24 * W);
      ctx.stroke();
    }
  }
  if (reveal >= 0.98) {                                                                             // head
    const h = pts[N - 1], m = nrm(N - 1), ang = Math.atan2(m.ty, m.tx), sw = Math.sin(time * 8);
    ctx.save();
    ctx.translate(h.x, h.y); ctx.rotate(ang); ctx.scale(W, W);
    ctx.strokeStyle = S.DRAGON_PAL.ink; ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {                                // mane streaming back from the head
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-4, -4 + k * 1.5);
      ctx.quadraticCurveTo(-18, -14 + k * 4 + Math.sin(time * 6 + k) * 3, -34 - k * 2, -10 + k * 5 + Math.sin(time * 6 + k) * 5); ctx.stroke();
    }
    ctx.fillStyle = S.DRAGON_PAL.ink;
    ctx.beginPath(); ctx.ellipse(2, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();         // skull
    ctx.beginPath(); ctx.moveTo(8, -7); ctx.quadraticCurveTo(24, -7, 30, -2); ctx.lineTo(22, 0); ctx.lineTo(8, 2); ctx.fill();   // upper snout
    ctx.beginPath(); ctx.moveTo(8, 4); ctx.quadraticCurveTo(20, 8 + sw, 27, 7 + sw * 2); ctx.lineTo(10, 8); ctx.fill();          // open lower jaw
    ctx.fillStyle = '#e5e7eb';                                                             // fangs
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(21.5, 4); ctx.lineTo(23, 0); ctx.fill();
    ctx.lineWidth = 2.6;                                                                  // branching horns
    for (const sgn of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(-2, sgn * 6); ctx.quadraticCurveTo(-10, sgn * 16, -22, sgn * 18); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-12, sgn * 14); ctx.lineTo(-14, sgn * 22); ctx.stroke(); ctx.lineWidth = 2.6;
    }
    ctx.lineWidth = 1.2;                                                                  // long whiskers
    ctx.beginPath(); ctx.moveTo(24, -4); ctx.bezierCurveTo(36, -14 + sw * 4, 48, -2 + sw * 6, 60, -12 + sw * 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, 4); ctx.bezierCurveTo(36, 14 - sw * 4, 48, 4 - sw * 6, 58, 14 - sw * 5); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(8, -4, 3.2, 2, -0.2, 0, Math.PI * 2); ctx.fill();   // eye
    ctx.restore();
    additiveGlow(ctx, h.x + Math.cos(ang) * 8 * W + Math.sin(ang) * 4 * W, h.y + Math.sin(ang) * 8 * W - Math.cos(ang) * 4 * W, 7 * W, S.DRAGON_PAL.eye, 1);
  }
  ctx.restore();
}
export function drawLandscapeGather(ctx, cx, cy, prog, size) {
  drawInkWash(ctx, size, cx, cy, Math.min(1, prog / 0.25));
  const now = S.battle.time;
  ctx.save();                                                                   // ink strokes spiralling in
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const ph = (now * 0.9 + i / 6) % 1, r = 118 * (1 - ph) + 26, a0 = i * 1.05 + ph * 3.2;
    ctx.strokeStyle = `rgba(12, 12, 14, ${Math.min(1, prog * 2) * (0.25 + 0.6 * ph)})`;
    ctx.lineWidth = 2 + 6 * ph;
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, r, r * 0.45, 0, a0, a0 + 1.1); ctx.stroke();
  }
  ctx.restore();
  const pts = [];
  for (let i = 0; i <= 56; i++) {
    const u = i / 56;
    const wave = { x: cx - 140 + 280 * u, y: Math.max(40, cy - 96) + Math.sin(u * Math.PI * 3) * 26 * (0.6 + 0.4 * u) };
    const th = u * Math.PI * 2.6 + now * 1.5, rr = 34 + 70 * (1 - u), coil = { x: cx + Math.cos(th) * rr, y: Math.max(60, cy - 100) + Math.sin(th) * rr * 0.45 - u * 30 };
    const c = easeOut(Math.min(1, Math.max(0, (prog - 0.82) / 0.3)));   // storyboard 0.9-1.2s: the dragon coils tightly above the Sage
    pts.push({ x: wave.x + (coil.x - wave.x) * c, y: wave.y + (coil.y - wave.y) * c });
  }
  drawInkDragon(ctx, pts, Math.min(1, Math.max(0, (prog - 0.3) / 0.6)), 1, now, 1.25);   // ink lifts off the scroll 0.4-0.9s
  if (Math.random() < 0.3 && prog < 0.9) {                                       // ink flicks off the brush
    const i = Math.floor(pts.length * Math.min(1, prog / 0.9)) - 1, p = pts[Math.max(0, i)];
    emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 120, -40 - Math.random() * 80, 0.5, 1.5 + Math.random() * 1.5, INK);
  }
  channelLabel(ctx, cx, cy + 150, '🐉 SƠN HÀ MỰC LONG', prog, '#d1fae5', '#1f2937');
}
export function drawLandscapeDragon(ctx, f, size) {
  const t = (f.maxTtl || 3) - f.ttl, sch = f.schedule || { hits: [], start: 0.15, speed: 20 };
  const o = routePoint(f.x, f.y, size), end = sch.start + 16 / sch.speed, time = S.battle.time;
  f._landed ??= {};
  drawInkWash(ctx, size, o.x, o.y, Math.max(0, 1 - Math.max(0, t - end - 0.2) / 0.5));
  // Head position along the track: emerges at the exit (16) and flies back toward the spawn (0)
  const head = 16 - Math.max(0, t - sch.start) * sch.speed, BODY = 6;
  if (t < sch.start) {                                                           // emergence: an ink splash at the exit
    const q = trackPoint(15.9, size), k = t / sch.start;
    additiveGlow(ctx, q.x, q.y, 30 * k, '110, 231, 183', 0.5 * k);
    if (!f._splash) { f._splash = true; droplets(q.x, q.y, 18, INK, 1.3); }
  } else {
    const fade = Math.max(0, 1 - Math.max(0, t - end) / 0.35);
    const pts = [];
    for (let p = Math.min(15.999, head + BODY); p >= Math.max(0, head); p -= 0.1) {   // tail → head
      const q = trackPoint(p, size), wig = Math.sin(p * 2.4 + time * 8) * 12;
      const n2 = trackPoint(Math.max(0, p - 0.1), size), dx = n2.x - q.x, dy = n2.y - q.y, d = Math.hypot(dx, dy) || 1;
      pts.push({ x: q.x - (dy / d) * wig, y: q.y + (dx / d) * wig - 14 });
    }
    drawInkDragon(ctx, pts, 1, fade, time, 1.45);
    if (head > 0 && Math.random() < 0.6) { const q = trackPoint(Math.min(15.99, head + BODY), size); emitParticle(1, q.x, q.y, (Math.random() - 0.5) * 20, -10, 0.7, 6, '#1f2937'); }
  }
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; droplets(p.x, p.y - 6, 12, INK, 1.1); burstColors(p.x, p.y - 8, 6, ['#6ee7b7', '#ffffff'], 0.8, 0.35); nudgeEnemy(h.uid, 0, 7, 0.5); }
    const e = S.battle.enemies.find(v => v.uid === h.uid);
    if (!e || e.gone || e.hp <= 0) continue;
    if (e.warpFx && time - e.warpFx.at < 0.6) {                                   // boss dragged back: ink trail
      const vp = visualTrackP(e), a = 1 - (time - e.warpFx.at) / 0.6;
      ctx.save(); ctx.strokeStyle = `rgba(12, 12, 14, ${0.7 * a})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let pp = vp, i = 0; pp <= e.warpFx.from + 0.001; pp += 0.15, i++) { const q = trackPoint(pp, size); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.stroke(); ctx.restore();
    }
    if ((e.frozenUntil || 0) > S.battle.time) {                                     // stun: a turning ink swirl
      ctx.save();
      ctx.translate(p.x, p.y - 30); ctx.rotate(time * 5);
      ctx.strokeStyle = 'rgba(12, 12, 14, 0.85)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let a = 0; a < 3; a++) {
        ctx.beginPath();
        for (let s = 0; s <= 10; s++) { const r = 2 + s * 0.9, th = a * 2.094 + s * 0.35; if (s) ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r * 0.6); else ctx.moveTo(Math.cos(th) * r, Math.sin(th) * r * 0.6); }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
export function drawInkFlick(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.55;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT;
    ctx.save();
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) {                                                  // blob with trailing droplets
      const qq = quadPt(x, y, (x + tx) / 2, Math.min(y, ty) - 50, tx, ty, Math.max(0, k - i * 0.05));
      ctx.globalAlpha = 1 - i * 0.22;
      ctx.beginPath(); ctx.arc(qq.x, qq.y, 5 - i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._splat) { f._splat = true; droplets(tx, ty, 8, INK, 0.7); }
  ctx.save();
  ctx.globalAlpha = 0.85 * (1 - q * 0.6);
  ctx.fillStyle = INK;
  for (let i = 0; i < 5; i++) {
    const a = hash01(tx * 0.37 + i) * 6.28 + i * 1.3, r = 3 + i * 1.2 + q * 6;
    ctx.beginPath(); ctx.ellipse(tx + Math.cos(a) * r, ty + 4 + Math.sin(a) * r * 0.4, 4 + q * 3, 2 + q, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// Ink puddles on the track (Landscape Sage normal attack): they slow runners, so draw them where they are.
export function drawInkPuddles(ctx, size) {
  for (const pd of S.battle.inkPuddles || []) {
    const left = pd.until - S.battle.time;
    if (left <= 0) continue;
    const grow = Math.min(1, Math.max(0, (S.battle.time - (pd.at ?? pd.until - 2)) / 0.2)), a = Math.min(1, left / 0.4) * grow;
    const c = ringTile(((pd.p % 16) + 16) % 16, size);
    ctx.save();
    ctx.globalAlpha = 0.6 * a;
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) {
      const ox = (hash01(pd.p * 7 + i) - 0.5) * 22, oy = (hash01(pd.p * 3 + i + 9) - 0.5) * 8;
      ctx.beginPath(); ctx.ellipse(c.x + ox, c.y + 8 + oy, (12 + hash01(pd.p + i) * 8) * grow, (4 + hash01(pd.p * 5 + i) * 3) * grow, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
