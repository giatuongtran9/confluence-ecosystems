import { routePoint } from '../battlefield.js';
import { NOTE_GLYPHS, additiveGlow, dimFocus, emitParticle, hash01, stampSwordTip } from './core.js';
import { burstColors, channelLabel, channelRing, droplets, easeOut, enemyPt, quadPt } from './formation-ink.js';
import { nudgeEnemy } from './sword-music.js';
import { S } from '../state.js';
import { VFX } from '../vfx.js';

// ==== Soul-Reaping Heavenly Demon · Ten-Thousand Soul Banner (Vạn Hồn Bạo Phá) ====
// Gather: souls spiral into the Demon from all around while a torn black silk banner unfurls behind it.
// Release: a wisp leaves the banner for each enemy and explodes on arrival (schedule.hits).
const SOUL_RGB = '187, 247, 208', SOUL_DEEP = '34, 197, 94';
function drawWisp(ctx, x, y, vx, vy, r, alpha) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 3.2, SOUL_RGB, 0.55 * alpha);
  const sp = Math.hypot(vx, vy) || 1, tx = -vx / sp, ty = -vy / sp;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  const g = ctx.createLinearGradient(x, y, x + tx * r * 5, y + ty * r * 5);
  g.addColorStop(0, `rgba(${SOUL_RGB}, 0.9)`); g.addColorStop(1, `rgba(${SOUL_DEEP}, 0)`);
  ctx.strokeStyle = g; ctx.lineWidth = r * 1.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tx * r * 5, y + ty * r * 5); ctx.stroke();
  ctx.fillStyle = '#f0fdf4';
  ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function bannerGeom(cx, cy) { const top = Math.max(30, cy - 170); return { px: cx + 34, top, bottom: cy - 14, cx: cx - 4, cy: top + 62 }; }
// Torn black silk banner on a crossbar: fold shading, embroidered edge, frayed hem, tassels, bronze finial, green mist.
function drawSoulBanner(ctx, g, unfurl, glow, alpha, time) {
  if (alpha <= 0) return;
  const w = 66, h = 118 * unfurl, x1 = g.px - 5, x0 = x1 - w, y0 = g.top + 6;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const pole = ctx.createLinearGradient(g.px - 3, 0, g.px + 3, 0);                  // lacquered pole with bronze bands
  pole.addColorStop(0, '#1c1917'); pole.addColorStop(0.5, '#57534e'); pole.addColorStop(1, '#1c1917');
  ctx.fillStyle = pole; ctx.fillRect(g.px - 3, g.top - 6, 6, g.bottom - g.top + 6);
  ctx.fillStyle = '#a16207';
  for (const yy of [g.top + 2, g.top + 40, g.bottom - 10]) ctx.fillRect(g.px - 4, yy, 8, 3);
  ctx.fillStyle = '#ca8a04';                                                         // bronze spear finial
  ctx.beginPath(); ctx.moveTo(g.px, g.top - 26); ctx.lineTo(g.px + 5, g.top - 10); ctx.lineTo(g.px, g.top - 6); ctx.lineTo(g.px - 5, g.top - 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f2a14'; ctx.fillRect(x0 - 6, y0 - 3, w + 10, 5);               // crossbar
  ctx.fillStyle = '#a16207'; ctx.fillRect(x0 - 9, y0 - 4, 5, 7);
  if (h > 4) {
    const cols = 14, edge = [];                                                     // waving cloth outline
    for (let i = 0; i <= cols; i++) {
      const u = i / cols, x = x0 + u * w + Math.sin(time * 4 + u * 5) * 3 * unfurl;
      const tear = hash01(i * 3.7) * 0.22 + (i === 4 || i === 10 ? 0.28 : 0);      // ragged hem with two deep tears
      edge.push({ x: x + Math.sin(time * 5 + u * 7) * 4 * unfurl, y: y0 + h * (1 - tear) });
    }
    const outline = () => {
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
      for (let i = cols; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
      ctx.closePath();
    };
    outline();
    const fold = ctx.createLinearGradient(x0, 0, x1, 0);                            // vertical folds
    fold.addColorStop(0, '#0b0b0c'); fold.addColorStop(0.18, '#1d1d20'); fold.addColorStop(0.32, '#070708');
    fold.addColorStop(0.55, '#19191c'); fold.addColorStop(0.72, '#060607'); fold.addColorStop(0.88, '#18181b'); fold.addColorStop(1, '#09090a');
    ctx.fillStyle = fold; ctx.fill();
    ctx.save(); ctx.clip();
    const shade = ctx.createLinearGradient(0, y0, 0, y0 + h);
    shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = shade; ctx.fillRect(x0 - 10, y0, w + 20, h);
    ctx.strokeStyle = `rgba(${SOUL_RGB}, ${0.25 + 0.3 * glow})`; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]);   // embroidered edging
    ctx.strokeRect(x0 + 5, y0 + 5, w - 10, h * 0.62);
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = '#27272a'; ctx.lineWidth = 0.8;                                // frayed threads at the hem
    for (let i = 1; i < cols; i += 2) { const p = edge[i]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.sin(time * 6 + i) * 2, p.y + 5 + hash01(i) * 6); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter';                                        // glowing 魂
    ctx.fillStyle = `rgba(${SOUL_RGB}, ${Math.min(1, (0.45 + 0.55 * glow) * (0.85 + 0.15 * Math.sin(time * 9)))})`;
    ctx.font = '900 30px "Noto Serif SC", "SimSun", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('魂', x0 + w / 2, y0 + Math.min(h * 0.4, 46));
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5;                                   // tassels at the crossbar ends
  for (const tx of [x0 - 6, x1 + 2]) {
    const sway = Math.sin(time * 3 + tx) * 2;
    ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx + sway, y0 + 16); ctx.stroke();
    ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.arc(tx + sway, y0 + 18, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  additiveGlow(ctx, x0 + w / 2, y0 + 46, 64, SOUL_RGB, (0.18 + 0.4 * glow) * alpha);
  for (let i = 0; i < 4; i++) {                                                       // green mist rising off the cloth
    const ph = (time * 0.6 + i / 4) % 1;
    additiveGlow(ctx, x0 + w * (0.2 + 0.6 * hash01(i * 5.5)), y0 + h * 0.8 - ph * 70, 14 + ph * 10, SOUL_RGB, 0.25 * (1 - ph) * alpha * unfurl);
  }
}
export function drawSoulGather(ctx, cx, cy, prog, size, u) {
  const time = S.battle.time, souls = u?.souls || 0, g = bannerGeom(cx, cy);
  const drop = 90 * (1 - Math.min(1, prog / 0.22) ** 2); g.top -= drop; g.bottom -= drop; g.cy -= drop;   // the banner is slammed down (storyboard 0-0.4s)
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25), '2, 10, 5');
  drawSoulBanner(ctx, g, easeOut(Math.min(1, prog / 0.45)), prog, 1, time);
  const n = Math.min(36, 8 + Math.floor(souls / 3)), appear = Math.min(1, prog / 0.25);
  for (let i = 0; i < n; i++) {                                     // souls spiral in from all around and are absorbed
    const ph = (time * (0.7 + 0.5 * hash01(i * 2.1)) + hash01(i)) % 1, r = 150 * (1 - ph) + 8, a = hash01(i * 7.3) * 6.28 + ph * 4.2;
    const x = cx + Math.cos(a) * r, y = cy - 6 + Math.sin(a) * r * 0.55;
    drawWisp(ctx, x, y, -Math.sin(a) - Math.cos(a) * 1.5, Math.cos(a) * 0.55 - Math.sin(a) * 0.8, 2.4, appear * Math.min(1, ph * 4) * (0.6 + 0.4 * prog));
    if (ph > 0.95) additiveGlow(ctx, cx, cy - 6, 22, SOUL_RGB, 0.5 * appear);
  }
  additiveGlow(ctx, cx, cy, 44 + 34 * prog, SOUL_RGB, 0.18 + 0.4 * prog);
  channelLabel(ctx, cx, cy + 150, `💀 VẠN HỒN BẠO PHÁ · ${souls} souls`, prog, '#bbf7d0', '#052e16');
}
export function drawSoulDetonation(ctx, f, size) {
  const t = (f.maxTtl || 1.6) - f.ttl, sch = f.schedule || { hits: [], souls: 0 };
  const o = routePoint(f.x, f.y, size), g = bannerGeom(o.x, o.y), time = S.battle.time, LAUNCH = 0.2;
  f._landed ??= {};
  dimFocus(ctx, size, o.x, o.y, 0.5 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.4), '2, 10, 5');
  drawSoulBanner(ctx, g, 1, t < LAUNCH ? 1.4 : 0.8, Math.max(0, 1 - Math.max(0, t - 1.0) / 0.4), time);
  const extra = Math.min(20, Math.floor((sch.souls || 0) / 4));       // spare souls scatter upward
  for (let i = 0; i < extra && t > LAUNCH && t < LAUNCH + 0.9; i++) {
    const k = (t - LAUNCH) / 0.9, a = -Math.PI / 2 + (hash01(i * 5.1) - 0.5) * 2.4, d = 30 + k * 180;
    drawWisp(ctx, g.cx + Math.cos(a) * d, g.cy + Math.sin(a) * d * 0.8, Math.cos(a), Math.sin(a), 2.2, 1 - k);
  }
  for (const h of sch.hits) {
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (t < h.at) {
      if (t < LAUNCH) continue;
      const k = (t - LAUNCH) / Math.max(0.05, h.at - LAUNCH), kk = k * k;
      const side = (hash01(h.uid * 1.7) - 0.5) * 160;
      const cxp = (g.cx + p.x) / 2 + side, cyp = Math.min(g.cy, p.y) - 70;
      const q = quadPt(g.cx, g.cy, cxp, cyp, p.x, p.y - 8, kk), q2 = quadPt(g.cx, g.cy, cxp, cyp, p.x, p.y - 8, Math.max(0, kk - 0.03));
      drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 3.2, 1);
      continue;
    }
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; burstColors(p.x, p.y - 8, 16, ['#bbf7d0', '#22c55e', '#ffffff'], 1.2, 0.45); nudgeEnemy(h.uid, 0, 6, 0.5); }
    const since = t - h.at;
    if (since < 0.35) {
      const q = since / 0.35;
      additiveGlow(ctx, p.x, p.y - 8, 34 * (1 + q), SOUL_RGB, 0.8 * (1 - q));
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${SOUL_RGB}, ${0.8 * (1 - q)})`; ctx.lineWidth = 2.5 * (1 - q);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + q * 30, 3 + q * 11, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}
export function drawSoulWispShot(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.7;
  const side = (hash01((f.tx || 0) * 13.1 + (f.ty || 0) * 7.7) - 0.5) * 90;
  const cx = (x + tx) / 2 + side, cy = Math.min(y, ty) - 40;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, q = quadPt(x, y - 20, cx, cy, tx, ty - 8, k), q2 = quadPt(x, y - 20, cx, cy, tx, ty - 8, Math.max(0, k - 0.06));
    drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 2.6, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._hit) { f._hit = true; burstColors(tx, ty - 8, 5, ['#bbf7d0', '#22c55e'], 0.6, 0.3); }
  additiveGlow(ctx, tx, ty - 8, 18, SOUL_RGB, 0.7 * (1 - q));
}
export function drawSoulReturn(ctx, x, y, tx, ty, prog) {                    // from the fallen enemy (tx, ty) back to the Demon (x, y)
  const g = bannerGeom(x, y), k = easeOut(prog);
  const q = quadPt(tx, ty - 10, (tx + g.cx) / 2, Math.min(ty, g.cy) - 60, g.cx, g.cy, k);
  const q2 = quadPt(tx, ty - 10, (tx + g.cx) / 2, Math.min(ty, g.cy) - 60, g.cx, g.cy, Math.max(0, k - 0.05));
  drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 2.4, prog < 0.85 ? 1 : (1 - prog) / 0.15);
}

// ==== Blood-Fiend Sword Master · Boiling Blood Domain (Huyết Hải Cuồng Lộc) ====
// Gather: crimson blades circle and draw in around the Master over a boiling pool of liquid blood.
// Release: the pool floods outward (to the track) at 5 tiles/s with splashes at its edge; as it reaches each
// enemy a large blood sword erupts from cracked ground, and detonated bleeds burst as a geyser (e.bloodBurst).
const BLOOD_RGB = '220, 38, 38';
function bloodPoolPath(ctx, cx, cy, rx, ry, time) {
  ctx.beginPath();
  for (let i = 0; i <= 56; i++) {
    const th = (i / 56) * Math.PI * 2;
    const wob = 1 + 0.07 * Math.sin(th * 5 + time * 2.4) + 0.04 * Math.sin(th * 11 - time * 3.1) + 0.03 * Math.sin(th * 2 + 1.3);
    const x = cx + Math.cos(th) * rx * wob, y = cy + Math.sin(th) * ry * wob;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}
// Glossy liquid blood: dark core, rim shading, a moving specular sheen, ripples and popping bubbles.
function drawBloodPool(ctx, cx, cy, rx, ry, alpha, time) {
  if (alpha <= 0 || rx <= 1) return;
  ctx.save();
  bloodPoolPath(ctx, cx, cy, rx, ry, time);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  g.addColorStop(0, `rgba(36, 2, 2, ${0.88 * alpha})`);
  g.addColorStop(0.6, `rgba(88, 7, 7, ${0.82 * alpha})`);
  g.addColorStop(0.92, `rgba(127, 18, 18, ${0.78 * alpha})`);
  g.addColorStop(1, `rgba(153, 27, 27, ${0.7 * alpha})`);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(30, 2, 2, ${0.9 * alpha})`; ctx.lineWidth = 3; ctx.stroke();        // dark rim
  ctx.save(); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 3; r++) {                                                                // ripples from the centre
    const ph = (time * 0.8 + r / 3) % 1;
    ctx.strokeStyle = `rgba(252, 165, 165, ${0.16 * (1 - ph) * alpha})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * ph, ry * ph, 0, 0, Math.PI * 2); ctx.stroke();
  }
  for (let s = 0; s < 2; s++) {                                                                // specular sheen
    const sx = cx - rx * 0.35 + Math.sin(time * 0.7 + s * 2) * rx * 0.15, sy = cy - ry * 0.4 + s * ry * 0.25;
    const sh = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx * 0.35);
    sh.addColorStop(0, `rgba(255, 228, 228, ${0.22 * alpha})`); sh.addColorStop(1, 'rgba(255, 228, 228, 0)');
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.ellipse(sx, sy, rx * 0.35, ry * 0.22, -0.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 18; i++) {                                                               // bubbles grow and pop
    const ph = (time * 1.4 + hash01(i * 4.4)) % 1, a = hash01(i * 2.2) * 6.28, d = Math.sqrt(hash01(i * 9.1)) * 0.85;
    const bx = cx + Math.cos(a) * rx * d, by = cy + Math.sin(a) * ry * d;
    ctx.strokeStyle = `rgba(254, 202, 202, ${(ph < 0.85 ? 0.4 : (1 - ph) * 2.5) * alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx, by, 1 + ph * 4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = `rgba(252, 165, 165, ${0.3 * alpha})`; ctx.lineWidth = 1;                  // wet highlight on the rim
  bloodPoolPath(ctx, cx, cy - 1.5, rx * 0.985, ry * 0.97, time); ctx.stroke();
  ctx.restore();
}
// A large crimson sword erupting tip-first from cracked ground: fuller ridge, edge highlight, cross-guard at ground level.
function drawBloodBlade(ctx, x, y, h, alpha, crack = 1) {
  if (alpha <= 0 || h <= 0) return;
  if (crack > 0) {                                                                // ground crack around the base
    ctx.save(); ctx.globalAlpha = Math.min(1, alpha * crack);
    ctx.strokeStyle = '#1c0505'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + 0.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 6); ctx.lineTo(x + Math.cos(a + 0.3) * 26, y + Math.sin(a + 0.3) * 9); ctx.stroke(); }
    ctx.restore();
  }
  additiveGlow(ctx, x, y - h * 0.5, h * 0.6, BLOOD_RGB, 0.5 * alpha);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const w = 9;
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#450a0a'); g.addColorStop(0.45, '#dc2626'); g.addColorStop(0.55, '#fca5a5'); g.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y - h + 20); ctx.lineTo(x + w * 0.8, y); ctx.lineTo(x - w * 0.8, y); ctx.lineTo(x - w, y - h + 20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(254, 226, 226, 0.75)'; ctx.lineWidth = 1;              // fuller ridge
  ctx.beginPath(); ctx.moveTo(x, y - h + 6); ctx.lineTo(x, y - 4); ctx.stroke();
  ctx.fillStyle = '#2b0606';                                                       // cross-guard
  ctx.beginPath(); ctx.moveTo(x - 17, y - 2); ctx.quadraticCurveTo(x, y - 8, x + 17, y - 2); ctx.lineTo(x + 15, y + 2); ctx.lineTo(x - 15, y + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x, y - 3, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawBloodGather(ctx, cx, cy, prog, size) {
  // Storyboard: the pool boils up after the blade plunge (0.35-0.85), then compresses into the blade (0.9-1.2)
  const time = S.battle.time, r = 96 * easeOut(Math.min(1, Math.max(0, (prog - 0.35) / 0.5))) * (1 - 0.7 * Math.max(0, (prog - 0.9) / 0.3));
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 2, 2');
  drawBloodPool(ctx, cx, cy + 10, r, r * 0.45, 1, time);
  additiveGlow(ctx, cx, cy, 46 + 36 * prog, BLOOD_RGB, 0.2 + 0.45 * prog);
  channelRing(cx, cy, prog, 8, 80, 44, (x, y, i, depth, appear) => drawBloodBlade(ctx, x, y + 8, 34 * appear, appear * depth, 0));
  channelLabel(ctx, cx, cy + 150, '🩸 HUYẾT HẢI CUỒNG LỘC', prog, '#fca5a5', '#450a0a');
}
export function drawBloodDomain(ctx, f, size) {
  const t = (f.maxTtl || 1.8) - f.ttl, sch = f.schedule || { hits: [] }, time = S.battle.time;
  const o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
  const pxX = ox1.x - o.x, pxY = oy1.y - o.y;
  f._landed ??= {};
  const grow = Math.max(0, (t - 0.1) * 5), R = Math.max(0.6, Math.min(3.4, grow));   // tiles; stops at the track
  const drain = Math.max(0, 1 - Math.max(0, t - 1.1) / 0.6);
  dimFocus(ctx, size, o.x, o.y, 0.3 * drain, '20, 2, 2');            // the pool itself is drawn under the runners (drawBloodGround)
  if (grow > 0.6 && grow < 3.4) for (let i = 0; i < 3; i++) {                       // splashes thrown off the advancing edge
    const a = Math.random() * 6.28, ex = o.x + Math.cos(a) * R * pxX, ey = o.y + 10 + Math.sin(a) * R * pxY;
    emitParticle(2, ex, ey, Math.cos(a) * 60, -60 - Math.random() * 80, 0.4, 1.2 + Math.random() * 1.4, Math.random() < 0.3 ? '#fca5a5' : '#991b1b');
  }
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    const e = S.battle.enemies.find(v => v.uid === h.uid);
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      const geyser = !!(e?.bloodBurst?.geyser);
      (f._geyser ??= {})[h.uid] = geyser;
      droplets(p.x, p.y, 14, '#b91c1c', 1.2);
      for (let i = 0; i < 8; i++) emitParticle(2, p.x, p.y + 6, (Math.random() - 0.5) * 160, -90 - Math.random() * 120, 0.6, 1.8 + Math.random() * 2, Math.random() < 0.5 ? '#44403c' : '#57534e');   // ground debris
      if (geyser) for (let i = 0; i < 30; i++) emitParticle(2, p.x + (Math.random() - 0.5) * 10, p.y - 4, (Math.random() - 0.5) * 70, -240 - Math.random() * 220, 0.6 + Math.random() * 0.4, 1.6 + Math.random() * 2, Math.random() < 0.4 ? '#fca5a5' : '#dc2626');
      nudgeEnemy(h.uid, 0, -8, 0.6);
    }
    const since = t - h.at;
    const rise = easeOut(Math.min(1, since / 0.09)), sink = since > 0.6 ? Math.max(0, 1 - (since - 0.6) / 0.3) : 1;
    drawBloodBlade(ctx, p.x, p.y + 10, 84 * rise * sink, sink, sink);
    if (f._geyser?.[h.uid] && since < 0.5) additiveGlow(ctx, p.x, p.y - 60, 52, BLOOD_RGB, 0.7 * (1 - since / 0.5));
  }
}
// Ground layer for Boiling Blood Domain: the flooding pool is drawn before the runners so they stand in it.
export function drawBloodGround(ctx, size) {
  for (const f of S.battle.effects) {
    if (f.type !== 'blood-domain') continue;
    const t = (f.maxTtl || 1.8) - f.ttl, o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
    const R = Math.max(0.6, Math.min(3.4, Math.max(0, (t - 0.1) * 5))), drain = Math.max(0, 1 - Math.max(0, t - 1.1) / 0.6);
    drawBloodPool(ctx, o.x, o.y + 10, R * (ox1.x - o.x), R * (oy1.y - o.y), 0.65 * drain, S.battle.time);
  }
}
export function drawBloodSlash(ctx, x, y, tx, ty, prog, f) {
  const ang = Math.atan2(ty - y, tx - x), sweep = Math.min(1, prog / 0.55), fade = prog < 0.55 ? 1 : 1 - (prog - 0.55) / 0.45;
  if (!f._hit && prog > 0.3) { f._hit = true; droplets(tx, ty - 6, 7, '#b91c1c', 0.8); }
  ctx.save();
  ctx.translate(tx, ty - 8); ctx.rotate(ang + Math.PI / 2);
  ctx.globalCompositeOperation = 'lighter';
  const a0 = -1.2, a1 = a0 + 2.4 * easeOut(sweep);
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(${BLOOD_RGB}, ${0.5 * fade})`; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, 0, 22, a0, a1); ctx.stroke();
  ctx.strokeStyle = `rgba(254, 226, 226, ${0.9 * fade})`; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, 0, 22, a0, a1); ctx.stroke();
  ctx.restore();
}

// ==== Sword Immortal normal attack: one jade sword pierces the target and up to 3 enemies behind it ====
// The sword flies from the Immortal to the target, then on through each enemy in schedule.chain (in order),
// leaving a light trail; each pierced enemy gets a slash flash, sparks and a knock. A thin line lingers after.
export function drawSwordPierce(ctx, f, size) {
  const t = (f.maxTtl || 0.6) - f.ttl, FLY = 0.34;
  const o = routePoint(f.x, f.y, size), chain = f.schedule?.chain || [];
  const pts = [{ x: o.x, y: o.y - 18 }];
  for (const uid of chain) { const p = enemyPt(f, uid, size); if (p) pts.push({ x: p.x, y: p.y - 12, uid }); }
  if (pts.length < 2) return;
  const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  pts.push({ x: b.x + (b.x - a.x) / d * 70, y: b.y + (b.y - a.y) / d * 70 });         // carries on past the last enemy
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = cum[cum.length - 1], s = L * Math.min(1, easeOut(Math.min(1, t / FLY)) * 1.02);
  const at = dist => { let i = 1; while (i < cum.length - 1 && cum[i] < dist) i++; const k = (dist - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]); return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k, i }; };
  f._passed ??= {};
  for (let i = 1; i < pts.length - 1; i++) {                                           // pierce each enemy as the sword passes
    if (s < cum[i] || f._passed[i]) continue;
    f._passed[i] = { at: t };
    const p = pts[i], dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y, dd = Math.hypot(dx, dy) || 1;
    burstColors(p.x, p.y, 10, ['#ecfdf5', '#6ee7b7', '#34d399'], 1, 0.3);
    nudgeEnemy(p.uid, dx / dd * 6, dy / dd * 6, 0.45);
  }
  const fade = t <= FLY ? 1 : Math.max(0, 1 - (t - FLY) / (f.maxTtl - FLY));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(167, 243, 208, ${0.35 * fade})`; ctx.lineWidth = 1.5;          // thin line through everything pierced
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) { if (cum[i] > s) { const q = at(s); ctx.lineTo(q.x, q.y); break; } ctx.lineTo(pts[i].x, pts[i].y); }
  ctx.stroke();
  const tail = Math.max(0, s - 150);                                                    // bright trail behind the sword
  for (let k = 0; k < 10; k++) {
    const d0 = tail + (s - tail) * (k / 10), d1 = tail + (s - tail) * ((k + 1) / 10), q0 = at(d0), q1 = at(d1);
    ctx.strokeStyle = `rgba(110, 231, 183, ${(k / 10) * 0.7 * fade})`; ctx.lineWidth = 1 + k * 0.45;
    ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
  }
  for (const [i, pass] of Object.entries(f._passed)) {                                  // slash flash across each pierced enemy
    const since = t - pass.at;
    if (since > 0.22) continue;
    const p = pts[i], q = since / 0.22, dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y, dd = Math.hypot(dx, dy) || 1;
    ctx.strokeStyle = `rgba(236, 253, 245, ${0.9 * (1 - q)})`; ctx.lineWidth = 2.5 * (1 - q);
    ctx.beginPath(); ctx.moveTo(p.x - dy / dd * 16, p.y + dx / dd * 16); ctx.lineTo(p.x + dy / dd * 16, p.y - dx / dd * 16); ctx.stroke();
    additiveGlow(ctx, p.x, p.y, 22, '110, 231, 183', 0.7 * (1 - q));
  }
  ctx.restore();
  if (t <= FLY + 0.08) {                                                                 // the sword itself, tip leading
    const q = at(Math.min(s, L - 0.01)), q2 = at(Math.max(0, s - 12)), ang = Math.atan2(q.y - q2.y, q.x - q2.x);
    stampSwordTip(ctx, q.x, q.y, ang, 0.95, t <= FLY ? 1 : 1 - (t - FLY) / 0.08, false);
  }
}

// ==== Melodic Saint normal attacks ====
// Harmony Chord: a warm gold-and-indigo ring spreads gently; golden notes rise from each ally it reaches (speed buff).
export function drawHarmonyChord(ctx, f, size) {
  const t = (f.maxTtl || 0.9) - f.ttl, o = routePoint(f.x, f.y, size), R = 260 * easeOut(Math.min(1, t / 0.6)), fade = Math.max(0, 1 - t / (f.maxTtl || 0.9));
  f._reached ??= {};
  if (!f._start) { f._start = true; for (let i = 0; i < 6; i++) { const n = emitParticle(4, o.x + (Math.random() - 0.5) * 20, o.y - 20, (Math.random() - 0.5) * 50, -40 - Math.random() * 40, 0.9, 0.8 + Math.random() * 0.4, i % 2 ? '#fde68a' : '#c7d2fe'); if (n) n.glyph = i % NOTE_GLYPHS.length; } }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 2; r++) {
    const rr = R - r * 22;
    if (rr <= 4) continue;
    ctx.strokeStyle = r ? `rgba(129, 140, 248, ${0.45 * fade})` : `rgba(253, 230, 138, ${0.6 * fade})`;
    ctx.lineWidth = r ? 2 : 3;
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) { const th = (i / 90) * Math.PI * 2, w = rr * (1 + 0.025 * Math.sin(th * 8 + t * 20)); if (i) ctx.lineTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); else ctx.moveTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); }
    ctx.stroke();
  }
  ctx.restore();
  if (R > 4) VFX.melodic.soundRing(ctx, o.x, o.y, R, R * 0.5, 0.7 * fade, VFX.melodic.GOLD);
  for (const uid of f.schedule?.allies || []) {
    const v = S.battle.units.find(x => x.uid === uid && !x.removed);
    if (!v || f._reached[uid]) continue;
    const p = routePoint(v.x + 1, v.y + 1, size), d = Math.hypot(p.x - o.x, (p.y - o.y) * 2);
    if (d > R) continue;
    f._reached[uid] = true;
    VFX.melodic.harmonyAlly(p.x, p.y);
    for (let i = 0; i < 3; i++) { const n = emitParticle(4, p.x + (i - 1) * 10, p.y - 24, (i - 1) * 12, -55 - Math.random() * 25, 0.9, 0.75, '#fde68a'); if (n) n.glyph = (uid + i) % NOTE_GLYPHS.length; }
    additiveGlow(ctx, p.x, p.y - 10, 30, '253, 230, 138', 0.6);
  }
}
// Dissonance Chord: a jagged, discordant violet wave rips outward; each enemy it reaches gets broken notes and a jolt.
export function drawDissonanceChord(ctx, f, size) {
  const t = (f.maxTtl || 0.8) - f.ttl, o = routePoint(f.x, f.y, size), R = 340 * Math.min(1, t / 0.4), fade = Math.max(0, 1 - t / (f.maxTtl || 0.8));
  f._reached ??= {};
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'miter';
  for (let r = 0; r < 3; r++) {
    const rr = R - r * 26;
    if (rr <= 4 || R >= 340 && r === 0 && t > 0.55) continue;
    ctx.strokeStyle = r === 0 ? `rgba(244, 114, 182, ${0.85 * fade})` : `rgba(168, 85, 247, ${(0.5 / r) * fade})`;
    ctx.lineWidth = r === 0 ? 2.6 : 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {                                    // sawtooth with jitter: harsh, not musical
      const th = (i / 72) * Math.PI * 2, saw = ((i % 3) - 1) * 0.06 + (hash01(i * 3.3 + Math.floor(t * 30)) - 0.5) * 0.05;
      const w = rr * (1 + saw);
      if (i) ctx.lineTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); else ctx.moveTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5);
    }
    ctx.stroke();
  }
  ctx.restore();
  if (R > 4) VFX.melodic.soundRing(ctx, o.x, o.y, R, R * 0.5, 0.6 * fade, VFX.melodic.VIOLET);
  for (const uid of f.schedule?.hits || []) {
    const p = enemyPt(f, uid, size);
    if (!p) continue;
    const d = Math.hypot(p.x - o.x, (p.y - o.y) * 2);
    if (d > R) continue;
    if (!f._reached[uid]) {
      f._reached[uid] = t;
      VFX.melodic.dissonanceHit(p.x, p.y);
      for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28, n = emitParticle(4, p.x, p.y - 14, Math.cos(a) * 50, Math.sin(a) * 30 - 30, 0.6, 0.7, i % 2 ? '#f472b6' : '#a855f7'); if (n) { n.glyph = i % NOTE_GLYPHS.length; n.vr = 20; } }
      const dx = p.x - o.x, dy = p.y - o.y, dd = Math.hypot(dx, dy) || 1;
      nudgeEnemy(uid, dx / dd * 5, dy / dd * 5, 0.4);
    }
    const since = t - f._reached[uid];
    if (since < 0.25) additiveGlow(ctx, p.x, p.y - 8, 22, '217, 70, 239', 0.7 * (1 - since / 0.25));
  }
}
