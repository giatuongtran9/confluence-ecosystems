'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');
const D = require('../data');

function battle(ids, slots = ids.map((_, i) => i), leader = 'none') {
  const r = G.newRun(leader, 17);
  r.roster = ids.map(id => G.instance(r, id));
  r.depth = 9;
  r.node = { row: 9, lane: 1, type: 'battle' };
  r.phase = 'combat';
  const b = {
    run: r,
    time: 0,
    units: [],
    enemies: [],
    effects: [],
    metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 },
    plan: { count: 3, interval: 2, hp: 100, speed: 0.3 },
    spawned: 3,
    enemyUid: 0
  };
  b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
  b.units.forEach(u => {
    G.prepareHooks(b, u);
    G.record(b, u);
    u.currentCooldown = 999;
  });
  return b;
}

function enemy(b, kind = '', p = 1, hp = 100000) {
  const e = {
    uid: ++b.enemyUid,
    p,
    hp,
    maxHp: hp,
    speed: 0.3,
    defense: 0,
    boss: kind === 'boss',
    champion: kind === 'champion',
    elite: kind === 'elite',
    gone: false,
    bornAt: 0,
    frozenUntil: 0,
    slows: [],
    bleeds: [],
    burns: [],
    venoms: [],
    auras: []
  };
  b.enemies.push(e);
  return e;
}

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('Phase 1: Card & Data Definitions - rarities, base stats, and support card properties', () => {
  assert.equal(D.CARD.pyroMage.rarity, 'Rare');
  assert.equal(D.CARD.pyroMage.baseAtk, 25);
  assert.equal(D.CARD.pyroMage.attackInterval, 1.4);
  assert.equal(D.CARD.pyroMage.max, 10);

  assert.equal(D.CARD.hydroMage.rarity, 'Rare');
  assert.equal(D.CARD.hydroMage.baseAtk, 22);
  assert.equal(D.CARD.hydroMage.attackInterval, 1.4);
  assert.equal(D.CARD.hydroMage.max, 10);

  assert.equal(D.CARD.geoMage.rarity, 'Rare');
  assert.equal(D.CARD.geoMage.baseAtk, 23);
  assert.equal(D.CARD.geoMage.attackInterval, 1.4);
  assert.equal(D.CARD.geoMage.max, 10);

  assert.equal(D.CARD.aeroMage.rarity, 'Rare');
  assert.equal(D.CARD.aeroMage.baseAtk, 22);
  assert.equal(D.CARD.aeroMage.attackInterval, 1.3);
  assert.equal(D.CARD.aeroMage.max, 10);

  assert.equal(D.CARD.manaBattery.baseAtk, 0);
  assert.equal(D.CARD.manaBattery.attackInterval, 0);
  assert.equal(D.CARD.elementalPrism.baseAtk, 0);
  assert.equal(D.CARD.elementalPrism.attackInterval, 0);

  assert.equal(D.CARD.elementalApprentice.baseAtk, 12);
  assert.equal(D.CARD.elementalApprentice.attackInterval, 1.5);

  assert.equal(D.CARD.elementalAdept.baseAtk, 25);
  assert.equal(D.CARD.elementalAdept.attackInterval, 1.4);

  assert.equal(D.CARD.elementalMage.baseAtk, 55);
  assert.equal(D.CARD.elementalMage.attackInterval, 1.4);

  assert.equal(D.CARD.elementalArchmage.rarity, 'Legendary');
  assert.equal(D.CARD.elementalArchmage.baseAtk, 90);
  assert.equal(D.CARD.elementalArchmage.attackInterval, 1.4);

  assert.equal(D.CARD.magmaLord.baseAtk, 150);
  assert.equal(D.CARD.magmaLord.attackInterval, 1.2);
  assert.equal(D.CARD.tempestArchon.baseAtk, 135);
  assert.equal(D.CARD.tempestArchon.attackInterval, 0.9);
  assert.equal(D.CARD.steamSovereign.baseAtk, 145);
  assert.equal(D.CARD.steamSovereign.attackInterval, 1.4);
  assert.equal(D.CARD.quagmireColossus.baseAtk, 150);
  assert.equal(D.CARD.quagmireColossus.attackInterval, 1.5);
  assert.equal(D.CARD.blizzardArchon.baseAtk, 140);
  assert.equal(D.CARD.blizzardArchon.attackInterval, 1.2);
  assert.equal(D.CARD.sandstormTitan.baseAtk, 145);
  assert.equal(D.CARD.sandstormTitan.attackInterval, 1.0);
});

test('Phase 2: Apprentice Path Locking at 25 points and 2:1 off-pair conversion', () => {
  const b = battle(['elementalApprentice']), u = b.units[0];
  assert.equal(u.lockedPair, undefined);

  // Feed 24 points to earth+fire
  for (let i = 0; i < 24; i++) {
    G.receiveEssence(b, u, 'earth');
    G.receiveEssence(b, u, 'fire');
  }
  assert.equal(u.synthesis['earth+fire'], 24);
  assert.equal(u.lockedPair, undefined);
  assert.equal(u.id, 'elementalApprentice');

  // 25th point locks the path to earth+fire and evolves to elementalAdept
  G.receiveEssence(b, u, 'earth');
  G.receiveEssence(b, u, 'fire');
  assert.equal(u.synthesis['earth+fire'], 25);
  assert.equal(u.lockedPair, 'earth+fire');
  assert.equal(u.id, 'elementalAdept');

  // Now feed an off-pair: water+wind (should convert 2:1 -> +0.5 to earth+fire)
  G.receiveEssence(b, u, 'water');
  G.receiveEssence(b, u, 'wind');
  assert.equal(u.synthesis['earth+fire'], 25.5);
  assert.equal(u.synthesis['water+wind'], undefined);

  // Feed more off-pair until 45 points -> evolves to elementalMage
  for (let i = 0; i < 39; i++) {
    G.receiveEssence(b, u, 'water');
    G.receiveEssence(b, u, 'wind');
  }
  // 25.5 + 39 * 0.5 = 25.5 + 19.5 = 45.0
  close(u.synthesis['earth+fire'], 45.0);
  assert.equal(u.id, 'elementalMage');

  // Feed to 65 points -> evolves to elementalArchmage
  for (let i = 0; i < 40; i++) {
    G.receiveEssence(b, u, 'water');
    G.receiveEssence(b, u, 'wind');
  }
  // 45 + 20 = 65
  close(u.synthesis['earth+fire'], 65.0);
  assert.equal(u.id, 'elementalArchmage');

  // Check evolution progress UI label
  const prog = G.evolutionProgress(u);
  assert.equal(prog.current, 65);
  assert.equal(prog.max, 80);
  assert.ok(prog.label.includes('Path Locked'));
});

test('Phase 2: Mastery Growth Engine - spell cast increments Mastery and permanent ATK', () => {
  const b = battle(['pyroMage', 'hydroMage', 'geoMage', 'aeroMage']),
        [pyro, hydro, geo, aero] = b.units;
  const e = enemy(b);

  assert.equal(pyro.mastery || 0, 0);
  assert.equal(pyro.permanentAtkBonus || 0, 0);

  G.elementalSpell(b, pyro);
  assert.equal(pyro.mastery, 1);
  assert.equal(pyro.permanentAtkBonus, 1);

  G.elementalSpell(b, hydro);
  assert.equal(hydro.mastery, 1);
  assert.equal(hydro.permanentAtkBonus, 1);

  G.elementalSpell(b, geo);
  assert.equal(geo.mastery, 1);
  assert.equal(geo.permanentAtkBonus, 1);

  G.elementalSpell(b, aero);
  assert.equal(aero.mastery, 1);
  assert.equal(aero.permanentAtkBonus, 1);
});

test('Phase 2: Primary Mage Mastery scaling formulas', () => {
  // Pyromancer Burn Stacks: 1 + Math.floor(mastery / 10)
  const bP = battle(['pyroMage']), pyro = bP.units[0];
  pyro.mastery = 25;
  const e1 = enemy(bP);
  G.elementalSpell(bP, pyro); // mastery becomes 26 -> Math.floor(26/10) = 2 -> 1 + 2 = 3 burn stacks
  assert.equal(e1.burns.length, 3);

  // Hydromancer: ATK * (1 + mastery * 0.005) and applies Drenched (slow 30% for 3s)
  const bH = battle(['hydroMage']), hydro = bH.units[0];
  hydro.mastery = 20; // after spell, mastery is 21 -> 1 + 21 * 0.005 = 1.105
  const e2 = enemy(bH);
  G.elementalSpell(bH, hydro);
  const hydroAtk = G.atk(bH, hydro); // base 22 + 1 permanent ATK = 23
  close(100000 - e2.hp, hydroAtk * (1 + 21 * 0.005));
  assert.ok(e2.drenchedUntil > bH.time);
  assert.ok(e2.slows.some(s => s.power === 0.30));

  // Geomancer: pierces 20% + Math.floor(mastery / 5)% armor
  const bG = battle(['geoMage']), geo = bG.units[0];
  geo.mastery = 25; // after spell, mastery is 26 -> Math.floor(26/5) = 5 -> 25% pierce (armorFactor: 0.75)
  const e3 = enemy(bG);
  e3.defense = 0.5;
  G.elementalSpell(bG, geo);
  assert.ok(e3.hp < 100000);

  // Aeromancer: +Math.floor(mastery / 5)% attack speed, 4 targets at max gauge, +20% haste to neighbors
  const bA = battle(['aeroMage']), aero = bA.units[0];
  enemy(bA);
  aero.mastery = 14; // after spell, mastery is 15 -> Math.floor(15/5) = 3 (+3% vs +2%) -> +3% speed
  const spdBefore = G.speed(bA, aero);
  G.elementalSpell(bA, aero);
  const spdAfter = G.speed(bA, aero);
  assert.ok(spdAfter > spdBefore);
});

test('Phase 2: Support Structure Overhauls - Elemental Prism, Mana Battery, Astral Loom', () => {
  const b = battle(['pyroMage', 'elementalPrism', 'manaBattery', 'astralLoom', 'hydroMage'], [0, 1, 5, 4, 3]);
  const [pyro, prism, battery, loom, hydro] = b.units;
  enemy(b);

  // 1. Astral Loom grants adjacent units +20% attack speed
  const loomNeighbors = G.neighbors(b, loom, false);
  assert.ok(loomNeighbors.includes(prism));
  assert.ok(loomNeighbors.includes(battery));

  // Also normal attack adjacent to Astral Loom charges 2 ticks
  pyro.threshold.current = 0;
  // Move loom next to pyro (slot 1 next to slot 0)
  const bLoom = battle(['pyroMage', 'astralLoom'], [0, 1]);
  enemy(bLoom);
  G.attack(bLoom, bLoom.units[0]);
  assert.equal(bLoom.units[0].threshold.current, 2);

  // 2. Elemental Prism: when adjacent mage casts at max gauge, grants all deployed elemental mages +2 ticks
  const bPrism = battle(['pyroMage', 'elementalPrism', 'hydroMage'], [0, 1, 4]);
  enemy(bPrism);
  bPrism.units[0].threshold.current = 0;
  bPrism.units[2].threshold.current = 0;
  G.elementalLinks(bPrism, bPrism.units[0]);
  assert.equal(bPrism.units[0].threshold.current, 2);
  assert.equal(bPrism.units[2].threshold.current, 2);

  // 3. Mana Battery: every 8.0s, grants +4 ticks to one random deployed mage
  const bBat = battle(['manaBattery', 'pyroMage'], [0, 1]);
  enemy(bBat);
  bBat.units[1].threshold.current = 0;
  bBat.time = 8.0;
  G.arcaneExtras(bBat, bBat.units[0]);
  assert.equal(bBat.units[1].threshold.current, 4);
});

test('Phase 2 & 4: Archon 10th-attack cycle counters, channel triggers, and channel resolution', () => {
  const b = battle(['magmaLord']), u = b.units[0];
  const e = enemy(b, '', 1, 100000);

  // 9 normal attacks
  for (let i = 0; i < 9; i++) {
    G.attack(b, u);
  }
  assert.equal(u.archonAttacks, 9);
  assert.ok(!u.channeling);

  // 10th attack resets counter and enters 1.2s channel mode
  G.attack(b, u);
  assert.equal(u.archonAttacks, 0);
  assert.ok(u.channeling);
  assert.equal(u.channeling.type, 'magmaLord');
  assert.equal(u.channeling.duration, 1.2);

  // While channeling, normal attacks are blocked
  assert.equal(G.attack(b, u), false);

  // Step 1.2s to complete channel (dt clamped to max 0.1s in step)
  for (let s = 0; s < 13; s++) G.step(b, 0.1);
  assert.ok(!u.channeling);
  // Verify 16-tile Molten Fissure zone created
  assert.ok(b.arcaneZones.some(z => z.type === 'magmaFissure16'));
});

test('Phase 2 & 4: Sandstorm Titan 10s channel mode and 1s pulse', () => {
  const b = battle(['sandstormTitan']), u = b.units[0];
  const e = enemy(b, '', 1, 100000);
  e.defense = 0.5;

  u.archonAttacks = 9;
  G.attack(b, u);
  assert.ok(u.channeling);
  assert.equal(u.channeling.type, 'sandstormTitan');
  assert.equal(u.channeling.duration, 10.0);

  // Advance 1s: should strip 10% base armor and deal damage
  for (let s = 0; s < 12; s++) G.step(b, 0.1);
  assert.equal(e.permanentShred, 0.10);
  assert.ok(e.hp < 100000);
});

test('Phase 2 & 4: Scalding Vapor Sovereign - Drenched 10% burst happens ONLY 1 time per enemy', () => {
  const b = battle(['steamSovereign']), u = b.units[0];
  const e = enemy(b, '', 1, 100000);
  e.hp = 50000; // 50,000 missing HP -> 10% is 5,000
  e.drenchedUntil = b.time + 3.0;

  // First attack should trigger burst
  G.attack(b, u);
  assert.equal(e.scaldBursted, true);
  const hpAfterFirst = e.hp;

  // Second attack on the same drenched enemy should NOT trigger another scald burst
  G.attack(b, u);
  const dmgSecond = hpAfterFirst - e.hp;
  // dmgSecond should just be raw normal hit damage (~145), not another 5,000 burst
  assert.ok(dmgSecond < 1000);
});

test('Patronage shares only the co-element base max-gauge spell effect, without Mastery scaling', () => {
  // Magma Lord (Fire + Earth): Pyromancer pierces base 20%; Geomancer adds exactly one base Burn.
  const bM = battle(['magmaLord', 'pyroMage', 'geoMage'], [0, 1, 2]);
  const eM = enemy(bM); eM.defense = 0.5;
  G.elementalSpell(bM, bM.units[1]);
  assert.equal(eM.permanentShred, 0.2);
  const eM2 = enemy(bM, '', 2);
  G.elementalSpell(bM, bM.units[2]);
  assert.equal(eM2.burns.length, 1);
  assert.equal(eM2.burns[0].dps, 1000);

  // Firestorm Tempest (Fire + Wind): Pyro gains 4-target Wind effect + haste; Aero gains base Burn.
  const bT = battle(['tempestArchon', 'pyroMage', 'aeroMage'], [0, 1, 2]);
  for (let i = 0; i < 5; i++) enemy(bT, '', i + 1);
  G.elementalSpell(bT, bT.units[1]);
  assert.equal(bT.enemies.filter(e => e.hp < 100000).length, 4);
  assert.ok(bT.units[2].arcaneHasteUntil > bT.time);
  const bT2 = battle(['tempestArchon', 'aeroMage']); const eT2 = enemy(bT2);
  G.elementalSpell(bT2, bT2.units[1]);
  assert.equal(eT2.burns.length, 1);

  // Vapor Sovereign (Fire + Water): Pyro gains Drenched; Hydro gains one unscaled Burn.
  const bV = battle(['steamSovereign', 'pyroMage', 'hydroMage'], [0, 1, 2]);
  const eV = enemy(bV); G.elementalSpell(bV, bV.units[1]);
  assert.ok(eV.drenchedUntil > bV.time);
  const bV2 = battle(['steamSovereign', 'hydroMage']); const eV2 = enemy(bV2);
  G.elementalSpell(bV2, bV2.units[1]);
  assert.equal(eV2.burns.length, 1);

  // Quagmire (Water + Earth): Hydro gains base 20% armor pierce; Geo gains Drenched.
  const bQ = battle(['quagmireColossus', 'hydroMage', 'geoMage'], [0, 1, 2]);
  const eQ = enemy(bQ); eQ.defense = 0.5;
  G.elementalSpell(bQ, bQ.units[1]); assert.equal(eQ.permanentShred, 0.2);
  const eQ2 = enemy(bQ, '', 2); G.elementalSpell(bQ, bQ.units[2]);
  assert.ok(eQ2.drenchedUntil > bQ.time);

  // Glacial Typhoon (Water + Wind): Hydro gains 4 targets + haste; Aero gains Drenched.
  const bG = battle(['blizzardArchon', 'hydroMage', 'aeroMage'], [0, 1, 2]);
  for (let i = 0; i < 5; i++) enemy(bG, '', i + 1);
  G.elementalSpell(bG, bG.units[1]);
  assert.equal(bG.enemies.filter(e => e.hp < 100000).length, 4);
  assert.ok(bG.units[2].arcaneHasteUntil > bG.time);
  const bG2 = battle(['blizzardArchon', 'aeroMage']); const eG2 = enemy(bG2);
  G.elementalSpell(bG2, bG2.units[1]); assert.ok(eG2.drenchedUntil > bG2.time);

  // Sandstorm Titan (Earth + Wind): Geo gains 4 targets + haste; Aero gains base 20% pierce.
  const bS = battle(['sandstormTitan', 'geoMage', 'aeroMage'], [0, 1, 2]);
  for (let i = 0; i < 5; i++) enemy(bS, '', i + 1);
  G.elementalSpell(bS, bS.units[1]);
  assert.equal(bS.enemies.filter(e => e.hp < 100000).length, 4);
  assert.ok(bS.units[2].arcaneHasteUntil > bS.time);
  const bS2 = battle(['sandstormTitan', 'aeroMage']); const eS2 = enemy(bS2); eS2.defense = 0.5;
  G.elementalSpell(bS2, bS2.units[1]); assert.equal(eS2.permanentShred, 0.2);
});

test('Magma Lord normal fissure applies only Burn while enemies remain on the tile', () => {
  const b = battle(['magmaLord']), u = b.units[0], e = enemy(b, '', 1, 100000);
  const hp = e.hp;
  G.attack(b, u);
  assert.equal(e.hp, hp - G.atk(b, u));
  assert.ok(b.arcaneZones.some(z => z.type === 'magma' && z.until === 2));
  for (let i = 0; i < 12; i++) { b.time += 0.1; G.tickArcane(b, 0.1); }
  assert.equal(e.burns.length, 1);
  assert.equal(e.burns[0].dps, 1000);
  // The fissure doesn't inflict flat 60 DPS; only the normal hit and Burn stack apply.
  assert.ok(e.hp >= hp - G.atk(b, u));
  e.p = 2; const count = e.burns.length;
  for (let i = 0; i < 12; i++) { b.time += 0.1; G.tickArcane(b, 0.1); }
  assert.equal(e.burns.length, count);
});

test('Elemental Prism has no one-second throttle but blocks recursive Prism chains', () => {
  const b = battle(['pyroMage', 'elementalPrism', 'hydroMage'], [0, 1, 4]);
  enemy(b);
  G.elementalLinks(b, b.units[0]);
  assert.equal(b.units[0].threshold.current, 2);
  assert.equal(b.units[2].threshold.current, 2);
  b.time = 0.1;
  G.elementalLinks(b, b.units[0]);
  assert.equal(b.units[0].threshold.current, 4);
  assert.equal(b.units[2].threshold.current, 4);
  assert.equal(b.units[1].prismAt, undefined);
});
