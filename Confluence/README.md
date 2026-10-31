# Confluence · The Ninefold Crossing

A buildless browser auto-battler: 45 draftable cards, four earned evolution forms, five token definitions, and nine universal leaders. Randomly deploy up to nine originals into a 3×3 field surrounded by a sixteen-tile enemy track. All attackers have global reach; enemies never damage cards.

## Play locally

Extract the ZIP and open `dist/index.html`, or run:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. No build, package installation, API key, or server is required for gameplay. Artwork is included. Fonts have local fallbacks.

## Run and upgrades

Choose a leader, then one of three attackers. Your leader’s genre receives 1.5× selection weight within each rarity pool, beginning with the first draft. All sixteen crossings are visible. Successful stages offer one of three cards, skip, or repeated rerolls for 10 coins each. Each completed battle awards 100 coins, Elites 200, and the Boss 500, including losses.

Fate Workshops occupy the middle route at crossings 4, 8, and 12 in NEW runs. Choose any original in your roster, inspect three options, and pay 10 health for one; you must have at least 11 health. Passing restores 3 health. Both routes lead to a normal draft.

Unevolved Jade Disciple, Blood Heir, Restless Spirit, and Mortal Monk can awaken immediately through one of three paths: Might (+12 permanent ATK), Flow (+20% permanent attack speed), or Storm (every sixth attack adds a three-target true-damage burst equal to unbuffed ATK). Their existing combat-triggered evolution remains available. Other cards—including evolved cards—choose Strength (+8 permanent ATK), Tempo (+10% permanent speed), or Resonance (+1 allied ability progress every 6s per upgrade). Growth and instance identity are retained.

## Breeding and permanent deletion

- Originals consumed, sacrificed, or used as catalysts are permanently removed from the run roster. They never return next wave.
- Tokens last only for the battle. Consuming one does not remove an original; a recovery ability creates a NEW token and never restores a deleted roster entry.
- Named predator diets are restricted by species and ancestral genre. A generic token or Fodder tag is insufficient.
- Only printed opening-summon abilities run at deployment: Only Veil Shepherd creates a token at opening and repeats every 8 seconds. Crimson Hound has no opening or timed summon; it breeds same-species copies through normal Bloodline adjacency. Breeding fodder does not get a free opening offspring.
- Each breeding original or token checks once per second. With at least one same-species orthogonal neighbor, roll ONE 10% birth chance, regardless of neighbor count. Birth needs a free orthogonal slot. Offspring are temporary copies of the parent species (same identity and basic attack), start their first check one second after birth, and remain tokens rather than permanent roster cards.
- There is no per-parent or per-battle offspring cap. The nine occupied slots are the physical limit.
- Tokens snapshot the spawning unit's unbuffed ATK and attack interval at birth. Bred Bloodline offspring display as copies of their own fodder species rather than as separate Scale Imp/offspring cards. They inherit species basic attack effects and breeding, not growth engines, evolution, support abilities, or timed original-only summons. Later original growth does not update existing tokens.
- Veil Shepherd creates baseline Lamb tokens (8 ATK / 1.2s) every 8s. Medium reserves full-ATK echoes on original consumption or Dormancy, with a 10s reservation cooldown; active echoes do not block future reservations. A full field holds one pending echo until space opens.

## Three distinct food chains

| Chain | Prey/generator | Consumer | Recovery or payoff |
| --- | --- | --- | --- |
| Bloodline | Primordial Blood Cub, five lineage fodders, and their offspring | Primordial Blood Cub follows five prey lineages; Blood Heir remains legacy content. Crimson Hound is same-species breeding fodder and does not summon; each of the five fodders can trigger Broodkeeper when consumed. NO attack-count growth. | Crimson Broodkeeper has a 35% global chance to recall any of the five consumed Bloodline fodders as a temporary copy of that species into any empty slot. Matriarch extends Bloodline Bleed by 0.5s per living prey and gives those prey +40% speed. |
| Cultivation | Lotus/Petals, Spirit Herb Spring | Alchemical Adept consumes a named offering every 6s for +3 ATK and +3 allied ability progress. Lotus also refines without consumption every 18s. | Cauldron reacts to consumption/refinement/breakthrough; Threefold Pill Blossom is a cycling Jade evolution catalyst. Herb sacrifices only to another original Cultivation attacker. |
| Haunted | Mourning Lamb and Veil Shepherd | Soul Harvester sacrifices Lambs every 6s for +6 ATK and three-target true-damage cleave. | Lambs release Soulflare on consumption and charge Lantern. Medium creates echoes. Soul Well fires stronger missiles for Haunted losses, weaker missiles for other genres. |

Herald retains a separate Cosmic diet: Shoggoth/Mind Larva ancestry only. Altar, Cauldron, Medium, and Soul Well provide explicitly described cross-genre reactions. Machine, spell, critical-hit, Burn, Bleed, and control decks remain distinct and viable combinations.

## Late-game payoffs

Normal/Rare cards establish permanent power. Fresh Epic/Legendary cards are designed to contribute immediately and become much stronger in a matching ecosystem: Railgun borrows 200% of the highest allied permanent bonus and ignores armor; allied gauges accelerate Weaver/Archmage; shutdowns charge Behemoth; critical hits charge Core; Reaper detonates and transfers Bleed; displacement charges Herald's next Madness pulse. These cards generally do not generate permanent ATK themselves. Herald feeding and earned evolutions are explicit exceptions.

Permanent ATK and Burn/Bleed stack counts have no gameplay caps. Damage-over-time stacks keep individual expiry times. Cooldowns, state duration, and Progenitor's printed 6 HP healing allowance remain. Nanite and Asura retain unfinished critical-growth counters between battles. Temporary buffs, tokens, and stored Madness reset each battle.

## Interface and saves

The realistic field dominates combat. Unit cards display current ATK. Clicking opens live details while combat continues; Map, Deck, Log, and Help pause it. Reports separate original losses from token meals and attribute damage, growth, and actual interactions. Workshop paths and permanent speed are shown in details.

Browser-local v3 run saves and legacy saves remain compatible. Existing growth is retained, but new rules apply. Existing maps do not retroactively gain Workshops: start a new run for the complete revision. Reloading combat restores the pre-deployment checkpoint. Phone reset investigation was outside this change.

## Verification

```sh
node test-engine.cjs --mechanics-only
node simulate-ecosystems.cjs
node simulate-payoffs.cjs
```

148 mechanics regressions passed. Campaign samples use nine deck priorities × nine leaders × three seeds (243 runs). Paired payoff tests use twelve scenarios, three leaders, and four seeds, comparing an established low-tier sixth unit with a fresh higher-tier replacement (288 final waves). These scripted policies are not human win-rate estimates or proof of equal balance. Haunted sacrifice remains harder to assemble; read `BALANCE.md` for the actual sample and `AUDIT.md` for scope.

`dist/data.js` owns player-facing card rules; `dist/engine.js` owns simulation; `dist/app.js` / `style.css` own UI. New cards reuse included genre artwork; no asset downloads are required.

## Primordial Blood Cub ecosystem update

The Blood Heir chain is replaced in new offers by the Primordial Blood Cub. The Cub chooses one of five lineages from its first meal. Every meal increases permanent ATK (+4 matching, +3 off-lineage); only matching meals add evolution stacks, with thresholds of 2/4/6. All five eligible Bloodline fodders and their offspring are attacking units; Scarlet Familiar is retired from new runs and remains only as a legacy save record. Same-species orthogonal adjacency triggers a 10% birth roll each second when an adjacent board slot is empty. Matching relics unlock Apex forms.

Cub evolution abilities are cumulative across all five lineages: each higher form keeps the lower tiers’ combat traits and adds its new ability.

Run coins start at 0 and reset between runs. They persist across battles in a run. Mythic forms remain earned-only and never appear in ordinary drafts.

Cultivation realms are earned card-form changes: Foundation (Rare) at 30 Qi, Golden Core (Epic) at 85 Qi, and Nascent Soul (Legendary) at 175 Qi. Eligible relic fusion remains the route to Mythic Apex forms. The formation grid remains 3×3.
