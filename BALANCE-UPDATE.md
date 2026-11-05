# Ecosystem balance fixes — November 4, 2026

Based on GitHub commit 67114bbbe79f62fe8b1363203ae9a4f7139b4e3b. Includes the seven separate Haunted taboo marks, the complete Scrapwork system, legacy Post-Apocalypse removal, and the earlier Cultivation/Haunted/Matriarch/WebP fixes.

## Approved rules and implementation

Bosses and Harbingers are excluded from ordinary-runner executions and leak prevention. Rule Architect, Living Taboo and Xuanwu cannot remove a boss to award victory. Penrose, Talisman Sovereign and Slit-Mouthed Sovereign cannot execute bosses or Harbingers. Normal damage can still kill them. Penrose's direct positional reset also excludes bosses/Harbingers, preserving the boss control rules. Ordinary-runner effects remain intact. Bloodline breeding, feeding, thresholds and damage are unchanged.

Kuchisake now earns evolution progress from qualifying attacks independently of its personal marks. Haunted Legends earn 0.35 evolution progress per eligible reaction, with an eight-second reward cooldown per legend instance per runner. Adjacent Legends receive 15% of that earned progress. Each actual rumor contact spread/death grants 0.1 progress globally. These restrictions affect evolution rewards; reactions, marks, damage and Blackout charge still occur during the reward cooldown. Thresholds remain 15/45; no crossing lock was added. Investigator Dread progression is unchanged.

Before ascension, cultivation attacks grant one Qi every three attacks, with the partial counter saved. Spirit Grass gives one Qi every four seconds, absorbed Blossoms give five Qi, and Cauldron recipes give 12/6 Qi for Blossom/Grass recipes. Thresholds stay 30/85/175 and brewing remains on the eight-second cadence. Permanent pill bonuses and temporary speed remain. Ascended recipients retain the previous two-Qi dew, 15-Qi absorption, 35/18-Qi pills, and 30-Qi permanent-growth cycle. No crossing lock was added.

Smelters now intake adjacent scrap one piece at a time into a capacity of two. Intake is saved on that Smelter across battles. One neighboring working slot can feed both ingredients sequentially. A deployed Mech is required to collect/process scrap; four-second forging cooldown remains. A full intake cannot consume extra scrap. Recipes, two locked weapons, surplus Alloy and Titan gates are unchanged. The Crane still moves scrap into empty slots only; a full board still prevents new scrap from spawning.

## Validation and limitations

81 tests pass: the previous 57 tests (with expected values updated for approved reward changes) and 24 additional checks. New checks cover bosses, Harbingers and ordinary runners; Kuchisake rewards and cooldown; independent targets; cultivation attack remainder; sequential intake across deployments; capacity; cooldown; and no-Mech preservation. JavaScript syntax checks pass. No browser visual verification was available; the previous environment lacked a browser executable.

Fresh campaigns use 30 identical seeds per setup, neutral leader modifiers, no meta upgrades, chosen support drafts, normal battles with fixed recovery crossings, and the actual final boss. Results are controlled scenarios, not random-draft win-rate estimates.

| Setup | Wins before → after | Median Mythic crossing before → after |
| --- | --- | --- |
| Cultivation | 30/30 → 30/30 | 5 → 9 |
| Haunted Investigator | 30/30 → 30/30 | 7 → 7 |
| Haunted Step + Raincoat | 30/30 → 30/30 | 5 → 9 |
| Haunted six-card Legends | 30/30 → 30/30 | 5 → 9 |
| Scrapwork | 7/30 → 15/30 | 11 → 10 |
| Bloodline Tiger | 0/30 → 0/30 | Not reached |
| Bloodline Monkey | 1/30 → 1/30 | Not reached |

Cultivation's median Legendary crossing moved 3 → 6. Scrapwork's median Titanshift moved 10 → 9. In 30 fresh Crossing 6 battles with a supplied full Scrapwork setup, median smelts improved 0 → 5 and median leaks 4 → 1.

The requested pacing goals improved, but strong supplied Cultivation/Haunted decks still win all these controlled campaigns. This does not establish global balance or solve Bloodline breeding fragility. Existing earned forms/progress are retained, so old advanced saves do not demonstrate the new progression curve; use fresh runs to evaluate pacing.

Run `node --test tests/*.test.js`. Reproduce controlled scenarios with `node scripts/balance-campaigns.cjs`, `node scripts/balance-legends.cjs`, and `node scripts/balance-waves.cjs`. Results are written beside these scripts. The ZIP's audit-results folder contains baseline and final measurements.

