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

function enemy(b, p = 4, hp = 1000, maxHp = 1000, defense = 0) {
  const e = {
    uid: b.enemies.length + 1, p, hp, maxHp, speed: 0, defense, gone: false,
    slows: [], bleeds: [], burns: [], venoms: [], auras: [], ruleMarks: 0,
    tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 }
  };
  b.enemies.push(e);
  return e;
}

// 1. Cultivation Ecosystem
test('Soul-Reaping Heavenly Demon: death detonation removed (no 160 AOE on enemy death)', () => {
  const b = battle(['soulReapingDemon'], [0]);
  const dyingEnemy = enemy(b, 4, 10, 1000);
  const bystander = enemy(b, 4.2, 1000, 1000); // within 1.5 tiles
  
  // Kill dyingEnemy
  G.damage(b, dyingEnemy, 50, b.units[0]);
  assert.equal(dyingEnemy.hp, 0);
  assert.equal(dyingEnemy.gone, true);
  
  // Bystander should NOT take 160 detonation damage
  assert.equal(bystander.hp, 1000, 'Bystander should not take death explosion damage');
});

test('Realm Qi Caps: practitioner caps at 30, 85, 175, 200 without pill; excess Qi is discarded with no growth', () => {
  const b = battle(['practitioner'], [0]);
  const u = b.units[0];
  
  // Cap at 30 for practitioner realm 0
  G.addQi(b, u, 50);
  assert.equal(u.qi, 30, 'Qi should cap at 30 without breakthrough pill');
  assert.equal(u.permanentAtkBonus || 0, 0, 'No excess Qi ATK growth on unascended practitioner');
  
  // Test Nascent Soul caps at 200
  const bSoul = battle(['cultivationNascentSoul'], [0]);
  const soul = bSoul.units[0];
  soul.qi = 190;
  G.addQi(bSoul, soul, 30);
  assert.equal(soul.qi, 200, 'Nascent Soul should cap at 200 Qi');
  assert.equal(soul.permanentAtkBonus || 0, 0, 'No excess Qi ATK growth on Nascent Soul');
});

test('Weiqi Board: stuns on corners 4, 8, 12 only; ignores 0 and 16', () => {
  const b = battle(['weiqiBoard'], [0]);
  const e1 = enemy(b, 15.8);
  // Cross 16
  G.triggerWeiqiCorner(b, e1, 15.8, 16.2);
  assert.equal(e1.weiqiCornerStunned || false, false, 'Tile 16 / 0 should not trigger weiqi corner stun');
  
  const e2 = enemy(b, 3.8);
  // Cross corner 4
  G.triggerWeiqiCorner(b, e2, 3.8, 4.2);
  assert.equal(e2.weiqiCornerStunned, true, 'Corner 4 should trigger weiqi corner stun');
});

// 2. Bloodline Fantasy Ecosystem
test('Burn spread on death: only triggers when Phoenix T3 or Apex is deployed', () => {
  // Case A: No Phoenix deployed (e.g. Pyromancer)
  const bNoPhoenix = battle(['pyroMage'], [0]);
  const dying = enemy(bNoPhoenix, 5, 10, 100);
  const behind = enemy(bNoPhoenix, 4, 100, 100);
  G.dot(bNoPhoenix, dying, 'burn', 10, 3, bNoPhoenix.units[0]);
  assert.equal(dying.burns.length, 1);
  G.damage(bNoPhoenix, dying, 50, bNoPhoenix.units[0]);
  assert.equal(behind.burns?.length || 0, 0, 'Burn should not spread on death without Phoenix');

  // Case B: Phoenix Apex deployed
  const bPhoenix = battle(['phoenixCubApex'], [0]);
  const dyingP = enemy(bPhoenix, 5, 10, 100);
  const behindP = enemy(bPhoenix, 4, 100, 100);
  G.dot(bPhoenix, dyingP, 'burn', 10, 3, bPhoenix.units[0]);
  G.damage(bPhoenix, dyingP, 50, bPhoenix.units[0]);
  assert.equal(behindP.burns.length, 1, 'Burn should spread on death when Phoenix is deployed');
});

test('Stone Simian: undocumented +10% base crit chance removed', () => {
  const b = battle(['monkeyCubT1', 'monkeyCubT2', 'monkeyCubT3', 'monkeyCubApex'], [0, 1, 2, 3]);
  for (const m of b.units) {
    // Base crit for standard non-tiger/non-sensor unit with no relics is 0.10 (10%)
    const c = G.crit(b, m);
    assert.equal(c, 0.10, `${m.id} should have base 10% crit rate, not 20%`);
  }
});

test('Multiple Blood Altars: each deployed instance triggers support on consumption', () => {
  // Two Altars deployed around a Cub (slot 0 is adjacent to slot 1 and slot 3)
  const bAltar = battle(['cub', 'altar', 'altar'], [0, 1, 3]);
  const cub = bAltar.units[0];
  const initialAtk = cub.permanentAtkBonus || 0;
  
  // Trigger fodder consumed event
  G.event(bAltar, 'consumed', { unit: { species: 'serpent', id: 'hornedSerpent' } });
  G.flushEvents(bAltar);
  
  // Each altar grants +2 permanent ATK, so cub should gain +4 ATK total
  assert.equal(cub.permanentAtkBonus, initialAtk + 4, 'Two Altars should each grant +2 permanent ATK');
});

// 3. Arcane Magic Ecosystem
test('Astral Loom: adjacent unit gains exactly 2 ticks total per normal attack', () => {
  const b = battle(['pyroMage', 'astralLoom'], [0, 1]);
  const pyro = b.units[0];
  enemy(b);
  pyro.threshold.current = 0;
  G.attack(b, pyro);
  assert.equal(pyro.threshold.current, 2, 'Adjacent mage should gain 2 ticks total per attack');
});

test('Arcane Reactions: Earth+Wind (Dust Abrasion) inflicts 1 bleed stack for 3s (1% max HP/s)', () => {
  const b = battle(['elementalApprentice'], [0]);
  const app = b.units[0];
  const e1 = enemy(b, 4, 1000, 1000);
  G.arcaneReaction(b, app, e1, 'earth');
  G.arcaneReaction(b, app, e1, 'wind');
  assert.equal(e1.bleeds.length, 1, 'Should apply 1 bleed stack');
  assert.equal(e1.bleeds[0].until, b.time + 3, 'Bleed should last 3s');
  assert.equal(e1.bleeds[0].dps, 10, 'Bleed DPS should be 1% max HP');
});

test('Arcane Reactions: Earth+Water drenches target and reduces armor by 20% for 3s', () => {
  const b = battle(['elementalApprentice'], [0]);
  const app = b.units[0];
  const e2 = enemy(b, 4, 1000, 1000, 0.5);
  G.arcaneReaction(b, app, e2, 'earth');
  G.arcaneReaction(b, app, e2, 'water');
  assert.equal(e2.drenchedUntil, b.time + 3, 'Target should be Drenched for 3s');
  assert.equal(e2.shredUntil, b.time + 3, 'Armor shred should last 3s');
  assert.equal(e2.shredAmount, 0.20, 'Armor shred amount should be 20%');
});

test('Arcane Reactions: Fire+Wind spreads active burns to up to 2 runners behind target safely', () => {
  const b = battle(['elementalApprentice'], [0]);
  const app = b.units[0];
  const eFront = enemy(b, 8, 1000, 1000);
  const eBehind1 = enemy(b, 6, 1000, 1000);
  const eBehind2 = enemy(b, 4, 1000, 1000);
  G.dot(b, eFront, 'burn', 10, 4, app);
  assert.equal(eFront.burns.length, 1);
  G.arcaneReaction(b, app, eFront, 'fire');
  G.arcaneReaction(b, app, eFront, 'wind');
  assert.equal(eBehind1.burns.length, 1, 'Runner 1 behind should receive burn stack');
  assert.equal(eBehind2.burns.length, 1, 'Runner 2 behind should receive burn stack');
});
