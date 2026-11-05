# Arcane Loom & Elemental Synthesis

This update adds eight draftable Arcane cards, two earned intermediate forms and six earned Mythic Archons. It preserves Eclipse Hunt, Scrapwork, the previous Cultivation/Haunted pacing changes, boss protection, Matriarch coverage and WebP asset changes.

## Confirmed decisions and rules

- Bosses and Harbingers retain half-strength slows, half-duration freeze/stun and half-distance knockback. At 45 seconds they still enrage and reject freeze/stun and displacement. Swamps do not suppress enrage.
- After the first simulation exposed very slow progression, the user approved revised **10 / 20 / 30** pair milestones. Each primary spell still supplies exactly one essence to each adjacent Apprentice. Two different stored essences are consumed for one point in that specific pair. Same-element essences wait. Both counters and unmatched essences persist.
- The highest individual pair determines advancement, not the sum. Equal counters use this stable order: Earth+Fire, Fire+Wind, Fire+Water, Earth+Water, Water+Wind, Earth+Wind. At Crossing10+, an adjacent Astral Loom is consumed to bind the highest pair if it has30 points. No workshop shortcut.
- Adept:10 points,24 ATK/1.2s. Elemental Mage:20 points,55 ATK/1.0s. Apprentice and both intermediate forms have an8-tick gauge.
- Basic attacks supply one gauge tick, multiplied by Lyra's1.25. Elemental effects occur on full-gauge spells. Lyra's0.85 penalty now applies to basic attack power only, while spell and DOT damage retain other universal damage modifiers.
- Prism works from any cell, reacts to adjacent elemental spells and gives orthogonal allies with ability gauges2 ticks. Each Prism has a1-second cooldown; only one ready Prism responds to a given spell. Recursive pulses remain subject to that cooldown.
- Battery collects actual excess charge after elemental casts, up to32 mana. Every6s it spends stored mana on the deployed elemental mage with the lowest gauge fraction. It supplies only the missing amount, without applying Lyra's multiplier twice. Discharge cannot create new overflow. Mana is battle-only; this is not a free refill.
- All elemental marks last4s. Reactions work in either order, consume both participating applications and do not recursively reapply elements. An application participates in at most one reaction. Fire spreading copies only original Burn stacks to the nearest two runners with the original expiration; copies cannot spread again.
- Quagmire reaction doubles remaining slow duration, capped at6s, and roots for1.5s using the normal freeze-resistance rules. Other reaction effects match the proposal:15% missing-HP scald, complete armor removal,2s freeze and30 true DPS abrasion for4s.

## Initial spell tuning

These values fill the previously unspecified spell formulas and were increased after the initial campaign tests. Raw ATK includes permanent card ATK, before basic-attack-only modifiers.

| Spell | Gauge | Damage and targets |
|---|---:|---|
| Apprentice essence volley | 8 | 120 +6× raw ATK +8× highest pair points, four leaders |
| Ignite Blast | 6 | 200 +8× raw ATK, leading runner;8 true Burn DPS for4s |
| Tidal Wave | 8 | 100 +6× raw ATK, four leaders;35% slow for3s, Water mark |
| Seismic Spike | 10 | 250 +10× raw ATK, leading runner;40% armor strip,1s stun |
| Gale Blast | 5 | 100 +5× raw ATK, leading runner;2-tile knockback;adjacent elemental mages gain20% haste for3s |

## Mythics

All six retain the proposal's base ATK and attack intervals. Mythic forms have no primary-mage gauge; their listed attack/periodic mechanics replace the Apprentice volley.

- Magma Lord: melts armor in a cluster within one track tile of its primary target;3× damage to priority enemies. One aligned4-tile fissure per caster,60 true DPS for5s. Recasting replaces it.
- Firestorm Tempest: one4-second cyclone per caster every fourth attack. It moves clockwise at2tiles/s and captures at most six ordinary runners for35 true DPS. Bosses take nearby damage but cannot be carried. Carried runners are never wrapped past the exit. Every10 team kills in a battle grants5% permanent speed; incomplete kill counters reset each battle.
- Scalding Vapor Sovereign: drenches the attacked target and adds20% missing-HP scald. Cancels sprint bonuses track-wide while deployed. Every fifth attack removes12% **current**, not maximum, HP from its boss/Harbinger target.
- Quagmire Colossus: its first attack creates one battle-long4-tile swamp.45 true DPS and60% slow, reduced to30% against bosses/Harbingers. It never disables enrage.
- Glacial Typhoon: every5s freezes the track for2.5s; its affected survivors are pushed back3tiles when that freeze expires. Boss resistance and enrage immunity apply to both stages.
- Sandstorm Titan: each second strips another10% of base armor. At zero armor, refreshes a single40-DPS,4-second Bleed per caster instead of stacking a new one every second. Every third attack pierces the five leading runners.

## Legacy removal and saves

Mana Conduit, Storm Archmage, Mana Crystal and Rune Weaver are removed from catalogs, offers, combat branches and UI connections. Standalone crystal.svg and weaver.svg are deleted by the installer. Shared atlas positions remain under neutral names because other artwork relies on the atlas. Active saves referencing removed cards reset; account upgrades and currency remain. Clean runs retain progression.

## Validation and known balance limits

172 automated tests pass. Coverage includes all six pair bindings, both orders of every reaction, consumed/expired statuses, overflow conservation, Prism recursion, Lyra damage separation, boss resistance/enrage, terrain lifetime, cyclone capacity, permanent Tempest growth, save migration and UI/art references. No browser visual playtest was performed.

`node audit/arcane-simulation.js` reproduces48 seeded campaigns. These use guaranteed support acquisition and random deployment, not actual draft RNG: Apprentice plus first primary at start, second primary at crossing2, Prism4, Battery5, Loom6; no meta or workshop upgrades; elite6/10/14 and boss16. Each pair gets8 seeds. They intentionally test a lean two-primary roster, not every mixed or duplicate-card deck.

| Pair | Wins /8 | Archon awakenings /8 |
|---|---:|---:|
| Fire+Earth | 3 | 3 |
| Fire+Wind | 8 | 5 |
| Fire+Water | 1 | 4 |
| Water+Earth | 0 | 2 |
| Water+Wind | 6 | 3 |
| Earth+Wind | 7 | 4 |

Overall25/48 wins and21/48 awakenings. Awakening ranged from crossing11 to16, median14. The initial implementation with25/45/60 milestones and lower spell damage produced zero wins and zero awakenings; its results are retained in `audit/arcane-before-tuning.json` as historical evidence, not results for the delivered version.

**The ecosystem works, but the proposed crossing10–13 awakening pace is not consistently achieved.** Random adjacency and two-primary specialization remain substantial constraints. Water/Earth and Fire/Water are weaker in these controls; Fire/Wind is much stronger. This is a functional implementation with initial tuning, not a claim of equal branch strength or completed balance. Further tuning should address essence delivery reliability and pre-Mythic coverage without restoring boss bypasses.
