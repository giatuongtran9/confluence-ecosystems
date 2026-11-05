# Confluence · The Ninefold Crossing

[**Play the game on GitHub Pages**](https://giatuongtran9.github.io/confluence-ecosystems/)

A browser-based roguelite auto-battler with nine genres, a branching campaign, and a 3×3 formation grid.

## Run locally

Open `index.html` in a browser, or start a local web server:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. No package installation or backend is required.

## Repository contents

The game files (`index.html`, JavaScript, CSS, and `assets/`) are at the repository root. The extracted original project, tests, and design notes are retained under `Confluence/`. The ZIP archive has been removed.

GitHub Actions deploys the playable root files to GitHub Pages on each push to `main`.


## Regression checks

Run `node --test tests/ecosystems.test.js` (Node.js 18 or later). The suite checks
brewing cadence, temporary buffs, post-ascension growth, Haunted triggers, save
compatibility, Bloodline feeding invariants, Matriarch coverage, and WebP mapping.

Cultivation and Bloodline sprites use the `*-sprites-webp` folders. Original PNG
sprite folders are no longer needed. Existing battlefield backgrounds are retained.



## Scrapwork Colossus

See [SCRAPWORK-UPDATE.md](SCRAPWORK-UPDATE.md) for the current Post-Apocalypse roster, forging rules, two-slot Titan progression, validation and balance results. Run all regression checks with `node --test tests/*.test.js`.



## Current balance update
See [BALANCE-UPDATE.md](BALANCE-UPDATE.md) for boss protections, slower earned ascension, persistent Smelter intake, and measured results. It supersedes the earlier pacing and two-adjacent-scrap descriptions.

## Eclipse Hunt

Dark Fantasy now uses quarry marking, temporary monster trophies, mounted auras,
persistent Taxidermist carving counters and three forged-only Mythic paths.
See `ECLIPSE-HUNT-UPDATE.md` for the complete rules and controlled simulation results.
Run all regression checks with `node --test tests/*.test.js`.

## Arcane Loom

Arcane now uses four primary mages, pair-specific essence synthesis, Prism
refraction and finite Battery overflow. Astral Loom binds one of six Mythics at
Crossing10+ and30 points in a single pair. See `ARCANE-LOOM-UPDATE.md` for the
approved rules, initial spell tuning, reproducible simulations and balance limits.

## Ripperdoc Matrix

Cyberpunk now has twelve draftable cards, locked Arm/OS sockets and nine earned
Mythics. Chrome comes only from attacks. Heat, finite RAM and adjacent cooling
shape combat. See `CYBER-MATRIX-UPDATE.md` for the implemented rules, test coverage
and controlled single- and mixed-Operative campaign results.
