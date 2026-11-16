import { routePoint } from '../battlefield.js';
import { additiveGlow, burstImpact, dimFocus, drawBezierProjectile, emitParticle, hash01, vfxPaletteFor } from './core.js';
import { drawBolt, drawClawMarks, fxProg, fxTime, onceEach, softPuff, tilePx } from './elements.js';
import { DECALS, addDecal, drawEnvironment, smoke, vfxShake } from './environment.js';
import { channelLabel, visualTrackP } from './formation-ink.js';
import { Game } from '../lib.js';
import { S } from '../state.js';

// ─── Mythic VFX: Haunted (Order + Chaos), PostApoc, Sci-Fi, Cyberpunk, Dark Fantasy, Cosmic Horror ───
// Each Mythic has a recipe: its own normal attack, channel, 10th-ability shape, weather and ground scars.
// Realism comes from the beats every effect follows: anticipation (light gathers, weather rolls in),
// staggered impacts that travel outward from the caster, and aftermath (smoke, debris, decals that fade).
export const RD_ULTS = {
  // Cultivation · Body and Monk paths
  vajraBody:         { rgb: '250, 204, 21', hot: '254, 249, 195', env: 'golden', atk: 'punch', ch: 'charge', shape: 'cleave', decal: 'crack', glyph: '✊' },
  bodhisattva:       { rgb: '253, 230, 138', hot: '255, 251, 235', env: 'golden', atk: 'spear', ch: 'sigil', shape: 'nova', decal: 'gold', glyph: '☸' },
  // Haunted A · Order
  ruleArchitect:     { rgb: '241, 198, 110', hot: '255, 247, 214', env: 'lights', atk: 'stamp', ch: 'sigil', shape: 'marks', decal: 'gold', glyph: '§' },
  allSeeingOverseer: { rgb: '186, 230, 253', hot: '240, 249, 255', env: 'lights', atk: 'beam', ch: 'eye', shape: 'nova', prop: 'eye', decal: 'frost', glyph: '◉' },
  curfewDirector:    { rgb: '241, 198, 110', hot: '255, 247, 214', env: 'lights', atk: 'stamp', ch: 'clock', shape: 'walls', decal: 'gold', glyph: '‖' },
  forensicDemiurge:  { rgb: '94, 234, 212', hot: '204, 251, 241', env: 'lights', atk: 'spear', ch: 'sigil', shape: 'marks', decal: 'toxic', glyph: '✚' },
  backroomsWarden:   { rgb: '234, 210, 120', hot: '254, 249, 195', env: 'yellow', atk: 'stamp', ch: 'pillar', shape: 'sweep', decal: 'crack', glyph: '▤' },
  // Haunted B · Chaos
  slitMouthedSovereign: { rgb: '220, 38, 38', hot: '254, 202, 202', env: 'blood', atk: 'slash', ch: 'vortex', shape: 'marks', decal: 'blood', glyph: '✂' },
  terminusBus:       { rgb: '253, 224, 71', hot: '255, 251, 235', env: 'gloom', atk: 'bus', ch: 'pillar', shape: 'sweep', decal: 'scorch', glyph: '⛟' },
  midnightOperator:  { rgb: '129, 140, 248', hot: '224, 231, 255', env: 'gloom', atk: 'bolt', ch: 'charge', shape: 'nova', decal: 'crack', glyph: '☏' },
  mirrorQueen:       { rgb: '226, 232, 240', hot: '255, 255, 255', env: 'gloom', atk: 'shards', ch: 'glass', shape: 'nova', decal: 'frost', glyph: '◇' },
  livingTaboo:       { rgb: '190, 24, 93', hot: '251, 207, 232', env: 'void', atk: 'tendril', ch: 'vortex', shape: 'marks', decal: 'void', glyph: '✖' },
  crimsonHarbinger:  { rgb: '185, 28, 28', hot: '254, 226, 226', env: 'blood', atk: 'slash', ch: 'pool', shape: 'rain', decal: 'blood', glyph: '☂' },
  penroseLabyrinth:  { rgb: '217, 138, 112', hot: '255, 237, 213', env: 'gloom', atk: 'stamp', ch: 'sigil', shape: 'drain', decal: 'crack', glyph: '⌇' },
  // PostApoc · Scrapwork Titans
  berserkerColossus: { rgb: '251, 146, 60', hot: '255, 237, 213', env: 'fire', atk: 'slash', ch: 'charge', shape: 'cleave', decal: 'crack', glyph: '⚔' },
  siegeDreadnought:  { rgb: '250, 204, 21', hot: '254, 249, 195', env: 'fire', atk: 'shell', ch: 'pillar', shape: 'rain', decal: 'scorch', glyph: '✹' },
  vanguardJuggernaut:{ rgb: '234, 88, 12', hot: '254, 215, 170', env: 'fire', atk: 'shell', ch: 'charge', shape: 'walls', decal: 'scorch', glyph: '♨' },
  // Sci-Fi · Xeno Lab
  impalerApex:       { rgb: '250, 245, 230', hot: '255, 255, 255', env: 'acid', atk: 'spear', ch: 'charge', shape: 'sweep', decal: 'crack', glyph: '➶' },
  xenoQueen:         { rgb: '163, 230, 53', hot: '236, 252, 203', env: 'acid', atk: 'lob', ch: 'pool', shape: 'walls', decal: 'acid', glyph: '☣' },
  hiveOvermind:      { rgb: '192, 132, 252', hot: '243, 232, 255', env: 'void', atk: 'beam', ch: 'charge', shape: 'nova', decal: 'void', glyph: '✺' },
  causticRavager:    { rgb: '132, 204, 22', hot: '236, 252, 203', env: 'acid', atk: 'lob', ch: 'charge', shape: 'rain', decal: 'acid', glyph: '☣' },
  phaseStalker:      { rgb: '129, 140, 248', hot: '238, 242, 255', env: 'void', atk: 'slash', ch: 'glass', shape: 'strike', decal: 'void', glyph: '✕' },
  metroidLeviathan:  { rgb: '244, 114, 182', hot: '253, 242, 248', env: 'void', atk: 'drain', ch: 'vortex', shape: 'drain', decal: 'acid', glyph: '◌' },
  // Cyberpunk · Ripperdoc Matrix
  chronoPhantom:     { rgb: '0, 240, 255', hot: '236, 254, 255', env: 'neon', atk: 'slash', ch: 'clock', shape: 'nova', prop: 'clock', decal: 'frost', glyph: '◷', tint: '125, 211, 252' },
  thermalRipper:     { rgb: '249, 115, 22', hot: '255, 237, 213', env: 'fire', atk: 'slash', ch: 'charge', shape: 'walls', decal: 'slag', glyph: '♨' },
  gravitonColossus:  { rgb: '129, 140, 248', hot: '238, 242, 255', env: 'void', atk: 'punch', ch: 'vortex', shape: 'drain', decal: 'crack', glyph: '◎' },
  juggernautSmasher: { rgb: '255, 42, 109', hot: '255, 228, 230', env: 'neon', atk: 'punch', ch: 'charge', shape: 'strike', decal: 'crack', glyph: '✊' },
  razorPhantom:      { rgb: '0, 240, 255', hot: '236, 254, 255', env: 'neon', atk: 'whip', ch: 'glass', shape: 'sweep', decal: 'plasma', glyph: '⟋' },
  plasmaTempest:     { rgb: '99, 211, 240', hot: '236, 254, 255', env: 'neon', atk: 'whip', ch: 'charge', shape: 'walls', decal: 'plasma', glyph: 'ϟ' },
  // Dark Fantasy · Eclipse Hunt
  dragonSlayer:      { rgb: '220, 38, 38', hot: '254, 215, 170', env: 'fire', atk: 'slash', ch: 'pillar', shape: 'cleave', decal: 'crack', glyph: '⚔' },
  witcherGrandmaster:{ rgb: '251, 146, 60', hot: '255, 247, 237', env: 'moon', atk: 'slash', ch: 'sigil', shape: 'nova', decal: 'scorch', glyph: '✧' },
  bloodDrunkHunter:  { rgb: '220, 38, 38', hot: '254, 202, 202', env: 'blood', atk: 'slash', ch: 'pool', shape: 'marks', prop: 'moon', decal: 'blood', glyph: '☾' },
  lycanLord:         { rgb: '226, 232, 240', hot: '255, 255, 255', env: 'moon', atk: 'claw', ch: 'vortex', shape: 'nova', prop: 'moon', decal: 'blood', glyph: '☾' },
  gallowsHeadsman:   { rgb: '168, 162, 158', hot: '245, 245, 244', env: 'gloom', atk: 'slash', ch: 'pillar', shape: 'marks', decal: 'blood', glyph: '†' },
  // Cosmic Horror · Forbidden Texts
  cthulhu:           { rgb: '45, 212, 191', hot: '204, 251, 241', env: 'deep', atk: 'tendril', ch: 'pool', shape: 'sweep', decal: 'toxic', glyph: '≋' },
  yogSothoth:        { rgb: '167, 139, 250', hot: '245, 243, 255', env: 'void', atk: 'spear', ch: 'sigil', shape: 'nova', prop: 'gate', decal: 'void', glyph: '◯' },
  shubNiggurath:     { rgb: '74, 222, 128', hot: '220, 252, 231', env: 'acid', atk: 'tendril', ch: 'pool', shape: 'marks', decal: 'toxic', glyph: 'Ψ' },
  kingInYellow:      { rgb: '250, 204, 21', hot: '254, 249, 195', env: 'yellow', atk: 'tendril', ch: 'sigil', shape: 'marks', prop: 'sign', decal: 'gold', glyph: '✶' },
  elderBrain:        { rgb: '244, 114, 182', hot: '253, 242, 248', env: 'void', atk: 'drain', ch: 'eye', shape: 'drain', decal: 'void', glyph: '❂' },
  azathoth:          { rgb: '233, 213, 255', hot: '255, 255, 255', env: 'void', atk: 'bolt', ch: 'vortex', shape: 'nova', decal: 'void', glyph: '✹', chaos: true },
};
const RD_CHANNEL = /^(order|xeno|cyber|hunt|cosmic|chaos|cult)-(.+)$/;
const RD_CHANNEL_ALIAS = { 'berserker-cleave': 'berserkerColossus', 'siege-bombardment': 'siegeDreadnought', 'juggernaut-hellfire': 'vanguardJuggernaut' };
export const rdChannelId = type => RD_CHANNEL_ALIAS[type] || RD_CHANNEL.exec(type || '')?.[2] || null;
export const rdStyle = id => RD_ULTS[id] || { rgb: '226, 232, 240', hot: '255, 255, 255', atk: 'beam', ch: 'charge', shape: 'nova', glyph: '✦' };
const ULT_NAMES = Object.assign({ berserkerColossus: 'Colossus Cleave', siegeDreadnought: 'Siege Bombardment', vanguardJuggernaut: 'Hellfire Barrage' }, Game.CULT_ULTS, Game.CHAOS_ULTS, Game.ORDER_ULTS, Game.XENO_ULTS, Game.CYBER_ULTS, Game.HUNT_ULTS, Game.COSMIC_ULTS);
const rgbaOf = (rgb, a) => `rgba(${rgb}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const rdNow = () => performance.now() / 1000;
const rdRunnerPt = (e, size) => { const p = Game.track(visualTrackP(e)); return routePoint(p.x, p.y, size); };
const rdTilePt = (i, size) => { const p = Game.track(i + 0.5); return routePoint(p.x, p.y, size); };
const rdLive = () => S.battle.enemies.filter(e => !e.gone && e.hp > 0);
const rdWallOf = e => Math.floor(((visualTrackP(e) % 16) + 16) % 16 / 4);
const ease = t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
function rdGlyph(ctx, ch, x, y, px, rgb, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.font = `800 ${px}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(6, 8, 12, 0.85)'; ctx.lineWidth = 3; ctx.strokeText(ch, x, y); ctx.fillStyle = `rgb(${rgb})`; ctx.fillText(ch, x, y); ctx.restore();
}
function rdBanner(ctx, size, text, rgb, alpha) {
  if (alpha <= 0 || !text) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.font = '900 22px Georgia, serif'; ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 56, y = 56, g = ctx.createLinearGradient(size / 2 - w / 2, 0, size / 2 + w / 2, 0);
  g.addColorStop(0, 'rgba(6, 8, 12, 0)'); g.addColorStop(0.2, 'rgba(6, 8, 12, 0.8)'); g.addColorStop(0.8, 'rgba(6, 8, 12, 0.8)'); g.addColorStop(1, 'rgba(6, 8, 12, 0)');
  ctx.fillStyle = g; ctx.fillRect(size / 2 - w / 2, y - 24, w, 36);
  ctx.fillStyle = rgbaOf(rgb, 0.9); ctx.fillRect(size / 2 - w * 0.32, y + 9, w * 0.64, 2);
  ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 14; ctx.fillStyle = `rgb(${rgb})`; ctx.fillText(text, size / 2, y); ctx.restore();
}
// Light-emitting tapered stroke: wide soft glow, then a bright core.
function rdLight(ctx, pts, rgb, hot, width, alpha) {
  if (pts.length < 2 || alpha <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  for (const [w, a, c] of [[width * 3, 0.18, rgb], [width * 1.6, 0.45, rgb], [width * 0.55, 0.95, hot]]) {
    ctx.strokeStyle = rgbaOf(c, a * alpha); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (const p of pts) ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.restore();
}
function rdDebris(x, y, rgb, n = 8, power = 1) {
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + Math.random() * 0.8), v = (80 + Math.random() * 160) * power; emitParticle(0, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.3 + Math.random() * 0.35, 1.2 + Math.random() * 1.8, Math.random() < 0.35 ? '#ffffff' : `rgb(${rgb})`); }
}
// Ground scars the redesign adds to the decal pass.
export function rdDecal(ctx, d, a, age) {
  const s = d.s, x = d.x, y = d.y, seed = d.seed;
  if (d.kind === 'blood') {
    ctx.fillStyle = `rgba(110, 10, 14, ${0.7 * a})`;
    for (let k = 0; k < 7; k++) { const ang = hash01(seed + k) * 6.28, r = hash01(seed + k * 2) * 16 * s; ctx.beginPath(); ctx.ellipse(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.4, (3 + hash01(seed + k * 3) * 7) * s, (1.5 + hash01(seed + k * 5) * 3) * s, ang, 0, Math.PI * 2); ctx.fill(); }
  } else if (d.kind === 'acid') {
    ctx.fillStyle = `rgba(54, 83, 20, ${0.55 * a})`; ctx.beginPath(); ctx.ellipse(x, y, 26 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) { const ph = (age * 1.4 + hash01(seed + k)) % 1; ctx.strokeStyle = `rgba(190, 242, 100, ${0.6 * a * (1 - ph)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + (hash01(seed + k * 7) - 0.5) * 30 * s, y - ph * 6, 2 + ph * 3, 0, Math.PI * 2); ctx.stroke(); }
  } else if (d.kind === 'slag' || d.kind === 'plasma') {
    const hot = d.kind === 'slag' ? '249, 115, 22' : '99, 211, 240', cool = Math.max(0, 1 - age / d.life);
    ctx.fillStyle = `rgba(20, 14, 10, ${0.55 * a})`; ctx.beginPath(); ctx.ellipse(x, y, 24 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgbaOf(hot, 0.85 * a * cool); ctx.lineWidth = 1.6;
    for (let k = 0; k < 5; k++) { let ang = hash01(seed + k) * 6.28, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 3; j++) { ang += hash01(seed + k * 4 + j) - 0.5; px += Math.cos(ang) * 8 * s; py += Math.sin(ang) * 3 * s; ctx.lineTo(px, py); } ctx.stroke(); }
  } else if (d.kind === 'void') {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 24 * s); g.addColorStop(0, `rgba(10, 4, 24, ${0.85 * a})`); g.addColorStop(0.7, `rgba(76, 29, 149, ${0.35 * a})`); g.addColorStop(1, 'rgba(76, 29, 149, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 24 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
}
// Weather for the redesign genres; existing kinds (storm, fire, toxic, frost, steam…) come from drawEnvironment.
function rdEnvironment(ctx, size, kind, a) {
  if (!kind || a <= 0) return;
  const time = S.battle.time;
  if (kind === 'acid') return drawEnvironment(ctx, size, 'toxic', a);
  if (!['lights', 'blood', 'void', 'neon', 'gloom', 'moon', 'deep', 'yellow'].includes(kind)) return drawEnvironment(ctx, size, kind, a);
  ctx.save();
  if (kind === 'lights') {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255, 250, 235, ${0.14 * a})`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4; i++) { const x = size * (0.18 + i * 0.22) + Math.sin(time * 0.6 + i) * 30, g = ctx.createLinearGradient(x, 0, x, size); g.addColorStop(0, `rgba(255, 250, 235, ${0.2 * a})`); g.addColorStop(1, 'rgba(255, 250, 235, 0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 10, 0); ctx.lineTo(x + 10, 0); ctx.lineTo(x + 90, size); ctx.lineTo(x - 90, size); ctx.fill(); }
  } else if (kind === 'blood') {
    ctx.fillStyle = `rgba(60, 4, 8, ${0.45 * a})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.5 * a})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) { const x = (hash01(i) * (size + 60) + time * 40) % (size + 60) - 30, y = (hash01(i * 3.7) * size + time * 520) % size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke(); }
  } else if (kind === 'void' || kind === 'deep') {
    const tone = kind === 'void' ? '12, 4, 30' : '2, 22, 30', star = kind === 'void' ? '196, 181, 253' : '94, 234, 212';
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.15, size / 2, size / 2, size * 0.75); g.addColorStop(0, rgbaOf(tone, 0.3 * a)); g.addColorStop(1, rgbaOf(tone, 0.75 * a));
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const tw = 0.5 + 0.5 * Math.sin(time * 3 + i * 1.7); ctx.fillStyle = rgbaOf(star, 0.5 * a * tw); ctx.beginPath(); ctx.arc(hash01(i * 4.1) * size, (hash01(i * 7.3) * size + (kind === 'deep' ? time * 12 : 0)) % size, 1 + hash01(i) * 1.2, 0, Math.PI * 2); ctx.fill(); }
    if (kind === 'deep') for (let i = 0; i < 6; i++) { ctx.strokeStyle = rgbaOf('94, 234, 212', 0.12 * a); ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= size; x += 20) ctx.lineTo(x, size * (0.15 + i * 0.15) + Math.sin(x / 60 + time * 1.5 + i) * 10); ctx.stroke(); }
  } else if (kind === 'neon') {
    ctx.fillStyle = `rgba(2, 6, 23, ${0.5 * a})`; ctx.fillRect(0, 0, size, size); ctx.globalCompositeOperation = 'lighter';
    for (let y = (time * 60) % 6; y < size; y += 6) { ctx.fillStyle = `rgba(0, 240, 255, ${0.025 * a})`; ctx.fillRect(0, y, size, 1); }
    if (hash01(Math.floor(time * 12)) > 0.7) { const y = hash01(Math.floor(time * 12) * 3.3) * size; ctx.fillStyle = `rgba(255, 42, 109, ${0.18 * a})`; ctx.fillRect(0, y, size, 6 + hash01(time) * 14); }
  } else if (kind === 'gloom') {
    ctx.fillStyle = `rgba(8, 6, 12, ${0.52 * a})`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6; i++) softPuff(ctx, (hash01(i) * size + time * 18) % (size + 160) - 80, size * (0.55 + hash01(i * 3) * 0.45), 140, '30, 27, 38', 0.35 * a);
  } else if (kind === 'moon') {
    ctx.fillStyle = `rgba(10, 18, 40, ${0.48 * a})`; ctx.fillRect(0, 0, size, size); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(size * 0.78, 90, 10, size * 0.78, 90, size * 0.6); g.addColorStop(0, `rgba(226, 232, 240, ${0.25 * a})`); g.addColorStop(1, 'rgba(226, 232, 240, 0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  } else if (kind === 'yellow') {
    ctx.fillStyle = `rgba(66, 52, 6, ${0.4 * a})`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 5; i++) softPuff(ctx, (hash01(i * 2) * size + time * 22) % (size + 160) - 80, hash01(i * 5) * size, 130, '161, 128, 22', 0.18 * a);
  }
  ctx.restore();
}
// Props: the big set pieces some abilities summon above the board.
function rdProp(ctx, size, prop, rgb, a, prog) {
  if (!prop || a <= 0) return;
  const t = rdNow(), cx = size / 2, cy = 118;
  ctx.save(); ctx.globalAlpha = Math.min(1, a);
  if (prop === 'moon') {
    additiveGlow(ctx, cx, cy, 110, rgb, 0.55); const g = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 38); g.addColorStop(0, '#ffffff'); g.addColorStop(1, `rgb(${rgb})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(100, 116, 139, 0.35)'; for (const [dx, dy, r] of [[-10, -6, 7], [9, 8, 5], [12, -12, 4]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill(); }
  } else if (prop === 'eye') {
    const open = ease(prog * 3) * (1 - Math.max(0, prog - 0.8) * 5);
    ctx.fillStyle = 'rgba(6, 8, 12, 0.85)'; ctx.beginPath(); ctx.ellipse(cx, cy, 120, 48 * open + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 120, 48 * open + 2, 0, 0, Math.PI * 2); ctx.clip();
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 42); g.addColorStop(0, '#0b0b10'); g.addColorStop(0.3, '#0b0b10'); g.addColorStop(0.35, `rgb(${rgb})`); g.addColorStop(1, 'rgba(6, 8, 12, 0.9)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + Math.sin(t * 1.3) * 18, cy, 42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, 120, 48 * open + 2, 0, 0, Math.PI * 2); ctx.stroke(); additiveGlow(ctx, cx, cy, 140, rgb, 0.35 * open);
  } else if (prop === 'clock') {
    ctx.strokeStyle = rgbaOf(rgb, 0.85); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy + 180, 150, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 12; i++) { const ang = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 138, cy + 180 + Math.sin(ang) * 138); ctx.lineTo(cx + Math.cos(ang) * 150, cy + 180 + Math.sin(ang) * 150); ctx.stroke(); }
    const stop = prog > 0.25 ? 0.25 : prog; for (const [len, sp] of [[120, 9], [80, 1.2]]) { const ang = -Math.PI / 2 + stop * sp * 6.28; ctx.lineWidth = len > 100 ? 2 : 5; ctx.beginPath(); ctx.moveTo(cx, cy + 180); ctx.lineTo(cx + Math.cos(ang) * len, cy + 180 + Math.sin(ang) * len); ctx.stroke(); }
    additiveGlow(ctx, cx, cy + 180, 160, rgb, 0.25);
  } else if (prop === 'sign') {
    ctx.translate(cx, cy + 30); ctx.rotate(t * 0.4); ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 5; ctx.lineCap = 'round'; additiveGlow(ctx, 0, 0, 110, rgb, 0.45);
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -20, 18, -62); ctx.stroke(); ctx.beginPath(); ctx.arc(18, -66, 6, 0, Math.PI * 2); ctx.stroke(); }
  } else if (prop === 'gate') {
    for (let i = 0; i < 9; i++) { const ang = i * Math.PI * 2 / 9 + t * 0.5, r = 70 + 50 * prog, x = cx + Math.cos(ang) * r * 1.6, y = cy + 40 + Math.sin(ang) * r * 0.6, g = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, 18); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, `rgb(${rgb})`); g.addColorStop(1, 'rgba(76, 29, 149, 0.6)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); additiveGlow(ctx, x, y, 34, rgb, 0.5); }
  }
  ctx.restore();
}

// ── Normal attacks ──
export const RD_ATTACK_TYPES = ['shot', 'spell', 'slash', 'beam'];
export function drawMythicAttack(ctx, f, s, x, y, tx, ty, prog) {
  const ang = Math.atan2(ty - y, tx - x), d = Math.hypot(tx - x, ty - y) || 1, t = rdNow(), seed = (f.uid || 1) * 7.1 + (f.maxTtl || 0);
  const land = (k = 0.55) => { if (prog >= k) onceEach(f, 'land', () => { rdDebris(tx, ty, s.rgb, f.crit ? 14 : 7, f.crit ? 1.2 : 0.8); if (s.decal) addDecal(s.decal, tx, ty + 8, 0.55, 1.8); if (f.crit) vfxShake(2.5); }); };
  const fade = Math.min(1, (1 - prog) * 3.5);
  switch (s.atk) {
    case 'slash': { // crescent with motion blur at the target
      const k = ease(prog / 0.5), r = 26, a0 = ang - 1.9 + 3.8 * Math.max(0, k - 0.25), a1 = ang - 1.9 + 3.8 * k;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = rgbaOf(i ? s.rgb : s.hot, fade * (1 - i * 0.22)); ctx.lineWidth = (8 - i * 1.6) * (f.crit ? 1.4 : 1); ctx.beginPath(); ctx.arc(tx, ty - 12, r + i * 2.5, a0 - i * 0.12, a1 - i * 0.12); ctx.stroke(); }
      ctx.restore(); if (prog > 0.35) additiveGlow(ctx, tx, ty - 12, 30, s.rgb, fade * 0.6); land(0.35); break;
    }
    case 'beam': case 'stamp': { // searchlight / psionic lance
      const reach = ease(prog / 0.25), ex = x + (tx - x) * reach, ey = y + (ty - y) * reach;
      rdLight(ctx, [{ x, y }, { x: ex, y: ey - 10 }], s.rgb, s.hot, s.atk === 'stamp' ? 5 : 7, fade * (0.8 + 0.2 * Math.sin(t * 60)));
      if (s.atk === 'stamp' && prog > 0.4) { const q = ease((prog - 0.4) / 0.3); ctx.save(); ctx.globalAlpha = fade; ctx.translate(tx, ty - 16); ctx.rotate(-0.25); ctx.scale(1.6 - 0.6 * q, 1.6 - 0.6 * q); ctx.strokeStyle = `rgb(${s.rgb})`; ctx.lineWidth = 2.5; ctx.strokeRect(-14, -8, 28, 16); ctx.font = '900 8px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = `rgb(${s.rgb})`; ctx.fillText(s.glyph === '§' ? 'RULE 0' : 'CITED', 0, 3); ctx.restore(); }
      additiveGlow(ctx, ex, ey - 10, 24, s.rgb, fade * 0.8); land(0.3); break;
    }
    case 'bolt': { // jagged arc with branches; it re-strikes a few times
      const flick = Math.floor(prog * 5); if (prog < 0.75) { drawBolt(ctx, x, y, tx, ty - 12, seed + flick, s.rgb, fade, 2.2); if (flick % 2) drawBolt(ctx, tx, ty - 12, tx + (hash01(seed + flick) - 0.5) * 50, ty + 10, seed + flick * 3, s.rgb, fade * 0.6, 1.2); }
      additiveGlow(ctx, tx, ty - 12, 34, s.rgb, fade * 0.7); land(0.15); break;
    }
    case 'whip': { // monowire lash: travelling curve that snaps straight at contact
      const k = ease(prog / 0.4), mx = (x + tx) / 2 + Math.cos(ang + Math.PI / 2) * d * 0.45 * (1 - k), my = (y + ty) / 2 + Math.sin(ang + Math.PI / 2) * d * 0.45 * (1 - k), pts = [];
      for (let i = 0; i <= 16; i++) { const q = i / 16 * k; pts.push({ x: (1 - q) * (1 - q) * x + 2 * (1 - q) * q * mx + q * q * tx, y: (1 - q) * (1 - q) * y + 2 * (1 - q) * q * my + q * q * (ty - 12) }); }
      rdLight(ctx, pts, s.rgb, s.hot, 2.4, fade); additiveGlow(ctx, pts.at(-1).x, pts.at(-1).y, 18, s.hot, fade); land(0.4); break;
    }
    case 'spear': { // fast elongated projectile with a smoke/energy trail
      const k = ease(prog / 0.45), px = x + (tx - x) * k, py = y + (ty - 12 - y) * k, bx = px - Math.cos(ang) * 34, by = py - Math.sin(ang) * 34;
      if (prog < 0.5) { rdLight(ctx, [{ x: bx, y: by }, { x: px, y: py }], s.rgb, s.hot, 4, 1); ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.fillStyle = `rgb(${s.hot})`; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -3); ctx.lineTo(-6, 3); ctx.fill(); ctx.restore(); }
      else { additiveGlow(ctx, tx, ty - 12, 34, s.rgb, fade); } land(0.45); break;
    }
    case 'lob': { // arcing glob, drips, splash
      const k = Math.min(1, prog / 0.55), px = x + (tx - x) * k, py = y + (ty - y) * k - Math.sin(k * Math.PI) * d * 0.35;
      if (k < 1) { const g = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 9); g.addColorStop(0, `rgb(${s.hot})`); g.addColorStop(1, rgbaOf(s.rgb, 0.85)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, 8, 6.5, ang, 0, Math.PI * 2); ctx.fill(); additiveGlow(ctx, px, py, 18, s.rgb, 0.6); }
      else { const q = (prog - 0.55) / 0.45; for (let i = 0; i < 7; i++) { const a2 = -Math.PI * (i + 0.5) / 7; ctx.fillStyle = rgbaOf(s.rgb, 1 - q); ctx.beginPath(); ctx.arc(tx + Math.cos(a2) * 22 * ease(q), ty - 6 + Math.sin(a2) * 18 * ease(q) + q * q * 18, 3 * (1 - q) + 1, 0, Math.PI * 2); ctx.fill(); } }
      land(0.55); break;
    }
    case 'punch': { // no projectile: a gravity/kinetic shockwave lands on the target
      const q = ease(prog), r = 8 + 46 * q;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgbaOf(s.rgb, 1 - q); ctx.lineWidth = 9 * (1 - q) + 1; ctx.beginPath(); ctx.ellipse(tx, ty + 2, r, r * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      if (prog < 0.2) additiveGlow(ctx, tx, ty - 8, 46, s.hot, 1 - prog / 0.2);
      onceEach(f, 'land', () => { burstImpact(tx, ty + 4, 6, 6, 8, 1.2); addDecal('crack', tx, ty + 8, 0.8, 2.5); vfxShake(f.crit ? 4 : 2); }); break;
    }
    case 'tendril': { // writhing tapered tentacle with suckers
      const k = ease(prog / 0.4), pts = [];
      for (let i = 0; i <= 18; i++) { const q = i / 18 * k, wob = Math.sin(q * 9 - t * 10) * 14 * (1 - q) * (1 - Math.max(0, prog - 0.6)); pts.push({ x: x + (tx - x) * q + Math.cos(ang + Math.PI / 2) * wob, y: y + (ty - 12 - y) * q + Math.sin(ang + Math.PI / 2) * wob }); }
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = rgbaOf('6, 8, 12', 0.8 * fade); ctx.lineWidth = 11; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.restore();
      rdLight(ctx, pts, s.rgb, s.hot, 3.2, fade * 0.9); ctx.fillStyle = rgbaOf(s.hot, 0.7 * fade); for (let i = 3; i < pts.length; i += 3) { ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.6, 0, Math.PI * 2); ctx.fill(); } land(0.4); break;
    }
    case 'claw': { drawClawMarks(ctx, tx, ty - 14, 1 + (f.crit ? 0.4 : 0), fade, -0.7, 30 * ease(prog / 0.3)); additiveGlow(ctx, tx, ty - 14, 26, s.rgb, fade * 0.5); land(0.25); break; }
    case 'drain': { // siphon: motes flow from the victim back into the caster
      rdLight(ctx, [{ x: tx, y: ty - 12 }, { x, y }], s.rgb, s.hot, 1.4, fade * 0.7);
      for (let i = 0; i < 6; i++) { const q = (prog * 1.5 + i / 6) % 1; additiveGlow(ctx, tx + (x - tx) * q, ty - 12 + (y - ty + 12) * q + Math.sin(q * 9 + i) * 5, 7, s.hot, fade); }
      land(0.2); break;
    }
    case 'shell': { // artillery tracer, then fireball and smoke
      const k = Math.min(1, prog / 0.5), px = x + (tx - x) * k, py = y + (ty - y) * k - Math.sin(k * Math.PI) * d * 0.5;
      if (k < 1) { rdLight(ctx, [{ x: px - (tx - x) * 0.06, y: py + Math.cos(k * Math.PI) * 10 }, { x: px, y: py }], s.rgb, s.hot, 3, 1); }
      else { const q = (prog - 0.5) / 0.5; additiveGlow(ctx, tx, ty - 8, 50 * (1 - q) + 10, s.rgb, 1 - q); onceEach(f, 'boom', () => { smoke(tx, ty - 4, 5, '41, 37, 36', 1); addDecal('scorch', tx, ty + 8, 0.8, 2.5); rdDebris(tx, ty, s.rgb, 10, 1); vfxShake(2); }); }
      break;
    }
    case 'shards': { // mirror glass fans out and shatters on the target
      for (let i = 0; i < 5; i++) { const spread = (i - 2) * 0.12, k = ease(prog / 0.45), a2 = ang + spread * (1 - k), px = x + Math.cos(a2) * d * k, py = y + Math.sin(a2) * d * k - 12 * k; ctx.save(); ctx.translate(px, py); ctx.rotate(a2 + t * 6); ctx.globalAlpha = fade; ctx.fillStyle = `rgba(${s.hot}, 0.75)`; ctx.strokeStyle = `rgb(${s.rgb})`; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 4); ctx.lineTo(-3, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      land(0.45); break;
    }
    case 'bus': { // two headlights rake the target
      const k = ease(prog / 0.35); for (const off of [-8, 8]) { const g = ctx.createLinearGradient(x, y, tx, ty); g.addColorStop(0, rgbaOf(s.hot, 0.6 * fade)); g.addColorStop(1, rgbaOf(s.rgb, 0.05)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + (tx - x) * k + off * 3 - 18, y + (ty - y) * k - 20); ctx.lineTo(x + (tx - x) * k + off * 3 + 18, y + (ty - y) * k); ctx.fill(); }
      additiveGlow(ctx, tx, ty - 10, 30, s.hot, fade * 0.8); land(0.35); break;
    }
    default: drawBezierProjectile(ctx, x, y, tx, ty, f.curve, prog, vfxPaletteFor(f.genre));
  }
}

// ── Channel (1.2s) ──
export function drawRedesignChannel(ctx, cx, cy, prog, size, id) {
  const s = rdStyle(id), t = rdNow(), env = Math.min(1, prog / 0.35);
  rdEnvironment(ctx, size, s.env, env);
  dimFocus(ctx, size, cx, cy, 0.22 * prog);
  // ground: a lit circle under the caster that tightens as the channel completes
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gr = 70 - 26 * prog, g = ctx.createRadialGradient(cx, cy + 24, 4, cx, cy + 24, gr); g.addColorStop(0, rgbaOf(s.rgb, 0.35 * prog)); g.addColorStop(1, rgbaOf(s.rgb, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 24, gr, gr * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  switch (s.ch) {
    case 'vortex': for (let i = 0; i < 26; i++) { const a = t * 3 + i * 0.6, r = 90 * (1 - ((t * 0.9 + i / 26) % 1)) + 10; additiveGlow(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5, 11, i % 3 ? s.rgb : s.hot, 0.9 * prog); } additiveGlow(ctx, cx, cy - 6, 30 + 40 * prog, s.rgb, 0.5 * prog); break;
    case 'pillar': { const h = 260 * ease(prog), gg = ctx.createLinearGradient(cx, cy - h, cx, cy); gg.addColorStop(0, rgbaOf(s.rgb, 0)); gg.addColorStop(1, rgbaOf(s.hot, 0.55 * prog)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.fillRect(cx - 16 - 10 * prog, cy - h, 32 + 20 * prog, h); ctx.restore(); break; }
    case 'charge': { additiveGlow(ctx, cx, cy - 10, 18 + 40 * prog, s.hot, 0.5 + 0.5 * prog); for (let i = 0; i < 4; i++) { const a = t * 7 + i * 1.6; drawBolt(ctx, cx, cy - 10, cx + Math.cos(a) * 46, cy - 10 + Math.sin(a) * 30, Math.floor(t * 18) + i, s.rgb, prog, 1.4); } break; }
    case 'sigil': { ctx.save(); ctx.translate(cx, cy + 22); ctx.scale(1, 0.4); ctx.rotate(t * 0.8); ctx.strokeStyle = rgbaOf(s.rgb, 0.9 * prog); ctx.lineWidth = 3; for (const r of [56, 40]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2 * ease(prog * 1.3)); ctx.stroke(); } for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, Math.sin(a) * 40); ctx.lineTo(Math.cos(a + 2.1) * 40, Math.sin(a + 2.1) * 40); ctx.stroke(); } ctx.restore(); break; }
    case 'pool': { ctx.save(); const r = 20 + 60 * ease(prog); ctx.fillStyle = rgbaOf(s.rgb, 0.4 * prog); ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, w = r * (1 + 0.12 * Math.sin(a * 5 + t * 3)); ctx.lineTo(cx + Math.cos(a) * w, cy + 26 + Math.sin(a) * w * 0.36); } ctx.fill(); ctx.restore(); for (let i = 0; i < 5; i++) { const ph = (t * 1.2 + i / 5) % 1; additiveGlow(ctx, cx + (hash01(i) - 0.5) * 80, cy + 20 - ph * 40, 6, s.hot, prog * (1 - ph)); } break; }
    case 'eye': rdProp(ctx, size, 'eye', s.rgb, prog, prog * 0.6); break;
    case 'clock': rdProp(ctx, size, 'clock', s.rgb, prog, prog * 0.2); break;
    case 'glass': for (let i = 0; i < 9; i++) { const a = t * 1.5 + i * 0.7, r = 40 + 30 * (1 - prog); ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy - 10 + Math.sin(a) * r * 0.5); ctx.rotate(a * 2); ctx.globalAlpha = prog; ctx.fillStyle = `rgba(${s.hot}, 0.6)`; ctx.strokeStyle = `rgb(${s.rgb})`; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 5); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } break;
  }
  if (Math.random() < 0.5 * prog) emitParticle(0, cx + (Math.random() - 0.5) * 60, cy + 20, (Math.random() - 0.5) * 20, -80 - Math.random() * 60, 0.7, 1.4, `rgb(${s.hot})`);
  ctx.save(); ctx.strokeStyle = rgbaOf(s.hot, 0.9); ctx.lineWidth = 2 + 2 * prog; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy - 4, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke(); ctx.restore();
  const name = (ULT_NAMES[id] || '').toUpperCase(); if (name) channelLabel(ctx, cx, cy, name, prog, `rgb(${s.hot})`, 'rgba(6, 8, 12, 0.78)');
}

// ── 10th ability (1.6s) ──
function rdSchedule(f, size) { // impacts travel outward from the caster at ~9 tiles/s, like a real wave front
  if (f._hits) return f._hits; const o = routePoint(f.x, f.y, size), px = tilePx(size), tile = Math.hypot(px.x, px.y) || 100;
  return f._hits = rdLive().map(e => { const p = rdRunnerPt(e, size); return { uid: e.uid, at: 0.18 + Math.hypot(p.x - o.x, p.y - o.y) / tile / 9 }; });
}
function rdImpact(f, s, p, power = 1) {
  addDecal('flash', p.x, p.y - 10, 0.7 * power, 0.25); DECALS[DECALS.length - 1].rgb = s.hot;
  if (s.decal) addDecal(s.decal, p.x, p.y + 8, 0.9 * power, 3.5);
  rdDebris(p.x, p.y, s.rgb, 8, power); burstImpact(p.x, p.y + 6, 0, 2, 4, 0.7 * power);
  if (['scorch', 'slag', 'crack'].includes(s.decal)) smoke(p.x, p.y, 3, '41, 37, 36', 0.9);
}
export function drawUltBurst(ctx, f, size) {
  const s = rdStyle(f.ult), prog = fxProg(f), time = fxTime(f), o = routePoint(f.x, f.y, size), t = rdNow(), fade = Math.min(1, (1 - prog) * 3), live = rdLive();
  rdEnvironment(ctx, size, s.env, Math.min(1, time / 0.15) * Math.min(1, f.ttl / 0.4));
  if (s.tint) { ctx.save(); ctx.fillStyle = rgbaOf(s.tint, 0.18 * fade); ctx.fillRect(0, 0, size, size); ctx.restore(); }
  rdProp(ctx, size, s.prop, s.rgb, fade, prog);
  onceEach(f, 'shake', () => vfxShake(['strike', 'cleave', 'rain'].includes(s.shape) ? 7 : 4, f.x, f.y, 0.35));
  if (time < 0.25) additiveGlow(ctx, o.x, o.y, 140, s.hot, 0.8 * (1 - time / 0.25));
  const hits = rdSchedule(f, size), pt = h => { const e = live.find(e => e.uid === h.uid); return e && rdRunnerPt(e, size); };
  const landed = (h, key, fn) => { if (time >= h.at) onceEach(f, key + h.uid, fn); };
  ctx.save();
  if (s.shape === 'nova') { // a real pressure front: bright leading edge, dark wake, shimmer behind
    const r = Math.max(0, time - 0.18) * 9 * (Math.hypot(tilePx(size).x, tilePx(size).y));
    for (let k = 0; k < 3; k++) { const rr = r - k * 18; if (rr <= 0) continue; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgbaOf(k ? s.rgb : s.hot, fade * (0.9 - k * 0.28)); ctx.lineWidth = 12 - k * 3; ctx.beginPath(); ctx.ellipse(o.x, o.y, rr, rr * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (s.chaos) for (let i = 0; i < 6; i++) drawBolt(ctx, o.x, o.y, o.x + Math.cos(i + t * 4) * r * 0.8, o.y + Math.sin(i + t * 4) * r * 0.45, Math.floor(t * 20) + i, s.rgb, fade * 0.8, 2);
    for (const h of hits) { const p = pt(h); if (!p) continue; landed(h, 'n', () => rdImpact(f, s, p)); if (time >= h.at) additiveGlow(ctx, p.x, p.y - 14, 30, s.rgb, fade * 0.7); }
  } else if (s.shape === 'walls') { // the four walls ignite tile by tile, racing away from the caster
    for (let i = 0; i < 16; i++) {
      const p = rdTilePt(i, size), at = 0.15 + i * 0.035, on = Math.max(0, Math.min(1, (time - at) / 0.15)), flick = 0.65 + 0.35 * Math.sin(t * 13 + i * 1.7);
      if (on <= 0) continue; onceEach(f, 'w' + i, () => { if (s.decal) addDecal(s.decal, p.x, p.y + 6, 1, 3.5); if (i % 2 === 0) smoke(p.x, p.y, 2, s.decal === 'acid' ? '54, 83, 20' : '41, 37, 36', 1); });
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 34); g.addColorStop(0, rgbaOf(s.hot, 0.6 * on * fade * flick)); g.addColorStop(1, rgbaOf(s.rgb, 0));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, 34, 18, 0, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 3; k++) { const ph = (t * 1.6 + k / 3 + i * 0.13) % 1; ctx.fillStyle = rgbaOf(s.rgb, on * fade * (1 - ph)); ctx.beginPath(); ctx.ellipse(p.x + (hash01(i * 3 + k) - 0.5) * 30, p.y - ph * 40, 3 * (1 - ph) + 1, 6 * (1 - ph) + 2, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  } else if (s.shape === 'marks') { // a sigil drops onto each runner in turn, then detonates
    for (const h of hits) { const p = pt(h); if (!p) continue; const k = Math.max(0, Math.min(1, (time - h.at + 0.25) / 0.25));
      if (k > 0 && k < 1) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(p.x, 0, p.x, p.y); g.addColorStop(0, rgbaOf(s.rgb, 0)); g.addColorStop(1, rgbaOf(s.hot, 0.5 * fade)); ctx.fillStyle = g; ctx.fillRect(p.x - 6, 0, 12, p.y - 10); }
      rdGlyph(ctx, s.glyph, p.x, p.y - 80 + 56 * ease(k), 24, s.hot, fade * (k > 0 ? 1 : 0)); landed(h, 'm', () => rdImpact(f, s, p)); }
  } else if (s.shape === 'sweep') { // a body of force races the whole track, leaving a scar behind it
    const head = Math.max(0, time - 0.15) / 1.1 * 16, pts = [];
    for (let k = 0; k <= 26; k++) { const q = head - k * 0.22; if (q < 0) break; const tp = Game.track(Math.min(15.99, q)); pts.push(routePoint(tp.x, tp.y, size)); }
    if (pts.length > 1 && head < 17) { rdLight(ctx, pts, s.rgb, s.hot, 9, fade); additiveGlow(ctx, pts[0].x, pts[0].y, 60, s.hot, fade); if (Math.random() < 0.7) rdDebris(pts[0].x, pts[0].y, s.rgb, 2, 0.7); }
    for (let i = 0; i < Math.min(16, Math.floor(head)); i++) onceEach(f, 'sw' + i, () => { const p = rdTilePt(i, size); if (s.decal) addDecal(s.decal, p.x, p.y + 6, 0.9, 3); });
    for (const e of live) { const p = rdRunnerPt(e, size); if (head >= visualTrackP(e)) onceEach(f, 's' + e.uid, () => rdImpact(f, s, p, 0.8)); }
  } else if (s.shape === 'strike' || s.shape === 'cleave') { // telegraph, then a blow from above
    const targets = s.shape === 'cleave' ? (() => { const n = [0, 0, 0, 0]; live.forEach(e => n[rdWallOf(e)]++); const w = n.indexOf(Math.max(...n)); return live.filter(e => rdWallOf(e) === w); })() : [[...live].sort((a, z) => z.hp - a.hp)[0]].filter(Boolean);
    const hitAt = 0.42;
    for (const e of targets) { const p = rdRunnerPt(e, size);
      if (time < hitAt) { const k = time / hitAt; ctx.strokeStyle = rgbaOf(s.rgb, 0.6 + 0.4 * Math.sin(t * 30)); ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 34 - 20 * k, 13 - 7 * k, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); if (k > 0.6) rdLight(ctx, [{ x: p.x, y: p.y - 320 * (1 - (k - 0.6) / 0.4) - 20 }, { x: p.x, y: p.y - 6 }], s.rgb, s.hot, 10, 1); }
      else { onceEach(f, 'hit' + e.uid, () => { rdImpact(f, s, p, 1.5); burstImpact(p.x, p.y, 12, 8, 10, 1.4); vfxShake(9, null, null, 0.3); }); const q = Math.min(1, (time - hitAt) / 0.6); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgbaOf(s.hot, 1 - q); ctx.lineWidth = 10 * (1 - q) + 1; ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 20 + 90 * q, 8 + 34 * q, 0, 0, Math.PI * 2); ctx.stroke(); additiveGlow(ctx, p.x, p.y - 6, 80 * (1 - q) + 10, s.rgb, 1 - q); }
    }
  } else if (s.shape === 'drain') { // every runner is tethered and wrenched toward the caster
    for (const h of hits) { const p = pt(h); if (!p) continue; const on = Math.max(0, Math.min(1, (time - h.at + 0.15) / 0.2));
      if (on <= 0) continue; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgbaOf(s.rgb, 0.5 * on * fade); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - 12); ctx.quadraticCurveTo((p.x + o.x) / 2, (p.y + o.y) / 2 - 40, o.x, o.y); ctx.stroke();
      for (let i = 0; i < 3; i++) { const q = (t * 1.4 + i / 3 + h.uid * 0.13) % 1; additiveGlow(ctx, p.x + (o.x - p.x) * q, p.y - 12 + (o.y - p.y + 12) * q - Math.sin(q * Math.PI) * 40, 8, s.hot, on * fade); }
      landed(h, 'd', () => rdImpact(f, s, p, 0.8)); }
    additiveGlow(ctx, o.x, o.y, 60 + 25 * Math.sin(t * 8), s.rgb, 0.7 * fade);
  } else if (s.shape === 'rain') { // shells or blood fall across the board, each one a real impact
    if (!f._drops) f._drops = Array.from({ length: 22 }, (_, i) => ({ i, at: 0.15 + hash01(i * 3.3 + (f.uid || 0)) * 0.9, tile: Math.floor(hash01(i * 7.7 + (f.uid || 0)) * 16) }));
    for (const d of f._drops) { const p = rdTilePt(d.tile, size), k = (time - d.at + 0.22) / 0.22; if (k < 0) continue;
      if (k < 1) rdLight(ctx, [{ x: p.x + 30 * (1 - k), y: p.y - 300 * (1 - k) - 20 }, { x: p.x + 30 * (1 - k) - 6, y: p.y - 300 * (1 - k) + 14 }], s.rgb, s.hot, 3.5, 1);
      else onceEach(f, 'r' + d.i, () => rdImpact(f, s, { x: p.x + (hash01(d.i) - 0.5) * 20, y: p.y }, 0.9)); }
  }
  ctx.restore();
  rdBanner(ctx, size, f.text, s.hot, prog < 0.75 ? 1 : (1 - prog) * 4);
}
// Order (Haunted A) units that are not Mythics keep the plain flashlight-and-stamp attack.
export function drawOrderCitation(ctx, x, y, tx, ty, prog) { drawMythicAttack(ctx, { uid: 0, maxTtl: 0.65 }, { ...RD_ULTS.ruleArchitect, glyph: '' }, x, y, tx, ty, prog); }
// Cyberpunk attacks glow with the attacker's heat band.
export function heatPalette(f, pal) {
  const u = S.battle.units.find(v => v.uid === f.uid); if (!u || !Game.heatUser(u)) return pal;
  const band = Game.heatBand(u);
  return band === 'redline' ? { ...pal, primary: '#ff3b3b', secondary: '#ffd166', glow: '#ff3b3b88', trail: '#ff8a3d' } : band === 'warm' ? { ...pal, primary: '#ffb020', secondary: '#ff2a6d', glow: '#ffb02088' } : pal;
}
export const rdHeatRgb = (u, base) => { if (!Game.heatUser(u)) return base; const b = Game.heatBand(u); return b === 'redline' ? '255, 59, 59' : b === 'warm' ? '255, 176, 32' : base; };
// Runner states, drawn in the runner's local (translated) space.
export function drawRunnerStates(ctx, e, scale, r) {
  const t = rdNow(), top = -scale - 16;
  if ((e.ruleMarks || 0) > 0 && !e.subjectZero) for (let i = 0; i < e.ruleMarks; i++) { ctx.fillStyle = '#f1c66e'; ctx.fillRect(-12 + i * 5.5, top - 6, 4, 4); }
  if (Game.compliant(S.battle, e)) { ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.ellipse(0, 2, scale * 0.42, scale * 0.18, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  if ((e.weakpoints || 0) > 0) { const y = -scale * 0.5; ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, y, 7, 0, Math.PI * 2); ctx.moveTo(-10, y); ctx.lineTo(10, y); ctx.moveTo(0, y - 10); ctx.lineTo(0, y + 10); ctx.stroke(); ctx.font = 'bold 9px system-ui'; ctx.fillStyle = '#f87171'; ctx.fillText(e.weakpoints, 11, y - 6); }
  if ((e.madness || 0) > 0 && !(e.insaneUntil > S.battle.time)) { const w = scale * 0.82; ctx.fillStyle = 'rgba(30, 16, 46, 0.9)'; ctx.fillRect(-w / 2, -scale - 1, w, 3); ctx.fillStyle = '#a78bfa'; ctx.fillRect(-w / 2, -scale - 1, w * Math.min(1, e.madness / 10), 3); }
  if (e.insaneUntil > S.battle.time) {
    additiveGlow(ctx, 0, -scale * 0.45, scale * 0.9, '139, 92, 246', 0.35 + 0.15 * Math.sin(t * 9));
    for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; ctx.strokeStyle = `rgba(167, 139, 250, ${0.7 - i * 0.15})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -scale * 0.45, scale * (0.42 + i * 0.1), a, a + 1.6); ctx.stroke(); }
    ctx.font = '800 9px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#c4b5fd'; ctx.fillText('INSANE', 0, top - 10);
  }
  if ((e.huntBleed || 0) > 0) { ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(r + 8, top - 4); ctx.quadraticCurveTo(r + 13, top + 4, r + 8, top + 6); ctx.quadraticCurveTo(r + 3, top + 4, r + 8, top - 4); ctx.fill(); ctx.font = 'bold 9px system-ui'; ctx.fillStyle = '#fca5a5'; ctx.fillText(Math.ceil(e.huntBleed), r + 15, top + 4); }
  if (e.yellowBrand) rdGlyph(ctx, '✶', -r - 10, -scale * 0.55, 12, '250, 204, 21', 0.9);
  if ((e.boss || e.champion) && e.vulnerableUntil > S.battle.time && (e.vulnerability || 0) >= 0.2) { ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -scale * 0.45, scale * 0.6, t * 3, t * 3 + 4); ctx.stroke(); }
  if ((e.tabooForcedUntil || 0) > S.battle.time) { ctx.strokeStyle = 'rgba(190, 24, 93, 0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, top - 2); ctx.lineTo(8, top - 14); ctx.moveTo(8, top - 2); ctx.lineTo(-8, top - 14); ctx.stroke(); }
}
// Spectral Wild Hunt wolves and Dark Young: they have no grid slot, so they are drawn at the runners they bite.
export function drawSpectrals(ctx, size) {
  const t = rdNow(), live = rdLive();
  for (const [list, rgb, wolf] of [[S.battle.huntWolves || [], '226, 232, 240', true], [S.battle.cosmicYoung || [], '74, 222, 128', false]]) {
    for (const w of list) {
      const prey = wolf ? live.filter(e => (e.huntBleed || 0) > 0 || (e.bleeds || []).some(d => d.until > S.battle.time)) : live;
      for (let i = 0; i < w.count && prey.length; i++) {
        const p = rdRunnerPt(prey[i % prey.length], size), a = t * 3 + i * 2.1, x = p.x + Math.cos(a) * 24, y = p.y + Math.sin(a) * 10;
        additiveGlow(ctx, x, y, 20, rgb, 0.5);
        ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = `rgba(${rgb}, 0.75)`; ctx.translate(x, y); ctx.scale(Math.cos(a) < 0 ? -1 : 1, 1);
        if (wolf) { ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(14, -9); ctx.lineTo(15, -2); ctx.lineTo(11, 1); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, -1); ctx.quadraticCurveTo(-18, -6, -20, 2); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${rgb}, 0.7)`; ctx.stroke(); }
        else { ctx.beginPath(); ctx.ellipse(0, -2, 8, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(${rgb}, 0.8)`; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 3, 3); ctx.quadraticCurveTo(k * 5, 10, k * 4 + Math.sin(t * 6 + k) * 3, 15); ctx.stroke(); } }
        ctx.restore();
      }
    }
  }
}
// Lights On: the Order pole floods the board with cold institutional light.
export function drawLightsOn(ctx, size) { if (Game.lightsOn(S.battle)) rdEnvironment(ctx, size, 'lights', 1); }
// DOM card states: heat bar and band, Redline glow, Sci-Fi cocoon, Mythic channel glow.
export function cardRedesignStates(el, u) {
  const heat = Game.heatUser(u);
  let bar = el.querySelector('.rd-heat');
  if (heat && !bar) { el.insertAdjacentHTML('beforeend', '<i class="rd-heat"><b></b></i>'); bar = el.querySelector('.rd-heat'); }
  if (bar) { bar.hidden = !heat; if (heat) bar.firstChild.style.width = Math.min(100, u.heat || 0) + '%'; }
  const band = heat ? Game.heatBand(u) : 'cold';
  el.classList.toggle('rd-warm', band === 'warm'); el.classList.toggle('rd-redline', band === 'redline' && u.state === 'active');
  const cocoon = (u.cocoonUntil || 0) > S.battle.time;
  el.classList.toggle('rd-cocoon', cocoon); if (cocoon) el.dataset.cocoon = Math.ceil(u.cocoonUntil - S.battle.time) + 's';
  const id = rdChannelId(u.channeling?.type);
  el.classList.toggle('rd-channel', !!id); if (id) el.style.setProperty('--rd-rgb', rdStyle(id).rgb);
}
