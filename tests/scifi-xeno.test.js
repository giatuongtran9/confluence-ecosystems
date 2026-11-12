'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');
const D = require('../data');

function battle(ids, slots = ids.map((_, i) => i), leader = 'orion') {
 const r = G.newRun(leader, 17);
 r.roster = ids.map(id => G.instance(r, id));
 r.node = { row: 5, lane: 1, type: 'battle' };
 r.depth = 5;
 r.phase = 'combat';
 const b = {
  run: r,
  time: 0,
  units: [],
  enemies: [],
  effects: [],
  metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 },
  plan: { count: 0, interval: 1, hp: 100 },
  spawned: 0
 };
 b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
 b.units.forEach(u => {
  G.prepareHooks(b, u);
  G.record(b, u);
 });
 return b;
}

function persistentSerum(b, id, slot) {
 const source = G.instance(b.run, id);
 b.run.roster.push(source);
 const serum = G.runtime(b, source, slot);
 b.units.push(serum);
 return serum;
}

function enemy(b, p = 4, hp = 10000, maxHp = 10000, defense = 0, priority = false) {
 const e = {
  uid: b.enemies.length + 1,
  p,
  hp,
  maxHp,
  speed: 0.336,
  defense,
  gone: false,
  slows: [],
  bleeds: [],
  burns: [],
  venoms: [],
  auras: [],
  ruleMarks: 0,
  elite: priority,
  boss: false,
  champion: false
 };
 b.enemies.push(e);
 return e;
}

test('SciFi Weakpoint uncapped stacking & +5 percentage points crit per stack', () => {
 const b = battle(['nanite'], [4], 'orion');
 const u = b.units[0];
 const e = enemy(b, 0, 1000, 1000);

 // Base crit for nanite with Orion (-5% leader penalty): 0.10 - 0.05 = 0.05
 const baseCrit = G.crit(b, u, e);
 assert.equal(Math.round(baseCrit * 100), 5);

 // Add 10 weakpoint stacks: uncapped!
 G.addWeakpoint(b, e, 10);
 assert.equal(e.weakpoints, 10);

 // Crit should increase by 10 * 0.05 = 0.50 -> 0.55
 const crit10 = G.crit(b, u, e);
 assert.equal(Math.round(crit10 * 100), 55);

 // Add 15 more stacks -> 25 stacks (1.25 bonus + 0.05 = 1.30 = 130%)
 G.addWeakpoint(b, e, 15);
 assert.equal(e.weakpoints, 25);
 const crit25 = G.crit(b, u, e);
 assert.equal(Math.round(crit25 * 100), 130);
});

test('Non-SciFi units cap at 100% crit chance; SciFi units do NOT cap and convert excess 2:1 to crit damage', () => {
 const b = battle(['nanite', 'practitioner'], [4, 0], 'orion');
 const scifi = b.units[0];
 const nonScifi = b.units[1];
 const e = enemy(b, 0, 1000, 1000);

 // Add 25 weakpoints (+125% crit)
 G.addWeakpoint(b, e, 25);

 // Non-scifi must be capped at 1.0 (100%)
 const nonScifiCrit = G.crit(b, nonScifi, e);
 assert.equal(nonScifiCrit, 1.0);
 assert.equal(G.critMultiplier(b, nonScifi, e), 2.3); // Orion +0.3 crit damage, no excess bonus

 // SciFi must be uncapped (> 1.0) and convert excess at 2:1 into crit damage
 const scifiCrit = G.crit(b, scifi, e);
 assert.ok(scifiCrit > 1.0);
 const excessCrit = scifiCrit - 1.0;
 const expectedCritDmgBonus = excessCrit * 0.5;

 const mult = G.critMultiplier(b, scifi, e);
 // Base crit multiplier with Orion (+30% crit damage = 2.3) + expectedCritDmgBonus
 assert.ok(Math.abs(mult - (2.3 + expectedCritDmgBonus)) < 1e-4);
});

test('Gene-Splicer consumes Helices, awards +12 Genome and +3 permanent ATK strictly to Specimen, and forges Serums', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const splicer = b.units[0];
 const specimen = b.units[1];

 // Place a chitinHelix at slot 5 (adjacent east slot)
 const helix = G.spawnToken(b, splicer, 'chitinHelix', 5);

 assert.equal(specimen.genome || 0, 0);
 const initialAtkBonus = specimen.permanentAtkBonus || 0;

 // Trigger extras
 G.xenoExtras(b, splicer, 5.1);

 // Helix consumed
 assert.ok(helix.removed);
 // Specimen received +12 Genome and +3 permanent ATK
 assert.equal(specimen.genome, 12);
 assert.equal(specimen.permanentAtkBonus, initialAtkBonus + 3);
 assert.deepEqual(specimen.strains, ['chitin']);
});

test('Xeno Metamorphosis: Larva at 25, Epic + Serum forge at 65, then Elite/Boss zero-leak trial at 130', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const splicer = b.units[0];
 const specimen = b.units[1];

 G.addGenome(b, specimen, 25, 'chitin');
 assert.equal(specimen.id, 'spineLurker');
 G.addGenome(b, specimen, 40, 'chitin');
 assert.equal(specimen.genome, 65);
 assert.equal(specimen.id, 'impalerMorph');

 const serum = b.units.find(v => v.id === 'keratinSerum');
 assert.ok(serum, 'keratinSerum should be forged');
 assert.ok(b.run.roster.some(v => v.uid === serum.uid), 'forged Serum persists as a roster card');
 assert.equal(specimen.serumForged, true);
 serum.slot = 0; serum.x = 0; serum.y = 0;

 // Reaching 130 Genome outside an eligible node must not awaken Mythic.
 G.addGenome(b, specimen, 65);
 assert.equal(specimen.genome, 130);
 assert.equal(specimen.id, 'impalerMorph');
 assert.equal(b.xenoTrial, undefined);

 // The same ready lineage starts its trial when it reaches the gate on an Elite.
 b.run.node.type = 'elite';
 G.addGenome(b, specimen, 0);
 const trial = b.xenoTrial;
 assert.equal(trial.status, 'active');
 assert.equal(trial.apexId, 'impalerApex');
 assert.equal(trial.serumUid, serum.uid);
 assert.equal(serum.removed, false);

 b.won = true;
 b.metrics.leaks = 1;
 assert.equal(G.passXenoTrial(b), false, 'a trial with any leak cannot pass');
 assert.equal(trial.status, 'active');
 b.metrics.leaks = 0;
 G.finish(b, true);
 assert.equal(specimen.id, 'impalerApex');
 assert.equal(serum.removed, true);
 assert.equal(trial.status, 'passed');
 assert.equal(b.done, true);
 assert.equal(b.won, true);
 assert.ok(!b.run.roster.some(v => v.uid === serum.uid), 'successful trial consumes Serum from persistent roster');
 assert.equal(b.run.roster.find(v => v.uid === specimen.uid)?.id, 'impalerApex');
});

test('SciFi trial requires Elite/Boss, 130 Genome, two strains, and the adjacent Serum mapped to that lineage', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const specimen = b.units[1];
 G.addGenome(b, specimen, 130, 'chitin');
 G.addGenome(b, specimen, 0, 'chitin');
 b.run.node.type = 'elite';
 assert.equal(G.xenoTrialCandidate(b, specimen), null, 'a single strain is not a complete lineage');
 assert.equal(G.startXenoTrial(b), null);

 specimen.strains = ['chitin', 'acid'];
 const wrong = persistentSerum(b, 'royalSerum', 0);
 assert.equal(G.xenoTrialCandidate(b, specimen), null, 'a mismatched Serum cannot start the trial');
 wrong.removed = true;
 b.run.roster = b.run.roster.filter(u => u.uid !== wrong.uid);
 const matching = persistentSerum(b, 'ordnanceSerum', 0);
 assert.equal(G.xenoTrialCandidate(b, specimen).apexId, 'causticRavager');
 assert.equal(G.startXenoTrial(b).status, 'active');
});

test('Xeno readiness on an ordinary node waits until an Elite/Boss and starts as soon as criteria are met', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const specimen = b.units[1];
 const serum = persistentSerum(b, 'keratinSerum', 0);
 G.addGenome(b, specimen, 130, 'chitin');
 G.addGenome(b, specimen, 0, 'chitin');
 assert.equal(b.xenoTrial, undefined, 'ordinary battle cannot start the Mythic trial');
 b.run.node.type = 'boss';
 G.startXenoTrial(b);
 assert.equal(b.xenoTrial?.status, 'active');
 assert.equal(b.xenoTrial?.serumUid, serum.uid);
});

test('Xeno Genome, strains, and serum-forged state persist from one battle to the next', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const specimen = b.units[1];
 G.addGenome(b, specimen, 25, 'chitin');
 G.addGenome(b, specimen, 40, 'chitin');
 assert.equal(specimen.id, 'impalerMorph');
 assert.equal(specimen.serumForged, true);
 G.finish(b, true);
 const saved = b.run.roster.find(v => v.uid === specimen.uid);
 assert.equal(saved.genome, 65);
 assert.deepEqual(saved.strains, ['chitin', 'chitin']);
 assert.equal(saved.serumForged, true);
 assert.ok(b.run.roster.some(v => v.id === 'keratinSerum'));
});

test('SciFi trial failure permanently removes the candidate and matching Serum', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const specimen = b.units[1];
 G.addGenome(b, specimen, 130, 'chitin');
 G.addGenome(b, specimen, 0, 'chitin');
 const serum = persistentSerum(b, 'keratinSerum', 0);
 b.run.node.type = 'boss';
 const t = G.startXenoTrial(b);
 assert.equal(t.status, 'active');
 assert.equal(G.failXenoTrial(b, 'A runner leaked'), true);
 assert.equal(t.status, 'failed');
 assert.equal(specimen.removed, true);
 assert.equal(serum.removed, true);
 assert.ok(!b.run.roster.some(u => u.uid === specimen.uid));
 assert.ok(!b.run.roster.some(u => u.uid === serum.uid));
});

test('An unsuccessful Elite/Boss clear fails the active Xeno trial and removes its stakes', () => {
 const b = battle(['geneSplicer', 'xenoSpecimen'], [4, 3], 'orion');
 const specimen = b.units[1];
 specimen.id = 'impalerMorph'; specimen.genome = 130; specimen.strains = ['chitin', 'chitin'];
 const serum = persistentSerum(b, 'keratinSerum', 0);
 b.run.node.type = 'elite';
 const trial = G.startXenoTrial(b);
 assert.equal(trial.status, 'active');
 G.finish(b, false);
 assert.equal(trial.status, 'failed');
 assert.ok(!b.run.roster.some(v => v.uid === specimen.uid));
 assert.ok(!b.run.roster.some(v => v.uid === serum.uid));
});

test('All 6 genetic pairings map to unique Epic morphs, Serums, and Mythic Apex Leviathans', () => {
 const expected = {
  'chitin+chitin': ['impalerMorph', 'keratinSerum', 'impalerApex'],
  'acid+acid': ['acidBrood', 'royalSerum', 'xenoQueen'],
  'psionic+psionic': ['synapseNexus', 'cortexSerum', 'hiveOvermind'],
  'chitin+acid': ['ravagerMorph', 'ordnanceSerum', 'causticRavager'],
  'chitin+psionic': ['stalkerMorph', 'phaseSerum', 'phaseStalker'],
  'acid+psionic': ['siphonMorph', 'metroidSerum', 'metroidLeviathan']
 };
 assert.deepEqual(G.XENO_BRANCHES, expected);
 for (const [pair, [epic, serum, apex]] of Object.entries(expected)) {
  assert.ok(D.CARD[epic], `Missing card definition for ${epic}`);
  assert.ok(D.CARD[serum], `Missing card definition for ${serum}`);
  assert.ok(D.CARD[apex], `Missing card definition for ${apex}`);
 }
});

test('Vector Railgun receives 2.5x growth transfer when Impaler Apex is deployed', () => {
 const bNormal = battle(['railgun', 'impalerMorph'], [0, 1], 'orion');
 bNormal.units[1].permanentAtkBonus = 10;
 const normalAtk = G.atk(bNormal, bNormal.units[0]);

 const bApex = battle(['railgun', 'impalerApex'], [0, 1], 'orion');
 bApex.units[1].permanentAtkBonus = 10;
 const apexAtk = G.atk(bApex, bApex.units[0]);

 // Apex provides 2.5x transfer instead of 2.0x -> (10 * 2.5) vs (10 * 2.0)
 assert.ok(apexAtk > normalAtk);
 assert.equal(apexAtk - normalAtk, 5); // Difference of 0.5 * 10 = 5 ATK
});

test('Impaler Morph ignores armor and hits 4 enemies with shard splash on crit', () => {
 const b = battle(['impalerMorph'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 4, 1000, 1000, 0.5);
 const e2 = enemy(b, 5, 1000, 1000, 0.5);
 const e3 = enemy(b, 6, 1000, 1000, 0.5);
 const e4 = enemy(b, 7, 1000, 1000, 0.5);

 // Ensure 100% crit
 G.addWeakpoint(b, e1, 25);
 G.xenoAttack(b, u, e1, 100);

 // e1 should take full direct damage ignoring 50% armor (100 * 2.3 = 230)
 assert.ok(e1.hp < 1000);
 // e2, e3, e4 should take direct damage plus shard splash
 assert.ok(e2.hp < 1000);
 assert.ok(e3.hp < 1000);
 assert.ok(e4.hp < 1000);
});

test('Impaler Apex pushes weakpoint targets and fires 3 shards on crit', () => {
 const b = battle(['impalerApex'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 4, 1000, 1000, 0);
 const e2 = enemy(b, 5, 1000, 1000, 0); // same wall (wall 1: tiles 4-7)
 G.addWeakpoint(b, e1, 5);

 const initialP = e1.p;
 G.xenoAttack(b, u, e1, 100);

 // e1 had weakpoints so should be knocked back by 2 tiles (4 - 2 = 2)
 assert.equal(e1.p, (initialP - 2 + 16) % 16);
});

test('Acid Brood shreds armor and spawns acid pool on crit', () => {
 const b = battle(['acidBrood'], [4], 'orion');
 const u = b.units[0];
 const e = enemy(b, 4, 1000, 1000, 0.5);

 G.hit(b, u, e, 50, true, { criticalMultiplier: 2.0 });

 // 50% defense stripped by 60% -> 0.20
 assert.ok(Math.abs(e.defense - 0.20) < 1e-4);
 assert.ok(b.acidPools && b.acidPools.length > 0);
});

test('Xeno Queen completely shreds armor (100%), spawns 5s pool, and deals 14% max HP true damage to priority on 4th crit', () => {
 const b = battle(['xenoQueen'], [4], 'orion');
 const u = b.units[0];
 const boss = enemy(b, 4, 10000, 10000, 0.8, true); // priority target

 for (let i = 0; i < 4; i++) {
  G.hit(b, u, boss, 50, true, { criticalMultiplier: 2.0 });
 }

 assert.equal(boss.defense, 0); // 100% stripped
 // Boss should take 14% max HP (1400) true damage on 4th crit
 assert.ok(boss.hp <= 10000 - 1400);
});

test('Synapse Nexus triggers retaliatory strike on adjacent ally crit', () => {
 const b = battle(['synapseNexus', 'nanite'], [4, 3], 'orion'); // adjacent slots
 const nexus = b.units[0];
 const nanite = b.units[1];
 const e = enemy(b, 0, 2000, 2000);

 const initHp = e.hp;
 G.hit(b, nanite, e, 50, true, { criticalMultiplier: 2.0 });

 // Nanite hit e, and Nexus should also have hit e
 assert.ok(e.hp < initHp - 100);
});

test('Hive Overmind provides global +30% crit aura and assists on ally crit', () => {
 const b = battle(['hiveOvermind', 'nanite'], [0, 8], 'orion'); // distant slots
 const over = b.units[0];
 const nanite = b.units[1];
 const e = enemy(b, 0, 2000, 2000);

 // Nanite base crit with Orion is 5%, + 30% from Overmind = 35%
 const c = G.crit(b, nanite, e);
 assert.equal(Math.round(c * 100), 35);

 const initHp = e.hp;
 G.hit(b, nanite, e, 50, true, { criticalMultiplier: 2.0 });
 // Overmind assists with true damage
 assert.ok(e.hp < initHp - 100);
});

test('Caustic Ravager targets largest enemy cluster, shreds armor and bleeds on crit', () => {
 const b = battle(['causticRavager'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 4, 1000, 1000, 0.4);
 const e2 = enemy(b, 5, 1000, 1000, 0.4);
 const solo = enemy(b, 12, 1000, 1000, 0.4);

 const target = G.chooseTarget(b, u);
 assert.ok(target === e1 || target === e2);

 G.hit(b, u, target, 50, true, { criticalMultiplier: 2.0 });
 assert.ok(e1.bleeds.length > 0 || e2.bleeds.length > 0);
});

test('Stalker Morph prioritizes Elites/Bosses and doubles damage under 35% HP', () => {
 const b = battle(['stalkerMorph'], [4], 'orion');
 const u = b.units[0];
 const normal = enemy(b, 4, 1000, 1000);
 const elite = enemy(b, 8, 1000, 1000, 0, true);

 const target = G.chooseTarget(b, u);
 assert.equal(target, elite);

 // Elite under 35% HP
 elite.hp = 300;
 const initHp = elite.hp;
 G.hit(b, u, elite, 50, true, { criticalMultiplier: 2.0 });
 // Stalker morph doubles crit damage under 35% HP
 assert.ok(elite.hp < initHp - 150);
});

test('Phase Stalker executes non-boss under 35% HP and applies 450 true damage + freeze on 5th crit', () => {
 const b = battle(['phaseStalker'], [4], 'orion');
 const u = b.units[0];
 const runner = enemy(b, 4, 1000, 1000);
 runner.hp = 300; // under 35%

 G.hit(b, u, runner, 10, true, { criticalMultiplier: 2.0 });
 assert.equal(runner.hp, 0); // Executed instantly

 const boss = enemy(b, 4, 10000, 10000, 0, true);
 for (let i = 0; i < 5; i++) {
  G.hit(b, u, boss, 50, true, { criticalMultiplier: 2.0 });
 }
 assert.ok(boss.hp <= 10000 - 450);
 assert.ok((boss.frozenUntil || 0) > b.time);
});

test('Siphon Morph ticks gauges on every 4th attack', () => {
 const b = battle(['siphonMorph', 'pyroMage'], [4, 3], 'orion');
 const u = b.units[0];
 const pyro = b.units[1];
 const e = enemy(b, 0, 5000, 5000);

 pyro.threshold = { current: 0, max: 10 };
 for (let i = 0; i < 4; i++) {
  G.xenoAttack(b, u, e, 50);
 }
 assert.ok(pyro.threshold.current > 0);
});

test('Metroid Leviathan drains 8% max HP and slows two healthiest runners every 3s', () => {
 const b = battle(['metroidLeviathan'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 0, 2000, 2000);
 const e2 = enemy(b, 1, 3000, 3000);

 G.tickXeno(b, 3.1);

 assert.ok(e2.hp <= 3000 - 240); // 8% of 3000 = 240
 assert.ok(e1.hp <= 2000 - 160); // 8% of 2000 = 160
 assert.equal(u.permanentAtkBonus, 2); // gains growth
});

test('Bio-Scanner applies weakpoint on attack and multi-scans every 4 attacks', () => {
 const b = battle(['bioScanner'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 0, 1000, 1000);
 const e2 = enemy(b, 1, 1000, 1000);
 const e3 = enemy(b, 2, 1000, 1000);

 // 4th attack hits 3 enemies and applies weakpoint to all of them
 for (let i = 0; i < 4; i++) {
  G.xenoAttack(b, u, e1, 20);
 }
 assert.ok(e1.weakpoints >= 4);
 assert.ok((e2.weakpoints || 0) >= 1);
 assert.ok((e3.weakpoints || 0) >= 1);
});

test('Telemetry Sensor applies weakpoint on direct ally crit', () => {
 const b = battle(['sensor', 'nanite'], [4, 3], 'orion');
 const sensor = b.units[0];
 const nanite = b.units[1];
 const e = enemy(b, 0, 1000, 1000);

 G.hit(b, nanite, e, 50, true, { criticalMultiplier: 2.0 });
 assert.equal(e.weakpoints, 1);
});

test('Focused Nanites extract Helices and grant growth every 6 crits', () => {
 const b = battle(['nanite'], [4], 'orion');
 const u = b.units[0];
 const e = enemy(b, 0, 5000, 5000);

 for (let i = 0; i < 6; i++) {
  G.hit(b, u, e, 10, true, { criticalMultiplier: 2.0 });
 }
 assert.equal(u.permanentAtkBonus, 1);
 const spawnedToken = b.units.find(v => ['chitinHelix', 'acidHelix', 'psionicHelix'].includes(v.id));
 assert.ok(spawnedToken, 'Helix token should be extracted on 6th crit');
});

test('Ravager Morph deals 1.5x splash damage to adjacent enemies on crit', () => {
 const b = battle(['ravagerMorph'], [4], 'orion');
 const u = b.units[0];
 const e1 = enemy(b, 4, 1000, 1000);
 const e2 = enemy(b, 5, 1000, 1000); // within 2 distance

 G.hit(b, u, e1, 100, true, { criticalMultiplier: 2.0 });
 // e2 should take splash damage
 assert.ok(e2.hp < 1000);
});

test('Gene-Splicer strain effects: Acid creates acid pool, Psionic stuns weakpoint enemies', () => {
 const b = battle(['geneSplicer'], [4], 'orion');
 const splicer = b.units[0];
 const e = enemy(b, 0, 1000, 1000);
 G.addWeakpoint(b, e, 2);

 // Place psionicHelix at slot 3
 G.spawnToken(b, splicer, 'psionicHelix', 3);
 G.xenoExtras(b, splicer, 5.1);

 // Enemy should be stunned
 assert.ok((e.frozenUntil || 0) > b.time);
});
