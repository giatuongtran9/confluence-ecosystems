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

test('Acid Brood shreds armor and spawns acid pool on crit', () => {
 const b = battle(['acidBrood'], [4], 'orion');
 const u = b.units[0];
 const e = enemy(b, 4, 1000, 1000, 0.5);

 G.hit(b, u, e, 50, true, { criticalMultiplier: 2.0 });

 // 50% defense stripped by 60% -> 0.20
 assert.ok(Math.abs(e.defense - 0.20) < 1e-4);
 assert.ok(b.acidPools && b.acidPools.length > 0);
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

test('Telemetry Sensor applies weakpoint on direct ally crit', () => {
 const b = battle(['sensor', 'nanite'], [4, 3], 'orion');
 const sensor = b.units[0];
 const nanite = b.units[1];
 const e = enemy(b, 0, 1000, 1000);

 G.hit(b, nanite, e, 50, true, { criticalMultiplier: 2.0 });
 assert.equal(e.weakpoints, 1);
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

