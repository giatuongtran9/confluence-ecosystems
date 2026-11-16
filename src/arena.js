import { STORYBOARDED, storyChannel, storyOwnsUlt, storyRelease } from './effects/storyboard.js';
import { applyCamera, combatFeedback, drawFlash, isFrozen } from './feedback.js';
import { cardCellCenter, routePoint } from './battlefield.js';
import { blackoutHUDHTML, bloodlineTrialHUDHTML, cosmicTrialHUDHTML, cyberTrialHUDHTML, detail, fieldUnit, huntTrialHUDHTML, urbanContainmentHUDHTML, urbanLegendTrialHUDHTML, xenoTrialHUDHTML } from './board.js';
import { drawBezierProjectile, drawCrescentSlash, drawGroundRing, drawImpactSparks, drawParticles, drawSwordTorrentChannel, updateParticles, vfxPaletteFor } from './effects/core.js';
import { ELEMENT_FX, ELEMENT_GATHER, ELEMENT_ULTS, drawElementalMarks, drawElementalZones, drawPersistentMarks } from './effects/elements.js';
import { CHANNEL_ENV, ULT_ENV, ULT_IMPACT, drawDecals, drawEnvironment, drawUltRealism } from './effects/environment.js';
import { CHANNEL_GLOW, drawFormationGather, drawFormationRiver, drawGoStoneShot, drawInkFlick, drawInkPuddles, drawLandscapeDragon, drawLandscapeGather, drawTalismanBurn, drawTalismanDecree, drawTalismanGather, drawTalismanShot, visualTrackP } from './effects/formation-ink.js';
import { drawArcaneRunes, drawBloodlineClaws, drawCosmicTentacle, drawCultivationSword, drawCyberMonowire, drawHauntedScissors, drawHuntBroadsword, drawScifiNeedle, drawScrapworkShell } from './effects/genre-attacks.js';
import { RD_ATTACK_TYPES, RD_ULTS, cardRedesignStates, drawLightsOn, drawMythicAttack, drawOrderCitation, drawRedesignChannel, drawRunnerStates, drawSpectrals, drawUltBurst, heatPalette, rdChannelId, rdHeatRgb, rdStyle } from './effects/mythic.js';
import { drawBloodDomain, drawBloodGather, drawBloodGround, drawBloodSlash, drawDissonanceChord, drawHarmonyChord, drawSoulDetonation, drawSoulGather, drawSoulReturn, drawSoulWispShot, drawSwordPierce } from './effects/soul-blood.js';
import { drawColossalNumber, drawMelodicGather, drawMelodicResonance, drawSwordGather, drawSwordTorrent } from './effects/sword-music.js';
import { simSpeed } from './lab.js';
import { CARD, Game } from './lib.js';
import { arcaneTrialHUDHTML, heavenlyTrialHUDHTML, lossNotice, receiveFeedback, scrapworkTrialHUDHTML } from './screens.js';
import { unitAtlas } from './sprites.js';
import { S } from './state.js';
import { $, modal } from './ui.js';
import { VFX } from './vfx.js';

export function draw() {
  let canvas = $('#arena');
  if (!canvas || !S.battle) return;
  let ctx = canvas.getContext('2d'), size = 700, unit = size / 5;
  ctx.clearRect(0, 0, size, size);

  // Particles run on wall time, scaled by game speed and slow motion; frozen while paused or in hit-stop
  const vfxNow = performance.now();
  let vfxDt = Math.min(0.05, (vfxNow - (draw.lastT || vfxNow)) / 1000);
  draw.lastT = vfxNow;
  const realDt = vfxDt;
  if (S.paused || (S.battle.hitStopRemaining || 0) > 0 || isFrozen()) vfxDt = 0;
  const vfxStep = vfxDt * simSpeed() * (S.battle.slowMo ? S.battle.slowMo.scale : 1);
  updateParticles(vfxStep);
  VFX.update(vfxStep);                                    // textured VFX layer (vfx.js)

  // One camera for every impact (src/feedback.js): trauma-based shake and punch-in, decaying on real time
  ctx.save();
  applyCamera(ctx, S.paused ? 0 : realDt);

  // The channelling Sword Immortal lifts and glows (DOM card over the canvas)
  for (const u of S.battle.units) {
    const card = document.querySelector(`.field-card[data-id="${u.uid}"]`);
    if (!card) continue;
    const glow = !u.removed && CHANNEL_GLOW[u.channeling?.type];
    for (const cls of Object.values(CHANNEL_GLOW)) card.classList.toggle(cls, cls === glow);
    if (!u.removed) cardRedesignStates(card, u);
  }

  drawInkPuddles(ctx, size);
  drawBloodGround(ctx, size);
  drawDecals(ctx, size);                                  // scorch, cracks, frost, mud and toxin left by impacts

  // Ecosystem grounds
  for (const oil of S.battle.oilPools || []) {
    const p = Game.track(oil.tile + 0.5), q = routePoint(p.x, p.y, size);
    ctx.fillStyle = '#d97524aa';
    ctx.beginPath();
    ctx.ellipse(q.x, q.y, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const pos = e => { let p = Game.track(visualTrackP(e)); return routePoint(p.x, p.y, size); };

  for (const z of S.battle.cyberZones || []) {
    for (let i = z.wall * 4; i < z.wall * 4 + 4; i++) {
      const p = Game.track(i + 0.5), q = routePoint(p.x, p.y, size);
      ctx.fillStyle = z.type === 'plasma' ? '#63d3f066' : '#e5724b66';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawElementalZones(ctx, size);   // arcane fissures, mist and swamps, Xuanwu toxin, Rebirth Inferno flames
  for (const c of S.battle.cyclones || []) {
    const p = Game.track(c.p), q = routePoint(p.x, p.y, size);
    ctx.strokeStyle = '#f2ac70';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 24, S.battle.time * 5, S.battle.time * 5 + 4.8);
    ctx.stroke();
  }
  if (S.battle.curfewUntil > S.battle.time) {
    ctx.save();
    ctx.fillStyle = 'rgba(15,5,18,0.22)';
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }
  drawLightsOn(ctx, size);
  if (S.battle.units.some(u => !u.removed && u.id === 'stair13')) {
    for (const i of [0, 4, 8, 12]) {
      const p = Game.ring[i], q = routePoint(p[0], p[1], size), pulse = 0.65 + 0.25 * Math.sin(S.battle.time * 5 + i);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#d98a70';
      ctx.fillStyle = '#c96d5522';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(q.x, q.y, unit * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(q.x, q.y, unit * 0.33, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // PASS 1: Perspective-Squashed Ground Decals & Rings (Under Runners)
  for (const f of S.battle.effects) {
    if (f.vfxKind !== 'ring') continue;
    const to = routePoint(f.tx ?? f.x, f.ty ?? f.y, size);
    const maxT = f.maxTtl || 0.65;
    const prog = Math.min(1, Math.max(0, 1 - f.ttl / maxT));
    const pal = vfxPaletteFor(f.genre);
    drawGroundRing(ctx, to.x, to.y, (f.radius || 1.2) * unit * 0.55, prog, pal, f.genre);
  }

  // PASS 2: Runners with Layer 1B Hit-Flash, Directional Recoil Spring & Hit-Squash
  for (const e of S.battle.enemies) {
    let baseP = pos(e);
    e.recoilX = (e.recoilX || 0) * 0.78;
    e.recoilY = (e.recoilY || 0) * 0.78;
    e.hitSquash = (e.hitSquash || 0) * 0.80;
    const rx = baseP.x + (e.recoilX || 0), ry = baseP.y + (e.recoilY || 0);
    const isFlashing = (e.hitFlashUntil || 0) > S.battle.time;
    const r = e.boss ? 20 : e.champion ? 18 : e.elite ? 15 : 11;
    const color = isFlashing ? (e.hitCrit ? '#ff5a46' : '#ffffff') : e.frozenUntil > S.battle.time ? '#a8e9fa' : e.boss ? '#ee8295' : e.champion ? '#d6a5ef' : e.armored ? '#c4ac87' : e.swift ? '#d6cd91' : '#b0b7a3';

    ctx.save();
    ctx.translate(rx, ry);
    const sq = e.hitSquash || 0;
    if (sq > 0.01) ctx.scale(1 + sq, 1 - sq * 0.65);

    const spriteIndex = e.boss || e.champion ? 41 : e.swift ? 40 : 39;
    const sw = unitAtlas.naturalWidth / 6, sh = unitAtlas.naturalHeight / 7;
    const scale = e.boss ? 58 : e.champion ? 48 : e.elite ? 40 : 34;

    ctx.fillStyle = '#131a1480';
    ctx.beginPath();
    ctx.ellipse(0, 2, scale * 0.32, scale * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    if (unitAtlas.complete && sw) {
      ctx.globalAlpha = e.frozenUntil > S.battle.time ? 0.65 : 1;
      if (isFlashing) ctx.filter = e.hitCrit ? 'brightness(2.8) saturate(1.8)' : 'brightness(2.5)';
      ctx.drawImage(unitAtlas, (spriteIndex % 6) * sw, Math.floor(spriteIndex / 6) * sh, sw, sh, -scale / 2, -scale + Math.sin(S.battle.time * 7 + e.uid) * 1.6, scale, scale);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isFlashing) {
      ctx.fillStyle = e.hitCrit ? 'rgba(255, 95, 70, 0.55)' : 'rgba(255, 255, 255, 0.52)';
      ctx.beginPath();
      ctx.arc(0, -scale * 0.42, scale * (e.hitCrit ? 0.44 : 0.34), 0, Math.PI * 2);
      ctx.fill();
    }

    if (e.subjectZero) {
      ctx.strokeStyle = '#f1c66e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f1c66e';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SUBJECT ZERO', 0, -scale - 20);
      ctx.fillStyle = '#271d16';
      ctx.fillRect(-24, -scale - 16, 48, 4);
      ctx.fillStyle = '#f1c66e';
      ctx.fillRect(-24, -scale - 16, 48 * Math.min(1, (e.ruleMarks || 0) / 5), 4);
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(`${e.ruleMarks || 0}/5 MARKS`, 0, scale * 0.15);
    }
    if (e.alphaQuarry) {
      ctx.strokeStyle = '#e4c376';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -scale / 2, scale * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e4c376';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('QUARRY', -22, -scale - 15);
    }
    if (e.armored) {
      ctx.strokeStyle = '#e3c58c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 6, scale * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }

    const barWidth = scale * 0.82;
    ctx.fillStyle = '#281e21';
    ctx.fillRect(-barWidth / 2, -scale - 7, barWidth, 5);
    ctx.fillStyle = e.boss ? '#ec858d' : '#aac998';
    ctx.fillRect(-barWidth / 2, -scale - 7, barWidth * Math.max(0, e.hp / e.maxHp), 5);
    if (e.bleeds.length) {
      ctx.fillStyle = '#ff8290';
      ctx.fillRect(r + 3, -scale - 9, 4, 7);
    }
    if (e.burns?.length) {
      ctx.fillStyle = '#ffad55';
      ctx.fillRect(-r - 7, -scale - 9, 5, 9);
      ctx.font = '10px system-ui';
      ctx.fillText(e.burns.length, -r - 9, -scale - 11);
    }
    drawRunnerStates(ctx, e, scale, r);
    ctx.restore();
  }

  drawPersistentMarks(ctx, size);
  drawElementalMarks(ctx, size);
  drawSpectrals(ctx, size);

  // Adjacency / Devour Link Visuals
  const seen = new Set();
  for (const e of S.visualEvents) {
    if (e.expires < performance.now() || e.fromSlot == null || e.toSlot == null || e.fromSlot === e.toSlot) continue;
    const key = e.fromSlot + ':' + e.toSlot;
    if (seen.has(key)) continue;
    seen.add(key);
    const a = Game.xy(e.fromSlot), z = Game.xy(e.toSlot), from = cardCellCenter(a.x, a.y, size), to = cardCellCenter(z.x, z.y, size);
    ctx.globalAlpha = Math.min(0.8, (e.expires - performance.now()) / 900);
    ctx.strokeStyle = e.kind === 'devour' ? '#f293a0' : '#d9e9ae';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(to.x, to.y, unit * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

    // Active Unit Channeling VFX (Real-Time)
  for (const u of S.battle.units.filter(u => !u.removed)) {
    if (u.channeling) {
      const pt = routePoint(u.x + 1, u.y + 1, size);
      const chProg = Math.min(1, Math.max(0, 1 - (u.channeling.remaining / (u.channeling.duration || 1.2))));
      if (u.channeling.type === 'sword-torrent') drawSwordGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'melodic-resonance') drawMelodicGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'formation-star-river') drawFormationGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'talisman-decree') drawTalismanGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'landscape-dragon') drawLandscapeGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'soul-reap-detonation') drawSoulGather(ctx, pt.x, pt.y, chProg, size, u);
      else if (u.channeling.type === 'blood-domain') drawBloodGather(ctx, pt.x, pt.y, chProg, size);
      else if (ELEMENT_GATHER[u.channeling.type]) { drawEnvironment(ctx, size, CHANNEL_ENV[u.channeling.type], Math.min(1, chProg / 0.3)); ELEMENT_GATHER[u.channeling.type](ctx, pt.x, pt.y, chProg, size, u); }
      else if (rdChannelId(u.channeling.type)) { if (!STORYBOARDED.has(u.channeling.type)) drawRedesignChannel(ctx, pt.x, pt.y, chProg, size, rdChannelId(u.channeling.type)); }
      else drawSwordTorrentChannel(ctx, pt.x, pt.y, chProg, size, u.channeling.type);
      storyChannel(ctx, u.channeling.type, pt.x, pt.y, chProg, size, u);   // storyboard beats (5 Cultivation Mythics)
    }
  }

  // PASS 3: Aerial VFX (9 Distinct Per-Genre Projectiles, Slashes & Spells)
  for (const f of S.battle.effects) {
    let from = routePoint(f.x, f.y, size), to = routePoint(f.tx, f.ty, size);
    let x = from.x, y = from.y, tx = to.x, ty = to.y;
    const maxT = f.maxTtl || 0.65;
    const prog = Math.min(1, Math.max(0, 1 - f.ttl / maxT));
    const pal = vfxPaletteFor(f.genre);
    const kind = f.vfxKind || 'projectile';

    const rdU = RD_ATTACK_TYPES.includes(f.type) && f.uid != null ? S.battle.units.find(v => v.uid === f.uid) : null;
    if (rdU && RD_ULTS[rdU.id]) {
      const st = rdStyle(rdU.id);
      drawMythicAttack(ctx, f, { ...st, rgb: rdHeatRgb(rdU, st.rgb) }, x, y, tx, ty, prog);
    } else if (f.type === 'ult-channel') {
      // drawn by the live channel pass above
    } else if (kind === 'ult-burst') {
      if (storyOwnsUlt(f.ult)) storyRelease(ctx, f, size); else drawUltBurst(ctx, f, size);
    } else if (kind === 'citation') {
      drawOrderCitation(ctx, x, y, tx, ty, prog);
    } else if (f.type === 'sword-channel' || kind === 'sword-channel') {
      // The live u.channeling pass above already draws an active channel; only draw orphaned ones
      const chU = S.battle.units.find(v => v.uid === f.uid);
      if (!(chU && chU.channeling)) drawSwordTorrentChannel(ctx, x, y, prog, size);
    } else if (f.type === 'sword-torrent' || kind === 'sword-torrent') {
      drawSwordTorrent(ctx, f, size);
    } else if (f.type === 'melodic-resonance') {
      drawMelodicResonance(ctx, f, size); storyRelease(ctx, f, size);
    } else if (f.type === 'formation-star-river') {
      drawFormationRiver(ctx, f, size); storyRelease(ctx, f, size);
    } else if (f.type === 'talisman-decree') {
      drawTalismanDecree(ctx, f, size);
    } else if (f.type === 'landscape-dragon') {
      drawLandscapeDragon(ctx, f, size); storyRelease(ctx, f, size);
    } else if (f.type === 'soul-reap-detonation') {
      drawSoulDetonation(ctx, f, size); storyRelease(ctx, f, size);
    } else if (f.type === 'blood-domain') {
      drawBloodDomain(ctx, f, size); storyRelease(ctx, f, size);
    } else if (ELEMENT_FX[f.type] || ELEMENT_FX[kind]) {
      if (ULT_ENV[f.type] || ULT_IMPACT[f.type]) drawUltRealism(ctx, f, size);
      (ELEMENT_FX[f.type] || ELEMENT_FX[kind])(ctx, f, size, x, y, tx, ty, prog);
    } else if (kind === 'sword-pierce') {
      drawSwordPierce(ctx, f, size);
    } else if (kind === 'harmony-chord') {
      drawHarmonyChord(ctx, f, size);
    } else if (kind === 'dissonance-chord') {
      drawDissonanceChord(ctx, f, size);
    } else if (kind === 'talisman') {
      drawTalismanShot(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'talisman-burn') {
      drawTalismanBurn(ctx, tx, ty, prog, f);
    } else if (kind === 'ink-flick') {
      drawInkFlick(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'soul-wisp') {
      drawSoulWispShot(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'soul-return') {
      drawSoulReturn(ctx, x, y, tx, ty, prog);
    } else if (kind === 'blood-slash') {
      drawBloodSlash(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'go-stone') {
      drawGoStoneShot(ctx, x, y, tx, ty, prog, f.type === 'go-stone-white', f);
    } else if (kind === 'sword' || (f.genre === 'Cultivation' && ['shot', 'spell', 'sword'].includes(kind))) {
      drawCultivationSword(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'claw' || (f.genre === 'Bloodline' && ['slash', 'claw'].includes(kind))) {
      drawBloodlineClaws(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'shell' || (f.genre === 'PostApoc' && ['shot', 'shell'].includes(kind))) {
      drawScrapworkShell(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'laser' || (f.genre === 'Cyberpunk' && ['beam', 'laser'].includes(kind))) {
      drawCyberMonowire(ctx, x, y, tx, ty, prog, heatPalette(f, pal));
    } else if (kind === 'orb' || (f.genre === 'Arcane' && ['spell', 'orb'].includes(kind))) {
      drawArcaneRunes(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'scissor' || (f.genre === 'Haunted' && ['slash', 'scissor'].includes(kind))) {
      drawHauntedScissors(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'tentacle' || (f.genre === 'Lovecraft' && ['spell', 'tentacle'].includes(kind))) {
      drawCosmicTentacle(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'broadsword' || (f.genre === 'Grimdark' && ['slash', 'broadsword'].includes(kind))) {
      drawHuntBroadsword(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'needle' || (f.genre === 'SciFi' && ['shot', 'needle'].includes(kind))) {
      drawScifiNeedle(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'slash') {
      drawCrescentSlash(ctx, x, y, tx, ty, prog, pal, f.genre);
    } else if (kind === 'beam' || f.type === 'beam') {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.ttl * 2.8);
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 9 * (1 - prog * 0.4);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.2 * (1 - prog * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
      drawImpactSparks(ctx, tx, ty, prog, pal, true);
    } else if (kind === 'impact') {
      drawImpactSparks(ctx, tx, ty, prog, pal, f.crit);
    } else if (f.type === 'warp') {
      ctx.strokeStyle = '#b9a5e7';
      ctx.lineWidth = 4;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(tx, ty, unit * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      drawBezierProjectile(ctx, x, y, tx, ty, f.curve, prog, pal);
      if (prog > 0.65) drawImpactSparks(ctx, tx, ty, (prog - 0.65) / 0.35, pal, f.crit);
    }

    if (f.type === 'big-dmg') {
      drawColossalNumber(ctx, tx, ty, f);
    } else if (f.text && !['sword-torrent', 'melodic-resonance', 'formation-star-river', 'talisman-decree', 'landscape-dragon', 'soul-reap-detonation', 'blood-domain', 'ult-burst', 'ult-channel', ...ELEMENT_ULTS].includes(f.type)) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.ttl * 2.2);
      const breakthrough = ['FOUNDATION ESTABLISHMENT', 'GOLDEN CORE', 'NASCENT SOUL'].includes(String(f.text).toUpperCase());
      ctx.font = breakthrough ? 'bold 9px system-ui' : f.crit ? '800 17px system-ui' : 'bold 15px system-ui';
      ctx.textAlign = 'center';
      const textX = f.vfxKind === 'impact' ? tx : (Number.isFinite(x) ? x : tx);
      const textY = (f.vfxKind === 'impact' ? ty : (Number.isFinite(y) ? y : ty)) - (breakthrough ? 52 : 30) - prog * 26;
      ctx.strokeStyle = '#090d0acc';
      ctx.lineWidth = 3.5;
      ctx.strokeText(f.text, textX, textY);
      ctx.fillStyle = f.crit ? pal.secondary : f.type === 'growth' ? '#b4f3ae' : pal.primary || '#e6d4a4';
      ctx.fillText(f.text, textX, textY);
      ctx.restore();
    }
  }

  drawParticles(ctx);
  combatFeedback(ctx, S.battle, size);                    // tiered hit / crit / ultimate bundles + every Mythic's textured channel
  VFX.draw(ctx);

// LAYER 4: Mythic Showstopper Radial Vignette Spotlight
  if (S.battle.showstopper && S.battle.showstopper.ttl > 0) {
    const sh = S.battle.showstopper;
    const spot = routePoint(sh.x, sh.y, size);
    const alpha = Math.min(0.42, (sh.ttl / (sh.maxTtl || 0.65)) * 0.55);
    const pal = vfxPaletteFor(sh.genre);
    ctx.save();
    const grad = ctx.createRadialGradient(spot.x, spot.y, 28, spot.x, spot.y, size * 0.65);
    grad.addColorStop(0, 'rgba(255, 248, 220, 0.14)');
    grad.addColorStop(0.22, pal.glow || 'rgba(92, 225, 230, 0.12)');
    grad.addColorStop(1, `rgba(6, 9, 8, ${alpha.toFixed(3)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore(); // shake transform
  drawFlash(ctx, size, S.paused ? 0 : realDt);
}
export function liveUI() {
  if (!$('#field')) return;
  receiveFeedback();
  const boardEl = document.querySelector('.in-combat .board');
  if (boardEl) {
    boardEl.classList.toggle('screen-shake', Boolean(S.battle.showstopper && S.battle.showstopper.ttl > 0.35));
  }
  for (const u of S.battle.units.filter(u => !u.removed)) {
    let el = document.querySelector('#field [data-id="' + u.uid + '"]');
    if (!el) {
      $('#field').insertAdjacentHTML('beforeend', fieldUnit(u));
      el = document.querySelector('#field [data-id="' + u.uid + '"]');
    } else if (el.dataset.card !== u.id || el.dataset.layout !== `${u.slot}:${u.extraSlot ?? ''}:${(u.modules || []).join()}:${u.mountedHead || ''}`) {
      el.outerHTML = fieldUnit(u);
      el = document.querySelector('#field [data-id="' + u.uid + '"]');
    }
    const active = S.visualEvents.filter(e => e.expires > performance.now());
    el.classList.toggle('combo-source', active.some(e => String(e.fromUid) === String(u.uid)));
    el.classList.toggle('combo-target', active.some(e => String(e.toUid) === String(u.uid)));
    el.classList.toggle('selected', String(S.selected) === String(u.uid));
    el.classList.toggle('inactive', u.state !== 'active');
    el.classList.toggle('trial-stunned', (u.trialStunnedUntil || 0) > S.battle.time);
    el.classList.toggle('showstopper-pop', Boolean(S.battle.showstopper && String(S.battle.showstopper.uid) === String(u.uid) && S.battle.showstopper.ttl > 0));
    el.setAttribute('aria-label', CARD[u.id].name + ', ' + Math.round(Game.atk(S.battle, u)) + ' attack');
    el.querySelector('.field-atk').textContent = Math.round(Game.atk(S.battle, u));

    // Layer 1: Omnidirectional Procedural Sprite Choreography (anchored at Y=467)
    if (u.animSeq && String(u.animSeq) !== el.dataset.animSeq) {
      el.dataset.animSeq = String(u.animSeq);
      const spriteEl = el.querySelector('.sprite');
      if (spriteEl) {
        const ux = u.x + 1, uy = u.y + 1;
        const tx = u.animTarget ? u.animTarget.x : ux;
        const ty = u.animTarget ? u.animTarget.y : uy - 1;
        const rawDx = tx - ux, rawDy = ty - uy;
        const dist = Math.hypot(rawDx, rawDy) || 1;
        const nx = rawDx / dist, ny = rawDy / dist;
        const durMs = Math.max(90, Math.min(420, Math.round(((u.attackInterval || 1.2) * 650) / (typeof S.speed === 'number' && S.speed > 0 ? S.speed : 1))));
        spriteEl.style.setProperty('--dx', `${(nx * 14).toFixed(1)}px`);
        spriteEl.style.setProperty('--dy', `${(ny * 12).toFixed(1)}px`);
        spriteEl.style.setProperty('--rx', `${(-nx * 10).toFixed(1)}px`);
        spriteEl.style.setProperty('--ry', `${(-ny * 8).toFixed(1)}px`);
        spriteEl.style.setProperty('--rot', `${(nx * 3.5).toFixed(2)}deg`);
        spriteEl.style.setProperty('--anim-dur', `${durMs}ms`);
        const cls = 'anim-' + (u.animType || 'lunge');
        spriteEl.classList.remove('anim-lunge', 'anim-recoil', 'anim-cast', 'anim-glitch');
        void spriteEl.offsetWidth;
        spriteEl.classList.add(cls);
      }
    }
  }
  const hpHTML = `${Math.ceil(S.run.health)}<span>/${S.run.maxHealth}</span>`;
  document.querySelectorAll('#hp,.stat-hp').forEach(el => el.innerHTML = hpHTML);
  document.querySelectorAll('#coin-count,.stat-coin').forEach(el => el.textContent = S.run.coins || 0);
  const deckStat = document.querySelector('.hud-deck b');
  if (deckStat) deckStat.textContent = S.run.roster.length;
  const hpBar = document.querySelector('.hud-hp-bar i');
  if (hpBar) hpBar.style.width = Math.max(0, Math.min(100, S.run.health / S.run.maxHealth * 100)) + '%';
  if (modal.open && modal.dataset.live === 'true' && $('#live-card-detail')) $('#live-card-detail').innerHTML = detail();
  $('#loss-strip').innerHTML = lossNotice();
  const bhud = $('#blackout-hud'); if (bhud) bhud.innerHTML = blackoutHUDHTML(S.battle);
  const xhud = $('#xeno-trial-hud'); if (xhud) xhud.innerHTML = xenoTrialHUDHTML(S.battle);
  const cthud = $('#cosmic-trial-hud'); if (cthud) cthud.innerHTML = cosmicTrialHUDHTML(S.battle);
  const thud = $('#heavenly-trial-hud'); if (thud) thud.innerHTML = heavenlyTrialHUDHTML(S.battle);
  const athud = $('#arcane-trial-hud'); if (athud) athud.innerHTML = arcaneTrialHUDHTML(S.battle);
  const sthud = $('#scrapwork-trial-hud'); if (sthud) sthud.innerHTML = scrapworkTrialHUDHTML(S.battle);
  const cyhud = $('#cyber-trial-hud'); if (cyhud) cyhud.innerHTML = cyberTrialHUDHTML(S.battle);
  const hthud = $('#hunt-trial-hud'); if (hthud) hthud.innerHTML = huntTrialHUDHTML(S.battle);
  const blhud = $('#bloodline-trial-hud'); if (blhud) blhud.innerHTML = bloodlineTrialHUDHTML(S.battle);
  const uthud = $('#urban-trial-hud'); if (uthud) uthud.innerHTML = urbanContainmentHUDHTML(S.battle);
  const ulthud = $('#urban-legend-trial-hud'); if (ulthud) ulthud.innerHTML = urbanLegendTrialHUDHTML(S.battle);
  for (const u of S.battle.units.filter(u => u.removed)) document.querySelector('#field [data-id="' + u.uid + '"]')?.remove();
}
