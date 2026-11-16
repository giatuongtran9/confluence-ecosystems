// Storyboard layer for the Cultivation Mythics' channel (0-1.2 s) and 10th attack (release 1.2-1.6 s, aftermath to 3.0 s).
// It draws the beats the base drawers lack, on top of them: Blood-Fiend Sword Master, Soul-Reaping Heavenly Demon,
// Formation Master, Landscape Sage and Melodic Saint. Channel beats read the channel progress (0..1 over 1.2 s);
// release beats read seconds since release. One-shot moments (impacts, eruptions) fire once per channel / effect.
import { routePoint } from '../battlefield.js';
import { addTrauma } from '../feedback.js';
import { S } from '../state.js';
import { VFX } from '../vfx.js';
import { additiveGlow, hash01 } from './core.js';
import { addDecal } from './environment.js';
import { drawGoStoneDisc, drawStarPoint, ringTile, trackPoint, visualTrackP } from './formation-ink.js';
import { guqinStrings } from './sword-music.js';

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

const CHANNEL = { 'blood-domain': bloodChannel, 'soul-reap-detonation': soulChannel, 'formation-star-river': formationChannel, 'landscape-dragon': landscapeChannel, 'melodic-resonance': melodicChannel };
const RELEASE = { 'blood-domain': bloodRelease, 'soul-reap-detonation': soulRelease, 'formation-star-river': formationRelease, 'landscape-dragon': landscapeRelease, 'melodic-resonance': melodicRelease };
export const STORYBOARDED = new Set(Object.keys(CHANNEL));

// Called after the base channel drawer; `u.channeling` is new for every channel, so its one-shots reset each time.
export function storyChannel(ctx, type, cx, cy, prog, size, u) { const fn = CHANNEL[type]; if (fn) fn(ctx, cx, cy, prog, size, (u.channeling._story ??= {})); }
// Called after the base release drawer.
export function storyRelease(ctx, f, size) { const fn = RELEASE[f.type]; if (fn) fn(ctx, f, size, (f._story ??= {})); }
