# Ripperdoc’s Matrix & Modular Chrome

The Cyberpunk ecosystem is implemented on top of Arcane Loom, Eclipse Hunt, Scrapwork and the earlier combined balance fixes. GitHub still points to audited commit `67114bbbe79f62fe8b1363203ae9a4f7139b4e3b`; the combined changes are delivered here as an update package.

## Roster and installation

Exactly **12 draftable Cyberpunk cards**:

- Cyber-Operative
- Thermal Mantis Blades, Hydraulic Gorilla Arms, Monomolecular Wire
- Sandevistan OS, Berserk OS, Combat Cyberdeck
- Cooling Vent, Cryo-Nitrogen Pump, Biomonitor Regulator, Subnet Access Point
- Military Cyber-Reactor, Epic, available from Crossing 5

There are also two earned intermediate forms and nine earned Mythics: **23 Cyberpunk definitions total**, no disposable Cyberpunk tokens. All Operatives and Mythics occupy one grid cell.

A deployed module installs automatically into the oldest eligible adjacent original Operative with an empty matching socket. Installation permanently consumes the module card and frees its cell. It grants no Chrome. Installed choices cannot be replaced. If no recipient is adjacent, the module waits as a zero-attack card until a later opportunity. Original instance ordering breaks recipient ties deterministically.

Sockets, Chrome and the partial four-attack counter persist across battles and reloads. Heat, RAM, upload timing and Sandevistan charge reset each battle. Old saves containing Mantis Frame, Grid Netrunner or Plasma Battery reset their active run while preserving account meta. Those cards, unique combat branches, UI connections and standalone assets are removed. Shared atlas positions remain under neutral names for other cards that still use the atlas.

## Progression and initial stats

The selected rule is **one Chrome per four actual attacks**, including before modules are installed. A cleave or multi-target lash counts once. Kills, module installation and battle completion grant no additional Chrome. Unused Chrome beyond 120 remains recorded but grants no additional stat reward.

| Form | Chrome | Base ATK | Interval |
|---|---:|---:|---:|
| Cyber-Operative | 0 | 12 | 1.1s |
| Chromed Operative | 25 | 32 | 0.95s |
| Elite Cyber-Operative | 65 | 70 | 0.8s |
| Hybrid binding ready | 120 | — | — |

At Crossing 10+, an eligible Operative with both sockets installed consumes an adjacent Military Cyber-Reactor to awaken its matching Mythic. Neither Chrome alone nor Workshop upgrades bypass this requirement.

## Heat and cooling

These initial thermal values fill the unspecified parts of the proposal:

- Start each battle at 20°C. Passive cooling is 4°C/second.
- Each attack generates 8°C, or 14°C with Berserk installed. Cleaves generate heat once per attack.
- At 100°C the Operative shuts down for 3 seconds and purges heat to 40°C. Existing Smelter/Vent downtime modifiers still apply.
- Pre-Mythic Berserk activates at 80°C and remains active below shutdown temperature. Its physical attacks become double true damage; its target wall receives a refreshing 12 true Burn DPS effect for 2 seconds. This steam does not stack once per attack. Cooling below 80°C ends Overdrive.
- An adjacent Vent adds 15°C/second cooling; duplicate Vents do not stack. It retains the existing two-runner freeze every 8 seconds and team shutdown-duration reduction.
- Pump purges 40°C from adjacent Operatives every 6 seconds and freezes its facing wall for 2 seconds. Facing uses the nearest outer wall, with N/E/S/W tie order; center faces north.
- Biomonitor averages adjacent Operatives’ heat every second, preserving their total temperature. Its +15 percentage-point critical aura applies to augmented neighbors and does not stack from duplicates.

Cooling can reduce Berserk damage by ending Overdrive, as selected. Thermal state is visible in the battlefield inspector; the roster inspector shows permanent sockets and Chrome without presenting stale battle temperatures.

## Operating systems and RAM

Sandevistan opens a 3.5-second window after eight attacks outside an active window: 2.5× owner attack speed and a 50% track slow. Attacks during the window do not refresh it or charge the next window. Multiple time-dilation effects use the strongest slow, not a sum.

Cyberdeck earns one RAM per three attacks. An adjacent Access Point changes this to one per two attacks and raises capacity from 8 to 12; duplicate hubs do not stack. Capacity is clamped if adjacency is lost. RAM resets each battle.

Every 3 seconds, if targets exist and at least 3 RAM is available, regular Cyberdeck users alternate:

- Short Circuit: 220 + 3× raw ATK true damage to the leading runner.
- Contagion: 24 + 0.25× raw ATK true DPS for 4 seconds on the three leading runners. One Contagion effect per owner per victim refreshes instead of stacking.

Both uploads cost 3 RAM. No targets or insufficient RAM means no expenditure. Shutdown prevents uploads. Nyx now applies +25% speed and a **basic-hit-only** 15% damage penalty; DOTs and quickhacks are not reduced by that penalty. A 25% attack-speed increase normally means 25% faster attack-based RAM generation, not automatically double the upload rate.

## Nine Mythic combinations

All Mythics retain the proposed base ATK and intervals. Their signatures replace overlapping OS effects rather than stacking a second Sandevistan speed window or Berserk double-damage multiplier. Cyberdeck hybrids retain RAM and paid uploads; Network Reaper uses its specified replacement generation/upload schedule.

| Arm × OS | Mythic | Behavior |
|---|---|---|
| Mantis × Sandevistan | Chrono-Scythe Phantom | Mantis pattern, permanent 40% slow, ordinary-only 30% execution; carved Witch Eye raises that existing threshold to 35%. |
| Mantis × Berserk | Thermal Ripper Demon | Four full-damage true-fire cleaves, Plasma Bleed, one 4-tile slag zone for 4s at 50 true DPS. |
| Mantis × Cyberdeck | Glitch Infiltrator | Mantis hits mark victims with nanites; a marked bleeding victim’s death infects its wall with 24 true DPS Contagion for 4s. Once per victim; spread does not mark new victims for further death explosions. |
| Gorilla × Sandevistan | Kinetic Graviton Colossus | Highest-HP targeting; gravity impact at most every 4s, 2s stasis, pulls nearby ordinary runners toward the crater by up to 2 tiles. Boss displacement remains resisted. |
| Gorilla × Berserk | Apex Juggernaut Smasher | Removes all target armor; every third attack removes exactly 15% current boss/Harbinger HP. Rule Marks cannot amplify this percentage into an instant kill. |
| Gorilla × Cyberdeck | EMP Shockwave Breaker | Six-tile arc, shield removal and sprint cancellation. Boss enrage state and timer are never reset. |
| Monowire × Sandevistan | Razor Phantom | Up to eight leading targets across the track, guaranteed criticals using normal critical multipliers, shield removal and 50% defense ignore. |
| Monowire × Berserk | Plasma Whiplash Tempest | Wire pattern plus one 4-tile plasma zone for 4s, 40 true DPS and 10% base armor removed each second. Refreshing the same zone preserves its armor-tick clock. |
| Monowire × Cyberdeck | Network Reaper | One RAM per runner actually hit replaces attack-count generation. Short Circuit every 1.5s still costs 3 RAM; no free uploads. |

Mantis normally hits the leading runner plus two 50% secondary cleaves, applying 8 true Bleed DPS for 4s to each. Gorilla normally strips 40% armor and stuns on every fourth attack. Monowire normally hits up to five runners on the primary target’s aligned four-tile wall. Native shield fields are handled, but this update does not introduce new shield-bearing enemy waves.

All boss/Harbinger slow, freeze, stun and knockback resistance remains. Enrage still starts after 45 seconds; freeze/stun and knockback cannot reset it. Chrono cannot execute bosses. No Mythic expands the 3×3 grid.

## Verification and controlled campaigns

**220 automated tests pass**, including all previous regression tests. New tests cover every binding, socket assignment and locking, persistent partial Chrome, no battle/installation bonuses, heat shutdown, finite RAM, upload cadence, cooling/critical aura duplication, percentage safety, terrain refresh, save migration, and rendered inspector content. New SVG files are included. Browser visual playtesting has not been performed.

`node audit/cyber-simulation.js` reproduces 54 controlled one-Operative campaigns: six seeds per module pair, Nyx, random deployment, no meta or Workshop upgrades. Arm is guaranteed at crossing 2, OS3, Vent4, Access5, Pump6, Biomonitor7, Reactor8. The route uses elite crossings6/10/14 and boss16. These are favorable acquisition tests, **not actual random-draft win rates**.

| Mythic path | Wins /6 | Awakenings /6 |
|---|---:|---:|
| Chrono Phantom | 5 | 5 |
| Thermal Ripper | 4 | 4 |
| Glitch Infiltrator | 5 | 5 |
| Graviton Colossus | 1 | 2 |
| Juggernaut Smasher | 0 | 1 |
| EMP Breaker | 4 | 4 |
| Razor Phantom | 5 | 5 |
| Plasma Tempest | 5 | 5 |
| Network Reaper | 6 | 6 |

Overall **35/54 wins**, **37/54 awakenings**. Every run reached 120 Chrome, between crossings7 and10. Awakening ranged from10 to15, median11. Module/Reactor adjacency can delay binding even after Chrome is ready.

The Gorilla specialist branches struggle when they are the deck’s only attacker. `node audit/cyber-mixed-simulation.js` tests a second Operative and Mantis support: six Sandevistan and six Berserk mixed-arm campaigns. All12 won with the same random deployment and oldest-adjacent module assignment rules. This supports combining single-target and swarm coverage; it does not establish equal strength across all drafts or prove the game fully balanced. Full traces are included in the two result JSON files.

