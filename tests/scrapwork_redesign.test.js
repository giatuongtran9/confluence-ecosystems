'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');

function battle(ids, slots = ids.map((_, i) => i)) {
  const run = G.newRun('none', 23);
  run.roster = ids.map(id => G.instance(run, id));
  run.node = { row: 5, lane: 1, type: 'battle' };
  run.depth = 5;
  run.phase = 'combat';
  const b = { run, time: 0, units: [], enemies: [], effects: [], metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, plan: { count: 0, interval: 1, hp: 100 }, spawned: 0, oilPools: [] };
  b.units = run.roster.map((u, i) => G.runtime(b, u, slots[i]));
  b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
  return b;
}
function enemy(b, p, hp = 10000, defense = 0) {
  const e = { uid: b.enemies.length + 1, p, hp, maxHp: hp, speed: .3, defense, gone: false, slows: [], bleeds: [], burns: [], venoms: [], auras: [], ruleMarks: 0 };
  b.enemies.push(e);
  return e;
}

test('forged weapons add ATK and Titan Reactor buffs adjacent units', () => {
  const b = battle(['scrapFrame', 'titanReactor'], [4, 1]);
  const frame = b.units[0];
  frame.modules = ['blade', 'blade'];
  assert.equal(G.rawAtk(frame), 115);
  assert.equal(G.atk(b, frame), 138);
  assert.equal(G.speed(b, frame), 1.2);
});

test('all three Scrapwork Mythics channel on each tenth attack', () => {
  for (const [id, type] of [['berserkerColossus', 'berserker-cleave'], ['siegeDreadnought', 'siege-bombardment'], ['vanguardJuggernaut', 'juggernaut-hellfire']]) {
    const b = battle([id]);
    const u = b.units[0];
    const e = enemy(b, 4);
    u.attackCount = 10;
    const before = e.hp;
    G.mechAttack(b, u, e, G.atk(b, u));
    assert.equal(u.channeling?.type, type);
    assert.equal(u.channeling?.remaining, 1.2);
    assert.ok(e.hp === before, `${id} should replace the tenth normal hit with its channel`);
  }
});

test('Berserker normal attack hits every enemy sharing the highest-HP runner tile', () => {
  const b = battle(['berserkerColossus']);
  const u = b.units[0];
  const a = enemy(b, 4, 10000), sameTile = enemy(b, 4.7, 10000), otherTile = enemy(b, 5, 10000);
  a.hp = 9000;
  u.attackCount = 1;
  G.mechAttack(b, u, a, 100);
  assert.ok(a.hp < 9000);
  assert.ok(sameTile.hp < 10000);
  assert.equal(otherTile.hp, 10000);
});

test('Riveter shreds only enemies in the densest four-tile segment', () => {
  const b = battle(['hydraulicRiveter']);
  const a = enemy(b, 4, 10000, .5), z = enemy(b, 5, 10000, .5), outside = enemy(b, 10, 10000, .5);
  G.attack(b, b.units[0]);
  assert.equal(a.shredAmount, .15);
  assert.equal(z.shredAmount, .15);
  assert.equal(outside.shredAmount, undefined);
  assert.equal(a.shredUntil, 2);
});

test('Smelter bank retains up to two weapons and installs a mixed Blade + Flak pair', () => {
  const b = battle(['scrapFrame', 'smelter'], [4, 0]);
  const frame = b.units[0], smelter = b.units[1];
  frame.modules = ['blade', 'blade'];
  smelter.savedWeapons = ['blade', 'flak'];
  G.persist(b, smelter);
  G.scrapworkExtras(b, smelter);
  assert.deepEqual(frame.modules, ['blade', 'blade']);
  // Two weapons already installed, so the bank remains stored until an eligible frame is present.
  assert.deepEqual(smelter.savedWeapons, ['blade', 'flak']);
  frame.modules = ['blade'];
  b.time = 5;
  G.scrapworkExtras(b, smelter);
  assert.deepEqual(frame.modules, ['blade', 'flak']);
  assert.deepEqual(smelter.savedWeapons, ['blade']);
});

test('Oil pools apply max-HP burn stacks to runners standing on their tiles', () => {
  const b = battle(['vanguardJuggernaut']);
  const u = b.units[0], e = enemy(b, 3, 10000);
  G.oilPool(b, u, 3, 1, 1, 5);
  G.tickOil(b, 1);
  assert.equal(e.hp, 9900);
});

test('Vanguard Gunblade module alternating cleave applies 1 burn stack/s oil pool', () => {
  const b = battle(['scrapFrame']);
  const u = b.units[0];
  u.modules = ['gunblade'];
  const e = enemy(b, 2);
  u.attackCount = 1;
  G.mechAttack(b, u, e, 100);
  assert.equal(b.oilPools.length, 4);
  assert.ok(b.oilPools.every(p => p.burnStacks === 1));
});
