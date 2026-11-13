# Arcane Loom — Approved Spell and Patronage Rules

This update supersedes earlier Arcane spell and patronage descriptions in this file. Card descriptions in `data.js` are the player-facing source of truth.

## Primary mage spells

All primary elemental spells trigger at 10 gauge ticks, grant +1 Mastery and +1 permanent ATK, and supply their element's Essence to adjacent Apprentices. Normal attacks only deal their standard attack damage and charge gauge; they do not apply max-gauge spell effects.

- **Elemental Apprentice:** at max gauge, hits `min(5, 1 + floor(pair points / 20))` leading enemies for 100% ATK each. No extra points-based damage.
- **Pyromancer:** 100% ATK plus `1 + floor(Mastery / 10)` Burn stacks; each stack deals 1% max HP/s for 1s.
- **Hydromancer:** four leading enemies for `ATK × (1 + Mastery × 0.005)`, then Drenched (30% slow for 3s).
- **Geomancer:** 100% ATK and 20% + `floor(Mastery / 5)%` armor pierce. No stun.
- **Aeromancer:** normal attacks hit two targets. At max gauge, hits four targets for 100% ATK and gives adjacent allies +20% haste for 3s. No knockback.

## Archon Patronage

When an Archon is deployed, each of its two constituent mages receives only the other mage's **base max-gauge effect**. This is a passive association, not a second spell cast: it adds no Mastery, permanent ATK, or unrelated normal-attack/passive effects. Shared effects do not gain Mastery scaling.

| Archon | Shared base effects |
|---|---|
| Magma Lord (Fire + Earth) | Pyromancer: 20% armor pierce. Geomancer: one Burn stack. |
| Firestorm Tempest (Fire + Wind) | Pyromancer: four targets and adjacent allies +20% haste for 3s. Aeromancer: one Burn stack. |
| Scalding Vapor Sovereign (Fire + Water) | Pyromancer: Drenched (30% slow for 3s). Hydromancer: one Burn stack. |
| Quagmire Colossus (Water + Earth) | Hydromancer: 20% armor pierce. Geomancer: Drenched (30% slow for 3s). |
| Glacial Typhoon (Water + Wind) | Hydromancer: four targets and adjacent allies +20% haste for 3s. Aeromancer: Drenched (30% slow for 3s). |
| Sandstorm Titan (Earth + Wind) | Geomancer: four targets and adjacent allies +20% haste for 3s. Aeromancer: 20% armor pierce. |

## Support and fissure behavior

- **Elemental Prism:** when an adjacent mage casts at max gauge, grants +2 ticks to every deployed elemental mage. There is no one-second throttle. A recursion guard prevents Prism-generated casts from creating an infinite Prism chain.
- **Magma Lord normal attack:** creates a 2s fissure on its hit tile. Enemies receive one Burn stack per second only while occupying that tile. The fissure adds no direct damage.
- **Scalding Vapor Sovereign:** its own normal attack hits three enemies; a Drenched enemy receives a 10% missing-HP burst at most once in the battle.

## Validation

Focused Arcane regression tests cover primary spell output, all six base-effect patronage pairs, no Mastery scaling on shared effects, Prism timing/recursion, Magma fissure occupancy, and the once-per-enemy Sovereign burst. Run with `node --test tests/arcane-loom.test.js`.
