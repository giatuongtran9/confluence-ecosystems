# Eclipse Hunt & Monster Trophies

Implemented on top of the combined balance update based on GitHub commit 67114bb. This preserves the earlier boss protections, Kuchisake progression, Haunted reward cooldowns, slowed early Cultivation, sequential Scrapwork intake, Matriarch coverage and WebP changes.

## Roster

Seven draftable cards: Cursed Mercenary, Witch Hunter, Gallows Executioner, Grave Leech, Trophy Stake, Beast Taxidermist, Iron Maiden Totem.

Three intermediate earned forms: Oathbound Hunter (25 points, 24 ATK/1.3s), Black-Iron Slayer (60 points, 55 ATK/1.2s), Branded Berserker (100 points, 95 ATK/1.1s). These fill the unspecified intermediate stats in the proposal.

Three Mythics: Dragon Slayer Berserker (250/1.6s), Grandmaster Witcher (210/1.1s), Blood-Drunk Abyssal Hunter (195/0.75s).

Three forged, undraftable roster relics: Feral Beast Heart, Demon-Forged Brand, Clairvoyant Iris. Three disposable trophy tokens: Beast Skull, Fiend Horn, Witch Eye. Total: 19 definitions, of which only seven can appear in drafts.

Abyssal Reaper's catalog entry, combat mechanics, synergy text and standalone asset are removed. Old saves referencing the removed card reset their active run while preserving account meta. The shared sprite atlas remains because other cards use it.

## Agreed rules

- A deployed Witch Hunter marks one shared Alpha Quarry per battle after the third spawn, selecting the healthiest living ordinary runner. Multiple Witch Hunters do not create extra quarries. Alpha is a targeting/reward classification, not an elite stat conversion.
- Qualifying kills give each deployed core slayer 3 permanent points and roll one uniformly random trophy family. A head occupies an empty cell adjacent to a deployed hunter. If none exists, the head is lost; points are retained. Escapes give neither.
- Loose trophies grant orthogonal auras. A Stake consumes one adjacent loose head, frees its cell, and projects that head's aura. A Taxidermist can carve an adjacent loose or mounted head every six seconds. Mounted heads and loose tokens expire at battle end.
- Carving grants 10 points to each deployed core slayer and +3 permanent ATK to adjacent hunters. Skull additionally gives the lowest-ATK other deployed original +3 permanent ATK. Horn reduces priority enemy base armor by 10% per carve, capped at 30% for the run. Eye upgrades existing 30% ordinary-runner executions to 35%; it grants no new execution to other attacks and does not affect the Talisman's 15% threshold.
- Two matching carvings on a Taxidermist forge a permanent relic into an empty cell. Counters survive battles and are spent only when the relic appears. One unbound roster copy per family is allowed, including undeployed copies. Surplus counters remain; carving rewards continue. Forging resumes after binding consumes that copy.
- At 100 Trophy Points, an adjacent forged Hunt Relic starts an Eclipse Hunt trial on an Elite/Boss node. A zero-leak clear awakens the relic-mapped Mythic and consumes the relic. Any leak or failed clear removes the Branded Berserker and relic. Crossing depth alone never binds a Mythic. All forms occupy one cell.
- Duplicate same-family trophy/relic auras do not stack; different aura types combine. Horn armor penetration combines multiplicatively with other penetration. Horn cleave can hit one additional runner per attack and cannot recurse.
- Dragon sweep covers the aligned four-tile wall containing its primary target. Every third attack removes 15% current boss/Harbinger HP. Its wall-kill frenzy caps at +50% speed and resets after battle.
- Witcher alternates three Silver attacks and three Sign attacks. Silver is 3× TOTAL against priority enemies and 2× against ordinary runners, avoiding a second random-critical multiplier. Signs use existing boss knockback resistance and enrage immunity.
- Hemorrhage stacks at 40 true DPS for four seconds, with ordinary-only execution and a once-per-victim 400 true-damage wall explosion. All boss/Harbinger execution protections remain. Damage and DOTs retain universal leader modifiers.
- Shield bonuses and shield breaking respond to a runner's shield field; this update does not add shield-bearing enemy waves to the existing campaign.

## Verification and pacing

127 automated tests pass, including the 81 earlier regression tests. New checks cover all recipes, persistence, deployment reservations, full-board behavior, one-copy relic limits, Alpha sharing, exact Silver multipliers, wall attacks, execution immunity, hemorrhage expiry, UI markup and save migration. Browser visual verification has not been performed.

`node audit/eclipse-hunt-simulation.js` reproduces 120 seeded campaigns; full results are in `audit/eclipse-hunt-results.json`. These are controlled roster tests, not random-draft win-rate estimates. They start with Mercenary plus Leech; the fixed-acquisition scenarios add Witch Hunter at crossing 2, Taxidermist at 3, Totem at 5, Executioner at 6, and optional Stake at 7. Upper-bound scenarios give all supports at the start. All use random deployment, Morrow, no meta or workshop upgrades, elite crossings 6/10/14, and boss16.

| Scenario (30 seeds each) | Wins | Reached 100 points | Median first 100* | Mythic awakenings | Median awakening* |
|---|---:|---:|---:|---:|---:|
| Fixed acquisition, six-card team | 23 | 26 | 10 | 23 | 11 |
| Fixed acquisition, seven-card team with Stake | 21 | 25 | 10 | 21 | 11 |
| All supports from start, six-card team | 22 | 27 | 10 | 22 | 10 |
| All supports from start, seven-card team | 23 | 28 | 10 | 23 | 11 |

*Among runs reaching the milestone. Readiness ranged from crossing6 to14; awakening from10 to14. Natural elite packs can accelerate point gain sharply, but no Mythic appeared before10. Random adjacency and limited working space can prevent carving or delay binding; adding Stake is not an automatic upgrade. The design is playable and its loop is functional, but these favorable acquisition tests do not establish balance across real drafts or mixed-genre decks. A separate tuning pass could address excess elite point income and the Stake's opportunity cost without silently changing the approved rules here.

