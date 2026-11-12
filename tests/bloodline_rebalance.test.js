'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');
const D = require('../data');

function battle(ids, slots = ids.map((_, i) => i)) {
  const r = G.newRun('none', 17);
  r.roster = ids.map(id => G.instance(r, id));
  r.node = { row: 5, lane: 1, type: 'battle' };
  r.depth = 5;
  r.phase = 'combat';
  const b = {
    run: r, time: 0, units: [], enemies: [], effects: [],
    metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 },
    plan: { count: 0, interval: 1, hp: 100 }, spawned: 0, inkPuddles: [], xuanwuToxins: []
  };
  b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
  b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
  return b;
}

function enemy(b, p = 4, hp = 100000, maxHp = 100000, defense = 0) {
  const e = {
    uid: b.enemies.length + 1, p, hp, maxHp, speed: 0, defense, leak: 1, gone: false,
    slows: [], bleeds: [], burns: [], venoms: [], auras: [], ruleMarks: 0,
    tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 }
  };
  b.enemies.push(e);
  return e;
}

test('Bloodline card base stats match requested values', () => {
  const expectedCards = {
    cub: { atk: 12, interval: 1.5 },
    altar: { atk: 0, interval: 0 },
    broodkeeper: { atk: 20, interval: 1.4 },
    matriarch: { atk: 45, interval: 1.3 },
    serpentFodder: { atk: 12, interval: 1.5 },
    hound: { atk: 12, interval: 1.5 },
    scuttler: { atk: 12, interval: 1.5 },
    flameToad: { atk: 12, interval: 1.5 },
    peachFodder: { atk: 12, interval: 1.5 },
    dragonPearl: { atk: 0, interval: 0 },
    tigerSeal: { atk: 0, interval: 0 },
    earthTablet: { atk: 0, interval: 0 },
    phoenixTree: { atk: 0, interval: 0 },
    goldenStaff: { atk: 0, interval: 0 }
  };

  for (const [id, stat] of Object.entries(expectedCards)) {
    const c = D.CARDS.find(card => card.id === id);
    assert.ok(c, `Card ${id} must exist in CARDS`);
    assert.strictEqual(c.baseAtk, stat.atk, `${id} baseAtk`);
    assert.strictEqual(c.attackInterval, stat.interval, `${id} attackInterval`);
  }
});

test('Bloodline forms base stats match requested values', () => {
  const expectedForms = {
    dragonCubT1: { atk: 25, interval: 1.4 },
    dragonCubT2: { atk: 48, interval: 1.3 },
    dragonCubT3: { atk: 85, interval: 1.2 },
    dragonCubApex: { atk: 150, interval: 1.0 },

    tigerCubT1: { atk: 24, interval: 1.3 },
    tigerCubT2: { atk: 45, interval: 1.2 },
    tigerCubT3: { atk: 80, interval: 1.1 },
    tigerCubApex: { atk: 130, interval: 0.9 },

    xuanwuCubT1: { atk: 20, interval: 1.5 },
    xuanwuCubT2: { atk: 45, interval: 1.4 },
    xuanwuCubT3: { atk: 90, interval: 1.4 },
    xuanwuCubApex: { atk: 150, interval: 1.3 },

    phoenixCubT1: { atk: 22, interval: 1.4 },
    phoenixCubT2: { atk: 46, interval: 1.3 },
    phoenixCubT3: { atk: 86, interval: 1.2 },
    phoenixCubApex: { atk: 130, interval: 1.0 },

    monkeyCubT1: { atk: 29, interval: 1.4 },
    monkeyCubT2: { atk: 54, interval: 1.3 },
    monkeyCubT3: { atk: 111, interval: 1.2 },
    monkeyCubApex: { atk: 169, interval: 1.0 }
  };

  for (const [id, stat] of Object.entries(expectedForms)) {
    const f = D.FORMS.find(form => form.id === id);
    assert.ok(f, `Form ${id} must exist in FORMS`);
    assert.strictEqual(f.baseAtk, stat.atk, `${id} baseAtk`);
    assert.strictEqual(f.attackInterval, stat.interval, `${id} attackInterval`);
  }
});

test('Bloodline relics cannot attack and isBloodlineRelic identifies them', () => {
  const relics = ['dragonPearl', 'tigerSeal', 'earthTablet', 'phoenixTree', 'goldenStaff'];
  for (const r of relics) {
    assert.strictEqual(G.isBloodlineRelic({ id: r }), true);
  }
  assert.strictEqual(G.isBloodlineRelic({ id: 'cub' }), false);
});

test('Dragon Pearl gives adjacent units +20% ATK', () => {
  const b = battle(['dragonPearl', 'cub', 'cub'], [4, 1, 8]);
  const adjCub = b.units.find(u => u.slot === 1);
  const nonAdjCub = b.units.find(u => u.slot === 8);
  
  const baseAtkVal = G.atk(b, nonAdjCub);
  const buffedAtkVal = G.atk(b, adjCub);
  assert.strictEqual(Math.round(buffedAtkVal), Math.round(baseAtkVal * 1.20));
});

test('Golden-Hooped Staff gives adjacent units +30% attack speed', () => {
  const b = battle(['goldenStaff', 'cub', 'cub'], [4, 3, 8]);
  const adjCub = b.units.find(u => u.slot === 3);
  const nonAdjCub = b.units.find(u => u.slot === 8);
  
  const baseSpd = G.speed(b, nonAdjCub);
  const buffedSpd = G.speed(b, adjCub);
  assert.strictEqual(Math.round(buffedSpd * 100), Math.round((baseSpd + 0.30) * 100));
});

test('Brood Matriarch gives adjacent units +35% attack speed', () => {
  const b = battle(['matriarch', 'cub', 'cub'], [4, 5, 0]);
  const adjCub = b.units.find(u => u.slot === 5);
  const nonAdjCub = b.units.find(u => u.slot === 0);
  
  const baseSpd = G.speed(b, nonAdjCub);
  const buffedSpd = G.speed(b, adjCub);
  assert.strictEqual(Math.round(buffedSpd * 100), Math.round((baseSpd + 0.35) * 100));
});

test('Slaughter Tiger Seal gives adjacent units +20% crit chance', () => {
  const b = battle(['tigerSeal', 'cub', 'cub'], [4, 1, 8]);
  const adjCub = b.units.find(u => u.slot === 1);
  const nonAdjCub = b.units.find(u => u.slot === 8);
  
  const baseCrit = G.crit(b, nonAdjCub);
  const buffedCrit = G.crit(b, adjCub);
  assert.strictEqual(Math.round((buffedCrit - baseCrit) * 100), 20);
});

test('Blood Altar grants +2 permanent ATK instead of +1 on consumption', () => {
  const b = battle(['altar', 'cub'], [4, 1]);
  const cub = b.units.find(u => u.id === 'cub');
  const beforeBonus = cub.permanentAtkBonus || 0;
  
  b.events = [{ type: 'consumed', unit: { id: 'serpentFodder', uid: 'test_fodder' }, consumer: cub }];
  G.flushEvents(b);
  
  const afterBonus = cub.permanentAtkBonus || 0;
  assert.strictEqual(afterBonus - beforeBonus, 2);
});

test('Phoenix Apex revives with 15 HP once per run', () => {
  const b = battle(['phoenixCubApex'], [4]);
  b.run.health = 1;
  const phoenix = b.units[0];
  phoenix.lineage = 'phoenix';
  
  const e = enemy(b, 15.99);
  e.speed = 1.0;
  G.step(b, 0.1);
  
  assert.strictEqual(b.run.phoenixRevived, true);
  assert.strictEqual(b.run.health, 15);
});

test('Brood Matriarch attacks up to 3 leading runners for 70% ATK, marks with Prey Mark and Bleed', () => {
  const b = battle(['matriarch'], [4]);
  const mat = b.units[0];
  const e1 = enemy(b, 5.0, 1000);
  const e2 = enemy(b, 4.5, 1000);
  const e3 = enemy(b, 4.0, 1000);
  const e4 = enemy(b, 3.5, 1000);

  G.attack(b, mat);
  assert.ok(e1.hp < 1000, 'e1 takes damage');
  assert.ok(e2.hp < 1000, 'e2 takes damage');
  assert.ok(e3.hp < 1000, 'e3 takes damage');
  assert.strictEqual(e4.hp, 1000, 'e4 takes no damage (only 3 targets)');

  assert.ok(e1.preyMarkUntil > b.time, 'e1 marked');
  assert.strictEqual(e1.bleeds.length, 1, 'e1 has 1 bleed stack');
});

test('Azure Dragon Apex channels on 10th attack for 200% ATK + 1s stun to all enemies', () => {
  const b = battle(['dragonCubApex'], [4]);
  const dragon = b.units[0];
  dragon.lineage = 'dragon';
  const e1 = enemy(b, 5.0, 100000);
  const e2 = enemy(b, 4.0, 100000);

  for (let i = 1; i <= 10; i++) G.attack(b, dragon);
  assert.strictEqual(dragon.attackCount, 10);
  assert.ok(dragon.channeling, 'Channels on 10th attack');
  assert.strictEqual(dragon.channeling.type, 'azure-dragon');

  dragon.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(dragon.channeling, null);
  assert.ok(e1.frozenUntil > b.time, 'e1 stunned for 1s');
  assert.ok(e2.frozenUntil > b.time, 'e2 stunned for 1s');
});

test('White Tiger Apex channels Terror Roar: all enemies retreat backward 3s and slow 45%', () => {
  const b = battle(['tigerCubApex'], [4]);
  const tiger = b.units[0];
  tiger.lineage = 'tiger';
  const e1 = enemy(b, 5.0, 100000);

  for (let i = 1; i <= 10; i++) G.attack(b, tiger);
  assert.strictEqual(tiger.attackCount, 10);
  assert.ok(tiger.channeling);
  assert.strictEqual(tiger.channeling.type, 'white-tiger');

  tiger.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(tiger.channeling, null);
  assert.ok(e1.retreatingUntil > b.time, 'e1 retreating backward');
  assert.ok(e1.slows.some(s => s.power === 0.45), 'e1 slowed 45%');
});

test('Xuanwu Apex channels Toxin Zone on highest density quadrant for 5s', () => {
  const b = battle(['xuanwuCubApex'], [4]);
  const xuanwu = b.units[0];
  xuanwu.lineage = 'xuanwu';
  // Put 2 enemies in quadrant 1 (p between 4 and 8)
  const e1 = enemy(b, 5.0, 100000);
  const e2 = enemy(b, 6.0, 100000);

  for (let i = 1; i <= 10; i++) G.attack(b, xuanwu);
  assert.strictEqual(xuanwu.attackCount, 10);
  assert.ok(xuanwu.channeling);
  assert.strictEqual(xuanwu.channeling.type, 'xuanwu-toxin');

  xuanwu.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(xuanwu.channeling, null);
  assert.ok(b.xuanwuToxins.length > 0, 'Toxin zone created');
  assert.strictEqual(b.xuanwuToxins[0].quadrant, 1, 'Toxin placed in quadrant 1');
});

test('Great Sage Equal to Heaven channels staff strike for 200% ATK down track quadrant', () => {
  const b = battle(['monkeyCubApex'], [4]);
  const sage = b.units[0];
  sage.lineage = 'monkey';
  const e1 = enemy(b, 5.0, 100000); // quadrant 1

  for (let i = 1; i <= 10; i++) G.attack(b, sage);
  assert.strictEqual(sage.attackCount, 10);
  assert.ok(sage.channeling);
  assert.strictEqual(sage.channeling.type, 'great-sage-staff');

  const preHp = e1.hp;
  sage.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(sage.channeling, null);
  assert.strictEqual(preHp - e1.hp, 169 * 2.0, '200% ATK dealt');
});
