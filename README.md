# Confluence · The Ninefold Crossing

[**Play the game on GitHub Pages**](https://giatuongtran9.github.io/confluence-ecosystems/)

A browser-based roguelite auto-battler: nine genres, a branching 16-stage map, and a 3×3 formation that defends a 16-tile loop.

## Run locally

Requires Node.js 22 or later. The UI is ES modules bundled by [Vite](https://vite.dev); there is no backend.

```sh
npm install
npm run dev       # dev server with reload at http://localhost:5173
npm run build     # production build in dist/ (Vite bundle + a copy of assets/)
npm run preview   # serve dist/
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html`, `style.css` | Page shell and styles |
| `data.js` | Leaders, 90 draftable cards, 130 earned forms, 17 tokens, relics |
| `engine.js` | Run, draft, map and combat rules (no DOM; also loadable from Node) |
| `battlefield-view.js` | Perspective mapping of the 2.5D battlefield images |
| `src/main.js` | Entry point: loads the save, starts the frame loop |
| `src/state.js` | Shared mutable UI state (`S`: run, battle, screen, Lab settings…) |
| `src/save.js` | Versioned save envelope with migrations and corrupt-save quarantine |
| `src/screens.js`, `map.js`, `cards.js`, `board.js` | HTML screens, map and node pop-ups, card faces, the battle board |
| `src/battlefield.js`, `arena.js` | Battlefield images and projection; the combat canvas and live HUD |
| `src/lab.js`, `input.js` | Ability Lab; click and input handlers |
| `src/effects/` | Canvas ability effects (Mythic channels and 10th attacks) |
| `src/vfx.js` | Textured particle and sprite layer (Kenney CC0 textures in `assets/vfx`) |
| `assets/` | Battlefields and card art |
| `tests/` | Node test suite |

GitHub Actions runs `npm ci && npm run build` and deploys `dist/` to GitHub Pages on each push to `main`.

## Tests

```sh
npm test
```

## How a run works

- Choose one of nine leaders. Each has a benefit, a drawback, and a genre that gets 1.5× weight in every draft.
- Draft one of three cards after each cleared stage, skip, or reroll for 10 coins. Normal and Rare cards appear first, Epic from crossing 5, Legendary from crossing 10. Mythic forms are earned, never drafted.
- Pick a connected node on the map: battles, Elites (a relic and better draft odds), rest, cache, event and Fate Workshop nodes, then the final boss at stage 16.
- Deploying draws up to nine cards from the deck onto random slots of the 3×3 grid. A Titan occupies two adjacent slots. Cards attack automatically with global reach; runners that complete the loop damage the player.
- Permanent ATK and ecosystem progress persist for the run. Saves live in the browser; a save from an older version is discarded on load.

## Ecosystems

Each genre has an engine that grows across battles and ends in Mythic forms. Every Mythic is earned through a trial on an Elite or Boss node that must be cleared with zero leaks; failing a trial removes the cards involved.

| Genre (leader) | Engine | Mythic trial |
| --- | --- | --- |
| Cultivation (Shen) | Spirit Grass, Lotus Blossoms and Cauldron pills feed Qi; Breakthrough Pills advance realms at 30/85/175 Qi | Heavenly Tribulation at 200 Qi beside an eligible relic |
| Haunted (Yara) | Investigators earn Dread from Violation Marks; Urban Legends earn Violations from rule-breaking runners | Subject Zero containment beside a Containment Relic; Folklore Merger between adjacent Legends |
| Bloodline (Vesper) | The Blood Cub's first meal locks one of five lineages; prey breed tokens that feed it | Ancestral Ascension beside the lineage's relic |
| Arcane (Lyra) | Adjacent mages supply essences; two different essences make a permanent pair point | Astral Loom trial: prove the pair's reaction on a priority target |
| Post-Apocalypse (Rook) | Scavenged scrap is smelted into two locked weapons; Alloy grows the Frame into a two-slot Titan | Titan Reactor field test: each module must hit a priority target |
| Science Fiction (Orion) | Scanners stack Weakpoints for crits; Nanites extract Helices that the Gene-Splicer sequences into Genome | Metamorphosis at 130 Genome beside the matching Serum |
| Cyberpunk (Nyx) | Operatives install one Arm and one OS, earn Chrome from attacks, and manage heat and RAM | Cyber-Reactor trial at 120 Chrome: prove the installed OS |
| Dark Fantasy (Morrow) | Witch Hunters brand a quarry; trophies are mounted and carved into permanent relics | Eclipse Hunt trial at 100 Trophy Points beside a forged Hunt Relic |
| Cosmic Horror (Naal) | Chants and deciphered pages give Idols Syllables and up to two scripts | Forbidden Recitation beside the matching Grimoire |

Exact numbers are on each card in the in-game Codex, which is generated from `data.js`.

## Battlefields

Each leader has a square battlefield image in `assets/battlefields/`. `src/battlefield.js` keeps per-image percentage bounds (`FIELD_GRIDS`) for the central 3×3, so cards, the enemy route and effects line up with the art. Replace an image and adjust its bounds together.
