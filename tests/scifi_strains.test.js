'use strict';
// Sci-Fi redesign: strains from playstyle, Biomass feeding, Metamorphosis cocoon, Weakpoint scans, crit cap, 10th abilities.
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');

function battle(ids, slots = ids.map((_, i) => i), type = 'battle') {
 const r = G.newRun('orion', 17);
 r.roster = ids.map(id => G.instance(r, id));
 r.node = { row: 5, lane: 1, type }; r.depth = 5; r.phase = 'combat';
 const b = { run: r, time: 0, units: [], enemies: [], effects: [], metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, plan: { count: 0, interval: 1, hp: 100 }, spawned: 0 };
 b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
 b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
 return b;
}
function enemy(b, p = 4, hp = 100000, extra = {}) {
 const e = { uid: b.enemies.length + 1, p, hp, maxHp: hp, speed: .3, defense: 0, gone: false, slows: [], bleeds: [], burns: [], venoms: [], stuns: [], weakpoints: 0, ruleMarks: 0, tabooMarks: {}, ...extra };
 b.enemies.push(e); return e;
}

test('strains follow playstyle: top strain picks the larva, top two pick the chrysalis', () => {
 const b = battle(['xenoSpecimen']); const u = b.units[0];
 G.addStrain(b, 'acid', 6); G.addStrain(b, 'psionic', 4);
 G.addGenome(b, u, 25); assert.equal(u.id, 'bileSpitter');
 G.addGenome(b, u, 40); assert.equal(u.id, 'siphonMorph'); // acid + psionic
 assert.deepEqual(u.strains, ['acid', 'psionic']); assert.equal(u.strainsLocked, true);
});

test('a dominant strain (at least double the second) becomes a pure chrysalis', () => {
 const b = battle(['xenoSpecimen']); const u = b.units[0];
 G.addStrain(b, 'chitin', 10); G.addStrain(b, 'acid', 4);
 G.addGenome(b, u, 65); assert.equal(u.id, 'impalerMorph');
});

test('kills fill Biomass; the Specimen eats 4 every 5s, 8 with a Gene-Splicer', () => {
 const solo = battle(['xenoSpecimen']); solo.biomass = 10;
 G.feedSpecimens(solo, 5); assert.equal(solo.biomass, 6); assert.equal(solo.units[0].genome, 3);
 const lab = battle(['xenoSpecimen', 'geneSplicer'], [0, 1]); lab.biomass = 10;
 G.feedSpecimens(lab, 5); assert.equal(lab.biomass, 2); assert.equal(lab.units[0].genome, 6);
 assert.equal(lab.units[0].permanentAtkBonus, 2); // adjacent Splicer
});

test('Metamorphosis: a 130-Genome chrysalis cocoons 15s on an Elite node and hatches mid-battle', () => {
 const b = battle(['impalerMorph'], [4], 'elite'); const u = b.units[0];
 Object.assign(u, { genome: 130, strains: ['chitin', 'chitin'], strainsLocked: true });
 const t = G.startXenoTrial(b); assert.ok(t);
 assert.ok(u.cocoonUntil > b.time);
 b.time = 15; G.tickXenoTrial(b);
 assert.equal(u.id, 'impalerApex'); assert.equal(t.status, 'passed');
});

test('a leak during the cocoon cracks it without removing the card', () => {
 const b = battle(['acidBrood'], [4], 'elite'); const u = b.units[0];
 Object.assign(u, { genome: 140, strains: ['acid', 'acid'], strainsLocked: true });
 G.startXenoTrial(b); b.metrics.leaks = 1; b.time = 3; G.tickXenoTrial(b);
 assert.equal(b.xenoTrial.status, 'failed'); assert.equal(u.removed, false); assert.equal(u.id, 'acidBrood');
 assert.ok(b.run.roster.some(v => v.uid === u.uid));
});

test('no cocoon on an ordinary battle node', () => {
 const b = battle(['impalerMorph']); Object.assign(b.units[0], { genome: 130, strains: ['chitin', 'chitin'] });
 assert.equal(G.startXenoTrial(b), null);
});

test('Bio-Scanner is a support that scans the first 3 runners every 3s (Weakpoints cap at 5)', () => {
 const b = battle(['bioScanner'], [0]); const es = [enemy(b, 9), enemy(b, 8), enemy(b, 7), enemy(b, 1)];
 assert.equal(b.units[0].attackInterval, 0);
 for (let t = 3; t <= 30; t += 3) { b.time = t; G.xenoExtras(b, b.units[0], .1); }
 assert.deepEqual(es.map(e => e.weakpoints), [5, 5, 5, 0]);
});

test('Sci-Fi crit damage is capped at 250%', () => {
 const b = battle(['xenoSpecimen', 'sensor', 'core', 'hiveOvermind']);
 b.run.mods = { ...(b.run.mods || {}), critDamage: 5 };
 assert.ok(G.critMultiplier(b, b.units[0], enemy(b)) <= 2.5);
});

test('Sci-Fi Mythics channel 1.2s on every 10th attack', () => {
 for (const id of ['impalerApex', 'xenoQueen', 'hiveOvermind', 'causticRavager', 'phaseStalker', 'metroidLeviathan']) {
  const b = battle([id]); const u = b.units[0]; enemy(b); u.attackCount = 9;
  G.attack(b, u);
  assert.equal(u.channeling?.type, 'xeno-' + id, id);
 }
});

test('Synaptic Storm forces the next 3 ally attacks to crit; Singularity Feast never skips an ally 10th', () => {
 const b = battle(['hiveOvermind', 'xenoSpecimen']); const [hive, ally] = b.units; enemy(b);
 G.resolveXenoUlt(b, hive, 'hiveOvermind', 100);
 assert.equal(ally.forcedCrits, 3);
 const m = battle(['metroidLeviathan', 'xenoSpecimen']); const [leech, mate] = m.units; enemy(m); mate.attackCount = 9;
 G.resolveXenoUlt(m, leech, 'metroidLeviathan', 100);
 assert.equal(mate.attackCount, 9);
});

test('Phase Execution hits the strongest Elite for 400% ATK true and stuns it', () => {
 const b = battle(['phaseStalker']); const u = b.units[0];
 const elite = enemy(b, 5, 50000, { elite: true }); enemy(b, 6, 1000);
 G.resolveXenoUlt(b, u, 'phaseStalker', 100);
 assert.ok(elite.maxHp - elite.hp >= 400 - 1e-6);
 assert.ok(elite.frozenUntil > b.time || elite.stuns.some(s => s.until > b.time));
});
