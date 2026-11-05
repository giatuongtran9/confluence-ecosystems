> Historical design record. For current balance and forging rules, see BALANCE-UPDATE.md.

# Scrapwork Colossus update — 4 November 2026

Based on GitHub commit `0627c3ee77b2e6c1d2d84a2655e8552a3a33c9a4`, “Fix expired taboo status checks for reactive legends”. The latest Haunted changes and the earlier Cultivation, Matriarch, removed-card, and WebP fixes are retained.

## Implemented rules

- Six draftable cards: Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, Titan Reactor Core. The old Autocannon, Bellows, and Behemoth are completely removed from the catalogs and combat engine. The unused Armament Pod definition and art are removed. The installer deletes the four old standalone machine SVGs and the Pod SVG; shared atlas regions still used by other genres retain neutral names. Saves referencing removed cards reset safely; account upgrades are preserved.
- Every Scavenger rolls 50% on any team kill. Scrap has no attack and occupies a real empty adjacent slot. No spawn limit beyond available cells.
- Two scraps adjacent to a Smelter forge one weapon: two swords → Blade; two guns → Flak; mixed → Gunblade. Four-second forge cooldown. The nearest deployed Mech with space permanently locks its first two weapons; both activate per attack at 65% individual power when two are installed. Flak/sweeps have their additional area-damage scaling. Subsequent smelts give Alloy only.
- Alloy: +1 per three attacks, +5 per deployed battle clear, +3 to each deployed Mech per smelt. The partial attack counter persists. Walker at 25, Heavy at 65, Titanshift at 120; each 15 above 120 grants +2 permanent ATK.
- Titanshift permanently unlocks a two-cell footprint. It waits if no adjacent cell is empty, then reserves an adjacent pair next deployment. The grid and perimeter never grow. The second cell is a reservation, not a targetable or buff-generating ally. Multiple Titans are packed without overlapping.
- Reactor draft rarity begins at Crossing 5. Binding requires Crossing 10+, two installed weapons, a two-cell Frame, and an adjacent original Reactor. Binding consumes the Reactor. Blade+Blade → Berserker; Flak+Flak → Siege; every other pair → Vanguard.
- Berserker: 260 base ATK, 1.8s interval, armor-ignoring primary strike, non-boss/non-champion execution below 30%, every third attack removes 15% CURRENT HP from bosses/champions. This is deliberately not 15% maximum HP.
- Siege: 165 base ATK, 1.8s interval, eight-tile arc, 50% noncompounding permanent armor shred, shield clearing when present.
- Vanguard: 185 base ATK, 1.7s interval, piercing primary strike plus four-tile sweep and four-second oil pools at 35 true DPS before leader damage modifiers. An owner's overlapping pools refresh rather than multiply DPS.
- Riveter: 25% armor shred and +3 permanent ATK to an adjacent Mech every six seconds. Reactor: nonstacking +20% damage to adjacent mechanical cards. Smelter retains the one-second shutdown reduction.
- Crane: moves scrap into EMPTY Smelter-adjacent cells every four seconds. It never swaps or displaces allies, as selected. The inspector explains when the forge is blocked. All card deployment remains automatic.
- New native SVG art, merged horizontal/vertical Titan cards, Alloy/weapon inspector, visible oil hazards, updated ecosystem guide, and cache-busted source files.

## Viability and measured limits

The system forms a distinct salvage → logistics → forging → Alloy → Titan → Reactor loop. It is viable, but has substantial placement risk under the selected empty-slot-only Crane rule. A six-card support deck can leave too few neighboring scrap positions beside the Smelter. Additional roster cards reduce working space further. Progress is retained between battles, whose deployment reshuffles.

The included script ran 100 seeded controlled campaigns with Rook, no account upgrades, normal battles, recovery on Crossings 4/8/12, and deliberately supplied support drafts. Start Frame + Scavenger; add Smelter before Crossing 2, Crane before 3, Riveter before 5, Reactor before 6. There are no workshop upgrades or optional drafts. Results: 98 Titans, 71 Mythics, 69 reaching Crossing 16, 43 final-boss wins. Median Titanshift and Mythic crossing: 11. Median smelts: 7. The desired Crossing 8–10 curve is not consistently reached with these exact rules. Do not interpret this setup as an ordinary random-draft win rate.

Rook's damage benefit and speed drawback both apply. The proposal's guaranteed under-20-second boss kill is not promised: current-HP cleaves diminish as the target weakens, and support growth/placement matters.

## Validation

`node --test tests/*.test.js` — 56 passing tests, including all 27 tests from the latest commit and 29 Scrapwork tests. Coverage includes recipes, module locking, progression persistence, full-board expansion, 100 multi-Titan placement seeds, token exclusion from reservations, six Mythic loadout combinations, Reactor timing, armor shred, current-HP boss cleave, both weapon activations, oil expiry, Crane delivery, draft retirement, salvage, clear rewards, support effects, and horizontal/vertical Titan HTML.

`node scripts/simulate-scrapwork.js` reproduces the campaign results. JavaScript syntax checks pass. Browser rendering was not visually verified: Playwright is present but its browser executable is unavailable in this environment. Native SVGs are included and HTML dimensions are tested; a desktop/mobile browser playtest remains advisable.

This package does not push commits or deploy to GitHub.

Cleanup checks also cover absent legacy definitions/mechanics, save reset behavior, and noncompounding armor damage. The campaign results above were measured before this cleanup; new Scrapwork-only campaign behavior is unchanged.
