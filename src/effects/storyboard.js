// Storyboard layer for the Cultivation Mythics' channel (0-1.2 s) and 10th attack (release 1.2-1.6 s, aftermath to 3.0 s).
// It draws the beats the base drawers lack, on top of them: Blood-Fiend Sword Master, Soul-Reaping Heavenly Demon,
// Formation Master, Landscape Sage and Melodic Saint. Channel beats read the channel progress (0..1 over 1.2 s);
// release beats read seconds since release. One-shot moments (impacts, eruptions) fire once per channel / effect.
import { routePoint } from '../battlefield.js';
import { addTrauma } from '../feedback.js';
import { S } from '../state.js';
import { VFX } from '../vfx.js';
import { additiveGlow, dimFocus, hash01 } from './core.js';
import { drawBolt } from './elements.js';
import { addDecal } from './environment.js';
import { drawGoStoneDisc, drawStarPoint, ringTile, trackPoint, visualTrackP } from './formation-ink.js';
import { guqinStrings, nudgeEnemy } from './sword-music.js';

const cl = x => Math.max(0, Math.min(1, x)), beat = (p, a, b) => cl((p - a) / (b - a));
const eOut = k => 1 - (1 - k) ** 3, eIn = k => k * k;
const once = (st, key) => (st[key] ? false : (st[key] = true));
const sinceRelease = f => (f.maxTtl || 2) - f.ttl;
const live = () => S.battle.enemies.filter(e => !e.gone && e.hp > 0);
const at = (gx, gy, size) => routePoint(gx, gy, size);

// ---------- shared pieces ----------
// A vertical shaft of light standing on (x, y).
function lightPillar(ctx, x, y, h, w, rgb, a) {
  if (a <= 0.01 || h <= 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, y - h, 0, y);
  g.addColorStop(0, `rgba(${rgb}, 0)`); g.addColorStop(0.65, `rgba(${rgb}, ${0.35 * a})`); g.addColorStop(1, `rgba(${rgb}, ${0.8 * a})`);
  ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h, w, h);
  const c = ctx.createLinearGradient(0, y - h, 0, y);
  c.addColorStop(0, 'rgba(255, 255, 255, 0)'); c.addColorStop(1, `rgba(255, 255, 255, ${0.85 * a})`);
  ctx.fillStyle = c; ctx.fillRect(x - w * 0.14, y - h, w * 0.28, h);
  ctx.restore();
  VFX.sprite(ctx, 'light_02', rgb, x, y, w * 4, w * 1.5, 0.9 * a);
}
// An isometric shock ring of radius r (px) around (x, y).
function shockRing(ctx, x, y, r, rgb, a, lw = 3) {
  if (a <= 0.01 || r <= 1) return;
  VFX.sprite(ctx, 'circle_02', rgb, x, y, r * 2.15, r * 1.0, a);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * a})`; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.46, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// Branching fracture web from the centre (unit coordinates, d = distance along the crack), built once.
const VEINS = (() => {
  const out = [];
  const grow = (x, y, a, d, steps, seed, depth) => {
    const pts = [{ x, y, d }];
    for (let s = 0; s < steps; s++) {
      a += (hash01(seed * 7.1 + s) - 0.5) * 0.8;
      const l = 0.09 + hash01(seed * 3.3 + s * 2.7) * 0.07;
      x += Math.cos(a) * l; y += Math.sin(a) * l; d += l;
      pts.push({ x, y, d });
      if (depth < 1 && (s === 1 || s === 3)) grow(x, y, a + (hash01(seed + s) < 0.5 ? -0.7 : 0.7), d, steps - s - 2, seed * 1.9 + s, depth + 1);
    }
    out.push(pts);
  };
  for (let i = 0; i < 11; i++) grow(0, 0, (i / 11) * Math.PI * 2 + hash01(i * 3.3) * 0.4, 0, 7, i + 1, 0);
  return out;
})();
function drawVeins(ctx, cx, cy, R, reveal, glow, dark = 1) {
  if (R <= 2 || reveal <= 0) return;
  const lim = reveal * 1.15;
  ctx.save(); ctx.lineCap = 'round';
  for (let pass = 0; pass < 3; pass++) {                     // dark crack, then its red heat and white-hot core
    if (pass && glow <= 0) break;
    ctx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
    for (const pts of VEINS) for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i]; if (q.d > lim) break;
      const k = Math.max(0, 1 - q.d / 1.2);                  // 1 at the blade, 0 at the tips
      ctx.lineWidth = pass === 0 ? 0.5 + 2.6 * k : pass === 1 ? 0.6 + 3.4 * k : 0.3 + 1.1 * k;
      ctx.strokeStyle = pass === 0 ? `rgba(24, 3, 3, ${0.8 * dark * (0.35 + 0.65 * k)})` : pass === 1 ? `rgba(220, 38, 38, ${0.6 * glow * k})` : `rgba(254, 202, 202, ${0.85 * glow * k * k})`;
      ctx.beginPath(); ctx.moveTo(cx + p.x * R, cy + p.y * R * 0.48); ctx.lineTo(cx + q.x * R, cy + q.y * R * 0.48); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- Blood-Fiend Sword Master · Boiling Blood Domain ----------
const BLOOD = '220, 38, 38', BLOOD_HOT = '254, 202, 202', BLOOD_DARK = '127, 29, 29';
// The crimson blade, point down, its tip at tipY.
function plantedBlade(ctx, x, tipY, glow, alpha = 1) {
  if (alpha <= 0) return;
  const len = 96, top = tipY - len;
  ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
  g.addColorStop(0, '#450a0a'); g.addColorStop(0.45, '#b91c1c'); g.addColorStop(0.55, '#fecaca'); g.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = g;                                                              // jagged blade, serrations on one edge
  ctx.beginPath(); ctx.moveTo(x - 7, top + 22); ctx.lineTo(x + 7, top + 22);
  for (let i = 0; i < 6; i++) { const y = top + 26 + i * 11; ctx.lineTo(x + 9, y); ctx.lineTo(x + 6, y + 6); }
  ctx.lineTo(x, tipY); ctx.lineTo(x - 7, top + 70); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(254, 226, 226, 0.7)'; ctx.lineWidth = 1;               // fuller
  ctx.beginPath(); ctx.moveTo(x, top + 26); ctx.lineTo(x, tipY - 10); ctx.stroke();
  ctx.fillStyle = '#1c0505';                                                     // guard, grip, pommel
  ctx.beginPath(); ctx.moveTo(x - 18, top + 22); ctx.quadraticCurveTo(x, top + 14, x + 18, top + 22); ctx.lineTo(x + 15, top + 26); ctx.lineTo(x - 15, top + 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f0d0d'; ctx.fillRect(x - 3, top, 6, 20);
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x, top - 3, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (glow > 0) { additiveGlow(ctx, x, tipY - 40, 46, BLOOD, 0.5 * glow * alpha); VFX.sprite(ctx, 'trace_02', BLOOD_HOT, x, tipY - 46, 26, 110, 0.5 * glow * alpha); }
}
function bloodChannel(ctx, cx, cy, prog, size, st) {
  const ground = cy + 10, fall = beat(prog, 0, 0.3), t = S.battle.time;
  // 0-0.4 s: the blade is driven into the tile, cracking the stone; crimson veins spread out from it
  const tipY = ground + 18 - 120 * (1 - eIn(fall));
  if (fall < 1) VFX.sprite(ctx, 'trace_02', BLOOD, cx, tipY - 70, 20, 150, 0.6 * fall);             // motion streak while falling
  if (fall >= 1 && once(st, 'plunge')) {
    VFX.burst('medium', cx, ground, BLOOD, BLOOD_HOT);
    for (let i = 0; i < 10; i++) VFX.emit({ x: cx, y: ground, vx: VFX.rnd(-160, 160), vy: VFX.rnd(-180, -60), ay: 700, drag: 1, tex: 'light_02', rgb: '41, 37, 36', blend: 'source-over', s0: 7, s1: 3, a0: 0.9, a1: 0.4, life: 0.6 });
    addDecal('crack', cx, ground, 1.3, 3.5); addTrauma(0.3, 0.6);
  }
  const vein = beat(prog, 0.22, 0.75), squeeze = beat(prog, 0.9, 1.2);
  drawVeins(ctx, cx, ground, 210 * eOut(vein), vein, (0.55 + 0.45 * Math.sin(t * 11)) * (1 - 0.4 * squeeze) + squeeze, 1);
  // 0.4-0.9 s: the floor boils — blood steam rises from the fractures
  if (prog > 0.4 && prog < 0.95 && Math.random() < 0.6) {
    const v = VEINS[Math.floor(Math.random() * VEINS.length)], p = v[Math.floor(Math.random() * v.length)];
    VFX.emit({ x: cx + p.x * 210 * eOut(vein), y: ground + p.y * 100 * eOut(vein), vx: VFX.rnd(-10, 10), vy: VFX.rnd(-50, -25), tex: 'smoke_05', rgb: BLOOD_DARK, blend: 'source-over', s0: 26, s1: 70, a0: 0.35, a1: 0, life: 1.1, vr: VFX.rnd(-1, 1) });
  }
  // 0.9-1.2 s: everything is pulled into the blade — a blinding ruby singularity
  if (squeeze > 0) {
    for (let n = 0; n < 2; n++) { const a = VFX.rnd(0, Math.PI * 2), d = VFX.rnd(110, 180); VFX.emit({ x: cx + Math.cos(a) * d, y: ground - 30 + Math.sin(a) * d * 0.5, vx: -Math.cos(a) * d * 3.2, vy: -Math.sin(a) * d * 1.6, drag: 1, tex: 'trace_02', rgb: n ? BLOOD : BLOOD_HOT, s0: 12, s1: 4, a0: 1, a1: 0, life: 0.3, stretch: 0.05 }); }
    VFX.sprite(ctx, 'flare_01', BLOOD_HOT, cx, ground - 40, 40 + 120 * squeeze, 40 + 120 * squeeze, 0.5 + 0.5 * squeeze, t * 3);
    VFX.sprite(ctx, 'star_07', '255, 255, 255', cx, ground - 40, 20 + 50 * squeeze, 20 + 50 * squeeze, squeeze, -t * 4);
  }
  plantedBlade(ctx, cx, tipY, 0.3 + vein * 0.4 + squeeze, 1);
}
function bloodRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), ground = o.y + 10;
  // 1.2-1.25 s: the blade is ripped skyward and a geyser of pressurized blood erupts
  if (once(st, 'rip')) { VFX.burst('medium', o.x, ground - 30, BLOOD, BLOOD_HOT); addDecal('crack', o.x, ground, 1.8, 4); }
  const up = beat(t, 0, 0.3);
  if (up < 1) plantedBlade(ctx, o.x, ground + 18 - 260 * eOut(up), 1, 1 - up);
  const rise = eOut(beat(t, 0, 0.16)), fade = 1 - beat(t, 0.35, 0.8), H = 330 * rise;
  if (fade > 0 && H > 2) {
    ctx.save();
    const w = 42 + 12 * Math.sin(t * 40), g = ctx.createLinearGradient(0, ground - H, 0, ground);
    g.addColorStop(0, `rgba(127, 29, 29, 0)`); g.addColorStop(0.25, `rgba(153, 27, 27, ${0.8 * fade})`); g.addColorStop(1, `rgba(69, 10, 10, ${0.95 * fade})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x - w * 0.6, ground);
    for (let i = 0; i <= 12; i++) { const k = i / 12; ctx.lineTo(o.x - w * (0.6 - 0.25 * k) + Math.sin(k * 9 + t * 30) * 4, ground - H * k); }
    for (let i = 12; i >= 0; i--) { const k = i / 12; ctx.lineTo(o.x + w * (0.6 - 0.25 * k) + Math.sin(k * 7 - t * 26) * 4, ground - H * k); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    lightPillar(ctx, o.x, ground, H * 0.9, 16, BLOOD, 0.22 * fade);   // faint inner glow; the liquid column carries the shape
    if (t < 0.55) for (let i = 0; i < 4; i++) VFX.emit({ x: o.x + VFX.rnd(-10, 10), y: ground - H * VFX.rnd(0.6, 1), vx: VFX.rnd(-170, 170), vy: VFX.rnd(-260, -80), ay: 900, drag: 0.4, tex: 'light_02', rgb: i % 2 ? '153, 27, 27' : '220, 38, 38', blend: 'source-over', s0: VFX.rnd(6, 11), s1: 4, a0: 0.95, a1: 0.6, life: VFX.rnd(0.6, 1) });
  }
  // 1.25-1.6 s: crimson rain over every runner (the detonations and fresh bleeds are scheduled by the engine)
  if (t > 0.08 && t < 0.75) for (const e of live()) {
    if (Math.random() > 0.55) continue;
    const p = trackPoint(visualTrackP(e), size);
    VFX.emit({ x: p.x + VFX.rnd(-16, 16), y: p.y - VFX.rnd(70, 120), vx: VFX.rnd(-20, 20), vy: VFX.rnd(520, 700), tex: 'trace_02', rgb: BLOOD, s0: 10, s1: 6, a0: 0.9, a1: 0.5, life: 0.18, stretch: 0.06 });
  }
  // 1.6-2.2 s: the sea drains into the fractures (veins glow, then go dark); 2.2-3.0 s: the blade steams
  const drain = beat(t, 0.35, 1.2);
  drawVeins(ctx, o.x, ground, 210, 1, (1 - drain) * (0.6 + 0.4 * Math.sin(S.battle.time * 9)), 1 - beat(t, 0.8, 1.6));
  if (t > 0.9 && t < 1.75 && Math.random() < 0.35) VFX.emit({ x: o.x + VFX.rnd(-8, 8), y: ground - VFX.rnd(20, 70), vx: VFX.rnd(-8, 8), vy: VFX.rnd(-40, -20), tex: 'smoke_05', rgb: '185, 28, 28', blend: 'source-over', s0: 16, s1: 52, a0: 0.25, a1: 0, life: 1.2, vr: VFX.rnd(-1, 1) });
}

// ---------- Soul-Reaping Heavenly Demon · Ten-Thousand Soul Banner ----------
const SOUL = '134, 239, 172', SOUL_HOT = '240, 253, 244', SOUL_DARK = '5, 46, 22';
const soulBanner = (cx, cy) => { const top = Math.max(30, cy - 170); return { px: cx + 34, top, bottom: cy - 14, cx: cx - 4, cy: top + 62 }; };
function skull(ctx, x, y, s, a) {
  if (a <= 0.02) return;
  VFX.sprite(ctx, 'light_02', SOUL, x, y, s * 3, s * 3, 0.5 * a);
  ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgb(${SOUL_HOT})`; ctx.font = `${Math.round(s * 1.6)}px "Segoe UI Symbol", "Noto Sans Symbols", serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('☠', x, y);
  ctx.restore();
}
function soulChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, g = soulBanner(cx, cy);
  // 0-0.4 s: the banner is slammed into the floor; nether-green flames run up the staff
  if (prog >= 0.22 && once(st, 'slam')) {
    VFX.burst('medium', g.px, cy - 6, SOUL, SOUL_HOT); addDecal('crack', g.px, cy - 4, 1.1, 3); addTrauma(0.32, 0.6);
    for (let i = 0; i < 8; i++) VFX.emit({ x: g.px, y: cy - 6, vx: VFX.rnd(-140, 140), vy: VFX.rnd(-40, -5), drag: 2.5, tex: 'smoke_05', rgb: '68, 64, 60', blend: 'source-over', s0: 18, s1: 50, a0: 0.4, a1: 0, life: 0.7 });
  }
  const flame = beat(prog, 0.22, 0.45);
  for (let i = 0; i < 6 && flame > 0; i++) {
    const y = g.bottom - (g.bottom - g.top) * (i / 6) * flame, fl = 0.7 + 0.3 * Math.sin(t * 17 + i * 2);
    VFX.sprite(ctx, 'flare_01', SOUL, g.px + Math.sin(t * 13 + i) * 2, y - 6, 18 * fl, 30 * fl, 0.55 * flame);
  }
  if (flame > 0 && Math.random() < 0.5) VFX.emit({ x: g.px + VFX.rnd(-3, 3), y: g.bottom - (g.bottom - g.top) * Math.random() * flame, vx: VFX.rnd(-10, 10), vy: VFX.rnd(-70, -35), tex: 'spark_01', rgb: SOUL, s0: 7, s1: 2, a0: 0.9, life: 0.6 });
  // 0.4-0.9 s: a hurricane of wailing skulls pours out of the banner; 0.9-1.2 s: they collapse into its core
  const swarm = beat(prog, 0.38, 0.6), collapse = eIn(beat(prog, 0.88, 1.15));
  if (swarm > 0) {
    VFX.sprite(ctx, 'twirl_01', SOUL_DARK, cx, cy - 20, 400 * swarm * (1 - 0.6 * collapse), 190 * swarm * (1 - 0.6 * collapse), 0.75 * swarm, t * 2.6, 'source-over');
    VFX.sprite(ctx, 'twirl_02', SOUL, cx, cy - 20, 360 * swarm * (1 - 0.6 * collapse), 170 * swarm * (1 - 0.6 * collapse), 0.7 * swarm, -t * 3.2);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * (1.6 + 0.3 * hash01(i)), r = (60 + 90 * hash01(i * 2.7)) * swarm;
      const x = cx + Math.cos(a) * r, y = cy - 26 + Math.sin(a) * r * 0.5 + Math.sin(t * 9 + i) * 4;
      skull(ctx, x + (g.cx - x) * collapse, y + (g.cy - y) * collapse, 13 + 5 * hash01(i * 5), swarm * (1 - collapse * 0.7));
    }
  }
  if (collapse > 0) { VFX.sprite(ctx, 'flare_01', SOUL_HOT, g.cx, g.cy, 30 + 120 * collapse, 30 + 120 * collapse, collapse, t * 2); additiveGlow(ctx, g.cx, g.cy, 70 * collapse, SOUL, 0.7 * collapse); }
}
function soulClaw(ctx, x, y, k, a) {                                   // three spectral talons erupting from the ground
  const h = 46 * Math.sin(Math.min(1, k) * Math.PI);
  if (h <= 1 || a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let c = -1; c <= 1; c++) {
    const bx = x + c * 9, tipX = x + c * 11, tipY = y - h;
    for (const [w, col] of [[6, `rgba(${SOUL}, ${0.45 * a})`], [2, `rgba(${SOUL_HOT}, ${0.9 * a})`]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(bx, y + 4); ctx.quadraticCurveTo(bx + c * 12, y - h * 0.6, tipX - c * 6, tipY); ctx.stroke();
    }
  }
  ctx.restore();
  VFX.sprite(ctx, 'light_02', SOUL, x, y, 60, 22, 0.6 * a);
}
function soulRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), g = soulBanner(o.x, o.y);
  // 1.2-1.25 s: the banner releases a shockwave of jade energy across the whole board
  if (once(st, 'burst')) VFX.burst('medium', g.cx, g.cy, SOUL, SOUL_HOT);
  const w = beat(t, 0, 0.5);
  shockRing(ctx, o.x, o.y, 30 + 620 * eOut(w), SOUL, 0.9 * (1 - w), 3);
  shockRing(ctx, o.x, o.y, 20 + 520 * eOut(beat(t, 0.08, 0.6)), SOUL_HOT, 0.6 * (1 - beat(t, 0.08, 0.6)), 1.5);
  // 1.25-1.6 s: ghost claws erupt beneath every runner as the scheduled wisp reaches it
  for (const h of (f.schedule?.hits || [])) {
    if (t < h.at || t > h.at + 0.5) continue;
    const e = S.battle.enemies.find(v => v.uid === h.uid); if (!e) continue;
    const p = trackPoint(visualTrackP(e), size);
    soulClaw(ctx, p.x, p.y + 4, (t - h.at) / 0.45, 1);
  }
  // 1.6-3.0 s: the mist recedes into the banner while green embers drift up
  if (t > 0.35 && Math.random() < 0.45) VFX.emit({ x: g.cx + VFX.rnd(-30, 30), y: g.cy + VFX.rnd(-10, 50), vx: VFX.rnd(-12, 12), vy: VFX.rnd(-45, -20), tex: 'spark_01', rgb: SOUL, s0: 6, s1: 2, a0: 0.9, life: 1.1 });
  if (t > 0.4) VFX.sprite(ctx, 'smoke_05', SOUL, g.cx, g.cy + 20, 160 * (1 - beat(t, 0.4, 1.5)) + 40, 90, 0.25 * (1 - beat(t, 0.4, 1.5)), t);
}

// ---------- Formation Master · Star-River Weiqi Board ----------
const STAR = '103, 232, 249', STAR_HOT = '236, 254, 255';
const boardCentre = size => at(2, 2, size);
function formationChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, corners = [0, 4, 8, 12].map(i => ringTile(i, size));
  // 0-0.4 s: faint vertical starlight rises from the four star points
  const beam = beat(prog, 0.1, 0.4), squeeze = beat(prog, 0.9, 1.2);
  for (const p of corners) lightPillar(ctx, p.x, p.y, 120 + 60 * squeeze, 10, STAR, 0.35 * beam + 0.35 * squeeze);
  // 0.4-0.9 s: black and white stones spiral around the Master; constellation lines tether every runner
  const ring = beat(prog, 0.38, 0.6), lift = eOut(squeeze), c = boardCentre(size), sky = { x: c.x, y: c.y - 150 };
  for (let i = 0; i < 10 && ring > 0; i++) {
    const a = (i / 10) * Math.PI * 2 + t * 2.2, r = 70 * ring * (1 - lift * 0.8);
    const x = cx + Math.cos(a) * r, y = cy - 20 + Math.sin(a) * r * 0.42;
    drawGoStoneDisc(ctx, x + (sky.x - x) * lift, y + (sky.y - y) * lift, 7 * (1 - 0.4 * lift), i % 2 === 0, ring);
  }
  const tether = beat(prog, 0.45, 0.85);
  if (tether > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 40;
    for (const [i, e] of live().entries()) {
      const k = cl(tether * 1.6 - (i % 6) * 0.1); if (k <= 0) continue;
      const p = trackPoint(visualTrackP(e), size), from = squeeze > 0 ? sky : { x: cx, y: cy - 20 };
      ctx.strokeStyle = `rgba(${STAR}, ${(0.45 + 0.5 * squeeze) * k})`; ctx.lineWidth = 1.4 + 1.6 * squeeze;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(from.x + (p.x - from.x) * k, from.y + (p.y - 8 - from.y) * k); ctx.stroke();
    }
    ctx.restore();
    for (const e of live()) { const p = trackPoint(visualTrackP(e), size); drawStarPoint(ctx, p.x, p.y - 8, 5, 0.8 * tether); }
  }
  // 0.9-1.2 s: the stones coalesce high above the board into a pulsing celestial sphere
  if (squeeze > 0) {
    const pulse = 0.85 + 0.15 * Math.sin(t * 24), r = (40 + 40 * squeeze) * pulse;
    VFX.sprite(ctx, 'light_02', STAR, sky.x, sky.y, r * 5, r * 5, 0.7 * squeeze);
    VFX.sprite(ctx, 'magic_05', STAR, sky.x, sky.y, r * 3.2, r * 3.2, 0.7 * squeeze, t * 2.5);
    VFX.sprite(ctx, 'star_07', STAR_HOT, sky.x, sky.y, r * 1.6, r * 1.6, squeeze, -t * 3);
  }
}
function formationRelease(ctx, f, size, st) {
  const t = sinceRelease(f), c = boardCentre(size), corners = [0, 4, 8, 12].map(i => ringTile(i, size));
  // 1.2-1.25 s: the keystone snaps onto the board; blinding light pillars erupt from the four star points
  if (once(st, 'clack')) { VFX.burst('medium', c.x, c.y, STAR, STAR_HOT); for (const p of corners) VFX.burst('medium', p.x, p.y, STAR, STAR_HOT); }
  const pill = 1 - beat(t, 0.25, 0.9);
  for (const p of corners) lightPillar(ctx, p.x, p.y, 420 * eOut(beat(t, 0, 0.1)), 30, STAR, pill);
  const drop = beat(t, 0, 0.08);                                         // the sphere falls onto the board centre
  if (drop < 1) VFX.sprite(ctx, 'star_07', STAR_HOT, c.x, c.y - 150 * (1 - drop), 60, 60, 1, t * 8);
  // 1.25-1.6 s: a gravitational shockwave sweeps the whole track (the river and warps follow, engine-scheduled)
  const w = beat(t, 0.02, 0.5);
  shockRing(ctx, c.x, c.y, 20 + 560 * eOut(w), STAR, 0.95 * (1 - w), 3);
  shockRing(ctx, c.x, c.y, 10 + 420 * eOut(beat(t, 0.1, 0.6)), STAR_HOT, 0.5 * (1 - beat(t, 0.1, 0.6)), 1.5);
  // 1.6-2.2 s: the grid fades, leaving a faint star-chart etched between the star points
  const chart = beat(t, 0.4, 0.7) * (1 - beat(t, 1.3, 2));
  if (chart > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${STAR}, ${0.35 * chart})`; ctx.lineWidth = 1;
    ctx.beginPath(); corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.moveTo(corners[0].x, corners[0].y); ctx.lineTo(corners[2].x, corners[2].y); ctx.moveTo(corners[1].x, corners[1].y); ctx.lineTo(corners[3].x, corners[3].y);
    ctx.stroke(); ctx.restore();
    for (const p of corners) drawStarPoint(ctx, p.x, p.y, 7, 0.6 * chart);
  }
  // 2.2-3.0 s: the white stone in the Master's hand dissolves into stardust
  const o = at(f.x, f.y, size), dust = beat(t, 1, 1.9);
  if (dust > 0 && dust < 1) { drawGoStoneDisc(ctx, o.x + 10, o.y - 28, 6, true, 1 - dust); if (Math.random() < 0.6) VFX.emit({ x: o.x + 10, y: o.y - 28, vx: VFX.rnd(-25, 25), vy: VFX.rnd(-50, -15), tex: 'star_06', rgb: STAR_HOT, s0: 6, s1: 1, a0: 1, life: 0.8 }); }
}

// ---------- Landscape Sage · Mountain-River Ink Dragon ----------
const INK = '12, 12, 14';
// Sumi-e painting on the scroll (u 0..1 along, v 0..1 across): a pale far range, a dark near range, a river wash.
const RANGES = [
  { tone: 0.32, pts: [[0, 0.62], [0.08, 0.4], [0.16, 0.52], [0.27, 0.28], [0.37, 0.47], [0.5, 0.34], [0.62, 0.5], [0.74, 0.3], [0.86, 0.46], [1, 0.4]] },
  { tone: 0.85, pts: [[0, 0.8], [0.1, 0.55], [0.19, 0.68], [0.3, 0.42], [0.4, 0.66], [0.55, 0.72], [0.66, 0.5], [0.76, 0.63], [0.85, 0.38], [0.95, 0.6], [1, 0.72]] },
];
function scrollQuad(size, open) {                                         // the scroll lies on the floor across the board
  const half = 1.75 * open, y0 = 1.3, y1 = 2.7;
  return { l: 2 - half, r: 2 + half, y0, y1, p: (u, v) => at(2 - 1.75 + 3.5 * u, y0 + (y1 - y0) * v, size) };
}
function smoothLine(ctx, pts) {                                           // brush-like curve through the points
  for (let i = 1; i < pts.length; i++) { const m = { x: (pts[i - 1].x + pts[i].x) / 2, y: (pts[i - 1].y + pts[i].y) / 2 }; ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, m.x, m.y); }
  ctx.lineTo(pts.at(-1).x, pts.at(-1).y);
}
function landscapeScroll(ctx, size, open, paint, alpha) {
  if (alpha <= 0 || open <= 0) return;
  const q = scrollQuad(size, open), a = at(q.l, q.y0, size), b = at(q.r, q.y0, size), c = at(q.r, q.y1, size), d = at(q.l, q.y1, size);
  const quad = (p0, p1, p2, p3) => { ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); };
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'; quad({ x: a.x, y: a.y + 6 }, { x: b.x, y: b.y + 6 }, { x: c.x, y: c.y + 6 }, { x: d.x, y: d.y + 6 }); ctx.fill();
  const g = ctx.createLinearGradient(a.x, a.y, d.x, d.y); g.addColorStop(0, '#f6f1e4'); g.addColorStop(1, '#e6dcc6');
  ctx.fillStyle = g; quad(a, b, c, d); ctx.fill();
  ctx.save(); quad(q.p(0, 0), q.p(paint, 0), q.p(paint, 1), q.p(0, 1)); ctx.clip();   // the brush has reached u = paint
  for (const r of RANGES) {                                              // each range: soft wash fading into the mist below
    const pts = r.pts.map(([u, v]) => q.p(u, v)), b0 = q.p(0, 0.92), b1 = q.p(1, 0.92), top = Math.min(...pts.map(p => p.y));
    const wash = ctx.createLinearGradient(0, top, 0, b0.y);
    wash.addColorStop(0, `rgba(${INK}, ${r.tone})`); wash.addColorStop(0.55, `rgba(${INK}, ${r.tone * 0.35})`); wash.addColorStop(1, `rgba(${INK}, 0)`);
    ctx.fillStyle = wash; ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(pts[0].x, pts[0].y); smoothLine(ctx, pts); ctx.lineTo(b1.x, b1.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(${INK}, ${Math.min(1, r.tone + 0.1)})`; ctx.lineWidth = r.tone > 0.5 ? 2.6 : 1.4; ctx.lineJoin = 'round';   // dry-brush ridge line
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); smoothLine(ctx, pts); ctx.stroke();
  }
  ctx.strokeStyle = `rgba(${INK}, 0.3)`; ctx.lineWidth = 1.2;           // river lines in the mist
  for (const v of [0.86, 0.9]) { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const p = q.p(i / 20, v + Math.sin(i * 0.9) * 0.012); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke(); }
  ctx.restore();
  if (paint >= 1) { const s0 = q.p(0.93, 0.12); ctx.fillStyle = 'rgba(185, 28, 28, 0.85)'; ctx.fillRect(s0.x - 6, s0.y - 6, 12, 12); }   // the painter's red seal
  ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 8; ctx.lineCap = 'round';   // wooden rollers at both ends
  for (const [p0, p1] of [[a, d], [b, c]]) { ctx.beginPath(); ctx.moveTo(p0.x, p0.y - 3); ctx.lineTo(p1.x, p1.y + 3); ctx.stroke(); }
  ctx.restore();
}
function landscapeChannel(ctx, cx, cy, prog, size, st) {
  const open = eOut(beat(prog, 0, 0.32)), paint = beat(prog, 0.05, 0.45), lift = beat(prog, 0.4, 0.9);
  // 0-0.4 s: a silk scroll unrolls across the floor and vigorous brush strokes lay down mountains
  landscapeScroll(ctx, size, open, paint, 1 - 0.35 * beat(prog, 0.9, 1.2));
  // 0.4-0.9 s: ink and mist lift off the painting into the air (the dragon forms above, base drawer)
  if (lift > 0 && lift < 1 && Math.random() < 0.7) {
    const q = scrollQuad(size, 1), p = q.p(Math.random(), 0.2 + Math.random() * 0.6);
    VFX.emit({ x: p.x, y: p.y, vx: (cx - p.x) * 0.4, vy: VFX.rnd(-110, -60), tex: 'smoke_05', rgb: '30, 30, 34', blend: 'source-over', s0: 14, s1: 46, a0: 0.45, a1: 0, life: 0.9, vr: VFX.rnd(-1, 1) });
  }
  // 0.9-1.2 s: the coiled dragon rains ink droplets onto the arena
  if (prog > 0.85) for (let i = 0; i < 2; i++) VFX.emit({ x: cx + VFX.rnd(-90, 90), y: cy - VFX.rnd(80, 130), vy: VFX.rnd(260, 380), ay: 500, tex: 'light_02', rgb: INK, blend: 'source-over', s0: 5, s1: 4, a0: 0.9, life: 0.35 });
}
function landscapeRelease(ctx, f, size, st) {
  const t = sinceRelease(f), sch = f.schedule || { start: 0.15, speed: 20 }, end = sch.start + 16 / sch.speed;
  if (once(st, 'roar')) { const o = at(f.x, f.y, size); VFX.burst('medium', o.x, o.y - 40, '110, 231, 183', '236, 253, 245'); }
  landscapeScroll(ctx, size, 1, 1, 0.65 * (1 - beat(t, 0, 0.5)));
  // 1.25-1.6 s: thick ink spatters off the dragon as it sweeps the track
  const head = 16 - Math.max(0, t - sch.start) * sch.speed;
  if (head > 0 && head < 16) {
    const q = trackPoint(head, size);
    for (let i = 0; i < 3; i++) VFX.emit({ x: q.x, y: q.y - 14, vx: VFX.rnd(-150, 150), vy: VFX.rnd(-160, -40), ay: 800, tex: 'light_02', rgb: INK, blend: 'source-over', s0: VFX.rnd(5, 10), s1: 7, a0: 0.9, a1: 0.7, life: VFX.rnd(0.35, 0.6) });
    if (Math.random() < 0.3) addDecal('mud', q.x, q.y + 4, 0.7, 4);
  }
  // 1.6-3.0 s: the dragon dissolves into calligraphy mist and a soft mountain rain
  const mist = beat(t, end, end + 0.6), rain = beat(t, end, end + 0.3) * (1 - beat(t, end + 1.2, end + 1.9));
  for (let m = 0; m < 2 && mist > 0 && mist < 1; m++) { const q = trackPoint(Math.random() * 7, size); VFX.emit({ x: q.x, y: q.y - 20, vx: VFX.rnd(-15, 15), vy: VFX.rnd(-25, -8), tex: 'smoke_05', rgb: '120, 120, 128', blend: 'source-over', s0: 30, s1: 90, a0: 0.3, a1: 0, life: 1.4, vr: VFX.rnd(-0.6, 0.6) }); }
  for (let i = 0; i < 4 && rain > 0; i++) if (Math.random() < rain) VFX.emit({ x: VFX.rnd(0, size), y: VFX.rnd(0, size * 0.5), vx: -40, vy: 520, tex: 'trace_02', rgb: '203, 213, 225', s0: 6, s1: 5, a0: 0.35, a1: 0.2, life: 0.5, stretch: 0.05 });
}

// ---------- Melodic Saint · Celestial Resonance ----------
const MEL = '129, 140, 248', MEL_GOLD = '253, 230, 138', MEL_PALE = '199, 210, 254';
function melodicChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, staves = beat(prog, 0.33, 0.55) * (1 - beat(prog, 0.9, 1.15));
  // 0.4-0.9 s: five lines of a musical staff spiral around the Saint in a helix
  if (staves > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.5; ctx.shadowColor = `rgba(${MEL}, 0.9)`; ctx.shadowBlur = 6;
    for (let l = 0; l < 5; l++) {
      ctx.strokeStyle = `rgba(${l % 2 ? MEL_PALE : MEL_GOLD}, ${0.85 * staves})`;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * Math.PI * 2 + t * 1.4, r = 78 + 5 * Math.sin(a * 2), y = cy - 30 - l * 6 + Math.sin(a) * r * 0.35 + Math.sin(a * 3 + t * 2) * 8;
        i ? ctx.lineTo(cx + Math.cos(a) * r, y) : ctx.moveTo(cx + Math.cos(a) * r, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  // 0.9-1.2 s: the sound collapses into a white-gold singularity under the fingertips
  const sing = beat(prog, 0.9, 1.2);
  if (sing > 0) {
    VFX.sprite(ctx, 'flare_01', MEL_GOLD, cx, cy + 12, 30 + 110 * sing, 30 + 110 * sing, 0.4 + 0.6 * sing, t * 2);
    VFX.sprite(ctx, 'star_07', '255, 255, 255', cx, cy + 12, 16 + 40 * sing, 16 + 40 * sing, sing, -t * 5);
  }
}
function melodicRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size);
  if (once(st, 'strum')) VFX.burst('medium', o.x, o.y, MEL, MEL_GOLD);
  // 1.25-1.6 s: three concentric shockwaves tear past the edge of the arena
  for (let i = 0; i < 3; i++) { const w = beat(t, 0.02 + i * 0.09, 0.6 + i * 0.09); if (w > 0) shockRing(ctx, o.x, o.y, 20 + 640 * eOut(w), i === 1 ? MEL_GOLD : MEL, 0.55 * (1 - w), 2); }
  // 1.6-2.2 s: gold dust drifts and dissolves; 2.2-3.0 s: the guqin dissolves into golden particles
  if (t > 0.4 && t < 1.4 && Math.random() < 0.6) VFX.emit({ x: o.x + VFX.rnd(-160, 160), y: o.y + VFX.rnd(-90, 60), vx: VFX.rnd(-8, 8), vy: VFX.rnd(-25, -8), tex: 'star_06', rgb: MEL_GOLD, s0: 5, s1: 1, a0: 0.9, life: 1.2 });
  const gq = beat(t, 1, 1.8);
  if (gq > 0 && gq < 1) {
    guqinStrings(ctx, o.x, o.y, 150, 0.6, 0.8 * (1 - gq), S.battle.time);
    if (Math.random() < 0.8) VFX.emit({ x: o.x + VFX.rnd(-75, 75), y: o.y + VFX.rnd(4, 24), vx: VFX.rnd(-10, 10), vy: VFX.rnd(-40, -15), tex: 'star_06', rgb: MEL_GOLD, s0: 6, s1: 1, a0: 1, life: 0.9 });
  }
}

// ---------- Monastic path: shared pieces ----------
const GOLD = '250, 204, 21', GOLD_HOT = '254, 249, 195', LOTUS = '244, 114, 182';
const wrap16 = p => ((p % 16) + 16) % 16;
const wallMid = (w, size) => trackPoint(wrap16(w * 4 + 2), size);
const onWall = (e, w) => Math.floor(wrap16(visualTrackP(e)) / 4) === w;
// A translucent golden temple bell (Kim Chung) standing on baseY, h px tall.
function goldenBell(ctx, x, baseY, h, alpha, t) {
  if (alpha <= 0.01) return;
  const w = h * 0.82, top = baseY - h;
  const outline = () => { ctx.beginPath(); ctx.moveTo(x - w * 0.5, baseY); ctx.bezierCurveTo(x - w * 0.46, baseY - h * 0.35, x - w * 0.36, top + h * 0.12, x - w * 0.22, top + h * 0.04); ctx.quadraticCurveTo(x, top - h * 0.04, x + w * 0.22, top + h * 0.04); ctx.bezierCurveTo(x + w * 0.36, top + h * 0.12, x + w * 0.46, baseY - h * 0.35, x + w * 0.5, baseY); ctx.ellipse(x, baseY, w * 0.5, w * 0.16, 0, 0, Math.PI); ctx.closePath(); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, `rgba(${GOLD}, ${0.28 * alpha})`); g.addColorStop(cl(0.35 + 0.15 * Math.sin(t * 2)), `rgba(${GOLD_HOT}, ${0.12 * alpha})`); g.addColorStop(1, `rgba(${GOLD}, ${0.3 * alpha})`);
  outline(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(${GOLD_HOT}, ${0.75 * alpha})`; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = `rgba(${GOLD}, ${0.6 * alpha})`; ctx.lineWidth = 1.2;              // cast bands and the lip
  for (const k of [0.3, 0.62]) { const yy = top + h * k, ww = w * (0.28 + 0.2 * k); ctx.beginPath(); ctx.ellipse(x, yy, ww, ww * 0.18, 0, 0, Math.PI); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(x, baseY, w * 0.5, w * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = `rgba(${GOLD_HOT}, ${0.8 * alpha})`; ctx.beginPath(); ctx.ellipse(x, top - 2, Math.max(2, h * 0.04), Math.max(1.5, h * 0.033), 0, 0, Math.PI * 2); ctx.fill();   // knob
  ctx.restore();
}
// A tiny swinging bell over a stunned runner's head.
function bellIcon(ctx, x, y, t, a) {
  VFX.sprite(ctx, 'light_02', GOLD, x, y, 26, 26, 0.5 * a);
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 9) * 0.35); goldenBell(ctx, 0, 7, 14, a, t); ctx.restore();
}
// The astral fist, knuckles forward along `ang`, s = width in px.
function astralFist(ctx, x, y, s, ang, alpha) {
  if (alpha <= 0.01) return;
  VFX.sprite(ctx, 'light_02', GOLD, x, y, s * 2.2, s * 1.6, 0.8 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s / 80, s / 80);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, `rgba(${GOLD}, ${0.15 * alpha})`); g.addColorStop(1, `rgba(${GOLD_HOT}, ${0.9 * alpha})`);
  ctx.fillStyle = g; ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * alpha})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-40, -24, 56, 48, 14); ctx.fill(); ctx.stroke();                         // back of the hand
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(20, -18 + i * 12, 14, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }   // four knuckles
  ctx.beginPath(); ctx.ellipse(-2, 22, 18, 7, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();                 // thumb
  ctx.restore();
}
const MANTRA = '唵嘛呢叭咪吽';

// ---------- Indestructible Vajra Body · Mountain-Splitting Fist ----------
function vajraChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, ground = cy + 14, fist = { x: cx + 26, y: cy - 30 };
  // 0-0.4 s: horse-stance stomp cracks the tile; the skin turns molten gold; a golden bell forms around him
  if (prog >= 0.1 && once(st, 'stomp')) {
    addDecal('crack', cx, ground, 1.2, 3.5); addTrauma(0.28, 0.6);
    for (let i = 0; i < 12; i++) VFX.emit({ x: cx + VFX.rnd(-20, 20), y: ground, vx: VFX.rnd(-160, 160), vy: VFX.rnd(-30, -5), drag: 2.4, tex: 'smoke_05', rgb: '120, 113, 108', blend: 'source-over', s0: 16, s1: 46, a0: 0.4, a1: 0, life: 0.7 });
  }
  if (prog >= 0.1 && prog < 0.45) shockRing(ctx, cx, ground, 40 + 160 * beat(prog, 0.1, 0.4), GOLD, 0.7 * (1 - beat(prog, 0.1, 0.4)), 2);
  const gilt = beat(prog, 0.05, 0.35), bell = eOut(beat(prog, 0.08, 0.38));
  VFX.sprite(ctx, 'light_02', GOLD, cx, cy - 16, 90, 120, 0.55 * gilt * (0.85 + 0.15 * Math.sin(t * 7)));   // molten-gold skin
  goldenBell(ctx, cx, ground + 6, 150 * (0.8 + 0.2 * bell), bell * (0.85 + 0.15 * Math.sin(t * 5)), t);
  // 0.4-0.9 s: mantra rings orbit the drawn-back fist; heat shimmer; loose stones float up
  const comp = beat(prog, 0.33, 0.55), sing = beat(prog, 0.75, 1);
  if (comp > 0) {
    for (let i = 0; i < 8; i++) {                                   // levitating stones (4 px and bobbing), with shadows
      const a = (i / 8) * Math.PI * 2 + 0.3, r = 64 + 24 * hash01(i * 3.1), sx = cx + Math.cos(a) * r, sy = ground + Math.sin(a) * r * 0.45, lift = (4 + 3 * Math.sin(t * 4 + i)) * comp;
      ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * comp})`; ctx.beginPath(); ctx.ellipse(sx, sy + 2, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${i % 2 ? '120, 113, 108' : '87, 83, 78'}, ${comp})`; ctx.beginPath(); ctx.ellipse(sx, sy - lift, 5 + 2 * hash01(i), 3.5, hash01(i * 7) * 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    VFX.sprite(ctx, 'smoke_05', GOLD, cx, cy - 30, 120 + 10 * Math.sin(t * 13), 150, 0.12 * comp, t * 0.7);   // heat haze
    ctx.save(); ctx.font = '700 12px "Noto Serif SC", "SimSun", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalCompositeOperation = 'lighter';
    for (let ring = 0; ring < 3; ring++) {                          // three rings of the six-syllable mantra around the forearm
      const r = (24 + ring * 12) * (1 - sing), spin = t * (2.4 - ring * 0.5) + ring;
      for (let i = 0; i < MANTRA.length; i++) {
        const a = spin + (i / MANTRA.length) * Math.PI * 2, depth = 0.55 + 0.45 * Math.cos(a);
        ctx.globalAlpha = comp * depth * (1 - 0.6 * sing); ctx.fillStyle = `rgb(${depth > 0.6 ? GOLD_HOT : GOLD})`;
        ctx.fillText(MANTRA[i], fist.x - 10 + ring * 8 + Math.cos(a) * r, fist.y + Math.sin(a) * r * 0.35);
      }
    }
    ctx.restore();
  }
  // 0.9-1.2 s: the mantras collapse into the knuckle; the fist burns like the sun
  if (sing > 0) {
    VFX.sprite(ctx, 'flare_01', GOLD_HOT, fist.x, fist.y, 30 + 120 * sing, 30 + 120 * sing, 0.5 + 0.5 * sing, t * 3);
    VFX.sprite(ctx, 'star_07', '255, 255, 255', fist.x, fist.y, 16 + 44 * sing, 16 + 44 * sing, sing, -t * 5);
    if (Math.random() < 0.8) { const a = VFX.rnd(0, Math.PI * 2), d = VFX.rnd(60, 110); VFX.emit({ x: fist.x + Math.cos(a) * d, y: fist.y + Math.sin(a) * d * 0.6, vx: -Math.cos(a) * d * 3, vy: -Math.sin(a) * d * 1.8, drag: 1, tex: 'spark_01', rgb: GOLD, s0: 9, s1: 3, a0: 1, life: 0.3, stretch: 0.05 }); }
  }
}
function vajraRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), now = S.battle.time;
  if (st.wall == null) { const top = live().sort((a, z) => z.hp - a.hp)[0]; st.wall = f.wall ?? (top ? Math.floor(wrap16(visualTrackP(top)) / 4) : 0); }
  const w = st.wall, mid = wallMid(w, size), walls = [w, (w + 1) % 4, (w + 3) % 4];
  // 1.2-1.25 s: he punches the air; an 80 px astral fist shoots across the board
  const fly = beat(t, 0, 0.16), from = { x: o.x + 26, y: o.y - 30 }, ang = Math.atan2(mid.y - 20 - from.y, mid.x - from.x);
  if (fly < 1) {
    const x = from.x + (mid.x - from.x) * eIn(fly), y = from.y + (mid.y - 20 - from.y) * eIn(fly);
    VFX.sprite(ctx, 'trace_02', GOLD, (x + from.x) / 2, (y + from.y) / 2, 50, Math.hypot(x - from.x, y - from.y) + 40, 0.7, ang - Math.PI / 2);
    astralFist(ctx, x, y, 80 * (0.7 + 0.3 * fly), ang, 1);
  }
  // 1.25-1.6 s: impact — rock fragments erupt from the struck wall, the shock rolls along the walls beside it
  if (fly >= 1 && once(st, 'impact')) {
    VFX.burst('medium', mid.x, mid.y, GOLD, GOLD_HOT); addTrauma(0.9, 1);
    for (let i = 0; i < 26; i++) VFX.emit({ x: mid.x + VFX.rnd(-30, 30), y: mid.y, vx: VFX.rnd(-200, 200), vy: VFX.rnd(-420, -150), ay: 1100, drag: 0.3, tex: 'light_02', rgb: i % 3 ? '120, 98, 60' : GOLD, blend: i % 3 ? 'source-over' : 'lighter', s0: VFX.rnd(5, 11), s1: 5, a0: 1, a1: 0.6, life: VFX.rnd(0.6, 1), vr: VFX.rnd(-6, 6) });
    for (let k = 0; k < 4; k++) { const p = trackPoint(w * 4 + k + 0.5, size); addDecal('gold', p.x, p.y + 6, 1.2, 4); }   // molten fractures along the struck wall
    addDecal('crack', mid.x, mid.y + 6, 1.6, 4);
    for (const e of live()) if (walls.some(wi => onWall(e, wi))) nudgeEnemy(e.uid, 0, -18, 0.6);   // thrown into the air
  }
  if (fly >= 1) {
    const k = beat(t, 0.16, 0.3);
    if (k < 1) { astralFist(ctx, mid.x, mid.y - 20, 80 * (1 + 0.4 * k), ang, 1 - k); shockRing(ctx, mid.x, mid.y, 30 + 120 * eOut(k), GOLD_HOT, 1 - k, 3); }
    const lat = beat(t, 0.18, 0.55);
    for (const side of [-1, 1]) if (lat > 0 && lat < 1) {
      const p = trackPoint(wrap16(w * 4 + 2 + side * lat * 4.5), size);
      shockRing(ctx, p.x, p.y, 24 + 10 * Math.sin(now * 30), GOLD, 0.8 * (1 - lat), 2);
      if (Math.random() < 0.7) VFX.emit({ x: p.x, y: p.y, vx: VFX.rnd(-40, 40), vy: VFX.rnd(-120, -40), ay: 500, tex: 'smoke_05', rgb: '161, 140, 100', blend: 'source-over', s0: 14, s1: 40, a0: 0.4, a1: 0, life: 0.6 });
    }
  }
  // stunned runners on the struck walls wear a little swinging golden bell
  for (const e of live()) if ((e.frozenUntil || 0) > now && walls.some(wi => onWall(e, wi))) { const p = trackPoint(visualTrackP(e), size); bellIcon(ctx, p.x, p.y - 34, now, 0.9); }
  // 1.6-2.2 s: golden dust and mantra embers drift over the ruined walls; 2.2-3.0 s: a long white exhale
  if (t > 0.4 && t < 1.4 && Math.random() < 0.7) { const wi = walls[Math.floor(Math.random() * 3)], p = trackPoint(wi * 4 + Math.random() * 4, size); VFX.emit({ x: p.x, y: p.y - 6, vx: VFX.rnd(-15, 15), vy: VFX.rnd(-30, -10), tex: 'star_06', rgb: GOLD, s0: 5, s1: 1, a0: 0.9, life: 1.1 }); }
  if (t > 0.9 && t < 1.45 && Math.random() < 0.6) VFX.emit({ x: o.x - 6, y: o.y - 46, vx: VFX.rnd(-70, -40), vy: VFX.rnd(-12, 4), drag: 1.5, tex: 'smoke_05', rgb: '241, 245, 249', blend: 'source-over', s0: 8, s1: 34, a0: 0.4, a1: 0, life: 0.9 });
}

// ---------- Thousand-Hand Bodhisattva · Thousand-Hand Palm ----------
// Isometric lotus: layers of petals, pink at the tips, gold at the heart.
function lotus(ctx, x, y, r, open, alpha, t) {
  if (alpha <= 0.01 || open <= 0) return;
  VFX.sprite(ctx, 'light_02', GOLD, x, y, r * 2.6, r * 1.1, 0.5 * alpha * open);
  ctx.save();
  for (let layer = 0; layer < 3; layer++) {
    const n = 8 + layer * 2, rr = r * (1 - layer * 0.26) * open, lift = layer * r * 0.07 * open;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + layer * 0.3 + t * 0.1, px = x + Math.cos(a) * rr * 0.55, py = y + Math.sin(a) * rr * 0.25 - lift;
      const g = ctx.createRadialGradient(x, y - lift, 0, x, y - lift, rr);
      g.addColorStop(0, `rgba(${GOLD_HOT}, ${0.9 * alpha})`); g.addColorStop(1, `rgba(${LOTUS}, ${0.75 * alpha})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, rr * 0.5, rr * 0.2, a, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
// The golden halo wheel behind the back.
function haloWheel(ctx, x, y, r, alpha, t) {
  if (alpha <= 0.01) return;
  VFX.sprite(ctx, 'light_02', GOLD, x, y, r * 3, r * 3, 0.55 * alpha);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${GOLD_HOT}, ${0.8 * alpha})`;
  for (const k of [1, 0.78, 0.4]) { ctx.lineWidth = k === 1 ? 2.4 : 1.2; ctx.beginPath(); ctx.arc(x, y, r * k, 0, Math.PI * 2); ctx.stroke(); }
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + t * 0.4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4); ctx.lineTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); ctx.stroke(); }
  ctx.restore();
}
// The mandala of arms fanned behind the back; spread 0 = folded, 1 = fully fanned.
const ITEMS = ['lotus', 'jewel', 'wheel', 'vajra', 'willow', 'scroll'];
function thousandArms(ctx, x, y, spread, alpha, t) {
  if (alpha <= 0.01 || spread <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const N = 42;
  for (let i = 0; i < N; i++) {
    const layer = i % 3, k = Math.floor(i / 3) / (N / 3 - 1), fan = (k - 0.5) * Math.PI * 1.25 * spread;
    const a = -Math.PI / 2 + fan * 1.15 + Math.sin(t * 1.5 + i) * 0.02, len = (95 + layer * 28) * (0.4 + 0.6 * spread), sx = x + Math.cos(a) * 16, sy = y + Math.sin(a) * 12, hx = x + Math.cos(a) * len, hy = y + Math.sin(a) * len * 0.8;
    const appear = cl(spread * 1.4 - layer * 0.2);
    const ex = x + Math.cos(a - 0.25) * len * 0.5, ey = y + Math.sin(a - 0.25) * len * 0.42;      // elbow bend
    for (const [lw, al] of [[8 - layer * 1.5, 0.16], [3.2 - layer * 0.6, 0.38]]) { ctx.strokeStyle = `rgba(${GOLD}, ${al * alpha * appear})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.stroke(); }
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = `rgba(${GOLD_HOT}, ${0.55 * alpha * appear})`;   // the open hand, fingers up
    ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 5.5, 0, 0, Math.PI * 2); ctx.fill(); for (let fg = -1.5; fg <= 1.5; fg++) { ctx.beginPath(); ctx.ellipse(fg * 2.2, -7, 1, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    if (i % 6 === 0 && appear > 0.5) {                               // a sacred object in every sixth hand
      const it = ITEMS[(i / 6) % ITEMS.length], ox = hx + Math.cos(a) * 7, oy = hy + Math.sin(a) * 7;
      ctx.fillStyle = `rgba(${it === 'lotus' ? LOTUS : it === 'willow' ? '134, 239, 172' : GOLD_HOT}, ${0.9 * alpha})`; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.4;
      if (it === 'jewel') { ctx.beginPath(); ctx.moveTo(ox, oy - 4); ctx.lineTo(ox + 3, oy); ctx.lineTo(ox, oy + 4); ctx.lineTo(ox - 3, oy); ctx.fill(); }
      else if (it === 'wheel') { ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.moveTo(ox - 4, oy); ctx.lineTo(ox + 4, oy); ctx.moveTo(ox, oy - 4); ctx.lineTo(ox, oy + 4); ctx.stroke(); }
      else if (it === 'vajra') { ctx.beginPath(); ctx.moveTo(ox - 4, oy); ctx.lineTo(ox + 4, oy); ctx.stroke(); ctx.beginPath(); ctx.arc(ox - 4, oy, 1.8, 0, 7); ctx.arc(ox + 4, oy, 1.8, 0, 7); ctx.fill(); }
      else if (it === 'willow') { ctx.beginPath(); ctx.moveTo(ox, oy - 5); ctx.quadraticCurveTo(ox + 4, oy, ox + 1, oy + 6); ctx.stroke(); }
      else if (it === 'scroll') ctx.fillRect(ox - 4, oy - 2, 8, 4);
      else { ctx.beginPath(); ctx.arc(ox, oy, 3, 0, 7); ctx.fill(); }
    }
  }
  ctx.restore();
}
// The cosmic palm, fingers away from the viewer; sy squashes it flat onto the floor.
function cosmicPalm(ctx, x, y, w, sy, alpha) {
  if (alpha <= 0.01) return;
  VFX.sprite(ctx, 'light_02', GOLD, x, y - w * 0.1 * sy, w * 1.4, w * 1.4 * sy, 0.4 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.scale(w / 200, (w / 200) * sy); ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = `rgba(${GOLD}, ${alpha})`; ctx.shadowBlur = 18;
  const g = ctx.createRadialGradient(0, 10, 10, 0, 0, 130); g.addColorStop(0, `rgba(${GOLD_HOT}, ${0.3 * alpha})`); g.addColorStop(1, `rgba(${GOLD}, ${0.08 * alpha})`);
  ctx.fillStyle = g; ctx.strokeStyle = `rgba(${GOLD_HOT}, ${0.35 * alpha})`; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 20, 62, 58, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();                       // palm
  for (const [fx, len, rot] of [[-42, 70, -0.18], [-15, 92, -0.05], [12, 96, 0.04], [38, 80, 0.16]]) {           // four tapering fingers
    ctx.save(); ctx.translate(fx, -18); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(-13, 10); ctx.lineTo(-10, -len + 10); ctx.quadraticCurveTo(0, -len - 6, 10, -len + 10); ctx.lineTo(13, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.translate(-58, 30); ctx.rotate(-0.9); ctx.beginPath(); ctx.roundRect(-12, -62, 24, 72, 12); ctx.fill(); ctx.stroke(); ctx.restore();   // thumb
  ctx.strokeStyle = `rgba(${GOLD_HOT}, ${0.45 * alpha})`; ctx.lineWidth = 2;                                    // palm lines
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(0, 18, 46, 0); ctx.moveTo(-36, 30); ctx.quadraticCurveTo(0, 40, 30, 58); ctx.stroke();
  ctx.restore();
}
function bodhiChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, ground = cy + 14, back = { x: cx, y: cy - 42 };
  // 0-0.4 s: a pink-gold lotus blooms underfoot; a golden halo wheel ignites behind the back
  dimFocus(ctx, size, cx, cy, 0.4 * beat(prog, 0.3, 0.5), '28, 18, 4');   // 0.4-0.9 s: lighting dims 40%, warm
  lotus(ctx, cx, ground, 70, eOut(beat(prog, 0, 0.3)), 1, t);
  haloWheel(ctx, back.x, back.y, 40, beat(prog, 0.08, 0.33), t);
  // 0.4-0.9 s: hundreds of golden arms fan out behind him, each hand in a mudra or holding a sacred object
  thousandArms(ctx, back.x, back.y, eOut(beat(prog, 0.33, 0.72)), 1, t);
  // 0.9-1.2 s: a cosmic golden palm forms from swirling clouds high above the battlefield; its shadow falls over the board
  const sky = beat(prog, 0.72, 1), c = at(2, 2, size), py = c.y - 120;
  if (sky > 0) {
    if (Math.random() < 0.9) VFX.emit({ x: c.x + VFX.rnd(-160, 160), y: py + VFX.rnd(-50, 60), vx: VFX.rnd(-30, 30), vy: VFX.rnd(-10, 10), tex: 'smoke_05', rgb: GOLD, s0: 40, s1: 110, a0: 0.3, a1: 0, life: 1, vr: VFX.rnd(-1, 1) });
    ctx.save(); ctx.fillStyle = `rgba(20, 12, 0, ${0.3 * sky})`; ctx.beginPath(); ctx.ellipse(c.x, c.y, 260 * sky, 110 * sky, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    cosmicPalm(ctx, c.x, py, 200, 1, sky);
  }
}
function bodhiRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), c = at(2, 2, size), now = S.battle.time, back = { x: o.x, y: o.y - 42 };
  // 1.2-1.25 s: the palm slams down flat over the whole arena in a white-gold flash
  const fall = beat(t, 0, 0.08), lift = beat(t, 0.45, 1);
  const py = c.y - 120 * (1 - eIn(fall)) - 120 * eIn(lift), sy = 1 - 0.58 * fall + 0.4 * lift;
  if (fall >= 1 && once(st, 'slam')) {
    VFX.burst('medium', c.x, c.y, GOLD, GOLD_HOT); addTrauma(0.75, 1);
    for (const e of live()) nudgeEnemy(e.uid, 0, 8, 0.85);      // every runner pressed flat into the ground
  }
  // 1.6-2.2 s: a faint palm print stays etched on the floor, with rising incense
  const print = beat(t, 0.1, 0.3) * (1 - beat(t, 1.1, 1.6));
  if (print > 0) {
    cosmicPalm(ctx, c.x, c.y, 460, 0.42, 0.35 * print);
    if (Math.random() < 0.4) VFX.emit({ x: c.x + VFX.rnd(-120, 120), y: c.y + VFX.rnd(-30, 30), vx: VFX.rnd(-5, 5), vy: VFX.rnd(-35, -20), tex: 'smoke_05', rgb: '214, 211, 209', blend: 'source-over', s0: 6, s1: 30, a0: 0.3, a1: 0, life: 1.5, vr: VFX.rnd(-1, 1) });
  }
  cosmicPalm(ctx, c.x, py, 200 + 260 * fall, sy, 0.75 * (1 - lift));
  if (fall >= 1) shockRing(ctx, c.x, c.y, 60 + 520 * eOut(beat(t, 0.08, 0.5)), GOLD_HOT, 0.8 * (1 - beat(t, 0.08, 0.5)), 3);
  // board-wide stun: little golden lotus wheels spin over every runner
  for (const e of live()) if ((e.frozenUntil || 0) > now) { const p = trackPoint(visualTrackP(e), size); lotus(ctx, p.x, p.y - 34, 13, 1, 0.9, now * 30); }
  // the palm lifts and dissolves into drifting lotus petals
  if (lift > 0 && lift < 1) for (let i = 0; i < 3; i++) VFX.emit({ x: c.x + VFX.rnd(-150, 150), y: py + VFX.rnd(-60, 60), vx: VFX.rnd(-40, 40), vy: VFX.rnd(-10, 30), drag: 0.6, tex: 'light_02', rgb: i % 2 ? LOTUS : GOLD_HOT, s0: 9, s1: 6, a0: 0.9, a1: 0, life: 1.4, squash: 0.45, vr: VFX.rnd(-3, 3) });
  // 2.2-3.0 s: the arms fold back as the hands meet in prayer
  thousandArms(ctx, back.x, back.y, 1 - eOut(beat(t, 0.8, 1.4)), 1 - beat(t, 1.3, 1.6), now);
  haloWheel(ctx, back.x, back.y, 40, 1 - beat(t, 1, 1.6), now);
  if (t > 1.2 && t < 1.6) VFX.sprite(ctx, 'light_02', GOLD_HOT, o.x, o.y - 24, 30, 30, 0.6 * (1 - beat(t, 1.4, 1.6)));   // palms together at the chest
}

// ---------- Bloodline Apexes: shared pieces ----------
const quadrantOf = e => Math.floor(wrap16(visualTrackP(e)) / 4);
const densestQuadrant = () => { const n = [0, 0, 0, 0]; for (const e of live()) n[quadrantOf(e)]++; return n.indexOf(Math.max(...n)); };
const tileC = (i, size) => trackPoint(wrap16(i) + 0.5, size);
const tint = (ctx, size, rgb, a, mode = 'source-over') => { if (a <= 0.005) return; ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = `rgba(${rgb}, ${a})`; ctx.fillRect(0, 0, size, size); ctx.restore(); };

// ---------- Primordial Azure Dragon · Primordial Wrath ----------
const AZ = '56, 189, 248', AZ_HOT = '224, 242, 254', AZ_VIOLET = '167, 139, 250';
const stormEye = size => { const c = at(2, 2, size); return { x: c.x, y: c.y - 175 }; };
function stormClouds(ctx, size, a, t) {
  if (a <= 0) return;
  const eye = stormEye(size);
  for (let i = 0; i < 7; i++) VFX.sprite(ctx, 'smoke_05', '15, 23, 42', eye.x + (i - 3) * 95 + Math.sin(t * 0.6 + i) * 12, eye.y + Math.sin(i * 2.1) * 26, 230, 120, 0.55 * a, t * 0.15 + i, 'source-over');
}
function azureChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, eye = stormEye(size), seed = Math.floor(t * 18);
  // 0-0.4 s: the roar; thunderheads blacken the sky; arcs crackle over scales and horns
  if (prog >= 0.05 && once(st, 'roar')) { addTrauma(0.22, 0.5); VFX.burst('small', cx, cy - 20, AZ, AZ_HOT); }
  shockRing(ctx, cx, cy + 10, 30 + 200 * eOut(beat(prog, 0.05, 0.35)), AZ, 0.6 * (1 - beat(prog, 0.05, 0.35)), 2);
  dimFocus(ctx, size, cx, cy, 0.5 * beat(prog, 0, 0.3), '2, 6, 20');
  stormClouds(ctx, size, beat(prog, 0, 0.35), t);
  for (let i = 0; i < 3; i++) { const a = hash01(seed + i) * Math.PI * 2; drawBolt(ctx, cx + Math.cos(a) * 10, cy - 24 + Math.sin(a) * 10, cx + Math.cos(a) * 34, cy - 30 + Math.sin(a) * 24, seed + i, AZ_HOT, 0.8 * beat(prog, 0.05, 0.25), 1.2); }
  // 0.4-0.9 s: the eye of the hurricane opens over the board; plasma arcs spiral down into the raised claws
  const vortex = beat(prog, 0.33, 0.55);
  if (vortex > 0) {
    VFX.sprite(ctx, 'twirl_01', '30, 41, 59', eye.x, eye.y, 360 * vortex, 150 * vortex, 0.7 * vortex, t * 1.4, 'source-over');
    VFX.sprite(ctx, 'twirl_02', AZ, eye.x, eye.y, 300 * vortex, 120 * vortex, 0.55 * vortex, -t * 2);
    VFX.sprite(ctx, 'light_02', AZ_HOT, eye.x, eye.y, 90 * vortex, 50 * vortex, 0.8 * vortex);
    for (let k = 0; k < 2; k++) drawBolt(ctx, eye.x + (k ? 30 : -30), eye.y + 10, cx + (k ? 12 : -12), cy - 34, seed * 3 + k, k ? AZ_VIOLET : AZ_HOT, 0.9 * vortex, 2);
    if (Math.random() < 0.5 * vortex) {                                  // ground lightning crawls along the rails; runners strobe
      const i = Math.floor(Math.random() * 16), p = tileC(i, size), q = tileC(i + 1, size);
      drawBolt(ctx, p.x, p.y + 6, q.x, q.y + 6, seed + i * 7, AZ, 0.9, 1.4);
      for (const e of live()) if (Math.random() < 0.3) { const r = trackPoint(visualTrackP(e), size); additiveGlow(ctx, r.x, r.y - 14, 22, AZ_HOT, 0.6); }
    }
  }
  // 0.9-1.2 s: the cloud flashes cyan as the coils reach full charge
  const over = beat(prog, 0.75, 1);
  if (over > 0) { tint(ctx, size, AZ, 0.12 * over * (0.6 + 0.4 * Math.sin(t * 40)), 'lighter'); VFX.sprite(ctx, 'flare_01', AZ_HOT, eye.x, eye.y, 120 + 140 * over, 80 + 90 * over, over, t * 4); }
}
function azureRelease(ctx, f, size, st) {
  const t = sinceRelease(f), eye = stormEye(size), c = at(2, 2, size), now = S.battle.time, seed = Math.floor(now * 22);
  stormClouds(ctx, size, 1 - beat(t, 1, 1.6), now);                     // 2.2-3.0 s: the clouds part
  // 1.2-1.25 s: a dragon head of pure lightning plunges from the eye, with dozens of bolts
  const dive = beat(t, 0, 0.14);
  if (dive < 1) {
    const hx = eye.x + (c.x - eye.x) * eIn(dive), hy = eye.y + (c.y - eye.y) * eIn(dive);
    drawBolt(ctx, eye.x, eye.y, hx, hy - 10, seed, AZ_HOT, 1, 6);
    for (const s of [-1, 1]) { drawBolt(ctx, hx, hy - 10, hx + s * 34, hy + 18, seed + s, AZ_HOT, 1, 3); drawBolt(ctx, hx, hy - 6, hx + s * 26, hy - 34, seed + 5 + s, AZ, 0.9, 2); }   // jaws and horns
    VFX.sprite(ctx, 'flare_01', AZ_HOT, hx, hy, 140, 140, 1, now * 6);
    for (const s of [-1, 1]) VFX.sprite(ctx, 'star_07', '255, 255, 255', hx + s * 10, hy - 8, 18, 18, 1);
  }
  if (t < 0.32) for (let i = 0; i < 3; i++) { const p = tileC(Math.floor(Math.random() * 16), size); drawBolt(ctx, p.x + VFX.rnd(-60, 60), 0, p.x, p.y, seed + i * 13, i % 2 ? AZ_VIOLET : AZ_HOT, 0.85, 2.2); }
  if (dive >= 1 && once(st, 'crack')) { VFX.burst('medium', c.x, c.y, AZ, AZ_HOT); addTrauma(0.85, 1); }
  // 1.25-1.6 s: a vertical lightning pillar on every runner, arcs chaining between them, plasma cages while stunned
  const hits = f.schedule?.hits || [], struck = [];
  for (const h of hits) {
    const e = S.battle.enemies.find(v => v.uid === h.uid); if (!e || e.gone) continue;
    const p = trackPoint(visualTrackP(e), size);
    if (t >= h.at) struck.push(p);
    if (t >= h.at && t < h.at + 0.3) { drawBolt(ctx, p.x + VFX.rnd(-8, 8), p.y - 300, p.x, p.y, seed + h.uid, AZ_HOT, 1 - (t - h.at) / 0.3, 4); lightPillar(ctx, p.x, p.y, 220, 18, AZ, 1 - (t - h.at) / 0.3); }
    if (t >= h.at && once(st, 'sc' + h.uid)) { addDecal('scorch', p.x, p.y + 6, 0.8, 3.5); VFX.burst('small', p.x, p.y, AZ, AZ_HOT); }
    if ((e.frozenUntil || 0) > now) for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + now * 5; drawBolt(ctx, p.x + Math.cos(a) * 14, p.y - 30, p.x + Math.cos(a + 1.2) * 14, p.y + 2, seed + k + h.uid, AZ, 0.8, 1.2); }
  }
  if (t > 0.1 && t < 0.6) for (let i = 1; i < struck.length; i++) drawBolt(ctx, struck[i - 1].x, struck[i - 1].y - 16, struck[i].x, struck[i].y - 16, seed + i * 5, AZ_VIOLET, 0.7 * (1 - beat(t, 0.4, 0.6)), 1.6);
  // 1.6-2.2 s: the storm recedes into blue sparks and rising ozone
  if (t > 0.35 && t < 1.4 && Math.random() < 0.7) { const p = tileC(Math.random() * 16, size); VFX.emit({ x: p.x, y: p.y, vx: VFX.rnd(-10, 10), vy: VFX.rnd(-40, -15), tex: Math.random() < 0.5 ? 'spark_01' : 'smoke_05', rgb: AZ_HOT, s0: 6, s1: 22, a0: 0.5, a1: 0, life: 1, blend: 'lighter' }); }
}

// ---------- White Tiger God of Slaughter · Roar of Terror ----------
const PLAT = '241, 245, 249', CRIM = '220, 38, 38';
function tigerChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, moon = { x: cx, y: cy - 96 }, mouth = { x: cx, y: cy - 24 };
  // 0-0.4 s: the predator crouch gouges furrows; the sky turns crimson under a blood moon
  if (prog >= 0.08 && once(st, 'crouch')) { addDecal('crack', cx, cy + 14, 1, 3.5); addTrauma(0.15, 0.4); }
  const sky = beat(prog, 0, 0.3);
  tint(ctx, size, '90, 6, 6', 0.28 * sky);
  ctx.save(); ctx.strokeStyle = `rgba(28, 10, 8, ${0.8 * beat(prog, 0.08, 0.3)})`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';   // claw furrows
  for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(cx - 6 + k * 7, cy + 18); ctx.lineTo(cx - 6 + k * 7 - 26 * beat(prog, 0.08, 0.3), cy + 30); ctx.stroke(); }
  ctx.restore();
  VFX.sprite(ctx, 'light_02', CRIM, moon.x, moon.y, 150, 150, 0.45 * sky);
  const g = ctx.createRadialGradient(moon.x - 8, moon.y - 8, 2, moon.x, moon.y, 30);
  g.addColorStop(0, `rgba(252, 165, 165, ${sky})`); g.addColorStop(0.7, `rgba(185, 28, 28, ${sky})`); g.addColorStop(1, `rgba(127, 29, 29, ${sky})`);
  ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(moon.x, moon.y, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(69, 10, 10, ${0.35 * sky})`; for (const [dx, dy, r] of [[-9, 4, 6], [8, -7, 4], [5, 11, 3.5]]) { ctx.beginPath(); ctx.arc(moon.x + dx, moon.y + dy, r, 0, Math.PI * 2); ctx.fill(); }   // maria
  ctx.restore();
  // 0.4-0.9 s: wind blades shred the air; slaughter runes ignite; darkness except the burning platinum eyes
  const blades = beat(prog, 0.33, 0.55) * (1 - beat(prog, 0.85, 1.05));
  dimFocus(ctx, size, cx, cy, 0.72 * beat(prog, 0.33, 0.6), '4, 2, 2');
  if (blades > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const a = t * 9 + i * 0.7, r = 40 + 50 * hash01(i), ax = cx + Math.cos(a) * r, ay = cy - 10 + Math.sin(a) * r * 0.5;
      ctx.strokeStyle = `rgba(${i % 3 ? PLAT : CRIM}, ${0.75 * blades})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(ax, ay, 14, a, a + 1.6); ctx.stroke(); }
    ctx.font = '700 13px "Noto Serif SC", "SimSun", serif'; ctx.textAlign = 'center';
    for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(${i % 2 ? CRIM : PLAT}, ${blades * (0.5 + 0.5 * Math.sin(t * 12 + i))})`; ctx.fillText('殺', cx - 24 + i * 16, cy - 2 + (i % 2) * 8); }
    ctx.restore();
    if (Math.random() < 0.5) VFX.emit({ x: cx + VFX.rnd(-60, 60), y: cy + 14, vx: VFX.rnd(-90, 90), vy: VFX.rnd(-120, -40), ay: 400, tex: 'light_02', rgb: '87, 83, 78', blend: 'source-over', s0: 5, s1: 3, a0: 0.9, life: 0.5 });
  }
  const eyes = beat(prog, 0.4, 0.6);
  for (const s of [-1, 1]) VFX.sprite(ctx, 'flare_01', PLAT, cx + s * 6, cy - 32, 22 * eyes, 10 * eyes, eyes);
  // 0.9-1.2 s: the deep inhale — air rushes into the maw; a platinum-crimson aura gathers before the fangs
  const inhale = beat(prog, 0.75, 1);
  if (inhale > 0) {
    if (Math.random() < 0.9) { const a = VFX.rnd(0, Math.PI * 2), d = VFX.rnd(90, 150); VFX.emit({ x: mouth.x + Math.cos(a) * d, y: mouth.y + Math.sin(a) * d * 0.6, vx: -Math.cos(a) * d * 3, vy: -Math.sin(a) * d * 1.8, drag: 1, tex: 'trace_02', rgb: PLAT, s0: 8, s1: 3, a0: 0.8, life: 0.3, stretch: 0.05 }); }
    VFX.sprite(ctx, 'circle_02', CRIM, mouth.x, mouth.y + 6, 40 + 30 * inhale, 20 + 14 * inhale, inhale);
    VFX.sprite(ctx, 'light_02', PLAT, mouth.x, mouth.y, 50 * inhale, 50 * inhale, inhale);
  }
}
function tigerRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), now = S.battle.time;
  tint(ctx, size, '90, 6, 6', 0.22 * (1 - beat(t, 0.4, 1.2)));
  dimFocus(ctx, size, o.x, o.y, 0.6 * (1 - beat(t, 0.1, 0.6)), '4, 2, 2');
  // 1.2-1.25 s: the roar — a visible wall of distorted air and platinum wind blades blasts across the arena
  if (once(st, 'roar')) { VFX.burst('medium', o.x, o.y - 20, PLAT, '255, 255, 255'); for (let i = 0; i < 40; i++) { const a = VFX.rnd(0, Math.PI * 2), v = VFX.rnd(500, 900); VFX.emit({ x: o.x, y: o.y - 20, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, tex: 'trace_02', rgb: i % 4 ? PLAT : CRIM, s0: 14, s1: 8, a0: 0.9, a1: 0, life: 0.45, stretch: 0.06 }); } }
  for (let k = 0; k < 3; k++) { const w = beat(t, k * 0.07, 0.5 + k * 0.07); if (w > 0) shockRing(ctx, o.x, o.y, 30 + 600 * eOut(w), k === 1 ? CRIM : PLAT, (k === 1 ? 0.35 : 0.6) * (1 - w), 2.5 - k * 0.6); }
  // 1.25-1.6 s: every runner flips and flees; razor wind opens crimson wounds
  for (const h of f.schedule?.hits || []) {
    const e = S.battle.enemies.find(v => v.uid === h.uid); if (!e || e.gone) continue;
    const p = trackPoint(visualTrackP(e), size);
    if (t >= h.at && t < h.at + 0.35) {
      const k = (t - h.at) / 0.35; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${CRIM}, ${1 - k})`; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (let s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(p.x - 12, p.y - 26 + s * 6); ctx.lineTo(p.x + 12, p.y - 14 + s * 6); ctx.stroke(); }
      ctx.restore();
      if (once(st, 'w' + h.uid)) for (let i = 0; i < 6; i++) VFX.emit({ x: p.x, y: p.y - 20, vx: VFX.rnd(-80, 80), vy: VFX.rnd(-90, -20), ay: 500, tex: 'light_02', rgb: '185, 28, 28', blend: 'source-over', s0: 4, s1: 3, a0: 1, life: 0.5 });
    }
  }
  // 1.6-2.2 s: claw scratches gouged along every wall; trembling runners wear white claw marks while slowed
  const scr = beat(t, 0.25, 0.45) * (1 - beat(t, 1.2, 1.6));
  if (scr > 0) { ctx.save(); ctx.strokeStyle = `rgba(30, 8, 8, ${0.55 * scr})`; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i += 2) { const p = tileC(i, size); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(p.x - 14, p.y + 10 + k * 4); ctx.lineTo(p.x + 14, p.y + 7 + k * 4); ctx.stroke(); } }
    ctx.restore(); }
  for (const e of live()) {
    const p = trackPoint(visualTrackP(e), size);
    if ((e.retreatingUntil || 0) > now && Math.random() < 0.4) VFX.emit({ x: p.x, y: p.y - 14, vx: VFX.rnd(-30, 30), vy: VFX.rnd(-10, 10), tex: 'trace_02', rgb: PLAT, s0: 6, s1: 3, a0: 0.6, life: 0.25 });
    else if (e.slows?.some(s => s.until > now) && t > 0.3) { ctx.save(); ctx.strokeStyle = `rgba(${PLAT}, 0.85)`; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; const j = Math.sin(now * 40); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(p.x - 6 + k * 5 + j, p.y - 40); ctx.lineTo(p.x - 2 + k * 5 + j, p.y - 30); ctx.stroke(); } ctx.restore(); }
  }
  if (t > 1.1 && t < 1.5) VFX.sprite(ctx, 'star_07', '255, 255, 255', o.x + 14, o.y - 8, 20, 20, 1 - beat(t, 1.3, 1.5), now * 6);   // a glint on the platinum claw
}

// ---------- Xuanwu Divine Heaven-Bearer · Abyssal Toxin Domain ----------
const TOX = '74, 222, 128', TOX_DARK = '20, 83, 45', TOX_PURP = '126, 34, 206';
function serpent(ctx, x, y, rise, t, alpha) {                           // the black serpent rearing off the shell
  if (alpha <= 0.01 || rise <= 0) return null;
  const hx = x + 34, hy = y - 40 - 60 * rise;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round';
  ctx.strokeStyle = '#0b1f14'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x + 8, y - 6); ctx.bezierCurveTo(x + 52, y - 18, x + 4, hy + 30, hx, hy + 8); ctx.stroke();
  ctx.strokeStyle = `rgba(${TOX}, 0.4)`; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#0b1f14'; ctx.beginPath(); ctx.ellipse(hx, hy, 18, 12, Math.sin(t * 3) * 0.15, 0, Math.PI * 2); ctx.fill();   // flared hood
  ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.ellipse(hx + 6, hy + 4, 7, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (const s of [-1, 1]) VFX.sprite(ctx, 'star_06', TOX, hx + 4 + s * 5, hy - 2, 12, 12, alpha);
  if (Math.random() < 0.3 * alpha) VFX.emit({ x: hx, y: hy + 6, vy: VFX.rnd(40, 80), ay: 300, tex: 'light_02', rgb: TOX, s0: 4, s1: 3, a0: 1, life: 0.5 });   // venom drips
  return { x: hx, y: hy };
}
function toxicBubble(ctx, x, y, k, a) {                                  // a sludge bubble swelling to 30 px, then bursting
  if (k >= 1 || a <= 0) return;
  const r = 15 * k;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 1, x, y, Math.max(1.5, r)); g.addColorStop(0, 'rgba(187, 247, 208, 0.8)'); g.addColorStop(0.5, `rgba(${TOX}, 0.55)`); g.addColorStop(1, `rgba(${TOX_DARK}, 0.7)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - r * 0.6, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function xuanwuChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, q = (st.q ??= densestQuadrant()), qm = trackPoint(q * 4 + 2, size);
  // 0-0.4 s: forelegs smash the ground; the serpent uncoils, fangs dripping emerald venom
  if (prog >= 0.12 && once(st, 'smash')) { addDecal('crack', cx, cy + 14, 1.3, 3.5); addTrauma(0.32, 0.6); for (let i = 0; i < 12; i++) VFX.emit({ x: cx + VFX.rnd(-24, 24), y: cy + 14, vx: VFX.rnd(-150, 150), vy: VFX.rnd(-30, -5), drag: 2.4, tex: 'smoke_05', rgb: '87, 83, 78', blend: 'source-over', s0: 16, s1: 46, a0: 0.4, a1: 0, life: 0.7 }); }
  shockRing(ctx, cx, cy + 12, 30 + 220 * eOut(beat(prog, 0.12, 0.42)), '161, 140, 100', 0.6 * (1 - beat(prog, 0.12, 0.42)), 2);
  const head = serpent(ctx, cx, cy, eOut(beat(prog, 0.1, 0.35)), t, 1);
  // 0.4-0.9 s: toxic sludge geysers burst up around the densest quadrant; the serpent exhales emerald mist over it
  tint(ctx, size, '6, 24, 10', 0.3 * beat(prog, 0.33, 0.6));
  const liq = beat(prog, 0.33, 0.7), boil = beat(prog, 0.75, 1);
  if (liq > 0) {
    for (let i = 0; i < 4; i++) { const p = trackPoint(q * 4 + i + 0.5, size); ctx.save(); ctx.fillStyle = `rgba(${TOX_DARK}, ${0.55 * liq})`; ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 30 * liq, 13 * liq, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); VFX.sprite(ctx, 'light_02', TOX, p.x, p.y + 6, 70 * liq, 30 * liq, 0.4 * liq); }
    if (Math.random() < 0.6) { const p = trackPoint(q * 4 + Math.random() * 4, size); VFX.emit({ x: p.x, y: p.y + 4, vx: VFX.rnd(-40, 40), vy: VFX.rnd(-260, -140), ay: 700, tex: 'light_02', rgb: Math.random() < 0.6 ? TOX : TOX_PURP, blend: 'source-over', s0: VFX.rnd(5, 9), s1: 5, a0: 0.9, life: 0.7 }); }
    if (head && Math.random() < 0.7) VFX.emit({ x: head.x + 8, y: head.y, vx: (qm.x - head.x) * 1.4, vy: (qm.y - 90 - head.y) * 1.4, drag: 1.2, tex: 'smoke_05', rgb: TOX, s0: 16, s1: 70, a0: 0.3, a1: 0, life: 1.1, vr: VFX.rnd(-1, 1) });
  }
  // 0.9-1.2 s: the pools boil violently; bubbles swell to 30 px and burst
  if (boil > 0) for (let i = 0; i < 6; i++) { const ph = (t * 1.8 + hash01(i * 3.7)) % 1, p = trackPoint(q * 4 + hash01(i * 5.3) * 4, size); toxicBubble(ctx, p.x + (hash01(i) - 0.5) * 20, p.y + 6, ph, boil); }
}
function xuanwuRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size);
  // 1.2-1.25 s: the whole obsidian shell crashes down; mud and acid erupt
  if (once(st, 'slam')) { VFX.burst('medium', o.x, o.y, TOX, '220, 252, 231'); addTrauma(0.6, 0.8); addDecal('crack', o.x, o.y + 14, 1.6, 4); }
  shockRing(ctx, o.x, o.y + 12, 30 + 420 * eOut(beat(t, 0, 0.45)), '161, 140, 100', 0.7 * (1 - beat(t, 0, 0.45)), 3);
  serpent(ctx, o.x, o.y, 1 - beat(t, 0.6, 1), S.battle.time, 1 - beat(t, 0.7, 1));
}
// The mire itself lasts 5 s (b.xuanwuToxins): boiling bubbles, waist-deep runners, poison skulls, toxic haze.
function xuanwuMire(ctx, size) {
  const now = S.battle.time;
  for (const z of S.battle.xuanwuToxins || []) {
    if (now >= z.until) continue;
    const a = Math.min(1, (now - z.at) / 0.3) * Math.min(1, (z.until - now) / 0.6);
    for (let i = 0; i < 7; i++) { const ph = (now * 1.3 + hash01(i * 2.9 + z.quadrant)) % 1, p = trackPoint(z.quadrant * 4 + hash01(i * 4.1) * 4, size); toxicBubble(ctx, p.x + (hash01(i * 7) - 0.5) * 24, p.y + 8, ph, a); }
    if (Math.random() < 0.5 * a) { const p = trackPoint(z.quadrant * 4 + Math.random() * 4, size); VFX.emit({ x: p.x, y: p.y, vx: VFX.rnd(-8, 8), vy: VFX.rnd(-30, -12), tex: 'smoke_05', rgb: TOX, s0: 20, s1: 70, a0: 0.22, a1: 0, life: 1.6, vr: VFX.rnd(-0.6, 0.6) }); }
    for (const e of live()) if (quadrantOf(e) === z.quadrant) {
      const p = trackPoint(visualTrackP(e), size);
      ctx.save(); ctx.fillStyle = `rgba(${TOX_DARK}, ${0.65 * a})`; ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 16, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();   // waist-deep in the mire
      if ((now + e.uid * 0.37) % 1 < 0.45) skull(ctx, p.x, p.y - 42 - ((now + e.uid * 0.37) % 1) * 20, 7, a * 0.9);
    }
  }
}

// ---------- Immortal Vermilion Phoenix · Rebirth Inferno ----------
const FIRE = '251, 146, 60', FIRE_HOT = '254, 240, 138', FIRE_RED = '220, 38, 38';
function fireWings(ctx, x, y, spread, alpha, t) {                        // two wings of translucent ruby-gold fire
  if (alpha <= 0.01 || spread <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + s * (0.35 + i * 0.15) * spread, len = (60 + 60 * Math.sin((i + 1) / 10 * Math.PI)) * spread, fl = 0.85 + 0.15 * Math.sin(t * 14 + i);
    const tx = x + Math.cos(a) * len * fl, ty = y + Math.sin(a) * len * 0.75 * fl;
    const g = ctx.createLinearGradient(x, y, tx, ty); g.addColorStop(0, `rgba(${FIRE_HOT}, ${0.7 * alpha})`); g.addColorStop(0.6, `rgba(${FIRE}, ${0.5 * alpha})`); g.addColorStop(1, `rgba(${FIRE_RED}, 0)`);
    ctx.strokeStyle = g; ctx.lineWidth = 9 - i * 0.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a - s * 0.4) * len * 0.5, y + Math.sin(a - s * 0.4) * len * 0.4, tx, ty); ctx.stroke();
  }
  ctx.restore();
  VFX.sprite(ctx, 'light_02', FIRE, x, y - 20, 220 * spread, 120 * spread, 0.45 * alpha);
}
function phoenixChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, body = { x: cx, y: cy - 24 - 24 * beat(prog, 0, 0.25) };
  // 0-0.4 s: colossal wings of fire spread as it soars 24 px; molten feathers fall and scorch the ground
  const tuck = beat(prog, 0.33, 0.55);
  fireWings(ctx, body.x, body.y, eOut(beat(prog, 0, 0.3)) * (1 - tuck), 1, t);
  if (prog < 0.45 && Math.random() < 0.5) VFX.emit({ x: body.x + VFX.rnd(-90, 90), y: body.y + VFX.rnd(-30, 10), vx: VFX.rnd(-20, 20), vy: VFX.rnd(40, 90), ay: 120, tex: 'flare_01', rgb: FIRE, s0: 10, s1: 4, a0: 1, life: 0.6, vr: VFX.rnd(-4, 4) });
  if (prog >= 0.2 && once(st, 'scorch')) for (let i = 0; i < 3; i++) addDecal('scorch', cx + VFX.rnd(-40, 40), cy + 14 + VFX.rnd(-6, 6), 0.6, 3);
  // 0.4-0.9 s: it becomes a miniature sun; heatwaves roll across the board; the light turns amber
  const sun = beat(prog, 0.33, 0.6), crit = beat(prog, 0.75, 1);
  tint(ctx, size, FIRE, 0.14 * sun, 'lighter');
  if (sun > 0) {
    const r = (24 + 26 * sun) * (1 + 0.12 * crit * Math.sin(t * 30));
    VFX.sprite(ctx, 'light_02', FIRE, body.x, body.y, r * 6, r * 6, 0.7 * sun);
    VFX.sprite(ctx, 'flare_01', FIRE_HOT, body.x, body.y, r * 3, r * 3, sun, t * 2);
    VFX.sprite(ctx, 'star_07', '255, 255, 255', body.x, body.y, r * 1.4, r * 1.4, sun, -t * 3);
    const ph = (t * 1.6) % 1; shockRing(ctx, body.x, cy + 10, 40 + 420 * ph, FIRE, 0.35 * sun * (1 - ph), 1.5);   // heat waves
  }
  // 0.9-1.2 s: solar flares lash out and every ember is pulled into the orb
  if (crit > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.26, r = 40; ctx.strokeStyle = `rgba(${FIRE_HOT}, ${0.7 * crit})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(body.x + Math.cos(a) * r, body.y + Math.sin(a) * r * 0.8, 16 + 8 * Math.sin(t * 9 + i), a, a + 2.4); ctx.stroke(); }
    ctx.restore();
    if (Math.random() < 0.9) { const a = VFX.rnd(0, Math.PI * 2), d = VFX.rnd(110, 180); VFX.emit({ x: body.x + Math.cos(a) * d, y: body.y + Math.sin(a) * d * 0.6, vx: -Math.cos(a) * d * 2.8, vy: -Math.sin(a) * d * 1.7, drag: 1, tex: 'spark_01', rgb: FIRE, s0: 8, s1: 3, a0: 1, life: 0.35, stretch: 0.05 }); }
  }
}
function phoenixRelease(ctx, f, size, st) {
  const t = sinceRelease(f), o = at(f.x, f.y, size), body = { x: o.x, y: o.y - 48 }, now = S.battle.time;
  // 1.2-1.25 s: the sun detonates in a supernova
  if (once(st, 'nova')) { VFX.burst('medium', body.x, body.y, FIRE, FIRE_HOT); addTrauma(0.75, 1); }
  for (let k = 0; k < 2; k++) { const w = beat(t, k * 0.08, 0.5 + k * 0.08); if (w > 0) shockRing(ctx, body.x, o.y + 10, 40 + 640 * eOut(w), k ? FIRE_RED : FIRE_HOT, (k ? 0.35 : 0.7) * (1 - w), 3); }
  tint(ctx, size, FIRE, 0.2 * (1 - beat(t, 0.05, 0.6)), 'lighter');
  // 1.25-1.6 s: solar pillars shoot up from all 16 tiles at once
  for (let i = 0; i < 16; i++) { const k = beat(t, 0.04 + (i % 4) * 0.02, 0.2 + (i % 4) * 0.02), p = tileC(i, size); if (k > 0) lightPillar(ctx, p.x, p.y + 6, 60 * eOut(k), 16, FIRE, 0.9 * (1 - beat(t, 0.5, 1))); }
  // 2.2-3.0 s: the phoenix unfurls from the ashes and hovers over the burning arena
  fireWings(ctx, body.x, body.y, eOut(beat(t, 0.9, 1.4)), 1 - beat(t, 1.4, 1.6), now);
}
// The pyre lasts 5 s (b.phoenixFlames): flames on every tile, rising ash, runners trailing fire.
function phoenixPyre(ctx, size) {
  const now = S.battle.time;
  for (const z of S.battle.phoenixFlames || []) {
    if (now < z.start || now > z.start + z.dur) continue;
    const a = Math.min(1, (now - z.start) / 0.2) * Math.min(1, (z.start + z.dur - now) / 0.6);
    for (let i = 0; i < 16; i++) { const p = tileC(i, size), fl = 0.75 + 0.25 * Math.sin(now * 13 + i * 2.3); VFX.sprite(ctx, 'flare_01', FIRE, p.x + Math.sin(now * 7 + i) * 3, p.y - 6, 30 * fl, 42 * fl, 0.55 * a); VFX.sprite(ctx, 'light_02', FIRE_RED, p.x, p.y + 6, 70, 28, 0.35 * a); }
    if (Math.random() < 0.8 * a) { const p = tileC(Math.random() * 16, size); VFX.emit({ x: p.x + VFX.rnd(-12, 12), y: p.y - 10, vx: VFX.rnd(-10, 10), vy: VFX.rnd(-60, -30), tex: 'spark_01', rgb: Math.random() < 0.5 ? FIRE : FIRE_HOT, s0: 5, s1: 2, a0: 1, life: 0.9 }); }
    for (const e of live()) if (Math.random() < 0.35 * a) { const p = trackPoint(visualTrackP(e), size); VFX.emit({ x: p.x + VFX.rnd(-6, 6), y: p.y - 16, vx: VFX.rnd(-15, 15), vy: VFX.rnd(-50, -20), tex: 'flare_01', rgb: FIRE, s0: 10, s1: 3, a0: 0.9, life: 0.45 }); }
  }
}

// ---------- Great Sage Equal to Heaven · Pillar of Heaven Cudgel ----------
const SAGE_GOLD = '250, 204, 21';
// The Ruyi Jingu Bang from (x0, y0) to (x1, y1), w px thick: red-lacquered ends, gold shaft, burning inscription.
function cudgel(ctx, x0, y0, x1, y1, w, alpha, glow = 0) {
  const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
  if (alpha <= 0.01 || len < 2) return;
  if (glow > 0) VFX.sprite(ctx, 'light_02', SAGE_GOLD, (x0 + x1) / 2, (y0 + y1) / 2, len * 1.2, w * 4, 0.5 * glow * alpha, ang);
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x0, y0); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -w / 2, 0, w / 2); g.addColorStop(0, '#fde68a'); g.addColorStop(0.45, '#ca8a04'); g.addColorStop(1, '#713f12');
  ctx.fillStyle = g; ctx.fillRect(0, -w / 2, len, w);
  const cap = Math.min(len * 0.12, w * 1.6), rg = ctx.createLinearGradient(0, -w / 2, 0, w / 2); rg.addColorStop(0, '#fca5a5'); rg.addColorStop(0.5, '#b91c1c'); rg.addColorStop(1, '#450a0a');
  ctx.fillStyle = rg; ctx.fillRect(0, -w / 2 - 1, cap, w + 2); ctx.fillRect(len - cap, -w / 2 - 1, cap, w + 2);
  if (w > 12 && len > 120) {                                              // the inscription burns along the shaft
    ctx.font = `700 ${Math.round(w * 0.55)}px "Noto Serif SC", "SimSun", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(254, 240, 138, ${0.6 + 0.4 * glow})`;
    ctx.fillText('如意金箍棒 · 一萬三千五百斤', len / 2, 1, len - cap * 2.4);
  }
  ctx.restore();
}
function somersaultCloud(ctx, x, y, a, t) { if (a <= 0) return; for (let i = 0; i < 5; i++) VFX.sprite(ctx, 'smoke_05', '254, 243, 199', x + (i - 2) * 16 + Math.sin(t * 3 + i) * 3, y + Math.sin(i * 1.7) * 4, 46, 26, 0.6 * a, t + i, 'source-over'); VFX.sprite(ctx, 'twirl_02', SAGE_GOLD, x, y, 100, 34, 0.5 * a, t * 4); }
// The square canvas is cropped top and bottom on widescreen, so the raised cudgel stays below y = 190.
function quadrantEnds(q, size, lift = 0) { const a = trackPoint(q * 4 + 0.05, size), b = trackPoint(q * 4 + 3.95, size), l = Math.max(0, Math.min(lift, Math.min(a.y, b.y) - 190)); return [{ x: a.x, y: a.y - l }, { x: b.x, y: b.y - l }]; }
function sageChannel(ctx, cx, cy, prog, size, st) {
  const t = S.battle.time, q = (st.q ??= densestQuadrant()), hover = { x: cx, y: cy - 30 - 24 * beat(prog, 0, 0.2) };
  // 0-0.4 s: he leaps onto the Somersault Cloud and twirls the needle-sized cudgel out of his ear, throwing sparks
  somersaultCloud(ctx, hover.x, hover.y + 34, beat(prog, 0, 0.2), t);
  const grow = beat(prog, 0.33, 0.75), aim = eOut(beat(prog, 0.75, 1));
  const len = 20 + 60 * beat(grow, 0, 0.4) + 220 * eIn(beat(grow, 0.4, 1)), w = 4 + 36 * eIn(grow), spin = t * (14 - 9 * grow);
  if (aim <= 0) {
    const dx = Math.cos(spin) * len / 2, dy = Math.sin(spin) * len / 2 * 0.5;
    cudgel(ctx, hover.x - dx, hover.y - 30 - dy, hover.x + dx, hover.y - 30 + dy, w, 1, grow);
    if (Math.random() < 0.6) VFX.emit({ x: hover.x + dx, y: hover.y - 30 + dy, vx: VFX.rnd(-60, 60), vy: VFX.rnd(-60, 20), tex: 'spark_01', rgb: SAGE_GOLD, s0: 6, s1: 2, a0: 1, life: 0.35 });
  }
  // 0.4-0.9 s: it grows to a 300 px pillar; the light dims and clouds gather around it
  dimFocus(ctx, size, cx, cy, 0.4 * beat(prog, 0.33, 0.6), '12, 10, 4');
  if (grow > 0.4) for (let i = 0; i < 3; i++) VFX.sprite(ctx, 'smoke_05', '68, 64, 60', hover.x + (i - 1) * 110, hover.y - 90, 180, 90, 0.35 * grow, t * 0.3 + i, 'source-over');
  // 0.9-1.2 s: raised high over the densest quadrant — red crosshairs and a falling shadow mark the target
  if (aim > 0) {
    const [a0, a1] = quadrantEnds(q, size, 0), [h0, h1] = quadrantEnds(q, size, 220), mid = trackPoint(q * 4 + 2, size);
    const lerp = (p, r) => ({ x: p.x + (r.x - p.x) * aim, y: p.y + (r.y - p.y) * aim });
    const e0 = lerp({ x: hover.x - 150, y: hover.y - 30 }, h0), e1 = lerp({ x: hover.x + 150, y: hover.y - 30 }, h1);
    ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * aim})`; ctx.beginPath(); ctx.ellipse(mid.x, mid.y + 6, 90 * aim, 26 * aim, Math.atan2(a1.y - a0.y, a1.x - a0.x), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.85 * aim * (0.6 + 0.4 * Math.sin(t * 20))})`; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(a0.x, a0.y + 6); ctx.lineTo(a1.x, a1.y + 6); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mid.x, mid.y + 6, 16, 0, Math.PI * 2); ctx.moveTo(mid.x - 26, mid.y + 6); ctx.lineTo(mid.x + 26, mid.y + 6); ctx.moveTo(mid.x, mid.y - 14); ctx.lineTo(mid.x, mid.y + 26); ctx.stroke(); ctx.restore();
    cudgel(ctx, e0.x, e0.y, e1.x, e1.y, 40, 1, 1);
    if (Math.random() < 0.5) VFX.emit({ x: mid.x + VFX.rnd(-60, 60), y: mid.y - 120, vy: VFX.rnd(160, 260), ay: 500, tex: 'light_02', rgb: '87, 83, 78', blend: 'source-over', s0: 4, s1: 3, a0: 0.9, life: 0.4 });   // falling debris
  }
}
function sageRelease(ctx, f, size, st) {
  const t = sinceRelease(f), sch = f.schedule || {}, q = sch.quadrant ?? 0, imp = sch.impactAt ?? 0.55, o = at(f.x, f.y, size);
  const [g0, g1] = quadrantEnds(q, size, 0), [h0, h1] = quadrantEnds(q, size, 220), mid = trackPoint(q * 4 + 2, size);
  // 1.2-1.25 s: the pillar of heaven comes crashing down onto the quadrant (on the engine's impact beat)
  const fall = eIn(beat(t, imp - 0.15, imp)), shrink = beat(t, imp + 0.45, imp + 0.85);
  const e0 = { x: h0.x + (g0.x - h0.x) * fall, y: h0.y + (g0.y - h0.y) * fall }, e1 = { x: h1.x + (g1.x - h1.x) * fall, y: h1.y + (g1.y - h1.y) * fall };
  const back = (p, k) => ({ x: p.x + (o.x - p.x) * k, y: p.y + (o.y - 40 - p.y) * k });
  // deep rectangular crater along the pulverized quadrant
  const crater = beat(t, imp, imp + 0.1) * (1 - beat(t, imp + 0.8, imp + 1.05));
  if (crater > 0) { ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 28; ctx.strokeStyle = `rgba(20, 16, 10, ${0.45 * crater})`; ctx.beginPath(); ctx.moveTo(g0.x, g0.y + 4); ctx.lineTo(g1.x, g1.y + 4); ctx.stroke(); ctx.restore(); }
  if (shrink < 1) { const s0 = back(e0, shrink), s1 = back(e1, shrink); cudgel(ctx, s0.x, s0.y, s1.x, s1.y, 40 * (1 - 0.9 * shrink), 1, 1 - shrink); }   // 1.6-2.2 s: it zips back to hand size
  // 1.25-1.6 s: the quadrant is pulverized — geysers of stone and gold sparks blast from both sides
  if (t >= imp && once(st, 'slam')) {
    VFX.burst('medium', mid.x, mid.y, SAGE_GOLD, '254, 249, 195'); addTrauma(1, 1);
    for (let k = 0; k < 4; k++) { const p = trackPoint(q * 4 + k + 0.5, size); addDecal('crack', p.x, p.y + 6, 1.4, 4.5);
      for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1; VFX.emit({ x: p.x, y: p.y, vx: side * VFX.rnd(60, 200), vy: VFX.rnd(-380, -160), ay: 1000, tex: 'light_02', rgb: i % 3 ? '120, 98, 60' : SAGE_GOLD, blend: i % 3 ? 'source-over' : 'lighter', s0: VFX.rnd(5, 10), s1: 5, a0: 1, a1: 0.6, life: VFX.rnd(0.6, 1), vr: VFX.rnd(-6, 6) }); } }
    for (const e of live()) if (quadrantOf(e) === q) nudgeEnemy(e.uid, 0, -30, 0.6);   // thrown 30 px into the air
  }
  if (t >= imp) { const k = beat(t, imp, imp + 0.45); shockRing(ctx, mid.x, mid.y, 40 + 360 * eOut(k), '254, 249, 195', 0.9 * (1 - k), 3); }
}

// Effects that outlive their release (5 s pools of toxin and fire), drawn every frame.
export function storyPersistent(ctx, size) { if (S.battle?.xuanwuToxins?.length) xuanwuMire(ctx, size); if (S.battle?.phoenixFlames?.length) phoenixPyre(ctx, size); }

const CHANNEL = { 'azure-dragon': azureChannel, 'white-tiger': tigerChannel, 'xuanwu-toxin': xuanwuChannel, 'phoenix-inferno': phoenixChannel, 'great-sage-staff': sageChannel, 'cult-vajraBody': vajraChannel, 'cult-bodhisattva': bodhiChannel, 'blood-domain': bloodChannel, 'soul-reap-detonation': soulChannel, 'formation-star-river': formationChannel, 'landscape-dragon': landscapeChannel, 'melodic-resonance': melodicChannel };
const RELEASE = { 'azure-wrath': azureRelease, 'tiger-roar': tigerRelease, 'xuanwu-lob': xuanwuRelease, 'phoenix-inferno': phoenixRelease, 'sage-staff': sageRelease, vajraBody: vajraRelease, bodhisattva: bodhiRelease, 'blood-domain': bloodRelease, 'soul-reap-detonation': soulRelease, 'formation-star-river': formationRelease, 'landscape-dragon': landscapeRelease, 'melodic-resonance': melodicRelease };
export const STORYBOARDED = new Set(Object.keys(CHANNEL));

// Called after the base channel drawer; `u.channeling` is new for every channel, so its one-shots reset each time.
export function storyChannel(ctx, type, cx, cy, prog, size, u) { const fn = CHANNEL[type]; if (fn) fn(ctx, cx, cy, prog, size, (u.channeling._story ??= {})); }
// Called after the base release drawer.
export function storyRelease(ctx, f, size) { const fn = RELEASE[f.type === 'ult-burst' ? f.ult : f.type]; if (fn) fn(ctx, f, size, (f._story ??= {})); }
// Ultimates whose whole release is storyboarded here (the generic ult-burst drawer stands aside).
export const storyOwnsUlt = id => id === 'vajraBody' || id === 'bodhisattva';
