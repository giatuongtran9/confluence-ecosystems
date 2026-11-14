'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');
const D = require('../data');

// Mirrors labBattle() in app.js: one unit, endless runners, sandbox leaks.
function labBattle(id) {
  const r = G.newRun(D.LEADERS[0].id, 1234);
  r.roster = [G.instance(r, id)];
  r.node = { row: 0, lane: 1, type: 'battle' };
  r.depth = 5;
  r.phase = 'ready';
  const b = G.deploy(r);
  b.sandbox = true;
  b.plan.count = Infinity;
  return b;
}

test('Ability Lab sandbox: runners that reach the end leave without costing health or ending the battle', () => {
  const b = labBattle('lotusRoot'); // deals no damage, so every runner reaches the end
  const health = b.run.health;
  for (let t = 0; t < 60; t += 1 / 30) G.step(b, 1 / 30);
  assert.equal(b.run.health, health);
  assert.equal(b.metrics.leaks, 0);
  assert.equal(b.done, false);
  assert.ok(b.spawned > 10, 'runners keep spawning');
});

test('Ability Lab sandbox: every card and evolved form runs without throwing', () => {
  for (const c of [...D.CARDS, ...D.FORMS]) {
    const b = labBattle(c.id);
    for (let t = 0; t < 8; t += 1 / 30) G.step(b, 1 / 30);
    assert.equal(b.done, false, c.id);
  }
});

test('Channel cooldown: a unit resumes attacking one interval after its channel ends (Sandstorm Titan 10s storm)', () => {
  const b = labBattle('sandstormTitan');
  const u = b.units[0];
  u.archonAttacks = 9; u.currentCooldown = 0;
  for (let i = 0; i < 40 && !u.channeling; i++) G.step(b, 0.1);
  assert.ok(u.channeling, 'storm started');
  for (let i = 0; i < 120 && u.channeling; i++) G.step(b, 0.1);
  assert.equal(u.channeling, null, 'storm ended');
  const before = u.archonAttacks || 0;
  for (let i = 0; i < Math.ceil(u.attackInterval * 10) + 3; i++) G.step(b, 0.1);
  assert.ok((u.archonAttacks || 0) > before, 'attacked again within about one interval');
});

test('Quagmire Colossus converts a quadrant to swamp only once per battle', () => {
  const b = labBattle('quagmireColossus');
  for (let t = 0; t < 12; t += 0.1) G.step(b, 0.1);
  const swamps = (b.arcaneZones || []).filter(z => z.type === 'swamp');
  assert.equal(swamps.length, 1);
});
