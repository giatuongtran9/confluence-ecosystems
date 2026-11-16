'use strict';
// Card faces show one short line (brief) plus keyword icons; full rules stay in Details and read as plain words.
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../data');
const { keywordsFor } = require('../src/keywords.js');
const all = Object.values(D.CARD);

test('every card has a one-line brief', () => {
  for (const c of all) { assert.ok(c.brief, c.id); assert.ok(c.brief.length <= 60, `${c.id}: ${c.brief.length} chars`); }
});

test('rules read as words, not code', () => {
  for (const c of all) assert.doesNotMatch(c.rules, /Math\.|floor\(|=>|[[\]{}]|,,/, c.id);
});

test('keywords come from what a card does in battle, not from its trial text', () => {
  const ids = id => keywordsFor(D.CARD[id]).map(k => k.id);
  assert.ok(ids('leech').includes('bleed'));
  assert.deepEqual(ids('sensor'), ['support', 'crit']);
  assert.ok(!ids('practitioner').includes('stun'), 'the tribulation storm is not a stun the card deals');
  assert.ok(ids('practitioner').includes('ascend'));
  assert.ok(!ids('railgun').includes('support'));
});
