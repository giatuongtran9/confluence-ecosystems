// The card data and rules engine stay dual-mode classic files (the Node tests require() them). Importing them here
// runs them once, in order, and they define their globals; the UI modules then import the names from this module.
import '../data.js';
import '../engine.js';
import '../battlefield-view.js';

export const { GENRES, LEADERS, CARDS, CARD, NODES, RELICS, FORMS, TOKENS, Game, BattleView } = window;
