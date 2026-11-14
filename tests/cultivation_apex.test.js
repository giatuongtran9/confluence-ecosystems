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
    plan: { count: 0, interval: 1, hp: 100 }, spawned: 0, inkPuddles: []
  };
  b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
  b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
  return b;
}

function enemy(b, p = 4, hp = 100000, maxHp = 100000, defense = 0) {
  const e = {
    uid: b.enemies.length + 1, p, hp, maxHp, speed: 0, defense, gone: false,
    slows: [], bleeds: [], burns: [], venoms: [], auras: [], ruleMarks: 0,
    tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 }
  };
  b.enemies.push(e);
  return e;
}

test('Cultivation Mythic Apex: base stats and attack intervals', () => {
  const expectedStats = {
    swordImmortal: { baseAtk: 150, interval: 1.0 },
    melodicSaint: { baseAtk: 110, interval: 1.0 },
    formationMaster: { baseAtk: 110, interval: 0.8 },
    talismanSovereign: { baseAtk: 120, interval: 0.7 },
    landscapeSage: { baseAtk: 110, interval: 0.8 },
    soulReapingDemon: { baseAtk: 140, interval: 1.0 },
    bloodFiendMaster: { baseAtk: 150, interval: 1.0 }
  };

  for (const [id, stat] of Object.entries(expectedStats)) {
    const card = D.FORMS.find(f => f.id === id);
    assert.ok(card, `Card ${id} must exist in FORMS`);
    assert.strictEqual(card.baseAtk, stat.baseAtk, `${id} baseAtk`);
    assert.strictEqual(card.attackInterval, stat.interval, `${id} attackInterval`);
  }
});

test('Sword Immortal: pierce 50% DEF, 4-target falloff (100%->70%), 10th attack Colossal Sword + Sword Rain', () => {
  const b = battle(['swordImmortal'], [4]);
  const sword = b.units[0];

  const e1 = enemy(b, 5.0, 100000, 100000, 0.2);
  const e2 = enemy(b, 4.8, 100000, 100000, 0.2);
  const e3 = enemy(b, 4.5, 100000, 100000, 0.2);
  const e4 = enemy(b, 4.2, 100000, 100000, 0.2);
  const e5 = enemy(b, 4.0, 100000, 100000, 0.2);

  // Attack 1: Pierce 50% DEF (eff def = 0.10)
  G.attack(b, sword);
  assert.strictEqual(sword.attackCount, 1);
  assert.strictEqual(100000 - e1.hp, 135); // 150 * 0.90 = 135
  const d2 = 100000 - e2.hp;
  assert.ok(d2 === 121.5 || d2 === 243, `e2 damage falloff (expected ~121.5, got ${d2})`);
  const d3 = 100000 - e3.hp;
  assert.ok(d3 === 108 || d3 === 216, `e3 damage falloff (expected ~108, got ${d3})`);
  const d4 = 100000 - e4.hp;
  assert.ok(d4 === 94.5 || d4 === 189, `e4 damage falloff (expected ~94.5, got ${d4})`);
  assert.strictEqual(e5.hp, 100000); // 5th enemy takes 0 damage (max 3 behind)

  // Advance to 10th attack
  for (let i = 2; i <= 10; i++) G.attack(b, sword);
  assert.strictEqual(sword.attackCount, 10);
  assert.ok(sword.channeling, 'Should channel on 10th attack');
  assert.strictEqual(sword.channeling.type, 'sword-torrent');

  // Complete channel
  e1.boss = true;
  const preHp = e1.hp;
  sword.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(sword.channeling, null);
  assert.strictEqual(e1.hp, preHp, 'Damage is scheduled, not instant');
  // Rain lands over 0.15–0.7s, Colossal at 0.95s (+0.1s hit-stop)
  for (let i = 0; i < 14; i++) G.step(b, 0.1);
  assert.ok(e1.hp < preHp - 300, 'Boss should take sword rain + Colossal Sword');
  assert.ok(!b.pendingHits.length, 'All queued hits resolved');
});

test('Melodic Saint: Harmony chord buffs attack speed, Dissonance slows, 10th channels Celestial Resonance', () => {
  const b = battle(['melodicSaint', 'practitioner'], [4, 5]);
  const saint = b.units[0];
  const ally = b.units[1];
  const e1 = enemy(b, 4.0, 100000);

  // Attack 1: Harmony Chord (+50% attack speed to all allies for 2s)
  G.attack(b, saint);
  assert.ok(ally.harmonyChordUntil > b.time);
  assert.ok(G.speed(b, ally) >= 1.5, 'Ally gets +50% speed');

  // Attack 2: Dissonance Chord (slows all enemies)
  G.attack(b, saint);
  assert.ok(e1.slows.some(s => s.power === 0.45));

  // Advance to 10th attack
  for (let i = 3; i <= 10; i++) G.attack(b, saint);
  assert.strictEqual(saint.attackCount, 10);
  assert.ok(saint.channeling);
  assert.strictEqual(saint.channeling.type, 'melodic-resonance');

  saint.channeling.remaining = 0.05;
  const preHp = e1.hp;
  G.step(b, 0.1);
  assert.strictEqual(saint.channeling, null);
  // The resonance wave reaches the enemy after the 0.12s pluck plus its travel time (5 tiles/s)
  for (let i = 0; i < 10; i++) G.step(b, 0.1);
  assert.ok(e1.hp <= preHp - 200, 'Celestial Resonance deals 200% ATK');
  assert.ok(e1.frozenUntil > b.time, 'Enemy stunned (frozenUntil) by Celestial Resonance');
  assert.ok(!b.pendingHits.length, 'All wave hits resolved');
});

test('Formation Master: Black Stone (120%), White Stone (80% + 30% slow), 10th channels Star-River warp', () => {
  const b = battle(['formationMaster'], [4]);
  const master = b.units[0];
  const e1 = enemy(b, 5.0, 100000);

  // Attack 1: Black Stone (120% ATK)
  G.attack(b, master);
  assert.ok(e1.hp < 100000);

  // Attack 2: White Stone (80% ATK + 30% slow)
  G.attack(b, master);
  assert.ok(e1.slows.some(s => s.power === 0.30));

  // Reach 10th attack
  for (let i = 3; i <= 10; i++) G.attack(b, master);
  assert.strictEqual(master.attackCount, 10);
  assert.ok(master.channeling);
  assert.strictEqual(master.channeling.type, 'formation-star-river');

  // Finish channel: the star river sweeps back from the exit end and reaches the enemy shortly after
  const preP = e1.p, preHp = e1.hp;
  master.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(master.channeling, null);
  assert.strictEqual(e1.p, preP, 'Warp waits for the star river');
  for (let i = 0; i < 8; i++) G.step(b, 0.1);
  // Warps back 2 tiles (from 5.0 to 3.0) and deals 150% ATK (tile 3 is not a corner)
  assert.strictEqual(e1.p, Math.max(0, preP - 2));
  assert.ok(e1.hp < preHp, 'Star-River damage landed');
  assert.ok(e1.warpFx && e1.warpFx.from === preP, 'Slide-back data recorded for the renderer');
  assert.ok(!b.pendingHits.length, 'All sweep hits resolved');
});

test('Talisman Sovereign: 50% Vulnerable, <10% execute, 10th channels Imperial Decree', () => {
  const b = battle(['talismanSovereign'], [4]);
  const sov = b.units[0];
  const e1 = enemy(b, 5.0, 90, 1000); // 9% HP

  G.attack(b, sov);
  assert.ok(e1.hp <= 0, 'Enemy below 10% HP should be executed');

  // Spawn new target for attacks 2-10
  const e2 = enemy(b, 5.0, 100000, 100000);
  for (let i = 2; i <= 10; i++) G.attack(b, sov);
  assert.strictEqual(sov.attackCount, 10);
  assert.ok(sov.channeling);
  assert.strictEqual(sov.channeling.type, 'talisman-decree');

  sov.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(sov.channeling, null);
  assert.ok(e2.vulnerableUntil > b.time, 'Imperial decree applies Vulnerable to survivors');
});

test('Landscape Sage: ink puddle slow, 10th channels Mountain-River Ink Dragon (2s stun + Boss warp)', () => {
  const b = battle(['landscapeSage'], [4]);
  const sage = b.units[0];
  const boss = enemy(b, 6.0, 200000, 200000);
  boss.boss = true;

  G.attack(b, sage);
  assert.ok(b.inkPuddles?.length > 0, 'Creates ink puddle on track');

  for (let i = 2; i <= 10; i++) G.attack(b, sage);
  assert.strictEqual(sage.attackCount, 10);
  assert.ok(sage.channeling);
  assert.strictEqual(sage.channeling.type, 'landscape-dragon');

  const preP = boss.p;
  sage.channeling.remaining = 0.05;
  G.step(b, 0.1);
  // Boss warp is subject to boss resistance (3 * 0.5 = 1.5 tiles back)
  assert.strictEqual(boss.p, preP - 1.5, 'Boss warped backward 1.5 tiles (3.0 * 0.5 boss resistance)');
  assert.ok(boss.frozenUntil > b.time, 'Boss stunned for 2s (frozenUntil)');
});

test('Soul-Reaping Demon: multi-target hit, souls increment on enemy death, 10th deals (150 + floor(souls/2))% ATK', () => {
  const b = battle(['soulReapingDemon'], [4]);
  const demon = b.units[0];
  assert.strictEqual(demon.souls || 0, 0);

  // Kill an enemy to harvest soul
  const e1 = enemy(b, 4.0, 10, 100);
  G.damage(b, e1, 20, demon, 'direct');
  assert.strictEqual(demon.souls, 1, 'Souls should increment on enemy death');

  // Set 50 souls (adds +25% -> 175% ATK = 140 * 1.75 = 245)
  demon.souls = 50;
  const e2 = enemy(b, 4.0, 100000, 100000);

  for (let i = 1; i <= 10; i++) G.attack(b, demon);
  assert.strictEqual(demon.attackCount, 10);
  assert.ok(demon.channeling);
  assert.strictEqual(demon.channeling.type, 'soul-reap-detonation');

  const preHp = e2.hp;
  demon.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(preHp - e2.hp, 245, '175% ATK dealt with 50 souls');
});

test('Blood-Fiend Sword Master: 1 bleed stack on normal hit, 10th channels Boiling Blood Domain detonating bleeds + 20 stacks', () => {
  const b = battle(['bloodFiendMaster'], [4]);
  const bf = b.units[0];
  const e1 = enemy(b, 4.0, 100000, 100000);

  // Attack 1 applies 1 bleed stack
  G.attack(b, bf);
  assert.strictEqual(e1.bleeds.length, 1);
  assert.strictEqual(e1.bleeds[0].dps, 1000); // 1% of 100000 maxHp = 1000 dps

  for (let i = 2; i <= 10; i++) G.attack(b, bf);
  assert.strictEqual(bf.attackCount, 10);
  assert.ok(bf.channeling);
  assert.strictEqual(bf.channeling.type, 'blood-domain');

  bf.channeling.remaining = 0.05;
  G.step(b, 0.1);
  assert.strictEqual(bf.channeling, null);
  assert.strictEqual(e1.bleeds.length, 20, 'Should apply 20 bleed stacks');
});
