'use strict';
// Haunted A (Order) vs B (Chaos): shared gauge, Lights On, Citations, Case Files, Order Mythic 10th abilities.
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');

function battle(ids, slots = ids.map((_, i) => i), seed = 17, type = 'battle') {
 const r = G.newRun('none', seed);
 r.roster = ids.map(id => G.instance(r, id));
 r.node = { row: 5, lane: 1, type }; r.depth = 5; r.phase = 'combat';
 const b = { run: r, time: 0, units: [], enemies: [], effects: [], metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, plan: { count: 0, interval: 1, hp: 100 }, spawned: 0 };
 b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
 b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
 return b;
}
function enemy(b, p = 4, hp = 100000) {
 const e = { uid: b.enemies.length + 1, p, hp, maxHp: hp, speed: .336, defense: 0, gone: false, slows: [], bleeds: [], burns: [], venoms: [], auras: [], stuns: [], ruleMarks: 0, tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 } };
 b.enemies.push(e); return e;
}

test('25 Citations push the gauge to −100 and fire Lights On with the shared 8s lockout', () => {
 const b = battle(['investigator']);
 for (let i = 0; i < 5; i++) { const e = enemy(b, i + 1); G.addRuleMark(b, e, 5, b.units[0]); }
 assert.ok(G.lightsOn(b));
 assert.equal(b.orderChaos, 0);
 assert.ok(Math.abs(b.lightsOnUntil - 6) < 1e-9);
 assert.ok(Math.abs(b.blackoutLockoutUntil - 14) < 1e-9);
 G.pushGauge(b, -50); assert.equal(b.orderChaos, 0); // frozen during the pole
});

test('Chaos violations still fire Blackout after 5 (+20 each) on the same gauge', () => {
 const b = battle(['kuchisake']); enemy(b);
 for (let i = 0; i < 4; i++) G.grantUrbanViolation(b, b.units[0], 1);
 assert.equal(b.orderChaos, 80); assert.ok(!(b.curfewUntil > b.time));
 G.grantUrbanViolation(b, b.units[0], 1);
 assert.ok(b.curfewUntil > b.time);
});

test('crossing zero flickers: the leading runner is stunned 0.5s', () => {
 const b = battle(['investigator', 'kuchisake']); const lead = enemy(b, 9); enemy(b, 2);
 G.pushGauge(b, -8); G.pushGauge(b, 20);
 assert.equal(b.orderChaos, 12);
 assert.ok((lead.stuns || []).some(s => s.until > b.time) || lead.frozenUntil > b.time);
});

test('Blackout blocks new Citations; 3+ Citations make a runner Compliant and not a taboo-breaker', () => {
 const b = battle(['investigator']); const e = enemy(b); e.panicUntil = 99;
 b.curfewUntil = 5; G.addRuleMark(b, e, 1, b.units[0]); assert.equal(e.ruleMarks, 0);
 b.curfewUntil = 0; G.addRuleMark(b, e, 3, b.units[0]);
 assert.ok(G.compliant(b, e));
});

test('Security Monitor opens a Case File every 3rd Citation, every 2nd beside an Investigator', () => {
 const far = battle(['securityCam', 'investigator'], [0, 8]);
 for (let i = 0; i < 6; i++) G.addRuleMark(far, enemy(far, i + 1), 1, far.units[1]);
 assert.equal(far.caseFiles, 2);
 const near = battle(['securityCam', 'investigator'], [0, 1]);
 for (let i = 0; i < 6; i++) G.addRuleMark(near, enemy(near, i + 1), 1, near.units[1]);
 assert.equal(near.caseFiles, 3);
 near.caseFiles = 6; G.addRuleMark(near, enemy(near, 9), 2, near.units[1]); // pool cap
 assert.ok(near.caseFiles <= 6);
});

test('Security Monitor and Emergency Broadcast are 0/0 supports; ranks use the anchor stats', () => {
 const b = battle(['securityCam', 'radioPA', 'investigator']);
 assert.equal(b.units[0].attackInterval, 0); assert.equal(b.units[1].attackInterval, 0);
 assert.equal(G.rawAtk(b.units[2]), 12); assert.equal(b.units[2].attackInterval, 1.5);
});

test('Lights On: Order units +30% attack speed and +20% damage', () => {
 const b = battle(['investigator']); const u = b.units[0], e = enemy(b);
 const base = G.speed(b, u); b.lightsOnUntil = 10;
 assert.ok(Math.abs(G.speed(b, u) - base * 1.3) < 1e-9);
 G.damage(b, e, 100, u); assert.equal(e.maxHp - e.hp, 120);
});

test('Forensic necrosis is 30% ATK per second and refreshes instead of stacking', () => {
 const b = battle(['forensicDemiurge']); const u = b.units[0], e = enemy(b); e.ruleMarks = 1;
 G.attack(b, u); b.time = 1; G.attack(b, u);
 const nec = e.bleeds.filter(x => x.necrosis);
 assert.equal(nec.length, 1);
 assert.ok(Math.abs(nec[0].dps - G.atk(b, u) * 0.3) < 1e-6);
});

test('Order Mythics channel 1.2s on every 10th attack', () => {
 for (const id of ['ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden']) {
  const b = battle([id]); const u = b.units[0]; enemy(b); u.attackCount = 9;
  G.attack(b, u);
  assert.equal(u.channeling?.type, 'order-' + id, id);
  assert.equal(u.channeling.duration, 1.2);
 }
});

test('10th abilities: Rule Zero cites +2 and hits 150% true; Warden banishes for 100% ATK/s', () => {
 const b = battle(['ruleArchitect']); const u = b.units[0]; const a = enemy(b, 6), z = enemy(b, 2);
 G.resolveOrderUlt(b, u, 'ruleArchitect', 100);
 assert.deepEqual([a.ruleMarks, z.ruleMarks], [2, 2]);
 assert.ok(a.hp < a.maxHp);
 const w = battle(['backroomsWarden']); const lead = enemy(w, 10);
 G.resolveOrderUlt(w, w.units[0], 'backroomsWarden', 140);
 assert.ok(lead.bleeds.some(x => Math.abs(x.dps - 140) < 1e-6));
 assert.ok(lead.p < 10);
});

test('Promotion: two relics beside the Enforcer pick one at random, never by choice', () => {
 const picked = new Set();
 for (let seed = 1; seed <= 40 && picked.size < 2; seed++) {
  const b = battle(['ruleEnforcer', 'ruleboard', 'panopticon'], [4, 1, 3], seed, 'elite');
  const enf = b.units[0]; enf.dread = 140;
  const t = G.startUrbanContainmentTrial(b);
  assert.ok(t, 'trial starts');
  picked.add(t.relicId);
 }
 assert.deepEqual([...picked].sort(), ['panopticon', 'ruleboard']);
});
