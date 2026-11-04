'use strict';
const Game = (() => {
 const D = typeof module !== 'undefined' ? require('./data.js') : { CARD, CARDS, LEADERS, RELICS };
 const card = id => D.CARD[id];
 const mod = (r, k, base = 1) => D.LEADERS.find(l => l.id === r.leader)?.mods?.[k] ?? base;
 const tier = id => ['Normal', 'Rare', 'Epic', 'Legendary', 'Mythic'].indexOf(card(id).rarity);
 const xy = s => ({ x: s % 3, y: Math.floor(s / 3) }), isCenter = (x, y) => x === 1 && y === 1, isCorner = (x, y) => x !== 1 && y !== 1, isEdge = (x, y) => (x === 1) !== (y === 1), sharesRowOrCol = (a, b) => a.x === b.x || a.y === b.y;
 const kind = s => s === 4 ? 'center' : [0, 2, 6, 8].includes(s) ? 'corner' : 'edge';
 const adjacent = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
 function rand(r) { r.seed = (Math.imul(r.seed, 1664525) + 1013904223) >>> 0; return r.seed / 4294967296 }
 function shuffle(r, a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(rand(r) * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
 function instance(r, id) { return { uid: ++r.uid, id, permanentAtkBonus: 0, threshold: 0 } }
 function newRun(leader, meta = {}, seed = Date.now() >>> 0) {
  const r = { version: 3, leader, seed, uid: 0, roster: [], health: 100 + (meta.vitality || 0) * 5 + (D.LEADERS.find(l => l.id === leader)?.mods?.health || 0), maxHealth: 100 + (meta.vitality || 0) * 5 + (D.LEADERS.find(l => l.id === leader)?.mods?.health || 0), legacyPower: (meta.power || 0) * .02, phase: 'draft', draftReason: 'first', coins: 0, depth: -1, lane: 1, visited: [], relics: [], cleared: 0, stats: { kills: 0, leaks: 0, growth: 0 }, map: [] };
  for (let row = 0; row < 16; row++) {
   r.map.push(Array.from({ length: row === 15 ? 1 : 3 }, (_, lane) => {
    let type = 'battle';
    if (row === 15) type = 'boss';
    else if (row > 1) {
     let n = rand(r);
     type = [3, 7, 11].includes(row) ? ['rest', 'cache', 'event'][(lane + Math.floor(n * 3)) % 3] : n < .28 ? 'elite' : 'battle'
    }
    if ([3, 7, 11].includes(row) && lane === 1) type = 'workshop';
    return { id: `${row}-${lane}`, row, lane: row === 15 ? 1 : lane, type }
   }))
  }
  r.offers = offers(r, true); return r;
 }
 function rewardWeights(r, first = false) { let stage = first ? 1 : Math.min(16, r.depth + 2), elite = !first && r.node?.type === 'elite'; return stage < 5 ? [72, 28, 0, 0, 0] : stage < 10 ? (elite ? [40, 40, 20, 0, 0] : [55, 35, 10, 0, 0]) : elite ? [35, 35, 24, 6, 0] : [50, 32, 15, 3, 0] }
 function offers(r, first = false, exclude = []) {
  let weights = rewardWeights(r, first), pool = D.CARDS.filter(c => !c.retired && (!first || c.baseAtk > 0) && weights[tier(c.id)] > 0 && !exclude.includes(c.id)), out = [];
  while (out.length < 3 && pool.length) {
   const available = weights.map((w, i) => pool.some(c => tier(c.id) === i) ? w : 0);
   let roll = rand(r) * available.reduce((a, v) => a + v, 0), chosen = 0;
   for (let i = 0; i < available.length; i++) { roll -= available[i]; if (roll < 0) { chosen = i; break } }
   let options = pool.filter(c => tier(c.id) === chosen), genre = D.LEADERS.find(l => l.id === r.leader)?.genre;
   let total = options.reduce((n, c) => n + (c.genre === genre ? 1.5 : 1), 0), pickRoll = rand(r) * total, pick = options[options.length - 1];
   for (const c of options) { pickRoll -= c.genre === genre ? 1.5 : 1; if (pickRoll < 0) { pick = c; break } }
   out.push(pick.id); pool = pool.filter(c => c.id !== pick.id)
  }
  return out;
 }

 function draft(r, id) { if (r.phase !== 'draft' || !r.offers.includes(id)) return false; r.roster.push(instance(r, id)); r.offers = []; r.phase = r.depth === 15 ? 'won' : 'map'; return true }
 function available(r) { if (r.phase !== 'map') return []; return (r.map[r.depth + 1] || []).filter(n => r.depth < 0 || n.row === 15 || Math.abs(n.lane - r.lane) <= 1) }
 function chooseNode(r, id) { const n = available(r).find(n => n.id === id); if (!n) return false; r.depth = n.row; r.lane = n.lane; r.node = n; r.visited.push(id); r.phase = ['battle', 'elite', 'boss'].includes(n.type) ? 'ready' : 'event'; return true }
 function skipDraft(r) { if (r.phase !== 'draft' || r.draftReason === 'first') return false; r.offers = []; r.phase = r.depth === 15 ? 'won' : 'map'; return true }
 function rerollDraft(r) { if (r.phase !== 'draft' || (r.coins || 0) < 10) return false; const next = offers(r, r.draftReason === 'first', r.offers); if (next.length !== 3) return false; r.coins -= 10; r.offers = next; return true }

 function reward(r) { r.draftRerolls = 0; r.phase = 'draft'; r.draftReason = 'reward'; r.offers = offers(r) }
 function addRelic(r, id) { if (r.relics.includes(id)) return; r.relics.push(id); if (id === 'heart') { r.maxHealth += 20; r.health = Math.min(r.maxHealth, r.health + 10) } }
 function base(u) { return card(u.id).baseAtk + (u.permanentAtkBonus || 0) }
 const ring = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1]];
 function track(p) { p = Math.max(0, Math.min(15.999, p)); let i = Math.floor(p), f = p - i, a = ring[i], z = ring[(i + 1) % 16]; return { x: a[0] + (z[0] - a[0]) * f, y: a[1] + (z[1] - a[1]) * f } }
 function flank(s, e) { let p = track(e.p); return s === 1 ? p.y < .55 : s === 3 ? p.x < .55 : s === 5 ? p.x > 3.45 : s === 7 ? p.y > 3.45 : false }
 const STAIR_TRAP_CORNERS = [0, 4, 8, 12];
 function trackEffect(b, type, fromP, toP, text) {
  const from = track(fromP), to = track(toP);
  b.effects.push({ type, x: from.x, y: from.y, tx: to.x, ty: to.y, text, ttl: 1.0 });
 }
 function triggerStairTraps(b, e, fromP, toP) {
  if (toP <= fromP) return;
  const stairs = b.units.filter(u => !u.removed && family(u) === 'stair13');
  if (!stairs.length) return;
  const inBlackout = b.curfewUntil > b.time;
  const crossedCorner = STAIR_TRAP_CORNERS.some(corner => corner === 0 ? (fromP === 0 && toP > 0) : (fromP < corner && toP >= corner));
  const oldSteps = Math.floor(fromP * 4);
  const newSteps = Math.floor(toP * 4);
  const normalStep13 = newSteps > oldSteps && (newSteps % 13 === 0);
  const blackoutStep4 = inBlackout && newSteps > oldSteps && (newSteps % 4 === 0);

  if (!crossedCorner && !normalStep13 && !blackoutStep4) return;

  for (const stair of stairs) {
   stair.lastRunnerReact = stair.lastRunnerReact || {};
   if (inBlackout && b.time - (stair.lastRunnerReact[e.uid] || -99) < 1.5) continue;
   if (inBlackout) stair.lastRunnerReact[e.uid] = b.time;

   const baseDmg = stair.id === 'penroseLabyrinth' ? 180 : stair.id === 'infiniteStair' ? 75 : 35;
   if (inBlackout && blackoutStep4) {
    const isPanicked = e.panic || e.panicUntil > b.time;
    if (isPanicked && e.hp / e.maxHp < 0.25) {
     damage(b, e, e.hp, stair, 'direct');
     fx(b, 'curfew', stair, e, 'TERMINAL DESCENT');
    } else {
     const voidDmg = baseDmg * (isPanicked ? 2.5 : 1.5);
     damage(b, e, voidDmg, stair, 'ability');
     status(b, e, 'stun', 2.0, 0, stair);
     e.p = Math.floor(e.p);
     fx(b, 'warp', stair, e, 'PENROSE TRAPDOOR');
    }
   } else {
    damage(b, e, baseDmg, stair, 'ability');
    status(b, e, 'slow', 1.2, 0.40, stair);
    const point = track(e.p);
    b.effects.push({ type: 'impact', x: point.x, y: point.y, tx: point.x, ty: point.y, text: `−${Math.round(baseDmg)}`, ttl: 1.0 });
   }
   addRuleMark(b, e, 1, stair);
   if ((e.ruleMarks || 0) >= 5) {
    const warpTiles = stair.id === 'penroseLabyrinth' ? 4 : 2;
    const before = e.p;
    warp(b, e, warpTiles, stair);
    if (e.p < before) trackEffect(b, 'warp', before, e.p, `WARP −${(before - e.p).toFixed(1).replace(/\.0$/, '')}`);
   }
  }
 }

 function triggerRedRaincoatTraps(b, e, previousProgress, currentProgress, wasRetreating) {
  const raincoats = b.units.filter(u => !u.removed && family(u) === 'redRaincoat');
  if (!raincoats.length) return;
  const inBlackout = b.curfewUntil > b.time;
  const lookedBack = wasRetreating || currentProgress < previousProgress;
  let crowding = false;
  if (inBlackout) {
   crowding = living(b).some(other => other !== e && Math.abs(other.p - currentProgress) <= 2.0);
  }
  if (!lookedBack && !crowding) return;

  for (const u of raincoats) {
   u.lastRunnerReact = u.lastRunnerReact || {};
   if (inBlackout && b.time - (u.lastRunnerReact[e.uid] || -99) < 1.5) continue;
   if (inBlackout) u.lastRunnerReact[e.uid] = b.time;

   const baseDmg = u.id === 'crimsonHarbinger' ? 120 : u.id === 'bloodPhantasm' ? 45 : 18;
   const mult = inBlackout ? ((e.panic || lookedBack) ? 3.0 : 2.0) : 1.0;
   damage(b, e, baseDmg * mult, u, 'direct');
   dot(b, e, 'bleed', u.id === 'crimsonHarbinger' ? 30 : 10, 4, u);
   status(b, e, 'slow', 2.0, 0.35, u);
   addRuleMark(b, e, 1, u);

   if (inBlackout && (e.panic || lookedBack)) {
    for (const nearby of living(b).filter(other => Math.abs(other.p - currentProgress) <= 2.0)) {
     status(b, nearby, 'slow', 3.0, 0.60, u);
    }
    fx(b, 'curfew', u, e, 'CRIMSON DELUGE');
   } else {
    fx(b, 'shot', u, e, 'DO NOT LOOK BACK');
   }
  }
 }
 function neighbors(b, u, diagonal = false) { return b.units.filter(v => !v.removed && v !== u && (diagonal ? Math.max(Math.abs(v.x - u.x), Math.abs(v.y - u.y)) === 1 : adjacent(u, v))) }
 function allies(b, u) { return b.units.filter(v => !v.removed && v !== u) }
 function support(b, id) { return b.units.filter(v => !v.removed && v.id === id).sort((a, z) => Number(a.uid) - Number(z.uid))[0] }
 function living(b) { return b.enemies.filter(e => e.hp > 0 && !e.gone).sort((a, z) => z.p - a.p || a.uid - z.uid) }
 
 function fx(b, type, u, e, text) { b.effects.push({ type, x: u?.x + 1, y: u?.y + 1, tx: e ? track(e.p).x : u?.x + 1, ty: e ? track(e.p).y : u?.y + 1, text, ttl: type === 'beam' ? .35 : .7 }); if (b.effects.length > 90) b.effects.shift() }
 const ENCOUNTERS = { packs: { id: 'packs', name: 'Swarm packs', test: 'Area damage', desc: 'Runners arrive in groups of three with reduced health.', tip: 'Soul-Wailing Bell or piercing strikes help hit several runners.' }, armor: { id: 'armor', name: 'Iron procession', test: 'Armor penetration', desc: 'Most runners wear armor blocking 40% damage.', tip: 'True damage and defense shred bypass armor.' }, fast: { id: 'fast', name: 'Rush runners', test: 'Crowd control', desc: 'Most runners move 60% faster.', tip: 'Slows, stuns, and knockbacks buy time.' } };
 function encounterFor(n) { if (!n || !['battle', 'elite'].includes(n.type) || n.row === 0) return null; return ENCOUNTERS[['packs', 'armor', 'fast'][(n.row + (n.lane ?? 1)) % 3]] }
 function record(b, u) { b.metrics.cards ??= {}; return b.metrics.cards[u.uid] ??= { uid: u.uid, id: u.id, slot: u.slot, phantom: !!u.phantom, damage: 0, direct: 0, ability: 0, dot: 0, kills: 0, growth: 0, triggers: 0, attacks: 0 } }
 function interact(b, from, to, kind, label) {
  b.metrics.interactions ??= {}; b.feedback ??= []; const key = [from?.uid ?? 'track', to?.uid ?? 'track', kind].join(':');
  const row = b.metrics.interactions[key] ??= { from: from?.id || null, to: to?.id || null, fromUid: from?.uid, toUid: to?.uid, kind, label, count: 0, last: -99 }; row.count++;
  if (b.time - row.last < .75) return; row.last = b.time;
  const event = { seq: ++b.feedbackSeq || (b.feedbackSeq = 1), t: b.time, fromUid: from?.uid, toUid: to?.uid, fromSlot: from?.slot, toSlot: to?.slot, kind, text: `${(from && card(from.id)?.name) || (from && from.hp != null ? 'Runner' : 'Track')}${to && to !== from ? ' → ' + (card(to.id)?.name || 'Enemy') : ''}: ${label}` }; b.feedback.push(event); if (b.feedback.length > 40) b.feedback.shift();
 }
 function report(b) {
  const cards = b.units.map(u => ({ ...record(b, u), consumed: !!u.removed })).sort((a, z) => z.damage - a.damage);
  const interactions = Object.values(b.metrics.interactions || {}).map(({ last, ...v }) => v).sort((a, z) => z.count - a.count);
  const consumed = b.metrics.consumed || [];
  const encounter = encounterFor(b.run.node);
  const dormant = cards.filter(c => ['jade', 'conduit', 'mage', 'eye'].includes(c.id) && !c.consumed && c.triggers === 0);
  let notes = [];
  if (b.metrics.leaks) notes.push(`${b.metrics.leaks} runners escaped.`); else notes.push('No runners escaped. Formation held.');
  if (dormant.length) notes.push(`${dormant.map(c => card(c.id).name + ' #' + c.uid).join(', ')} did not fill a trigger gauge.`);
  const originals = consumed.filter(c => !c.token).length, tokens = consumed.filter(c => c.token).length;
  if (originals) notes.push(`${originals} original cards permanently lost.`);
  if (tokens) notes.push(`${tokens} tokens consumed.`);
  return { cards, interactions, consumed, encounter: encounter?.id || null, notes, damage: cards.reduce((a, c) => a + c.damage, 0), leakTypes: { ...b.metrics.leakTypes } };
 }
 function growth(b, u, n) {
  if (u.removed || n <= 0) return;
  n = Math.round(n * mod(b.run, 'growth') * 100) / 100;
  u.permanentAtkBonus += n;
  if (token(u)) { record(b, u).temporaryGrowth = (record(b, u).temporaryGrowth || 0) + n; fx(b, 'growth', u, null, `+${n} wave ATK`); return; }
  record(b, u).growth += n;
  const src = b.run.roster.find(v => v.uid === u.uid);
  if (src) src.permanentAtkBonus = u.permanentAtkBonus;
  b.run.stats.growth += n; b.metrics.growth += n;
  fx(b, 'growth', u, null, `+${n} ATK`);
 }
 function grantGrowth(b, u, n) { if (u.removed || n <= 0) return false; growth(b, u, n); return true }
 function teamPower(b) { return b.units.filter(u => !u.removed && !token(u)).reduce((n, u) => n + (u.permanentAtkBonus || 0), 0) }
 function highestGrowth(b, u) { return Math.max(0, ...allies(b, u).filter(v => !token(v)).map(v => v.permanentAtkBonus || 0)) }

 const APEX_FORMS = [
  'dragonCubApex','tigerCubApex','xuanwuCubApex','phoenixCubApex','monkeyCubApex',
  'swordImmortal', 'melodicSaint', 'formationMaster', 'talismanSovereign', 'landscapeSage', 'soulReapingDemon', 'bloodFiendMaster',
  'ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden',
  'slitMouthedSovereign', 'terminusBus', 'midnightOperator', 'mirrorQueen', 'livingTaboo',
  'penroseLabyrinth', 'crimsonHarbinger'
 ];
 const CULT_RELICS = ['flyingSword', 'guqin', 'weiqiBoard', 'inkBrush', 'mountainScroll', 'soulBanner', 'demonBlade'];
 const isCultivationRelic = u => CULT_RELICS.includes(u.id);

 const urbanRelicMap = {
  ruleboard: 'ruleArchitect',
  panopticon: 'allSeeingOverseer',
  redPhone: 'curfewDirector',
  boneSaw: 'forensicDemiurge',
  elevatorKey: 'backroomsWarden'
 };
 const isUrbanRelic = u => Object.keys(urbanRelicMap).includes(u.id) || (card(u.id).genre === 'Haunted' && (card(u.id).tags || []).includes('urban-relic'));
 const isApexImmortal = u => APEX_FORMS.includes(u.id) || u.realm === 4;

 // Quái Đàm Đô Thị: Investigator & Urban Legend constants
 const urbanInvestigatorIds = ['investigator', 'occultDetective', 'anomalySpecialist', 'ruleEnforcer'];
 const isUrbanAuthority = u => Object.values(urbanRelicMap).includes(u.id);
 const isCultivationApex = u => APEX_FORMS.includes(u.id) && card(u.id).genre === 'Cultivation';
 const acceptsQi = u => !token(u) && (isPractitioner(u) || isCultivationApex(u));
 const acceptsDread = u => !token(u) && (isUrbanInvestigator(u) || isUrbanAuthority(u));
 function addQi(b, u, amount) {
  u.qi = (u.qi || 0) + amount;
  if (isCultivationApex(u)) {
   u.apexQi = (u.apexQi || 0) + amount;
   while (u.apexQi >= 30) { u.apexQi -= 30; growth(b, u, 2); }
  } else updatePractitionerRealm(b, u);
  persist(b, u);
 }
 function addDread(b, u, amount) {
  u.dread = (u.dread || 0) + amount;
  if (isUrbanAuthority(u)) {
   u.apexDread = (u.apexDread || 0) + amount;
   while (u.apexDread >= 30) { u.apexDread -= 30; growth(b, u, 2); }
  } else updateUrbanInvestigatorRealm(b, u);
  persist(b, u);
 }
 function bindUrbanRelic(b, u) {
  if (u.removed || token(u) || u.id !== 'ruleEnforcer') return;
  const relic = neighbors(b, u).find(v => urbanRelicMap[v.id]);
  if (!relic) return;
  const apexId = urbanRelicMap[relic.id];
  consume(b, u, relic, 'Containment Binding', 0);
  evolve(b, u, apexId);
  interact(b, relic, u, 'awaken', `${card(apexId).name} awakens!`);
 }
 const isUrbanInvestigator = u => family(u) === 'investigator' && !APEX_FORMS.includes(u.id);
 const urbanLegendFamilies = ['kuchisake', 'nightBus', 'payphone', 'morgueMirror', 'mannequin', 'stair13', 'redRaincoat'];
 const urbanLegendTiers = {
  kuchisake: ['kuchisake', 'scissorBanshee', 'slitMouthedSovereign'],
  nightBus: ['nightBus', 'ghostRoute', 'terminusBus'],
  payphone: ['payphone', 'hauntedSwitchboard', 'midnightOperator'],
  morgueMirror: ['morgueMirror', 'doppelMirror', 'mirrorQueen'],
  mannequin: ['mannequin', 'stalker', 'livingTaboo'],
  stair13: ['stair13', 'infiniteStair', 'penroseLabyrinth'],
  redRaincoat: ['redRaincoat', 'bloodPhantasm', 'crimsonHarbinger']
 };
 const isUrbanLegend = u => urbanLegendFamilies.includes(family(u));

 function urbanInvestigatorRealmForDread(dread = 0) { return dread >= 140 ? 3 : dread >= 70 ? 2 : dread >= 25 ? 1 : 0; }

 function updateUrbanInvestigatorRealm(b, u) {
  if (!isUrbanInvestigator(u)) return;
  const dread = u.dread || 0, newRealm = urbanInvestigatorRealmForDread(dread), oldRealm = u.realm || 0;
  u.realm = newRealm;
  if (newRealm !== oldRealm || u.id !== urbanInvestigatorIds[newRealm]) {
   const nextId = urbanInvestigatorIds[newRealm];
   if (u.id !== nextId) evolve(b, u, nextId);
   const stats = [[8, 1.3], [24, 1.1], [50, 0.85], [90, 0.65]][newRealm];
   u.baseAtk = stats[0]; u.attackInterval = stats[1];
   if (newRealm > oldRealm) {
    const title = ['Investigator', 'Occult Detective', 'Anomaly Specialist', 'Rule Enforcer'][newRealm];
    fx(b, 'growth', u, null, title.toUpperCase());
   }
   persist(b, u);
  }
 }

 function grantUrbanViolation(b, u, amount = 1) {
  if (!u || !isUrbanLegend(u)) return;
  u.violations = (u.violations || 0) + amount;
  updateUrbanLegendLineage(b, u);
  for (const neighbor of neighbors(b, u, false).filter(v => isUrbanLegend(v))) {
   neighbor.violations = (neighbor.violations || 0) + amount * 0.5;
   updateUrbanLegendLineage(b, neighbor);
  }
  if (b.time >= (b.blackoutLockoutUntil || 0) && b.time >= (b.curfewUntil || 0)) {
   b.urbanViolationsForBlackout = (b.urbanViolationsForBlackout || 0) + amount;
   if (b.urbanViolationsForBlackout >= 5) {
    b.urbanViolationsForBlackout = 0;
    triggerBlackout(b);
   }
  }
 }

 function updateUrbanLegendLineage(b, u) {
  const fam = family(u);
  if (!urbanLegendFamilies.includes(fam)) return;
  const v = u.violations || 0;
  const forms = urbanLegendTiers[fam];
  if (!forms) return;
  const targetTier = v >= 45 ? 2 : v >= 15 ? 1 : 0;
  const targetId = forms[targetTier];
  if (u.id !== targetId && !APEX_FORMS.includes(u.id)) {
   evolve(b, u, targetId);
   persist(b, u);
  }
 }

 function triggerBlackout(b) {
  const legends = b.units.filter(v => !v.removed && isUrbanLegend(v));
  if (!legends.length) return;
  if (b.time < (b.blackoutLockoutUntil || 0) || b.curfewUntil > b.time) return;

  const dur = 6.0 * mod(b.run, 'buffDuration');
  b.curfewUntil = b.time + dur;
  b.blackoutLockoutUntil = b.curfewUntil + 8.0;
  for (const e of living(b)) { e.panicUntil = Math.max(e.panicUntil || 0, b.time + 2.5); e.panic = true; }
  fx(b, 'curfew', null, null, 'TẮT ĐÈN · BLACKOUT FRENZY');
  for (const v of legends) {
   v.blackouts = (v.blackouts || 0) + 1;
   grantGrowth(b, v, 1);
   persist(b, v);
   if (family(v) === 'payphone') {
    for (const e of living(b)) {
     hit(b, v, e, atk(b, v) * (v.id === 'midnightOperator' ? 1.5 : 1.0));
     if ((e.ruleMarks || 0) > 0 || e.panic) {
      status(b, e, 'stun', v.id === 'midnightOperator' ? 2.0 : 0.8, 0, v);
      grantUrbanViolation(b, v, 1);
     }
    }
    fx(b, 'pulse', v, null, 'CURFEW RING');
   }
   if (family(v) === 'morgueMirror') {
    const clone = spawnToken(b, v, 'mirrorClone', false, { tokenAtk: rawAtk(v), attackInterval: v.attackInterval });
    if (clone) interact(b, v, clone, 'reflection', 'Blackout manifested mirror clone');
   }
  }
 }

 function addRuleMark(b, e, n = 1, source = null) {
  if (e.hp <= 0 || e.gone) return;
  n = Math.min(n, 5 - (e.ruleMarks || 0));
  if (n <= 0) return;
  e.ruleMarks = (e.ruleMarks || 0) + n;
  b.metrics.violations = (b.metrics.violations || 0) + n;
  b.totalRuleMarks = (b.totalRuleMarks || 0) + n;

  for (const v of b.units.filter(v => !v.removed && acceptsDread(v))) {
   const gain = n;
   addDread(b, v, gain);
   interact(b, null, v, 'dread', `+${gain} Dread recorded`);
  }

  if (source && isUrbanLegend(source)) {
   grantUrbanViolation(b, source, n);
  }
  // Security Monitor drops Incident Dossier on violations
  for (const cam of b.units.filter(v => !v.removed && v.id === 'securityCam')) {
   if (rand(b.run) < 0.40) {
    spawnToken(b, cam, 'dossier', true);
   }
  }

  fx(b, 'violation', source || e, e, 'PHẠM QUY');
 }

 function practitionerRealmForQi(qi = 0) { return qi >= 175 ? 3 : qi >= 85 ? 2 : qi >= 30 ? 1 : 0 }

 function updatePractitionerRealm(b, u) {
  if (!isPractitioner(u)) return;
  const qi = u.qi || 0, newRealm = practitionerRealmForQi(qi), oldRealm = u.realm || 0;
  u.realm = newRealm;
  if (newRealm !== oldRealm || u.id !== cultivationRealmIds[newRealm]) {
   const nextId = cultivationRealmIds[newRealm];
   if (u.id !== nextId) evolve(b, u, nextId);
   const stats = [[6, 1.5], [18, 1.2], [40, 1.0], [75, .75]][newRealm];
   u.baseAtk = stats[0]; u.attackInterval = stats[1];
   if (newRealm > oldRealm) {
    const title = ['Qi-Refining', 'Foundation Establishment', 'Golden Core', 'Nascent Soul'][newRealm];
     fx(b, 'growth', u, null, title.toUpperCase());
   }
   persist(b, u);
  }
 }
 function runtime(b, u, slot, phantom = false) {
  const d = card(u.id), pos = xy(slot);
  let baseAtk = d.baseAtk;
  let attackInterval = d.attackInterval;
  if (isUrbanInvestigator(u)) {
   const r = urbanInvestigatorRealmForDread(u.dread || 0);
   const stats = [[8, 1.3], [24, 1.1], [50, 0.85], [90, 0.65]][r];
   baseAtk = stats[0]; attackInterval = stats[1];
  }
  if (isPractitioner(u)) {
   const r = practitionerRealmForQi(u.qi || 0);
   if (r === 0) { baseAtk = 6; attackInterval = 1.5; }
   else if (r === 1) { baseAtk = 18; attackInterval = 1.2; }
   else if (r === 2) { baseAtk = 40; attackInterval = 1.0; }
   else { baseAtk = 75; attackInterval = 0.75; }
  }
  return {
   ...u, ...pos, apexQi: u.apexQi ?? u.swordQi ?? 0, apexDread: u.apexDread || 0, slot, name: d.name, genre: d.genre, lineage: u.lineage || d.lineage, lineageTier: u.lineageTier || d.lineageTier, baseAtk, attackInterval,
   currentCooldown: .15 + rand(b.run) * .25,
   threshold: { current: u.threshold || 0, max: d.max || 0, onTrigger: null },
   state: 'active', stateRemaining: 0, removed: false, phantom, mimic: 0, scale: phantom ? .5 : 1,
   attackCount: 0, naniteCrits: u.naniteCrits || 0, critCount: u.critCount || 0, breedAt: 1, overclock: false,
   cycle: 0, clockRemaining: 0, critGift: false, manualUntil: 0, herbSpeed: 0, emptySpeed: 0, hasteUntil: 0, lastFlip: -99,
   ventAt: 0, herbAt: 12, sacrificeAt: 18, offeringSpeed: 0, eliteHits: 0, feedAt: d.id === 'herald' ? 12 : 6,
   summonAt: 12, madnessAt: 8, flash: 0, spatialRole: { isCenter, isCorner, isEdge, sharesRowOrCol },
   onAdjacentAttack: null, onAdjacentStateFlip: null, onAdjacentTrigger: null,
   qi: u.qi || 0, realm: isPractitioner(u) ? practitionerRealmForQi(u.qi || 0) : (isUrbanInvestigator(u) ? urbanInvestigatorRealmForDread(u.dread || 0) : (u.realm || 0)), dread: u.dread || 0, violations: u.violations || 0, blackouts: u.blackouts || 0, busSweepAt: 8, abductAt: 6, swordQi: u.swordQi || 0, souls: u.souls || 0, bladeKills: u.bladeKills || 0, demonAtkBonus: u.demonAtkBonus || 0,
   bloomAt: 8, mistAt: 4, brewAt: 8, pillSpeedUntil: 0, missileAt: 5, banishAt: 10
  }
 }

 function prepareHooks(b, u) {
  u.threshold.onTrigger = () => trigger(b, u);
  u.onAdjacentAttack = v => { if (!token(u) && ['jade', 'conduit'].includes(family(u))) tick(b, u, 1, v) };
  u.onAdjacentStateFlip = v => {
   u.lastFlip = b.time; u.lastFlipSource = v;
   if (u.id === 'smelter' && support(b, 'smelter') === u && v.state !== 'active' && grantGrowth(b, v, 1))
    interact(b, u, v, 'forge', 'state change → +1 permanent ATK');
  };
  u.onAdjacentTrigger = () => { u.flash = .4 };
 }

 function deploy(r) {
  if (r.phase !== 'ready') throw Error('Deployment requires a selected battle');
  const b = { run: r, time: 0, units: [], enemies: [], effects: [],  metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, spawned: 0, enemyUid: 0, spawnAt: 0, done: false, won: false, statusEvents: 0 };
  const picked = shuffle(r, r.roster).slice(0, 9), slots = shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  b.units = picked.map((u, i) => runtime(b, u, slots[i]));
  b.units.sort((a, z) => a.uid - z.uid);
  b.units.filter(isPractitioner).forEach(u => updatePractitionerRealm(b, u));
  b.units.filter(isUrbanInvestigator).forEach(u => updateUrbanInvestigatorRealm(b, u));
  b.units.filter(isUrbanLegend).forEach(u => updateUrbanLegendLineage(b, u));
  b.units.forEach(u => prepareHooks(b, u));
  b.units.forEach(u => record(b, u));
  r.phase = 'combat'; r.lastDraw = picked.map(u => u.uid);
  startAbilities(b);
  b.plan = wavePlan(r);
  
  return b;
 }

 function startAbilities(b) {
  if (b.openingResolved) return; b.openingResolved = true;
  const snap = new Map(b.units.map(u => [u.uid, base(u)]));
  for (const u of b.units.filter(u => u.id === 'mass')) u.mimic = Math.max(0, ...neighbors(b, u).map(v => snap.get(v.uid) - base(u)));
  // Only cards with an explicit opening-summon rule create a token here.
  for (const u of [...b.units].filter(v => !v.removed && !token(v) && ['shepherd'].includes(v.id))) summon(b, u);
  for (const u of [...b.units].filter(v => !v.removed && !token(v) && ['cub', 'herald', 'alchemist', 'harvester'].includes(family(v)))) devour(b, u);
  for (const u of b.units.filter(v => !v.removed && v.id === 'herb')) teamCharge(b, u, 3);
  b.units.forEach(u => bindUrbanRelic(b, u));
  if (b.units.some(u => !u.removed && u.id === 'ruleArchitect')) {
   b.architectActive = true;
  }
  flushEvents(b);
 }

 function herbOffering(b, u) {
  const recipient = allies(b, u).filter(v => v.attackInterval > 0 && !token(v) && card(v.id).genre === 'Cultivation').sort((a, z) => rawAtk(z) - rawAtk(a) || a.uid - z.uid)[0];
  if (!recipient) return false;
  consume(b, recipient, u, 'Offering', 10); recipient.offeringSpeed += .15; flushEvents(b); return true;
 }

 function rawAtk(u) { return (u.tokenAtk != null ? u.tokenAtk + (u.permanentAtkBonus || 0) : (base(u) + (u.mimic || 0))) * u.scale }

 function atk(b, u) {
  let m = 1 + (b.run.relics.includes('blade') ? .12 : 0) + (b.run.legacyPower || 0);
  if (allies(b, u).some(v => family(v) === 'spirit' && (v.state === 'dormant' || v.spiritBuffUntil > b.time))) m += .2 * mod(b.run, 'buffPower');
  if (isApexImmortal(u) && neighbors(b, u, false).some(v => !v.removed && (isCultivationRelic(v) || isUrbanRelic(v)))) m *= 1.2;
  if (card(u.id).genre === 'Haunted' && b.curfewUntil > b.time) m *= (u.id === 'ruleArchitect' ? 2.5 : 1.2);
  return (rawAtk(u) + (u.id === 'railgun' ? highestGrowth(b, u) * 2 : 0)) * m * mod(b.run, 'damage')
 }

 function speed(b, u) {
  let n = 1 + (b.run.relics.includes('clock') ? .1 : 0) + (u.emptySpeed + (u.offeringSpeed || 0) + (u.hasteUntil > b.time ? .15 : 0) + (u.manualUntil > b.time ? .25 : 0) + (u.pillSpeedUntil > b.time ? .15 : 0) + (neighbors(b, u).some(v => v.id === 'netrunner' && v.state === 'active') ? .15 : 0)) * mod(b.run, 'buffPower');
  if (allies(b, u).some(v => v.id === 'mantis' && v.overclock)) n += .15 * mod(b.run, 'buffPower');
  if (support(b, 'matriarch') && BLOODLINE_FODDER.includes(species(u))) n += .4 * mod(b.run, 'buffPower');
  if ((isCultivationRelic(u) || isUrbanRelic(u)) && neighbors(b, u, false).some(v => !v.removed && isApexImmortal(v))) n *= 1.25;
  const inBlackout = b.curfewUntil > b.time;
  const hasDirector = b.units.some(v => !v.removed && v.id === 'curfewDirector');
  if (card(u.id).genre === 'Haunted' && inBlackout) n *= hasDirector ? 1.8 : 1.4;
  if (family(u) === 'mannequin' && (inBlackout || allies(b, u).some(v => v.state !== 'active'))) {
   n *= (u.id === 'livingTaboo' && inBlackout ? 3.0 : 2.5);
  }
  return n * (1 + (u.permanentSpeed || 0)) * (u.overclock ? 1 + 2 * mod(b.run, 'buffPower') : 1) * mod(b.run, 'speed')
 }

 function sensor(b, u) { return support(b, 'sensor') && u.id !== 'sensor' ? 1 : 0 }
 function crit(b, u) {
  const lt = lineageTierIds[u.id]?.tier || 0, lineageCrit = u.lineage === 'tiger' && lt >= 1 ? .15 : u.lineage === 'monkey' && lt >= 1 ? .10 : 0;
  if (u.id === 'livingTaboo' && b.curfewUntil > b.time) return 1.0;
  if (family(u) === 'mannequin' && allies(b, u).some(v => v.state !== 'active')) return 1.0;
  if (u.critGift) return 1.0;
  const manualCrit = (u.manualUntil && u.manualUntil > b.time) ? 0.15 : 0;
  return Math.max(0, Math.min(1, .1 + mod(b.run, 'crit', 0) + (b.run.relics.includes('lens') ? .1 : 0) + sensor(b, u) * .1 + (support(b, 'core') && u.id !== 'core' ? .15 : 0) + lineageCrit + manualCrit));
 }
 function downtime(b, u, duration, state) { if (support(b, 'smelter')) duration -= 1; if (state === 'dormant' && support(b, 'medium')) duration -= 2; if (['burnout', 'overheat'].includes(state) && support(b, 'vent')) duration *= .5; return Math.max(.5, duration) }

 function flip(b, u, state, duration = 0) {
  if (family(u) === 'spirit' && state === 'dormant') u.spiritBuffUntil = b.time + downtime(b, u, duration, state) * mod(b.run, 'buffDuration');
  const previous = u.state; u.state = state; u.stateRemaining = state === 'active' ? 0 : downtime(b, u, duration, state); u.overclock = false;
  for (const v of allies(b, u)) v.onAdjacentStateFlip(u);
  fx(b, 'state', u, null, state === 'active' ? 'RETURN' : state.toUpperCase());
  if (state !== 'active') {
   for (const v of allies(b, u)) {
    if (v.id === 'vent' && ['burnout', 'overheat'].includes(state)) interact(b, v, u, 'coolant', `downtime shortened to ${u.stateRemaining.toFixed(1)}s`);
    if (v.id === 'smelter') interact(b, v, u, 'downtime', `downtime shortened to ${u.stateRemaining.toFixed(1)}s`);
   }
  }
  if (state !== 'active') event(b, 'shutdown', { unit: u, state });
  if (previous === 'dormant' && state === 'active' && family(u) === 'spirit') { growth(b, u, 1); u.returns = (u.returns || 0) + 1; persist(b, u); if (u.id === 'spirit' && u.returns >= 5) evolve(b, u, 'wraith'); }
  if (state !== 'active') 
  if (family(u) === 'spirit' && state === 'dormant') for (const e of living(b)) status(b, e, 'slow', 3, .25, u);
 }

 function tick(b, u, n, source = null) {
  if (u.removed || token(u) || !u.threshold.max || ['lotus', 'monk'].includes(u.id)) return;
  const f = family(u); if (f === 'mantis') return;
  u.threshold.current += n * (abilityGauge(u) ? mod(b.run, 'gauge') : 1);
  let guard = 0;
  while (u.threshold.current >= u.threshold.max && u.threshold.max && guard++ < 2) {
   if (u.nextTrigger > b.time || u.state !== 'active') break;
   u.threshold.current -= u.threshold.max; u.triggerSource = source; trigger(b, u);
  }
 }

 function trigger(b, u) {
  if (abilityGauge(u)) event(b, 'gauge', { unit: u });
  b.metrics.triggers++; record(b, u).triggers++; u.flash = .65;
  for (const v of allies(b, u)) { v.onAdjacentTrigger(u); }
  switch (family(u)) {
   case 'spirit': flip(b, u, 'dormant', 5); break;
   case 'cannon': flip(b, u, 'burnout', 6); break;
   case 'jade': grantGrowth(b, u, 3); u.qiGrowth = (u.qiGrowth || 0) + 3; persist(b, u); event(b, 'breakthrough', { unit: u }); if (u.id === 'jade' && u.qiGrowth >= 18) evolve(b, u, 'immortal'); interact(b, u.triggerSource || u, u, 'breakthrough', 'breakthrough, +3 permanent ATK');  break;
   case 'conduit': for (const v of allies(b, u)) { v.hasteUntil = b.time + 4 * mod(b.run, 'buffDuration'); interact(b, u, v, 'haste', '+15% team attack speed for 4s'); } fx(b, 'pulse', u, null, 'HASTE'); break;
   case 'mage': interact(b, u.triggerSource || u, u, 'chain', 'Chain Lightning released'); for (const e of living(b).slice(0, 5)) hit(b, u, e, 240 + rawAtk(u) * 3 + teamPower(b) * 1.5, false); for (const v of allies(b, u).filter(v => ['jade', 'conduit'].includes(family(v)) && !token(v))) { tick(b, v, 2, u); interact(b, u, v, 'spell-charge', 'spell → +2 progress'); } fx(b, 'pulse', u, null, 'CHAIN');  break;
   case 'eye': u.nextTrigger = b.time + 4; for (const e of living(b).slice(0, 2)) status(b, e, 'vulnerable', 4, .15, u); interact(b, u.triggerSource || u, u, 'warp', 'control gauge filled · Warp'); for (const e of living(b).slice(0, 2)) { trueHit(b, u, e, 150 + teamPower(b) * .75); warp(b, e, 4, u); fx(b, 'warp', u, e, (e.boss || e.champion) ? (e.enraged ? 'RESIST' : 'WARP −2') : 'WARP −4') } break;
   case 'lantern': u.nextTrigger = b.time + 2; for (const e of living(b)) hit(b, u, e, 45, false); interact(b, u, u, 'echo-burst', '10 Echoes → shockwave'); break;
   case 'weaver': u.nova = true; for (const e of living(b).slice(0, 4)) { hit(b, u, e, 180 + rawAtk(u) * 3 + teamPower(b), false); status(b, e, 'vulnerable', 4, .2, u); } u.nova = false; interact(b, u, u, 'nova', 'Rune Nova → four targets + Vulnerable'); break;
   case 'plasma': for (const e of living(b).slice(0, 3)) { hit(b, u, e, 100, false); dot(b, e, 'burn', 8, 4, u); } flip(b, u, 'overheat', 3); break;
   case 'behemoth': for (const e of living(b)) trueHit(b, u, e, 600 + teamPower(b) * 3); flip(b, u, 'burnout', 5); interact(b, u, u, 'quake', 'SIEGE QUAKE → 600 + 3× Team Power'); break;
   case 'core': u.nextTrigger = b.time + 6; for (const e of living(b)) { trueHit(b, u, e, 240 + teamPower(b) * 2); warp(b, e, 2.5, u); } interact(b, u, u, 'singularity', '8 critical hits → collapse'); break;
  }
 }

 function status(b, e, type, seconds, power = 0, source = null) {
  if (e.hp <= 0 || e.gone) return;
  if (e.boss || e.champion) { if (type === 'slow') power *= .5; if (type === 'stun' || type === 'freeze') { if (e.enraged) return; seconds *= .5 } }
  if (type === 'slow') { const previous = e.slows.find(s => s.power === power); if (previous) previous.until = Math.max(previous.until, b.time + seconds); else e.slows.push({ until: b.time + seconds, power }) }
  else if (type === 'stun' || type === 'freeze') e.frozenUntil = Math.max(e.frozenUntil, b.time + seconds);
  else if (type === 'burn') { if (source) dot(b, e, 'burn', power, seconds, source); else (e.burns ??= []).push({ until: b.time + seconds, dps: power }); return }
  else if (type === 'vulnerable') { e.vulnerableUntil = b.time + seconds; e.vulnerability = power; return }
  else if (type === 'bleed') { if (source) dot(b, e, 'bleed', power, seconds, source); else e.bleeds.push({ until: b.time + seconds, dps: power }); return }
  else return;
  b.statusEvents++; for (const u of b.units.filter(u => !u.removed && u.id === 'eye')) tick(b, u, 1, source)
 }

 function damage(b, e, n, source = null, channel = 'direct') {
  if (e.hp <= 0 || e.gone) return 0;
  if (e.ruleMarks) n *= (1 + e.ruleMarks * 0.08);
  const actual = Math.min(e.hp, Math.max(0, n));
  if (source) { const row = record(b, source); row.damage += actual; row[channel] += actual; }
  e.hp -= actual;
  if (e.hp <= 0) {
   e.hp = 0; if (e.champion) recordTrial(b, e, true); if ((e.maxProgress || e.p) >= 12) b.metrics.closeCalls = (b.metrics.closeCalls || 0) + 1;
   e.gone = true; b.metrics.kills++; b.run.stats.kills++;

   // Soul Banner captures souls track-wide on any enemy death
   for (const banner of b.units.filter(v => !v.removed && v.id === 'soulBanner')) {
    banner.souls = Math.min(100, (banner.souls || 0) + 1);
    persist(b, banner);
    if (banner.souls === 100 && !banner.soulMaxLogged) {
     banner.soulMaxLogged = true;
     
     fx(b, 'state', banner, null, 'SOULS 100/100');
    }
   }

   // Soul-Reaping Heavenly Demon perimeter detonation
   const demon = b.units.find(v => !v.removed && v.id === 'soulReapingDemon');
   if (demon) {
    const kp = track(e.p);
    for (const other of living(b)) {
     if (Math.hypot(track(other.p).x - kp.x, track(other.p).y - kp.y) <= 1.5) {
      damage(b, other, 160 * mod(b.run, 'damage'), demon, 'ability');
     }
    }
   }

   // Director of Curfew restores player health on kills
   const curfewDir = b.units.find(v => !v.removed && v.id === 'curfewDirector');
   if (curfewDir) {
    curfewDir.curfewKills = (curfewDir.curfewKills || 0) + 1;
    if (curfewDir.curfewKills % 5 === 0 && b.run.health < b.run.maxHealth) {
     b.run.health = Math.min(b.run.maxHealth, b.run.health + 1);
     interact(b, curfewDir, null, 'heal', 'Curfew Director: 5 kills → restore 1 HP');
     fx(b, 'growth', curfewDir, null, '+1 HP');
    }
   }

   if (e.rumorInfected) spreadRumor(b, e, true);

   event(b, 'kill', { source, bleedCarry: (e.bleeds || []).filter(d => d.until > b.time).map(d => ({ ...d })), bleeding: (e.bleeds || []).some(d => d.until > b.time), burning: (e.burns || []).some(d => d.until > b.time) });
   if (source) {
    record(b, source).kills++;
    if (source.lineage === 'tiger' && (lineageTierIds[source.id]?.tier || 0) >= 4) for (const runner of living(b)) status(b, runner, 'stun', 1.5, 0, source);
    if (!source.removed && !token(source)) {
     if (source.id === 'asura') grantGrowth(b, source, 1);
     if (source.id === 'demonBlade') {
      source.bladeKills = (source.bladeKills || 0) + 1;
      if (source.bladeKills % 10 === 0 && (source.demonAtkBonus || 0) < 30) {
       source.demonAtkBonus = (source.demonAtkBonus || 0) + 1;
       growth(b, source, 1);
       persist(b, source);
       interact(b, source, source, 'blood-edge', '+1 permanent ATK from 10 kills');
      }
     }

    }
   }
  }
  return actual;
 }

 function hit(b, u, e, n, normal = true) {
  if (e.hp <= 0 || e.gone) return;
  let torment = normal && !!support(b, 'totem');
  let critical = u.id === 'asura' && (e.shredUntil > b.time || e.nanoUntil > b.time) || rand(b.run) < crit(b, u);
  if (critical) {
   const tigerBleedCrit = u.lineage === 'tiger' && (lineageTierIds[u.id]?.tier || 0) >= 2 && (e.bleeds || []).some(d => d.until > b.time);
   const mannequinCritBonus = family(u) === 'mannequin' && (b.curfewUntil > b.time || allies(b, u).some(v => v.state !== 'active')) ? 1 : 0;
   n *= (tigerBleedCrit ? 3 : 2) + sensor(b, u) * .3 + mod(b.run, 'critDamage', 0) + mannequinCritBonus;
  }
  if (critical && u.id === 'nanite') { e.nanoUntil = b.time + 3; u.naniteCrits = (u.naniteCrits || 0) + 1; if (u.naniteCrits % 6 === 0) grantGrowth(b, u, 1); }
  if (critical && u.id === 'asura') { u.critCount = (u.critCount || 0) + 1; if (u.critCount % 6 === 0) grantGrowth(b, u, 1); }
  let defense = (u.id === 'railgun' ? 0 : e.defense) * (e.shredUntil > b.time ? .5 : e.nanoUntil > b.time ? .75 : 1);
  damage(b, e, n * (normal ? 1 : mod(b.run, 'damage')) * mod(b.run, (e.elite || e.boss || e.champion) ? 'eliteDamage' : 'normalDamage') * (1 - defense * (torment ? .75 : 1)) * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), u, normal ? 'direct' : 'ability');
  if (species(u) === 'flameToad') dot(b,e,'burn',3,3,u);
  if (species(u) === 'scuttler') status(b,e,'slow',2,.15,u);
  if (torment && e.hp > 0) { dot(b, e, 'bleed', 2, 4, u); const totem = support(b, 'totem'); interact(b, totem, u, 'torment', '25% armor penetration + 2 DPS Bleed for 4s'); }
  if (critical && sensor(b, u)) { const src = support(b, 'sensor'); interact(b, src, u, 'critical', 'amplified critical strike'); }
  if (critical && normal) for (const v of allies(b, u).filter(v => v.id === 'core')) tick(b, v, 1, u);
  fx(b, normal ? 'shot' : 'spell', u, e, critical ? 'CRIT' : '');
 }

 function chooseTarget(b, u) {
  let es = living(b);
  if (species(u) === 'hound') { let low = es.filter(e => e.hp / e.maxHp < .3); if (low.length) return low[0] }
  if (family(u) === 'kuchisake') { let fastest = [...es].sort((a, z) => z.speed - a.speed)[0]; if (fastest) return fastest; }
  if (u.id === 'executioner' || u.lineage === 'tiger' && (lineageTierIds[u.id]?.tier || 0) >= 3) { let elite = es.find(e => e.elite || e.boss || e.champion); if (elite) return elite }
  return es[0]
 }

 function attack(b, u) {
  const target = chooseTarget(b, u); if (!target) return false;
  u.attackCount++; record(b, u).attacks++; u.flash = .18; let power = atk(b, u);
  for (const v of allies(b, u)) {
   if (family(v) === 'spirit' && (v.state === 'dormant' || v.spiritBuffUntil > b.time)) interact(b, v, u, 'spirit-buff', 'Dormancy → +20% team damage');
   if (v.id === 'mantis' && v.overclock) interact(b, v, u, 'overclock-buff', 'Overclock → +15% team attack speed');
  }
  if (u.id === 'wraith' && (target.elite || target.boss || target.champion)) power *= 1.5;
  if (u.id === 'cannon') target.shredUntil = b.time + 2;

  if (family(u) === 'cub') {
   const path=u.lineage || 'dragon', tier=lineageTierIds[u.id]?.tier || 0;
   if(path==='dragon') {
    const targets=living(b), count=tier>=4?6:tier>=3?4:tier>=2&&u.attackCount%4===0?3:2, mult=tier>=2&&u.attackCount%4===0?2:1;
    for(const e of targets.slice(0,count)) hit(b,u,e,power*mult);
   }
   else if(path==='tiger') { const execute=tier>=3&&target.hp/target.maxHp<.4?3:1; hit(b,u,target,power*(tier>=4?4:1)*execute); if(tier>=2) dot(b,target,'bleed',3,4,u); }
   else if(path==='xuanwu') {
    hit(b,u,target,power); status(b,target,'slow',2,.2,u);
    if(tier>=2) venom(b,target,4,4,u);
    if(tier>=2&&u.attackCount%5===0) for(const e of living(b)) trueHit(b,u,e,120);
    if(tier>=3&&(target.swift||target.speedBoostUntil>b.time)){ trueHit(b,u,target,60); status(b,target,'stun',1,u); }
    if(tier>=4){ if(u.attackCount%2===0) warp(b,target,2,u); else venom(b,target,6,4,u); }
   }
   else if(path==='phoenix') {
    hit(b,u,target,power); dot(b,target,'burn',5,4,u);
    if(tier>=2) { const next=living(b).find(e=>e!==target); if(next){ dot(b,next,'burn',5,4,u); status(b,next,'vulnerable',3,.15,u); } status(b,target,'vulnerable',3,.15,u); }
    if(tier>=4) trueHit(b,u,target,power*.25);
   }
   else if(path==='monkey') {
    const targets=living(b), count=tier>=4?8:tier>=3?3:1;
    if(tier>=4) { for(const e of targets.slice(0,count)){ trueHit(b,u,e,power*1.5); e.auras=[]; e.speedBoostUntil=0; if(e.baseSpeed!=null)e.speed=e.baseSpeed; } }
    else for(const e of targets.slice(0,count)) hit(b,u,e,power);
    if(tier>=2&&!token(u)&&u.attackCount%6===0){ const clone=spawnToken(b,u,u.id,false,{lineage:path,lineageTier:tier,tokenAtk:rawAtk(u)*.5,attackInterval:u.attackInterval}); if(clone) interact(b,u,clone,'clone','Sixth strike → 50%-ATK temporary clone'); }
   }
   else hit(b,u,target,power);
  } else if (isPractitioner(u)) {
   u.qi = (u.qi || 0) + 1;
   updatePractitionerRealm(b, u);
   persist(b, u);
   const r = u.realm || 0;
   if (r === 0) { hit(b, u, target, power); }
   else if (r === 1) { for (const e of living(b).slice(0, 2)) hit(b, u, e, power); }
   else if (r === 2) {
    hit(b, u, target, power);
    const tp = track(target.p);
    for (const e of living(b).filter(e => e !== target && Math.hypot(track(e.p).x - tp.x, track(e.p).y - tp.y) <= 1.5)) {
     hit(b, u, e, power * 0.5);
    }
   }
   else if (r >= 3) {
    const top3 = living(b).sort((a, z) => z.hp - a.hp).slice(0, 3);
    for (const e of top3) hit(b, u, e, power);
   }
  }
  else if (u.id === 'flyingSword') { for (const e of living(b).slice(0, 2)) hit(b, u, e, power); }
  else if (u.id === 'guqin') { for (const e of living(b).slice(0, 3)) { hit(b, u, e, power); status(b, e, 'slow', 3, 0.25, u); } }
  else if (u.id === 'weiqiBoard') { hit(b, u, target, power); damage(b, target, 35, u, 'ability'); }
  else if (u.id === 'inkBrush') { hit(b, u, target, power); status(b, target, 'vulnerable', 4, 0.15, u); }
  else if (u.id === 'demonBlade') { hit(b, u, target, power); dot(b, target, 'bleed', 5, 4, u); }
  else if (u.id === 'swordImmortal') {
   hit(b, u, target, power);
   if (u.attackCount % 4 === 0) {
    for (const e of living(b)) trueHit(b, u, e, rawAtk(u));
    const highestHp = living(b).sort((a, z) => z.hp - a.hp)[0];
    if (highestHp) damage(b, highestHp, highestHp.hp * 0.3, u, 'ability');
    fx(b, 'beam', u, target, 'SWORD TORRENT');
    interact(b, u, u, 'sword-torrent', 'Ten-Thousand Sword Torrent: all 16 tiles + 30% HP strip');
   }
  }
  else if (u.id === 'melodicSaint') {
   for (const e of living(b)) {
    hit(b, u, e, power);
    status(b, e, 'slow', 2, 0.45, u);
    e.dissonance = (e.dissonance || 0) + 1;
    if (e.dissonance >= 5) {
     e.dissonance = 0;
     damage(b, e, 260 * mod(b.run, 'damage'), u, 'ability');
     status(b, e, 'stun', 1.5, 0, u);
    }
   }
  }
  else if (u.id === 'formationMaster') {
   hit(b, u, target, power);
   u.stoneToggle = !u.stoneToggle;
   if (u.stoneToggle) { warp(b, target, 3, u); }
   else { status(b, target, 'stun', 2, 0, u); damage(b, target, 400 * mod(b.run, 'damage'), u, 'ability'); }
  }
  else if (u.id === 'talismanSovereign') {
   hit(b, u, target, power);
   status(b, target, 'vulnerable', 3, 0.70, u);
   if (target.hp / target.maxHp < 0.15) { damage(b, target, target.hp, u, 'direct'); }
  }
  else if (u.id === 'soulReapingDemon') {
   for (const e of living(b).slice(0, 5)) { hit(b, u, e, power * 0.4); }
  }
  else if (u.id === 'bloodFiendMaster') {
   hit(b, u, target, power);
   if (u.attackCount % 4 === 0) {
    for (const e of living(b).slice(0, 4)) { hit(b, u, e, power * 2.8); dot(b, e, 'bleed', 50, 4, u); }
   }
  }
    else if (isUrbanInvestigator(u) || ['ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden'].includes(u.id)) {
   if (u.id === 'allSeeingOverseer') {
    for (const e of living(b)) {
     hit(b, u, e, power);
     addRuleMark(b, e, 1, u);
     if (e.speed > 0.32 || e.swift || e.enraged) {
      status(b, e, 'freeze', 2.0, 0, u);
     }
    }
    fx(b, 'beam', u, target, 'PANOPTICON');
   } else if (u.id === 'curfewDirector') {
    hit(b, u, target, power * ((target.ruleMarks || 0) > 0 ? 2.0 : 1.0));
    addRuleMark(b, target, 1, u);
   } else if (u.id === 'forensicDemiurge') {
    hit(b, u, target, power);
    dot(b, target, 'bleed', 50, 4, u);
    if (u.attackCount % 4 === 0 && (target.elite || target.boss || target.champion)) {
     damage(b, target, target.maxHp * 0.12, u, 'ability');
     fx(b, 'spell', u, target, '−12% MAX HP');
    }
   } else if (u.id === 'backroomsWarden') {
    for (const e of living(b).slice(0, 3)) {
     hit(b, u, e, power);
     addRuleMark(b, e, 1, u);
    }
    if (b.time >= (u.backroomsAt || 6)) {
     u.backroomsAt = b.time + 6;
     for (const e of living(b).slice(0, 3)) {
      dot(b, e, 'bleed', 150, 4.0 * mod(b.run, 'buffDuration'), u);
      warp(b, e, 6, u);
      fx(b, 'warp', u, e, 'BACKROOMS');
     }
    }
   }
   const r = urbanInvestigatorRealmForDread(u.dread || 0);
   if (u.id === 'ruleArchitect') {
    for (const e of living(b).slice(0, 4)) { trueHit(b, u, e, power); addRuleMark(b, e, 1, u); }
    if (u.attackCount % 4 === 0) {
     for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0)) { trueHit(b, u, e, 240 + teamPower(b) * 2); fx(b, 'curfew', u, e, 'DETONATE'); }
    }
   } else if (r === 0) {
    hit(b, u, target, power); addRuleMark(b, target, 1, u);
   } else if (r === 1) {
    for (const e of living(b).slice(0, 2)) { hit(b, u, e, power); addRuleMark(b, e, 1, u); }
   } else if (r === 2) {
    hit(b, u, target, power); addRuleMark(b, target, 1, u);
    for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0).slice(0, 3)) { hit(b, u, e, power * 2); }
   } else if (r >= 3) {
    const top3 = [...living(b)].sort((a, z) => z.hp - a.hp).slice(0, 3);
    for (const e of top3) { trueHit(b, u, e, power); addRuleMark(b, e, 1, u); }
   }
  }
  else if (family(u) === 'redRaincoat' || family(u) === 'stair13') {
   return false;
  }
  else if (family(u) === 'kuchisake') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   } else if (target.speed <= 0.30 && !target.panic && !(target.retreatingUntil > b.time) && (target.ruleMarks || 0) <= 0) {
    return false;
   }
   const marks = target.ruleMarks || 0;
   const mult = marks > 0 ? (u.id === 'slitMouthedSovereign' ? 3.5 : 2.0) : 1.0;
   hit(b, u, target, power * mult);
   const dps = u.id === 'slitMouthedSovereign' ? 35 : u.id === 'scissorBanshee' ? 15 : 5;
   dot(b, target, 'bleed', dps, 4, u);
   addRuleMark(b, target, 1, u);
   if (u.id === 'scissorBanshee') {
    const second = living(b).find(e => e !== target);
    if (second) hit(b, u, second, power * 0.5);
   }
   if (u.id === 'slitMouthedSovereign') {
    if (!target.boss && !target.champion && target.hp / target.maxHp < 0.15) {
     damage(b, target, target.hp, u, 'direct');
     fx(b, 'shot', u, target, 'EXECUTE');
    }
    if (u.attackCount % 6 === 0 && target.boss) {
     damage(b, target, target.hp * 0.10, u, 'ability');
     fx(b, 'spell', u, target, '−10% CURRENT HP');
    }
   }
  }
  else if (family(u) === 'nightBus') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   }
   for (const e of living(b).slice(0, u.id === 'terminusBus' ? 4 : 2)) {
    hit(b, u, e, power);
    addRuleMark(b, e, 1, u);
   }
  }
  else if (family(u) === 'payphone') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   }
   const ringEvery = u.id === 'midnightOperator' ? 2 : 3;
   if (inBlackout || u.attackCount % ringEvery === 0) {
    for (const e of living(b)) {
     hit(b, u, e, power * (u.id === 'midnightOperator' ? 1.5 : 1.0));
     if (u.id === 'midnightOperator' ? (e.panicUntil > b.time || e.panic) : (e.ruleMarks || 0) > 0) {
      status(b, e, 'stun', u.id === 'midnightOperator' ? 2.0 : 0.8, 0, u);
      grantUrbanViolation(b, u, 1);
     }
    }
    if (u.id === 'midnightOperator' && inBlackout) {
     b.curfewUntil += 1.5;
     b.blackoutLockoutUntil = b.curfewUntil + 8.0;
    }
    fx(b, 'pulse', u, null, 'REDIAL');
   } else {
    hit(b, u, target, power);
   }
  }
  else if (family(u) === 'morgueMirror') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   }
   hit(b, u, target, power);
   const adjAllies = neighbors(b, u, false);
   if (adjAllies.length) {
    const highestAdj = Math.max(...adjAllies.map(rawAtk));
    const bonusPct = u.id === 'mirrorQueen' ? 1.0 : u.id === 'doppelMirror' ? 0.5 : 0.25;
    damage(b, target, highestAdj * bonusPct, u, 'ability');
    if (u.id === 'mirrorQueen') {
     const cluster = living(b).filter(e => e !== target && (e.frozenUntil > b.time || (e.stuns || []).some(v => v.until > b.time)) && Math.abs(e.p - target.p) <= 2);
     for (const e of cluster) damage(b, e, highestAdj, u, 'ability');
    }
    if ((target.ruleMarks || 0) > 0 || inBlackout) grantUrbanViolation(b, u, 1);
   }
  }
  else if (u.id === 'chainLetter') {
   target.rumorInfected = true;
   target.rumorOwner = u.uid;
   hit(b, u, target, power);
   fx(b, 'spell', u, target, 'RUMOR');
  }
  else if (family(u) === 'mannequin') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   } else if (!allies(b, u).some(v => v.state !== 'active') && (target.ruleMarks || 0) <= 0) {
    return false;
   }
   const mult = u.id === 'livingTaboo' ? 3.0 : inBlackout ? 2.5 : 1.0;
   hit(b, u, target, power * mult);
   if (u.id === 'stalker') status(b, target, 'slow', 3, 0.30, u);
   if (u.id === 'livingTaboo' && target.p >= 14.5) {
    damage(b, target, target.hp, u, 'direct');
    fx(b, 'shot', u, target, 'AMBUSH');
   }
  }
  else if (u.id === 'bell') { let empowered = b.time - u.lastFlip <= 2; if (empowered) interact(b, u.lastFlipSource || u, u, 'bell', 'state change → empowered ring + stun'); for (const e of living(b)) { hit(b, u, e, power + (empowered ? 24 * mod(b.run, 'damage') : 0)); status(b, e, 'slow', 1.5, .25, u); if (empowered) status(b, e, 'stun', .75, 0, u) } }
  else if (u.id === 'railgun') { const has = sensor(b, u); if (has) interact(b, support(b, 'sensor'), u, 'railgun', 'Sensor → five-target volley + knockback'); for (const e of living(b).slice(0, has ? 5 : 3)) { hit(b, u, e, power); if (has) warp(b, e, 1, u) } fx(b, 'beam', u, target, ''); }
  else if (['immortal', 'bellows', 'reaper'].includes(u.id)) { for (const [targetIndex, e] of living(b).slice(0, u.id === 'immortal' || u.id === 'bellows' ? 3 : 2).entries()) { let n = power * (u.id === 'immortal' && targetIndex > 0 ? .55 : 1); u.detonating = u.id === 'reaper' && e.bleeds.filter(d => d.until > b.time).length >= 4; if (u.detonating) { const burst = e.bleeds.reduce((sum, d) => sum + d.dps * Math.max(0, d.until - b.time), 0); e.bleeds = []; n *= 3; damage(b, e, burst * 1.5 * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), u, 'ability'); } hit(b, u, e, n); u.detonating = false; if (u.id === 'reaper') dot(b, e, 'bleed', 5, 4, u); if (u.id === 'bellows') dot(b, e, 'burn', 5, 4, u); } }
  else if (u.id === 'executioner') { let n = power; if (target.hp / target.maxHp < .35) n *= 4; else if (target.shredUntil > b.time || target.nanoUntil > b.time || [...(target.bleeds || []), ...(target.burns || [])].some(d => d.until > b.time)) n *= 2; hit(b, u, target, n); const second = living(b).find(e => e !== target); if (second) hit(b, u, second, power * .5); }
  else if (u.id === 'matriarch') { for (const e of living(b).slice(0, 3)) { hit(b, u, e, power); dot(b, e, 'bleed', 6, 4, u); } }
  else if (u.id === 'behemoth') { const p = target.p; hit(b, u, target, power); for (const e of living(b).filter(e => e !== target && Math.abs(e.p - p) <= 1)) hit(b, u, e, power * .5); }
  else {
   if (species(u) === 'hound' && target.hp / target.maxHp < .3) power *= 2;
   if (u.id === 'executioner') { if (target.hp / target.maxHp < .25) power *= 4; else if (target.shredUntil > b.time || target.nanoUntil > b.time || [...(target.bleeds || []), ...(target.burns || [])].some(d => d.until > b.time)) power *= 2; }
   if (u.id === 'leech' && [...(target.bleeds || []), ...(target.burns || [])].some(d => d.until > b.time)) power *= 2.5;
   if (species(u) === 'larva' && u.attackCount % 5 === 0) power *= 2;
   hit(b, u, target, power);
   if (u.id === 'matriarch') dot(b, target, 'bleed', 6, 4, u);
   if (u.id === 'asura') dot(b, target, 'bleed', 6, 4, u);
   if (species(u) === 'larva') status(b, target, 'slow', 3, .2, u);
   if (species(u) === 'mass') status(b, target, 'slow', 2, .2, u);
  }

  for (const v of b.units.filter(v => !v.removed && v !== u)) { v.onAdjacentAttack(u) }
  if (!token(u) && u.upgradePath === 'storm' && u.attackCount % 6 === 0) { for (const e of living(b).slice(0, 3)) trueHit(b, u, e, rawAtk(u)); interact(b, u, u, 'branch', 'Storm path → three-target burst'); }
  if (['mage', 'eye'].includes(u.id)) tick(b, u, 1);
  if (family(u) === 'spirit') tick(b, u, 1);
  if (['cannon', 'plasma', 'behemoth', 'weaver'].includes(u.id)) tick(b, u, 1);
  flushEvents(b); return true;
 }

 function trialFor(n) { if (!n || !['battle', 'elite'].includes(n.type)) return null; return ({ 5: { hp: 1800, leak: 10 }, 9: { hp: 4200, leak: 14 }, 13: { hp: 7000, leak: 18 } })[n.row] || null }
 function spreadRumor(b, source, onDeath = false) {
  if (!source.rumorInfected || (!onDeath && source.rumorContactSpread)) return;
  const target = living(b).find(e => e !== source && !e.rumorInfected && Math.min(Math.abs(e.p - source.p), 16 - Math.abs(e.p - source.p)) <= (onDeath ? 1.5 : .45));
  if (!onDeath && !target) return;
  if (!onDeath) source.rumorContactSpread = true;
  for (const legend of b.units.filter(v => !v.removed && !token(v) && isUrbanLegend(v))) {
   legend.violations = (legend.violations || 0) + 1;
   updateUrbanLegendLineage(b, legend);
   persist(b, legend);
  }
  if (target) {
   target.rumorInfected = true;
   target.rumorOwner = source.rumorOwner;
   const owner = b.units.find(u => u.uid === source.rumorOwner);
   if (owner) trueHit(b, owner, target, 20);
  }
  fx(b, 'spell', null, source, 'RUMOR SPREAD');
 }

 function wavePlan(r) {
  let d = r.depth, elite = r.node.type === 'elite', boss = r.node.type === 'boss';
  const encounter = encounterFor(r.node);
  const plan = { encounter: encounter?.id || null, count: d === 0 ? 5 : boss ? 42 : Math.min(36, 10 + d * 2), interval: d === 0 ? 2.5 : boss ? 1.4 : Math.max(1.5, 2.3 - d * .045), hp: d === 0 ? 9 : Math.round((17 + d * 8 + d * d * 1.5) * 1.8 * (1 + Math.max(0, d - 3) * .02) * (elite ? 1.25 : 1)), speed: boss ? .31 : elite ? .34 : .3, bossHp: 11000, trial: trialFor(r.node) };
  if (d > 0 && !boss) { plan.hp = Math.round(plan.hp * (1.12 + Math.min(d, 10) * .035)); plan.speed *= 1.12; }
  if (encounter?.id === 'packs') { plan.count = Math.ceil(plan.count * 1.5); plan.hp = Math.round(plan.hp * .62) }
  if (encounter?.id === 'armor') { plan.count = Math.ceil(plan.count * .8); plan.hp = Math.round(plan.hp * .85) }
  if (encounter?.id === 'fast') { plan.count = Math.ceil(plan.count * .9); plan.hp = Math.round(plan.hp * .75) }
  return plan;
 }
 function spawn(b) {
  let plan = b.plan, idx = b.spawned, boss = b.run.node.type === 'boss' && idx === plan.count - 1, champion = !!plan.trial && idx === plan.count - 1, elite = !boss && !champion && (b.run.node.type === 'elite' && idx % 4 === 0), armored = !boss && !champion && !elite && (plan.encounter === 'armor' ? idx % 3 !== 2 : !plan.encounter && b.run.depth > 3 && idx % 5 === 3), swift = !boss && !champion && !elite && !armored && (plan.encounter === 'fast' ? idx % 3 !== 2 : !plan.encounter && b.run.depth > 1 && idx % 4 === 2), hp = boss ? plan.bossHp : champion ? plan.trial.hp : plan.hp * (elite ? 2 : armored ? 1.45 : 1);
  const newEnemy = { uid: ++b.enemyUid, p: 0, hp, maxHp: hp, speed: (champion ? .31 : plan.speed) * (boss ? .95 : swift ? 1.6 : armored ? .85 : 1), leak: boss ? b.run.maxHealth : champion ? plan.trial.leak : elite ? 6 : armored ? 3 : 2, defense: armored ? .4 : elite ? .25 : (boss || champion) ? .2 : 0, boss, champion, maxProgress: 0, elite, armored, swift, bornAt: b.time, enraged: false, gone: false, panic: false, panicUntil: 0, retreatingUntil: 0, slows: [], frozenUntil: 0, shredUntil: 0, bleeds: [], burns: [], venoms: [], vulnerableUntil: 0, vulnerability: 0, auras: [] };
  b.enemies.push(newEnemy);
  const architect = b.units.find(v => !v.removed && v.id === 'ruleArchitect');
  if (architect) addRuleMark(b, newEnemy, 2, architect);
  b.spawned++;
 }

 function step(b, dt) {
  if (b.done) return; dt = Math.min(.1, dt); b.time += dt;
  if (b.spawned < b.plan.count && b.time >= b.spawnAt) { spawn(b); b.spawnAt += b.plan.encounter === 'packs' ? (b.spawned % 3 === 0 ? b.plan.interval * 2 : .18) : b.plan.interval }
  for (const u of b.units.filter(u => !u.removed)) {
   if (u.removed) continue; u.flash = Math.max(0, u.flash - dt); extras(b, u, dt); flushEvents(b); if (u.removed) continue;
   if (u.state !== 'active') { u.stateRemaining -= dt; if (u.stateRemaining <= 0) flip(b, u, 'active'); else continue }
   if (u.id === 'mantis') { if (u.overclock) { u.clockRemaining -= dt; if (u.clockRemaining <= 0) { grantGrowth(b, u, 1); u.cycle = 0; flip(b, u, 'overheat', 3); continue } } else { u.cycle += dt; u.threshold.current = u.cycle; if (u.cycle >= 10) { u.overclock = true; u.clockRemaining = 5 * mod(b.run, 'buffDuration'); for (const v of allies(b, u)) v.onAdjacentStateFlip(u); fx(b, 'state', u, null, 'OVERCLOCK') } } }
   if (u.id === 'herb' && b.time >= u.sacrificeAt && herbOffering(b, u)) continue;
   if (u.id === 'herb' && b.time >= u.herbAt) { u.herbAt = b.time + 12; teamCharge(b, u, 3); }
   if (u.id === 'vent' && support(b, 'vent') === u && b.time >= u.ventAt) { u.ventAt = b.time + 8; for (const e of living(b).slice(0, 2)) status(b, e, 'freeze', (e.burns || []).some(d => d.until > b.time) ? 2 : 1, 0, u); fx(b, 'pulse', u, null, 'FREEZE') }
   if (u.attackInterval > 0) { u.currentCooldown -= dt; let guard = 0; while (u.currentCooldown <= 0 && u.state === 'active' && guard++ < 5) { if (!attack(b, u)) { u.currentCooldown = .05; break } u.currentCooldown += u.attackInterval / speed(b, u) } }
  }
  for (const e of living(b)) {
   if ((e.boss || e.champion) && !e.enraged && b.time - e.bornAt >= 45) { e.enraged = true; e.frozenUntil = 0;  }
   e.bleeds = e.bleeds.filter(z => z.until > b.time); e.burns = (e.burns || []).filter(z => z.until > b.time); e.venoms = (e.venoms || []).filter(z => z.until > b.time); for (const dot of [...e.bleeds, ...e.burns, ...e.venoms]) damage(b, e, dot.dps * dt * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), b.units.find(u => u.uid === dot.owner) || null, 'dot'); if (e.gone) continue;
   e.slows = e.slows.filter(s => s.until > b.time); e.panic = e.panicUntil > b.time; let aura = b.units.some(v => !v.removed && v.id === 'wraith') ? ((e.boss || e.champion) ? .15 : .3) : 0; let slow = Math.max(aura, ...e.slows.map(s => s.power)), move = e.frozenUntil > b.time ? 0 : 1 - slow;
   if (b.curfewUntil > b.time) move *= 0.75;
   const previousProgress = e.p, wasRetreating = e.retreatingUntil > b.time;
   e.p += e.speed * dt * move * (e.enraged ? 1.25 : 1) * (b.run.relics.includes('frost') ? .9 : 1);
   if (wasRetreating) e.p -= e.speed * dt * move * (e.enraged ? 1.25 : 1) * (b.run.relics.includes('frost') ? .9 : 1) * 2;
   if (!wasRetreating && e.p > previousProgress) triggerStairTraps(b, e, previousProgress, e.p);
   triggerRedRaincoatTraps(b, e, previousProgress, e.p, wasRetreating);
   e.maxProgress = Math.max(e.maxProgress || 0, e.p); if (e.p >= 16) {
    if (e.champion) recordTrial(b, e, false);
    if (b.units.some(v => !v.removed && v.id === 'ruleArchitect') && !b.room404Saved) {
     b.room404Saved = true; e.gone = true;
     interact(b, null, e, 'room404', 'Room 404 trapped the runner · leak prevented');
     fx(b, 'warp', null, e, 'PHÒNG 404');
     continue;
    }
    const guardian=b.units.find(v=>!v.removed&&v.lineage==='xuanwu'&&(lineageTierIds[v.id]?.tier||0)>=4&&(v.savedLeaks||0)<2);
    if (guardian) { guardian.savedLeaks=(guardian.savedLeaks||0)+1; e.gone=true; interact(b,guardian,e,'save',`Xuanwu prevents leak ${guardian.savedLeaks}/2`); continue; }
    e.gone = true;
    const leakLoss=e.boss ? b.run.maxHealth : Math.max(1, e.leak + mod(b.run, 'leak', 0) - (b.run.relics.includes('mercy') ? 1 : 0));
    b.run.health = Math.max(0, b.run.health - leakLoss); b.metrics.leaks++; b.run.stats.leaks++;
    b.metrics.leakTypes ??= {}; const leakType = e.boss ? 'boss' : e.champion ? 'harbinger' : e.elite ? 'elite' : e.armored ? 'armored' : e.swift ? 'fast' : 'normal'; b.metrics.leakTypes[leakType] = (b.metrics.leakTypes[leakType] || 0) + 1; fx(b, 'leak', null, e, `−${leakLoss}`);
    if (b.run.health <= 0) { const phoenix=b.units.find(v=>!v.removed&&v.lineage==='phoenix'&&(lineageTierIds[v.id]?.tier||0)>=4); if(phoenix&&!b.run.phoenixRevived){b.run.phoenixRevived=true;b.run.health=1;interact(b,phoenix,e,'revive','Phoenix revival → restore 1 HP');}else{finish(b,false);break} }
   }
  }
  for (const e of living(b)) spreadRumor(b, e);
  flushEvents(b); b.effects.forEach(e => e.ttl -= dt); b.effects = b.effects.filter(e => e.ttl > 0); b.enemies = b.enemies.filter(e => !e.gone);
  if (!b.done && b.spawned >= b.plan.count && living(b).length === 0) finish(b, true);
 }

 function recordTrial(b, e, killed) { const result = { stage: b.run.depth + 1, killed, hpRemaining: Math.round(e.hp), maxHp: e.maxHp, progress: Math.min(16, e.maxProgress || e.p), seconds: Math.round(b.time - e.bornAt) }; b.metrics.trial = result; }
 function finish(b, won) {
  if (b.done) return;
  b.done = true; b.won = won; let r = b.run;
  const coinsEarned = r.node?.type === 'boss' ? 500 : r.node?.type === 'elite' ? 200 : 100;
  r.coins = (r.coins || 0) + coinsEarned; b.metrics.coinsEarned = coinsEarned;
  for (const u of b.units.filter(u => !u.phantom)) {
   let src = r.roster.find(v => v.uid === u.uid); if (!src) continue;
   persist(b, u); src.threshold = abilityGauge(u) ? u.threshold.current : 0; src.naniteCrits = u.naniteCrits || 0; src.critCount = u.critCount || 0
  }
  r.recap = { ...b.metrics, time: b.time, ...report(b) };
  r.battleHistory ??= []; r.battleHistory.push({ stage: r.depth + 1, leaks: b.metrics.leaks, closeCalls: b.metrics.closeCalls || 0, trial: b.metrics.trial || null });
  r.battleHistory = r.battleHistory.slice(-16);
  if (won) {
   r.cleared++; if (r.node.type === 'elite') { let options = D.RELICS.filter(v => !r.relics.includes(v.id)); if (options.length) { let item = options[Math.floor(rand(r) * options.length)]; addRelic(r, item.id); r.recap.relic = item.name } }
   reward(r)
  } else r.phase = 'lost';
 }
 function favored(b, u) { return ['herald', 'alchemist', 'harvester'].includes(family(u)) ? neighbors(b, u).some(v => preyEligible(u, v)) : card(u.id).fav === 'neighbor' && neighbors(b, u).length > 0 }

 const family = u => card(u.id).evolvedFrom || u.id;
 const cultivationRealmIds = ['practitioner', 'cultivationFoundation', 'cultivationGoldenCore', 'cultivationNascentSoul'];
 const isPractitioner = u => family(u) === 'practitioner' && !APEX_FORMS.includes(u.id);
 const token = u => !!(u.phantom || u.token || card(u.id)?.token);
 const abilityGauge = u => ['jade', 'conduit', 'mage', 'eye', 'lantern', 'weaver', 'core'].includes(family(u));
 function persist(b, u) {
  if (token(u)) return;
  const src = b.run.roster.find(v => v.uid === u.uid);
  if (src) {
   for (const k of ['id', 'permanentAtkBonus', 'permanentSpeed', 'upgradePath', 'lineage', 'lineageStacks', 'meals', 'qiGrowth', 'returns', 'witnesses', 'qi', 'realm', 'swordQi', 'apexQi', 'apexDread', 'souls', 'bladeKills', 'demonAtkBonus', 'dread', 'violations', 'blackouts']) {
    if (u[k] !== undefined) src[k] = u[k];
   }
  }
 }

 function event(b, type, data) { (b.events ??= []).push({ type, ...data }); }
 function flushEvents(b) {
  if (b.processingEvents) return; b.processingEvents = true; let count = 0;
  try {
   while (b.events?.length) {
    if (++count > 2000) throw Error('Combat event cycle exceeded limit');
    const ev = b.events.shift();
    if (ev.type === 'consumed' && species(ev.unit) === 'lamb') { for (const e of living(b).slice(0, 3)) trueHit(b, ev.unit, e, 80 + rawAtk(ev.unit) * 2); interact(b, ev.unit, ev.consumer, 'soulflare', 'Lamb sacrifice → three-target Soulflare'); }
    for (const u of [...b.units].filter(v => !v.removed && !token(v))) {
     if (['mage', 'weaver'].includes(u.id) && ev.type === 'gauge' && ev.unit !== u && !['mage', 'weaver'].includes(family(ev.unit)) && b.time >= (u.resonanceAt || 0)) { u.resonanceAt = b.time + 1; tick(b, u, 2, ev.unit); interact(b, ev.unit, u, 'resonance', 'RESONANCE → +2 spell charge'); }
     if (u.id === 'behemoth' && ev.type === 'shutdown' && ev.unit !== u && b.time >= (u.siegeAt || 0)) { u.siegeAt = b.time + 1; tick(b, u, 3, ev.unit); interact(b, ev.unit, u, 'siege-charge', 'shutdown → +3 siege charge'); }
     if (u.id === 'herald' && ev.type === 'displaced' && ev.source?.id !== 'herald') { u.madnessPower = (u.madnessPower || 0) + ev.tiles * 30; interact(b, ev.source, u, 'madness-feed', 'displacement → stored Madness damage'); }
     if (u.id === 'herald' && ev.type === 'consumed') { u.madnessPower = (u.madnessPower || 0) + 100; interact(b, ev.consumer, u, 'madness-feed', 'consumption → +100 next Madness damage'); }
     if (u.id === 'reaper' && support(b, 'reaper') === u && ev.type === 'kill' && ev.bleedCarry?.length) { const e = living(b)[0]; if (e) { e.bleeds.push(...ev.bleedCarry.filter(d => d.until > b.time).map(d => ({ ...d }))); interact(b, u, u, 'bleed-inheritance', 'BLEED INHERITANCE → surviving runner; expiry preserved'); } }
     if (u.id === 'broodkeeper' && support(b, 'broodkeeper') === u && ev.type === 'consumed' && BLOODLINE_FODDER.includes(species(ev.unit)) && rand(b.run) < .35) { const preySpecies = species(ev.unit), offspring = breedCopy[preySpecies] || preyToken[preySpecies]; const v = spawnToken(b, u, offspring, false, { origin: preySpecies, tokenAtk: rawAtk(ev.unit), attackInterval: ev.unit.attackInterval }); if (v) interact(b, u, v, 'recycle', `35% global recall → ${card(preySpecies).name} token; original stays deleted`); }
     if (ev.type === 'consumed' && species(ev.unit) === 'lamb' && u === support(b, 'lantern')) { tick(b, u, 3, ev.unit); interact(b, ev.unit, u, 'soul', 'Mourning Lamb → +3 Echoes'); }
     if (u.id === 'soulwell' && ev.type === 'consumed') { const haunted = card(species(ev.unit))?.genre === 'Haunted'; for (const e of living(b).slice(0, 3)) trueHit(b, u, e, haunted ? 300 + teamPower(b) : 80 + teamPower(b) * .5); interact(b, ev.unit, u, 'soul-payoff', haunted ? 'HAUNTED HARVEST → greater soul missiles' : 'foreign loss → soul missiles'); }
     if (u.id === 'lantern' && (ev.type === 'kill' || ev.type === 'shutdown' && ev.unit !== u)) tick(b, u, 1, ev.source || ev.unit);
     if (u.id === 'cauldron' && support(b, 'cauldron') === u && ['consumed', 'breakthrough', 'refined'].includes(ev.type) && ev.unit !== u && b.time >= (u.elixirAt || 0)) { u.elixirs = (u.elixirs || 0) + 1; u.elixirAt = b.time + 8; for (const v of b.units.filter(v => !v.removed)) growth(b, v, 1); b.run.health = Math.min(b.run.maxHealth, b.run.health + 1); interact(b, u, ev.consumer || ev.unit, 'elixir', 'Elixir: +1 team ATK, heal 1 HP; 8s cooldown'); }
     if (u.id === 'altar' && support(b, 'altar') === u && (ev.type === 'consumed' || ev.type === 'kill' && ev.bleeding)) for (const v of neighbors(b, u).filter(v => !token(v))) if (grantGrowth(b, v, 1)) interact(b, u, v, 'altar', 'ritual → +1 permanent ATK');
     if (u.id === 'monk' && ev.type === 'consumed' && !token(ev.unit) && ev.unit !== u) { u.witnesses = (u.witnesses || 0) + 1; u.threshold.current = u.witnesses; persist(b, u); if (u.witnesses >= 3) evolve(b, u, 'asura'); }
     if (u.id === 'medium' && !u.pendingEcho && b.time >= (u.echoAt || 0) && ev.unit !== u && !token(ev.unit || {}) && (ev.type === 'consumed' || ev.type === 'shutdown' && ev.state === 'dormant')) { u.echoUsed = true; u.echoAt = b.time + 10; u.pendingEcho = { atk: Math.max(0, rawAtk(ev.unit)), origin: family(ev.unit) }; }
     if (u.id === 'smelter' && support(b, 'smelter') === u && ev.type === 'kill' && ev.burning) { u.scrap = (u.scrap || 0) + 1; if (u.scrap >= 5) { u.scrap -= 5; for (const v of allies(b, u).filter(v => ['spirit', 'cannon', 'mantis', 'plasma', 'behemoth'].includes(family(v)))) if (grantGrowth(b, v, 1)) interact(b, u, v, 'burn-forge', 'five Burn deaths → +1 permanent ATK'); } }
     if (u.id === 'bellows' && support(b, 'bellows') === u && ev.type === 'shutdown' && ev.state === 'burnout' && b.time >= (u.detonateAt || 0)) { u.detonateAt = b.time + 3; for (const e of living(b)) for (const dot of [...(e.burns || [])].filter(d => d.until > b.time)) damage(b, e, dot.dps * Math.min(1, dot.until - b.time) * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), b.units.find(v => v.uid === dot.owner) || u, 'dot'); interact(b, ev.unit, u, 'burn-detonation', 'Burnout → detonate one second of Burn'); }
    }
   }
  } finally { b.processingEvents = false }
 }

 function evolve(b, u, id) {
  if (token(u) || u.removed || u.id === id) return;
  const before = u.id, d = card(id);
  if (isCultivationApex({ id }) && !isCultivationApex(u)) u.apexQi = 0;
  if (isUrbanAuthority({ id }) && !isUrbanAuthority(u)) u.apexDread = 0;
  u.id = id; u.name = d.name; u.genre = d.genre; u.baseAtk = d.baseAtk; u.attackInterval = d.attackInterval;
  u.threshold = { current: 0, max: d.max || 0, onTrigger: () => trigger(b, u) };
  prepareHooks(b, u); persist(b, u); record(b, u).id = id;
  (b.metrics.evolutions ??= []).push({ uid: u.uid, from: before, to: id, time: b.time });
  interact(b, u, u, 'evolution', `EVOLUTION · ${card(before).name} → ${d.name}`);
  
  fx(b, 'growth', u, null, 'EVOLVED');
 }

 function evolutionProgress(u) { switch (family(u)) { case 'jade': return { current: u.qiGrowth || 0, max: 18 }; case 'cub': return { current: u.lineageStacks || 0, max: 6 }; case 'spirit': return { current: u.returns || 0, max: 5 }; case 'monk': return { current: u.witnesses || 0, max: 3 };
   case 'investigator': {
    const dread = u.dread || 0;
    if (dread >= 140) return { current: 140, max: 140, label: 'Ready for Rule Binding' };
    if (dread >= 70) return { current: dread, max: 140 };
    if (dread >= 25) return { current: dread, max: 70 };
    return { current: dread, max: 25 };
   }
   case 'kuchisake': case 'nightBus': case 'payphone': case 'morgueMirror': {
    const v = u.violations || 0;
    if (v >= 45) return { current: 45, max: 45, label: 'Mythic Apex Achieved' };
    if (v >= 15) return { current: v, max: 45 };
    return { current: v, max: 15 };
   } default: return null } }
 const species = u => token(u) ? (u.origin || card(u.id).species) : family(u);
 function preyEligible(predator, prey) { if (prey.removed || predator === prey) return false; const diets = { cub: ['serpentFodder','hound','scuttler','flameToad','peachFodder'], herald: ['mass', 'larva'], alchemist: ['lotus', 'herb'], harvester: ['lamb'] }; return card(predator.id).genre === card(species(prey))?.genre && (diets[family(predator)] || []).includes(species(prey)); }
 function consume(b, consumer, victim, reason = 'Devour', reward = 0) {
  if (consumer.removed || victim.removed || consumer === victim) return false;
  const isToken = token(victim); victim.removed = true;
  if (!isToken) { b.run.roster = b.run.roster.filter(v => v.uid !== victim.uid); (b.run.devoured ??= []).push({ uid: victim.uid, id: victim.id, depth: b.run.depth, reason }); }
  const before = consumer.permanentAtkBonus; growth(b, consumer, reward);
  if (reason === 'Devour') b.metrics.devours++;
  const item = { uid: victim.uid, id: victim.id, slot: victim.slot, by: consumer.id, byUid: consumer.uid, toSlot: consumer.slot, bonus: consumer.permanentAtkBonus - before, reason, token: isToken, permanent: !isToken };
  (b.metrics.consumed ??= []).push(item);
  interact(b, victim, consumer, 'devour', `${isToken ? 'TOKEN CONSUMED · parent safe' : 'ORIGINAL PERMANENTLY LOST'}; +${item.bonus} ATK`);
  
  event(b, 'consumed', { unit: victim, consumer, reason });
  return true;
 }

 function devour(b, u) {
  if (u.removed || token(u)) return false;
  const prey = neighbors(b, u).filter(v => preyEligible(u, v)).sort((a, z) => Number(token(z)) - Number(token(a)) || rawAtk(a) - rawAtk(z) || a.slot - z.slot)[0];
  if (!prey) return false;
  const mealSpecies = species(prey), mealPath = family(u) === 'cub' ? cubPathForPrey[mealSpecies] : null;
  if (family(u) === 'cub' && !u.lineage && mealPath) u.lineage = mealPath;
  const matchingMeal = family(u) === 'cub' && !!mealPath && mealPath === u.lineage;
  const reward = family(u) === 'cub' ? (matchingMeal ? 4 : 3) : u.id === 'alchemist' ? 3 : u.id === 'harvester' ? 6 : 10;
  const reason = u.id === 'harvester' ? 'Sacrifice' : u.id === 'alchemist' ? 'Refinement' : 'Devour';
  consume(b, u, prey, reason, reward);
  if (u.id === 'alchemist') { teamCharge(b, u, 3); event(b, 'refined', { unit: u }); }
  if (u.id === 'harvester') for (const e of living(b).slice(0, 3)) trueHit(b, u, e, rawAtk(u) * 2);
  if (family(u) === 'cub') {
   u.meals = (u.meals || 0) + 1;
   if (matchingMeal) u.lineageStacks = (u.lineageStacks || 0) + 1;
   const tier = lineageTierIds[u.id]?.tier || 0, nextTier = Math.min(3, Math.floor((u.lineageStacks || 0) / 2));
   if (nextTier > tier) evolve(b, u, cubForms[u.lineage][nextTier - 1]);
   persist(b, u);
  } else if (u.id === 'herald') u.madnessAt = Math.max((u.lastMadness ?? -4) + 4, (u.madnessAt ?? b.time + 8) - 4);
  flushEvents(b); return true;
 }

 function spawnToken(b, parent, id, adjacentOnly = false, extra = {}) {
  if (parent.removed) return null;
  let free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(slot => !b.units.some(v => !v.removed && v.slot === slot) && (!adjacentOnly || adjacent(parent, xy(slot)))).sort((a, z) => { const x = xy(a), y = xy(z); return Math.abs(x.x - parent.x) + Math.abs(x.y - parent.y) - Math.abs(y.x - parent.x) - Math.abs(y.y - parent.y) || a - z });
  if (!free.length) return null;
  const v = runtime(b, { uid: `token-${++b.tokenSeq || (b.tokenSeq = 1)}`, id, permanentAtkBonus: 0, threshold: 0 }, free[0], true);
  v.parentUid = parent.uid; v.origin = species(parent); v.token = true; v.scale = 1; v.tokenAtk = rawAtk(parent); v.attackInterval = parent.attackInterval; v.breedAt = b.time + 1;
  Object.assign(v, extra); prepareHooks(b, v); b.units.push(v); record(b, v); interact(b, parent, v, 'summon', 'summoned disposable token'); return v;
 }
 const BLOODLINE_FODDER = ['serpentFodder','hound','scuttler','flameToad','peachFodder'];
 const preyToken = { lotus: 'petal', lotusRoot: 'lotusBlossom', hound: 'houndToken', serpentFodder: 'scaleImp', scuttler: 'carapaceToken', flameToad: 'emberToken', peachFodder: 'peachToken', lamb: 'lambToken' };
 const breedCopy = { hound: 'hound', serpentFodder: 'serpentFodder', scuttler: 'scuttler', flameToad: 'flameToad', peachFodder: 'peachFodder' };
 const cubPathForPrey = { serpentFodder:'dragon', hound:'tiger', scuttler:'xuanwu', flameToad:'phoenix', peachFodder:'monkey' };
 const cubForms = { dragon:['dragonCubT1','dragonCubT2','dragonCubT3','dragonCubApex'], tiger:['tigerCubT1','tigerCubT2','tigerCubT3','tigerCubApex'], xuanwu:['xuanwuCubT1','xuanwuCubT2','xuanwuCubT3','xuanwuCubApex'], phoenix:['phoenixCubT1','phoenixCubT2','phoenixCubT3','phoenixCubApex'], monkey:['monkeyCubT1','monkeyCubT2','monkeyCubT3','monkeyCubApex'] };
 const cubRelics = { dragon:'dragonPearl', tiger:'tigerSeal', xuanwu:'earthTablet', phoenix:'phoenixTree', monkey:'goldenStaff' };
 const lineageTierIds = Object.fromEntries(Object.entries(cubForms).flatMap(([path,ids])=>ids.map((id,i)=>[id,{path,tier:i+1}])));
 function summon(b, u) {
  if (token(u) || u.id === 'hound') return;
  // Explicit summon abilities keep their named token; bred Bloodline fodder uses its own card identity.
  const id = preyToken[species(u)]; if (id) return spawnToken(b, u, id, true);
  if (u.id === 'shepherd') return spawnToken(b, u, 'lambToken', false, { origin: 'lamb', tokenAtk: card('lamb').baseAtk, attackInterval: card('lamb').attackInterval });
 }
 function breed(b, u) {
  const kind = species(u), offspring = breedCopy[kind] || preyToken[kind]; if (!offspring || b.time < (u.breedAt || 1)) return; u.breedAt = b.time + 1;
  if (!neighbors(b, u).some(v => species(v) === kind)) return;
  if (![0, 1, 2, 3, 4, 5, 6, 7, 8].some(slot => !b.units.some(v => !v.removed && v.slot === slot) && adjacent(u, xy(slot)))) return;
  (b.metrics.breedingChecks ??= 0); b.metrics.breedingChecks++;
  if (rand(b.run) < .1) spawnToken(b, u, offspring, true);
 }
 function workshopOptions(r, uid) {
  const u = r.roster.find(v => String(v.uid) === String(uid)); if (!u) return [];
  if (card(u.id).evolveTo && !u.upgradePath) return [{ id: 'might', name: 'Might awakening', desc: 'Evolve now; +12 permanent ATK.' }, { id: 'flow', name: 'Flow awakening', desc: 'Evolve now; +20% permanent attack speed.' }, { id: 'storm', name: 'Storm awakening', desc: 'Evolve now; every sixth attack strikes 3 runners for unbuffed ATK as true damage.' }];
  return [{ id: 'power', name: 'Strength', desc: '+8 permanent ATK.' }, { id: 'tempo', name: 'Tempo', desc: '+10% permanent attack speed.' }, { id: 'resonance', name: 'Resonance', desc: 'Every 6s, grant other allies +1 ability progress.' }];
 }
 function upgrade(r, uid, choice) {
  if (r.phase !== 'event' || r.node?.type !== 'workshop' || r.health <= 10) return false;
  const u = r.roster.find(v => String(v.uid) === String(uid)); if (!u || !workshopOptions(r, uid).some(v => v.id === choice)) return false;
  r.health -= 10;
  if (['might', 'flow', 'storm'].includes(choice)) { u.id = card(u.id).evolveTo; u.upgradePath = choice; u.threshold = 0; }
  if (['might', 'power'].includes(choice)) u.permanentAtkBonus += (choice === 'might' ? 12 : 8);
  if (['flow', 'tempo'].includes(choice)) u.permanentSpeed = (u.permanentSpeed || 0) + (choice === 'flow' ? .2 : .1);
  if (choice === 'resonance') u.resonanceLevel = (u.resonanceLevel || 0) + 1;
  r.recap = null; reward(r); return true;
 }
 function teamCharge(b, u, n) { for (const v of allies(b, u).filter(v => abilityGauge(v) && !token(v))) { tick(b, v, n, u); interact(b, u, v, 'charge', `+${n} ability progress`); } }
 function refine(b, u) { const v = allies(b, u).filter(v => v.attackInterval > 0 && !token(v)).sort((a, z) => a.permanentAtkBonus - z.permanentAtkBonus || a.uid - z.uid)[0]; if (!v) return false; u.refinements = (u.refinements || 0) + 1; growth(b, v, 6); teamCharge(b, u, 3); interact(b, u, v, 'refinement', 'refine → +6 permanent ATK; root survives'); u.threshold.current = 0; u.refineAt = b.time + 18; return true; }
 function warp(b, e, tiles, source = null) { if (e.gone || e.hp <= 0) return; const before = e.p; e.p = Math.max(0, e.p - ((e.boss || e.champion) ? e.enraged ? 0 : tiles * .5 : tiles)); e.retreatingUntil = Math.max(e.retreatingUntil || 0, b.time + 2.5); e.panicUntil = Math.max(e.panicUntil || 0, b.time + 2.5); e.panic = true; if (source && before > e.p) event(b, 'displaced', { source, tiles: before - e.p }); }
 function pulseMadness(b, u) { const stored = u.madnessPower || 0; u.madnessPower = 0; for (const e of living(b)) { const late = e.p >= 12; trueHit(b, u, e, 200 + teamPower(b) * .75 + stored); if (late) warp(b, e, 5); } u.lastMadness = b.time; u.madnessAt = b.time + 8; interact(b, u, u, 'madness', `MADNESS → +${Math.round(stored)} stored damage released`); fx(b, 'pulse', u, null, 'MADNESS'); }
 function dot(b, e, type, dps, seconds, u) { if (e.hp <= 0 || e.gone) return; const key = type === 'burn' ? 'burns' : 'bleeds'; e[key] ??= []; e[key] = e[key].filter(x => x.until > b.time); if (type === 'bleed' && card(species(u))?.genre === 'Bloodline' && support(b, 'matriarch')) seconds += b.units.filter(v => !v.removed && BLOODLINE_FODDER.includes(species(v))).length * .5; e[key].push({ until: b.time + seconds, dps: dps * mod(b.run, 'damage') * mod(b.run, (e.elite || e.boss || e.champion) ? 'eliteDamage' : 'normalDamage'), owner: u.uid }); }
 function venom(b, e, dps, seconds, u) { if (e.hp <= 0 || e.gone) return; e.venoms ??= []; e.venoms = e.venoms.filter(x => x.until > b.time); e.venoms.push({ until: b.time + seconds, dps: dps * mod(b.run, 'damage'), owner: u.uid }); }
 function trueHit(b, u, e, n) { damage(b, e, n * mod(b.run, 'damage') * mod(b.run, (e.elite || e.boss || e.champion) ? 'eliteDamage' : 'normalDamage') * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), u, 'ability'); fx(b, 'spell', u, e, 'TRUE'); }

 function extras(b, u, dt) {
  breed(b, u); if (token(u)) return;
  bindUrbanRelic(b, u);
  if (family(u) === 'nightBus' && b.time >= u.busSweepAt && living(b).length) {
   u.busSweepAt = b.time + 8;
   const lead = living(b)[0], edge = Math.floor(lead.p / 4);
   const targets = living(b).filter(e => (e.ruleMarks || 0) >= 2 && (u.id === 'ghostRoute' ? Math.abs(e.p - lead.p) <= 3 : Math.floor(e.p / 4) === edge));
   for (const e of targets) {
    const before = e.p;
    warp(b, e, u.id === 'terminusBus' ? 5 : 3, u);
    if (e.p < before) grantUrbanViolation(b, u, 1);
    if (u.id === 'ghostRoute') hit(b, u, e, atk(b, u) * 1.5);
   }
   interact(b, u, u, 'bus-sweep', 'Timed sweep: marked runners sent backward');
  }
  if (u.id === 'terminusBus' && b.time >= u.abductAt && living(b).length) {
   u.abductAt = b.time + 6;
   for (const e of living(b).slice(0, 2)) {
    dot(b, e, 'bleed', 140, 3 * mod(b.run, 'buffDuration'), u);
    warp(b, e, 5, u);
   }
  }

  // Forensic Coroner examines adjacent Incident Dossier
  if (u.id === 'coroner' && b.time >= (u.autopsyAt || 5)) {
   u.autopsyAt = b.time + 5;
   const adjDossier = neighbors(b, u, false).find(v => v.id === 'dossier' && !v.removed);
   if (adjDossier) {
    adjDossier.removed = true;
    const recipient = neighbors(b, u, false).filter(v => !v.removed && !token(v) && card(v.id).genre === 'Haunted').sort((a, z) => rawAtk(a) - rawAtk(z))[0] || u;
    growth(b, recipient, 3);
    const investigator = b.units.filter(v => !v.removed && acceptsDread(v)).sort((a, z) => Number(isUrbanAuthority(a)) - Number(isUrbanAuthority(z)) || (a.dread || 0) - (z.dread || 0))[0];
    if (investigator) {
     addDread(b, investigator, 10);
    }
    interact(b, u, recipient, 'autopsy', 'Dossier examined: +3 perm ATK, +10 Dread');
    fx(b, 'growth', recipient, null, '+3 ATK');
   }
  }

  // Black-Box Cryptographer decodes adjacent Incident Dossier into Survival Manual
  if (u.id === 'decoder' && b.time >= (u.decodeAt || 6)) {
   u.decodeAt = b.time + 6;
   const adjDossier = neighbors(b, u, false).find(v => v.id === 'dossier' && !v.removed);
   if (adjDossier) {
    adjDossier.removed = true;
    const dur = 4 * mod(b.run, 'buffDuration');
    for (const ally of b.units.filter(v => !v.removed && card(v.id).genre === 'Haunted')) {
     ally.manualUntil = Math.max(ally.manualUntil || 0, b.time + dur);
    }
    const investigator = b.units.filter(v => !v.removed && acceptsDread(v)).sort((a, z) => Number(isUrbanAuthority(a)) - Number(isUrbanAuthority(z)) || (a.dread || 0) - (z.dread || 0))[0];
    if (investigator) {
     addDread(b, investigator, 8);
    }
    interact(b, u, null, 'manual', 'Survival Manual decoded: +25% team speed, +15% crit, +8 Dread');
    fx(b, 'pulse', u, null, 'SURVIVAL MANUAL');
   }
  }

  // Emergency Broadcast drops Dossier every 8s
  if (u.id === 'radioPA' && b.time >= (u.paAt || 8)) {
   u.paAt = b.time + 8;
   spawnToken(b, u, 'dossier', false);
   for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0)) {
    status(b, e, 'slow', 3, 0.25, u);
   }
   fx(b, 'pulse', u, null, 'CURFEW WARNING');
  }

  // Panopticon Monitor scans all 16 tiles every 4s
  if (u.id === 'panopticon' && b.time >= (u.panopticonAt || 4)) {
   u.panopticonAt = b.time + 4;
   const fastRunners = [...living(b)].sort((a, z) => z.speed - a.speed).slice(0, 3);
   for (const e of fastRunners) {
    addRuleMark(b, e, 1, u);
   }
  }

  // Liminal Keycard warps leading marked runners every 7s
  if (u.id === 'elevatorKey' && b.time >= (u.keyAt || 7)) {
   u.keyAt = b.time + 7;
   for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0).slice(0, 2)) {
    warp(b, e, 3, u);
   }
  }
  if (u.resonanceLevel && b.time >= (u.resonateAt || 6)) { u.resonateAt = b.time + 6; teamCharge(b, u, u.resonanceLevel); }
  if (u.id === 'shepherd' && b.time >= (u.pastureAt || 8)) { u.pastureAt = b.time + 8; summon(b, u); }
  if (u.id === 'soulwell' && living(b).length && b.time >= (u.soulPulseAt || 6)) { u.soulPulseAt = b.time + 6; for (const e of living(b).slice(0, 3)) trueHit(b, u, e, 160 + teamPower(b) * .75); }
  if (u.id === 'jade' && b.time >= (u.catalystAt || 1)) { u.catalystAt = b.time + 1; const v = neighbors(b, u).find(v => species(v) === 'catalyst'); if (v) { const paths = ['might', 'flow', 'storm'], path = paths[Math.floor(b.time / 4) % 3]; consume(b, u, v, 'Catalyst', 0); u.upgradePath = path; evolve(b, u, 'immortal'); if (path === 'might') growth(b, u, 12); if (path === 'flow') u.permanentSpeed = (u.permanentSpeed || 0) + .2; persist(b, u); interact(b, v, u, 'adaptation', path.toUpperCase() + ' cultivation awakening'); } }
  if (['lotus', 'lamb'].includes(u.id) && b.time >= (u.summonAt || 0)) { summon(b, u); u.summonAt = b.time + 12; }
  if (['cub', 'herald', 'alchemist', 'harvester'].includes(family(u)) && b.time >= (u.feedAt || 6)) { devour(b, u); u.feedAt = b.time + (u.id === 'herald' ? 12 : 6); }
  if (u.lineage === 'dragon' && (lineageTierIds[u.id]?.tier || 0) >= 4 && living(b).length && b.time >= (u.dragonPulseAt || 8)) { u.dragonPulseAt=b.time+8; for(const e of living(b)) warp(b,e,2,u); }
  if (u.lineage === 'phoenix' && (lineageTierIds[u.id]?.tier || 0) >= 3 && living(b).length && b.time >= (u.phoenixPulseAt || 8)) { u.phoenixPulseAt=b.time+8; for(const e of living(b)){const total=(e.burns||[]).filter(d=>d.until>b.time).reduce((n,d)=>n+d.dps*Math.max(0,d.until-b.time),0); if(total){damage(b,e,total,u,'ability');e.burns=e.burns.filter(d=>d.until<=b.time);}} interact(b,u,u,'flare','Phoenix detonation → active Burns consumed'); }
  if (family(u) === 'cub' && (lineageTierIds[u.id]?.tier || 0) === 3) { const relic=cubRelics[u.lineage]; const v=neighbors(b,u,false).find(x=>!x.removed&&x.id===relic); if(v){ consume(b,u,v,'Ancestral Ascension',0); evolve(b,u,cubForms[u.lineage][3]); } }
  if (u.id === 'lotus') { u.threshold.current = Math.min(18, u.threshold.current + dt); if (u.threshold.current >= 18) refine(b, u); }
  if (u.id === 'crystal' && b.time >= (u.crystalAt || 4)) { teamCharge(b, u, 2); u.crystalAt = b.time + 4; }
  if (u.id === 'netrunner' && b.time >= (u.hackAt || 5)) { const e = living(b).sort((a, z) => z.speed - a.speed)[0]; if (e) { status(b, e, 'slow', 3, .5, u); interact(b, u, u, 'hack', 'fastest runner slowed 50%'); } u.hackAt = b.time + 5; }
  if (u.id === 'medium' && living(b).length && b.time >= (u.soulAt || 6)) { u.soulAt = b.time + 6; const strongest = Math.max(rawAtk(u), ...allies(b, u).filter(v => !token(v)).map(rawAtk)); for (const e of living(b).slice(0, 2)) hit(b, u, e, 60 + strongest, false); interact(b, u, u, 'soul-volley', 'SOUL VOLLEY → strongest original ATK'); }
  if (u.id === 'core' && living(b).length && b.time >= (u.gravityAt || 2)) { u.gravityAt = b.time + 2; tick(b, u, 1, u); }
  if (u.id === 'medium' && u.pendingEcho) { const v = spawnToken(b, u, 'echo', false, { tokenAtk: u.pendingEcho.atk, origin: u.pendingEcho.origin, attackInterval: card(u.pendingEcho.origin).attackInterval }); if (v) u.pendingEcho = null; }
  if (u.id === 'herald' && b.time >= (u.madnessAt ?? 8)) pulseMadness(b, u);

  // --- CULTIVATION ECOSYSTEM TICKS ---
  // 1. Spirit Lotus Root blooms Lotus Blossom token every 8s
  if (u.id === 'lotusRoot' && b.time >= (u.bloomAt || 8)) {
   u.bloomAt = b.time + 8;
   spawnToken(b, u, 'lotusBlossom', false);
  }

  // Spirit dew and pills remain useful after ascension.
  if (u.id === 'herbGrass' && b.time >= u.mistAt) {
   u.mistAt = b.time + 4;
   for (const v of b.units.filter(v => !v.removed && acceptsQi(v))) {
    addQi(b, v, 2);
    interact(b, u, v, 'mist', '+2 Qi spiritual dew');
   }
  }
  if (acceptsQi(u)) {
   const blossom = neighbors(b, u).find(v => v.id === 'lotusBlossom');
   if (blossom) {
    const apex = isCultivationApex(u);
    consume(b, u, blossom, 'Blossom Absorption', apex ? 0 : 2);
    addQi(b, u, 15);
    interact(b, blossom, u, 'qi', apex ? '+15 Qi toward permanent growth' : '+15 Qi, +2 permanent ATK');
   }
  }
  if (u.id === 'cauldron' && b.time >= u.brewAt) {
   const target = allies(b, u).filter(acceptsQi).sort((a, z) => Number(isCultivationApex(a)) - Number(isCultivationApex(z)) || (a.qi || 0) - (z.qi || 0))[0];
   if (target) {
    const blossom = neighbors(b, u).find(v => v.id === 'lotusBlossom');
    const grass = neighbors(b, u).find(v => v.id === 'herbGrass');
    if (blossom || grass) {
     u.brewAt = b.time + 8;
     const apex = isCultivationApex(target);
     if (blossom) consume(b, u, blossom, 'Brewing', 0);
     // Apex recipients gain ATK through new Qi only, not both reward paths.
     if (!apex) growth(b, target, blossom ? 4 : 3);
     addQi(b, target, blossom ? 35 : 18);
     if (!blossom) target.pillSpeedUntil = Math.max(target.pillSpeedUntil || 0, b.time + 8 * mod(b.run, 'buffDuration'));
     interact(b, u, target, 'pill', blossom ? '+35 Qi: Breakthrough Dan' : '+18 Qi, temporary +15% speed: Qi Gathering Pill');
    }
   }
  }

  // 5. Ten-Thousand Soul Banner Missiles
  if (u.id === 'soulBanner' && (u.souls || 0) > 0 && b.time >= (u.missileAt || 5)) {
   u.missileAt = b.time + 5;
   const targets = living(b).slice(0, 3);
   for (const e of targets) hit(b, u, e, (u.souls || 0) * 1.5, false);
  }

  // 6. Mountain-River Scroll Banishment
  if (u.id === 'mountainScroll' && b.time >= (u.banishAt || 10)) {
   u.banishAt = b.time + 10;
   const topEnemy = living(b).sort((a, z) => z.hp - a.hp)[0];
   if (topEnemy) {
    status(b, topEnemy, 'stun', 2, 0, u);
    damage(b, topEnemy, 70, u, 'ability');
    interact(b, u, topEnemy, 'scroll-banish', 'Banished into Mountain-River Scroll');
   }
  }

  // 7. Relic Evolution: Nascent Soul Practitioner consumes adjacent Relic
  if (isPractitioner(u) && (u.qi || 0) >= 175 && (u.realm || 0) === 3) {
   const relicMap = {
    flyingSword: 'swordImmortal',
    guqin: 'melodicSaint',
    weiqiBoard: 'formationMaster',
    inkBrush: 'talismanSovereign',
    mountainScroll: 'landscapeSage',
    demonBlade: 'bloodFiendMaster'
   };
   const adjRelic = neighbors(b, u, false).find(v => {
    if (v.removed) return false;
    if (relicMap[v.id]) return true;
    if (v.id === 'soulBanner' && (v.souls || 0) >= 100) return true;
    return false;
   });
   if (adjRelic) {
    const evolveTo = adjRelic.id === 'soulBanner' ? 'soulReapingDemon' : relicMap[adjRelic.id];
    consume(b, u, adjRelic, 'Relic Fusion', 0);
    evolve(b, u, evolveTo);
    u.realm = 4;
    persist(b, u);
    
   }
  }

  // 8. Relic Resonance: Apex Immortal adjacent to Relic (Does NOT consume, triggers Resonance)
  if (isApexImmortal(u)) {
   const adjRelics = neighbors(b, u, false).filter(v => !v.removed && isCultivationRelic(v));
   if (adjRelics.length && b.time >= (u.resonanceLogAt || 0)) {
    u.resonanceLogAt = b.time + 6;
    interact(b, u, adjRelics[0], 'relic-resonance', 'Relic Resonance: +20% Apex Dmg, +25% Relic Spd');
    fx(b, 'state', u, null, 'RESONANCE');
   }
  }

  if (abilityGauge(u) && u.threshold.current >= u.threshold.max) tick(b, u, 0);
 }

 return { addQi, addDread, acceptsQi, acceptsDread, isCultivationApex, isUrbanAuthority, bindUrbanRelic, spreadRumor, cubForms, cubRelics, lineageTierIds, species, breed, workshopOptions, upgrade, family, token, abilityGauge, persist, event, flushEvents, evolve, evolutionProgress, preyEligible, consume, devour, spawnToken, summon, teamCharge, refine, dot, warp, extras, growth, grantGrowth, teamPower, highestGrowth, mod, tier, rewardWeights, herbOffering, allies, support, trialFor, encounterFor, ENCOUNTERS, interact, record, report, newRun, draft, skipDraft, rerollDraft, offers, available, chooseNode, reward, addRelic, instance, deploy, step, base, atk, speed, crit, neighbors, kind, xy, track, ring, flank, living, tick, trigger, status, flip, attack, damage, hit, downtime, sensor, rawAtk, startAbilities, prepareHooks, runtime, wavePlan, spawn, favored, rand, shuffle, finish, updatePractitionerRealm, practitionerRealmForQi, isPractitioner, isCultivationRelic, isUrbanRelic, isUrbanInvestigator, isUrbanLegend, urbanInvestigatorRealmForDread, addRuleMark, triggerBlackout, isApexImmortal, grantUrbanViolation };
})();
if (typeof module !== 'undefined') module.exports = Game;
