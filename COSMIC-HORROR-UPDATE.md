# Forbidden Texts · Cosmic Horror

Based on GitHub commit 1cf0404c72a80490c03ab6cbde984486b5fd3526 (November 5, 2026). Keeps the latest WebP mappings and all previous Cultivation, Bloodline, Haunted, Scrapwork, Eclipse Hunt, Arcane Loom and Cyber Matrix changes.

## Approved rules

- Seven draftable cards: Slumbering Idol, Blind Astrologer, Mad Archivist, Mind Larva, Shoggoth Mass, Void Eye and Azathoth Herald.
- Three Rare Idol forms, six Epic Herald forms, six Mythic awakenings, six undraftable permanent Grimoires, three temporary page tokens, temporary Mind Larva and Dark Young tokens: 33 definitions total.
- Seal milestones:25 /65 /154 Syllables. At154, an Epic Herald with an orthogonally adjacent matching Grimoire starts its Forbidden Recitation on an Elite or Boss node. It must channel for8 seconds, prove each distinct script effect on a priority target, and clear the node with zero leaks. Success consumes the Grimoire and awakens the mapped Mythic. Any leak, failed clear, or missing script proof removes the Herald and Grimoire. There is NO Crossing gate.
- First two deciphered scripts lock permanently. First selects the Rare branch, both select the Epic/Mythic branch. Pure and mixed pairs are supported.
- Combat chants advance every deployed original Idol. A decipher grants12 Syllables to them and assigns its script only to the oldest deployed Idol missing a script. Reserves do not progress.
- Only explicit chants from Astrologer, Larva and Eye advance the shared10-Syllable page-drop meter. The remainder persists across battles. Decipher rewards never generate pages. Astrologer's45% chance is additional; Larva-generated pages are Flesh and Eye-generated pages are Astral. Other page rolls are equal thirds.
- Pages require an empty orthogonal slot; failed drops are lost. Unprocessed pages expire with the battle. Cursed Elite, Harbinger, Boss or Alpha Quarry kills can drop pages. Cosmic cards do not create Alpha Quarry marks themselves.
- Each Archivist retains its own two-page recipe across battles. Completed recipes wait for any empty grid slot. Grimoires enter the permanent roster and are never draft rewards. There is no duplicate-Grimoire cap; extra relics compete for deployments.
- Fresh status applications charge Eye, bounded to once per runner/type/second. Refreshing an active slow does not count. Eye-generated effects do not recharge Eyes. Reaction recursion is blocked. Yellow Sign damage has a shared1s per-runner cooldown.
- Shub rewards each enemy death or token consumption once: +2 permanent ATK to deployed Cosmic originals, without a per-battle cap. Multiple Shubs do not multiply the reward. Temporary tokens cannot retain rewards.
- Elder Brain permanently absorbs50% of each OTHER deployed Cosmic ally's current unbuffed ATK exactly once, at awakening. This is a finite snapshot, including any currently deployed Cosmic tokens; it never repeats at battle start and never includes itself.
- Bosses/Harbingers retain control resistance and45-second enrage. Enraged bosses cannot be reversed, stunned or warped. Yog's emergency rewind excludes bosses and Harbingers. Azathoth's percentage strike is exactly15% CURRENT HP and is not amplified by Haunted marks or Hastur's aura.

## Branches

| Pair | Epic | Grimoire | Mythic |
|---|---|---|---|
| Abyss + Abyss | Sunken R'lyeh Herald | Necronomicon of the Deep | Cthulhu |
| Astral + Astral | Silver Gate Herald | Book of Eibon | Yog-Sothoth |
| Flesh + Flesh | Black Brood Herald | Cultes des Goules | Shub-Niggurath |
| Abyss + Astral | Yellow Sign Herald | King in Yellow Folio | Hastur |
| Abyss + Flesh | Brain Harvest Herald | Revelations of Gla'aki | Elder Brain |
| Astral + Flesh | Crawling Chaos Herald | Pnakotic Manuscripts | Azathoth |

## Implementation details for unspecified values

Astrologer pierces two targets. Brain Herald's infection lasts4s and pulses50% unbuffed ATK each second within2.5 track tiles. Dark Young have20% slow and25% armor shred. R'lyeh floods its facing wall. Gate Herald activates once per runner at Tile8; Yog activates once at each of8 and12. Womb/Brood mimic adjacent base ATK including permanent bonuses, excluding copied ATK, so adjacent mimics cannot recursively amplify one another.

Herald consumes every12s and releases stored Madness every8s. The previous free displacement-Madness bonus, opening consumption, bonus base pulse, permanent meal ATK and shortened pulse timer are removed to match the new roster design. Original Larva/Mass consumption still permanently removes them.

Existing Cosmic sprites remain. New cards use transparent SVG seal emblems, not new illustrated character sprites. Existing upstream WebP sprites are neither replaced nor deleted. Inspector shows locked scripts, Syllables, required Grimoire and pending recipes; persistent progress is serialized with the run.

## Validation

-251 gameplay/UI-code tests passed, including31 new Cosmic regression tests. Run `node --test tests/*.test.js` in the updated full repository.
-The upstream WebP-on-disk test could not run locally because the GitHub content connection does not transfer binary files.156 existing mapped WebP references were separately verified against the latest GitHub tree; original WebP files remain required in the checkout.
- The original36 controlled16-stage simulations (34 victories,35 awakenings, median awakening Crossing8, range4–15) predate the Forbidden Recitation gate and do not estimate its Mythic rate. See audit/cosmic-simulation.js and cosmic-results.json for historical pre-trial results.
-Early awakening is intentionally possible, including Crossing4 in the simulation. Uncapped Shub growth remains strong by user choice. No hidden stage gate or growth cap was added.
-No browser visual playthrough was performed. This package is an update overlay, not a standalone asset-complete game or a GitHub push.
