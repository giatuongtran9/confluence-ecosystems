// Keyword icons for card faces and the glossary in Details. Keywords are read from each card's full rules text, so
// new cards get icons without extra data. Order is priority: a card face shows the first few that match.
const K = (id, name, color, def, re, svg) => ({ id, name, color, def, re, svg });
export const KEYWORDS = [
  K('support', 'Support', '#8ec5ff', 'Strengthens allies; some supports never attack.', /does not attack(?! normally)|cannot attack|\bsupport\b|adjacent allies|allies gain|allies \+|grants? all|adjacent units gain/i,
    '<path d="M3 9l5-5 5 5M3 14l5-5 5 5" fill="none"/>'),
  K('summon', 'Summon', '#9be38f', 'Creates temporary units or tokens on free slots.', /summon|token|clone|blooms|salvage|reflections?\b/i,
    '<circle cx="8" cy="8" r="6" fill="none"/><path d="M8 5v6M5 8h6"/>'),
  K('devour', 'Devour', '#e58ad8', 'Eats adjacent cards or tokens for permanent power.', /devours?\b|\beats?\b|absorbs?\b/i,
    '<path d="M2 4l3 3 3-3 3 3 3-3v8l-3-3-3 3-3-3-3 3z" stroke="none" fill="currentColor"/>'),
  K('bleed', 'Bleed', '#ef6f7c', 'Damage over time; more stacks last longer.', /bleed|hemorrhage/i,
    '<path d="M8 1.5c3 4 5 6.6 5 9a5 5 0 0 1-10 0c0-2.4 2-5 5-9z" stroke="none" fill="currentColor"/>'),
  K('burn', 'Burn', '#ff9d4d', 'Fire damage over time.', /\bburns?\b|burn stack|ignite|molten|slag/i,
    '<path d="M8 1c1 3 4.5 4.6 4.5 8.6A4.5 4.5 0 0 1 3.5 9.6C3.5 7 5.6 6 6 3.6c1.3 1 2 2.4 2 3.8C9.2 6 9.2 3.6 8 1z" stroke="none" fill="currentColor"/>'),
  K('poison', 'Poison', '#a6d65a', 'Poison or acid damage over time.', /poison|acid|toxi|necrosis/i,
    '<circle cx="6" cy="10" r="3.2" stroke="none" fill="currentColor"/><circle cx="11.3" cy="5" r="2.2" stroke="none" fill="currentColor"/><circle cx="12" cy="11.5" r="1.4" stroke="none" fill="currentColor"/>'),
  K('slow', 'Slow', '#6fd3e6', 'Runners move slower for a while.', /\bslow|drench|swamp/i,
    '<path d="M4 2h8M4 14h8M5 2c0 4 6 4 6 6s-6 2-6 6M11 2c0 4-6 4-6 6s6 2 6 6" fill="none"/>'),
  K('stun', 'Stun', '#ffe066', 'Runners stop in place for a moment.', /\bstun|freez|frozen|lockdown|locks the/i,
    '<path d="M8 1l1.8 4.6 4.7.4-3.7 3 1.2 5L8 11.4 4 14l1.2-5L1.5 6l4.7-.4z" stroke="none" fill="currentColor"/>'),
  K('warp', 'Warp', '#b79cff', 'Sends runners backward along the track.', /warp|knock(?:s|ed)?\s?back|\bpull|throws?|drops? them|back \d+ tiles|backward|reverse/i,
    '<path d="M13 8a5 5 0 1 1-1.6-3.7M12 1.5v3.2H8.8" fill="none"/>'),
  K('execute', 'Execute', '#ff5a6e', 'Instantly kills weakened runners (not Bosses).', /execut|decapitat|behead/i,
    '<path d="M3 13L10 6" fill="none"/><path d="M8.5 2.5l5 5-2.5 2.5-5-5z" stroke="none" fill="currentColor"/>'),
  K('true', 'True damage', '#f2f2f2', 'Ignores armor and damage reduction.', /true damage/i,
    '<path d="M8 1.5l5.5 6.5L8 14.5 2.5 8z" stroke="none" fill="currentColor"/>'),
  K('crit', 'Critical hit', '#ffc857', 'A chance to deal extra damage.', /critical|\bcrits?\b/i,
    '<circle cx="8" cy="8" r="5" fill="none"/><path d="M8 1v4M8 11v4M1 8h4M11 8h4"/>'),
  K('armor', 'Armor break', '#a9b8c9', 'Ignores or strips runner armor and shields.', /armou?r|\bDEF\b|defen[cs]e|shields?/i,
    '<path d="M8 1.5l5.5 2v4c0 3.6-2.6 6-5.5 7.3C5.1 13.5 2.5 11.1 2.5 7.5v-4z" fill="none"/><path d="M8.6 3.8 7 7.6l2 .9-1.4 3.4" fill="none"/>'),
  K('area', 'Multi-target', '#5fd1b5', 'Hits several runners at once.', /every runner|all enemies|all (?:16 )?tiles|whole track|pierce|cleave|splash|(?:hits?|strikes?|lances?|whips?) (?:up to )?\d+ (?:leading )?(?:runners|enemies|targets|violators)|\bwall\b|quadrant|volley/i,
    '<circle cx="8" cy="8" r="1.8" stroke="none" fill="currentColor"/><circle cx="8" cy="8" r="4.2" fill="none"/><circle cx="8" cy="8" r="6.6" fill="none" opacity=".55"/>'),
  K('trap', 'Trap', '#c8a27a', 'Reacts when runners break its rule on the track.', /\btraps?\b/i,
    '<path d="M2 12.5h12M3 12.5l2-6 2 6 2-6 2 6 2-6" fill="none"/>'),
  K('growth', 'Growth', '#c4e86b', 'Gains permanent power or evolves during the run.', /permanent ATK|permanent attack speed|\bevolves?\b/i,
    '<path d="M8 14V3M4 7l4-4 4 4M3 14h10" fill="none"/>'),
  K('ascend', 'Mythic trial', '#f0b44c', 'On an Elite or Boss node, a zero-leak clear awakens a Mythic.', /trial|tribulation|summoning|eclipse rite|awaken/i,
    '<path d="M2 12.5l1-7.5 3 3 2-5 2 5 3-3 1 7.5z" stroke="none" fill="currentColor"/>'),
];

// Trial and merger sentences describe how a card ascends, not what it does in battle: only the trial keyword reads them.
const TRIAL = /trial|tribulation|summoning|merger|eclipse rite/i;
export const keywordsFor = c => {
  const rules = c?.rules || '', play = rules.split(/(?<=[.!?])\s+/).filter(x => !TRIAL.test(x)).join(' ');
  return KEYWORDS.filter(k => k.re.test(k.id === 'ascend' ? rules : play));
};

const icon = k => `<span class="kw" style="--kw:${k.color}" title="${k.name}: ${k.def}"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${k.svg}</svg></span>`;

// Card face: the first few keywords as icons (names and meanings on hover and in Details).
export const keywordIcons = (c, max = 3) => { const ks = keywordsFor(c).slice(0, max); return ks.length ? `<span class="card-keywords" aria-label="${ks.map(k => k.name).join(', ')}">${ks.map(icon).join('')}</span>` : ''; };

// Details: every keyword on the card with its meaning.
export const keywordGlossary = c => { const ks = keywordsFor(c); return ks.length ? `<div class="kw-glossary">${ks.map(k => `<div class="kw-row">${icon(k)}<b>${k.name}</b><span>${k.def}</span></div>`).join('')}</div>` : ''; };
