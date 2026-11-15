'use strict';
// Cross-genre balance pass: %-max-HP boss halving, idle Chaos swipes, summon caps, Bone Saw aura, stair rearm, save migration.
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../engine');

function battle(ids, slots = ids.map((_, i) => i)) {
 const r = G.newRun('orion', 17);
 r.roster = ids.map(id => G.instance(r, id));
 r.node = { row: 5, lane: 1, type: 'battle' }; r.depth = 5; r.phase = 'combat';
 const b = { run: r, time: 0, units: [], enemies: [], effects: [], metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, plan: { count: 0, interval: 1, hp: 100 }, spawned: 0 };
 b.units = r.roster.map((u, i) => G.runtime(b, u, slots[i]));
 b.units.forEach(u => { G.prepareHooks(b, u); G.record(b, u); });
 return b;
}
function enemy(b, p = 4, hp = 100000, extra = {}) {
 const e = { uid: b.enemies.length + 1, p, hp, maxHp: hp, speed: .3, defense: 0, gone: false, slows: [], bleeds: [], burns: [], venoms: [], stuns: [], weakpoints: 0, ruleMarks: 0, tabooMarks: {}, ...extra };
 b.enemies.push(e); return e;
}

test('Bosses take half from 1%-max-HP stacks', () => {
 const b = battle(['matriarch']); const u = b.units[0];
 const grunt = enemy(b, 6), boss = enemy(b, 5, 100000, { boss: true });
 G.attack(b, u);
 assert.equal(grunt.bleeds.at(-1).dps, 1000);
 assert.equal(boss.bleeds.at(-1).dps, 500);
});

test('an idle Chaos legend swipes the leading runner for 50% ATK; the 13th Step stays a pure trap', () => {
 const b = battle(['payphone', 'stair13']); const e = enemy(b);
 assert.equal(G.attack(b, b.units[0]), true);
 assert.ok(e.hp < 100000); assert.equal(b.units[0].violations || 0, 0);
 assert.equal(G.attack(b, b.units[1]), false);
});

test('Monkey clones: at most 2 alive, each expires after 6s', () => {
 const b = battle(['monkeyCubT3'], [4]); const u = b.units[0]; enemy(b);
 for (let i = 0; i < 16; i++) { u.currentCooldown = 0; G.attack(b, u); }
 const clones = b.units.filter(v => !v.removed && v.summonerUid === u.uid);
 assert.equal(clones.length, 2);
 assert.ok(clones.every(c => c.expiresAt === b.time + 6));
});

test('Bone Saw is a 0/0 support: adjacent Order allies bleed Cited runners', () => {
 const b = battle(['investigator', 'boneSaw'], [0, 1]); const [inv, saw] = b.units;
 assert.equal(saw.attackInterval, 0);
 const e = enemy(b, 6, 100000, { ruleMarks: 1 });
 G.attack(b, inv);
 assert.ok(e.bleeds.some(x => x.owner === inv.uid));
});

test('lesser stairs rearm on their interval instead of firing on every runner step', () => {
 const b = battle(['stair13']); const e1 = enemy(b, 3.98), e2 = enemy(b, 3.98);
 G.step(b, 0.1);
 assert.equal([e1, e2].filter(e => e.hp < 100000).length, 1);
});

test('saves holding deleted cards drop them and refund 10 coins each', () => {
 const r = G.newRun('orion', 3); r.roster = [G.instance(r, 'investigator'), { uid: 99, id: 'chitinHelix' }, { uid: 100, id: 'dossier' }]; r.coins = 5;
 assert.equal(G.migrateRun(r), 2);
 assert.deepEqual(r.roster.map(u => u.id), ['investigator']);
 assert.equal(r.coins, 25);
});

test('every redesign 10th ability has a VFX style and resolves through an ult-burst effect', () => {
 const src = require('node:fs').readFileSync(require.resolve('../app'), 'utf8');
 const table = src.slice(src.indexOf('const RD_ULTS = {'), src.indexOf('const RD_CHANNEL'));
 for (const id of ['berserkerColossus', 'siegeDreadnought', 'vanguardJuggernaut', ...Object.keys(G.CHAOS_ULTS), ...Object.keys(G.ORDER_ULTS), ...Object.keys(G.XENO_ULTS), ...Object.keys(G.CYBER_ULTS), ...Object.keys(G.HUNT_ULTS), ...Object.keys(G.COSMIC_ULTS)]) {
  assert.ok(table.includes(id + ':'), id);
 }
 const b = battle(['chronoPhantom']); enemy(b); G.resolveCyberUlt(b, b.units[0], 'chronoPhantom', 100);
 const f = b.effects.find(x => x.vfxKind === 'ult-burst'); assert.equal(f.ult, 'chronoPhantom'); assert.equal(f.text, 'TIME STOP');
});

test('Haunted B Mythics channel a 1.2s 10th ability (Penrose on its 10th trap)', () => {
 for (const id of Object.keys(G.CHAOS_ULTS).filter(id => id !== 'penroseLabyrinth')) {
  const b = battle([id]); const u = b.units[0]; enemy(b); u.attackCount = 9; G.attack(b, u);
  assert.equal(u.channeling?.type, 'chaos-' + id, id);
 }
 const b = battle(['livingTaboo']), e = enemy(b); G.resolveChaosUlt(b, b.units[0], 'livingTaboo', 100);
 assert.ok(e.tabooForcedUntil > b.time); assert.ok(b.effects.some(f => f.ult === 'livingTaboo'));
});

test('32-stage map: act bosses at 10/21/31, at least 3 shops, a Champion before each boss', () => {
 for (const seed of [1, 2, 3, 4, 5]) {
  const r = G.newRun('shen', seed); assert.equal(r.map.length, 32);
  for (const row of [10, 21, 31]) assert.deepEqual(r.map[row].map(n => n.type), ['boss']);
  assert.ok(r.map.flat().filter(n => n.type === 'shop').length >= 3);
  for (const [lo, hi] of [[4, 10], [11, 21], [22, 31]]) assert.ok(r.map.slice(lo, hi).flat().some(n => n.type === 'champion'), `seed ${seed} act ${lo}`);
 }
});

test('shop: buy a card, buy a general relic, remove one card, then return to the map', () => {
 const r = G.newRun('shen', 9); r.roster = ['practitioner', 'lotusRoot', 'herbGrass', 'cauldron'].map(id => G.instance(r, id)); r.coins = 1000; r.phase = 'map';
 const shop = r.map.flat().find(n => n.type === 'shop'); r.depth = shop.row - 1; r.lane = shop.lane; r.node = r.map[r.depth][0];
 assert.ok(G.chooseNode(r, shop.id)); assert.equal(r.phase, 'event'); assert.equal(r.shop.cards.length, 3);
 const card = r.shop.cards[0]; assert.ok(G.shopBuyCard(r, card.id)); assert.equal(r.roster.at(-1).id, card.id); assert.ok(!G.shopBuyCard(r, card.id));
 const relic = r.shop.relics[0]; assert.ok(G.shopBuyRelic(r, relic.id)); assert.ok(r.relics.includes(relic.id));
 assert.ok(G.shopRemove(r, r.roster[1].uid)); assert.ok(!G.shopRemove(r, r.roster[1].uid), 'one removal per visit');
 assert.ok(G.leaveShop(r)); assert.equal(r.phase, 'map');
});
