# Battlefield image and overlay calibration

The nine supplied square battlefield images replace the existing files in `assets/battlefields/`. Leader selection continues to choose a theme; combat keeps the existing logical nine-card deployment and sixteen-stop clockwise enemy route.

## Leader mapping

| Leader | Theme | Supplied image | Asset |
|---|---|---|---|
| Shen (`shen`) | Cultivation | IMG_1872 | `cultivation.jpg` |
| Yara (`yara`) | Haunted | IMG_1861 | `haunted.jpg` |
| Vesper (`vesper`) | Bloodline Fantasy | IMG_1864 | `bloodline-fantasy.jpg` |
| Lyra (`lyra`) | Arcane Magic | IMG_1868 | `arcane-magic.jpg` |
| Rook (`rook`) | Post-Apocalyptic | IMG_1869 | `post-apocalyptic.jpg` |
| Orion (`orion`) | Science Fiction | IMG_1873 | `science-fiction.jpg` |
| Nyx (`nyx`) | Cyberpunk | IMG_1866 | `cyberpunk.jpg` |
| Morrow (`morrow`) | Dark Fantasy | IMG_1867 | `dark-fantasy.jpg` |
| Naal (`naal`) | Cosmic Horror | IMG_1865 | `cosmic-horror.jpg` |

`app.js` stores per-image percentage bounds for the visible central 3×3. Card containers use those bounds, and both the enemy route and battle-effect endpoints are transformed through the same image-specific tile pitch. The game engine's 3×3 card positions, 16-cell route order, enemy progression, and combat rules are unchanged.

## Overlay calibration (percent of full square image)

| Leader | Left | Top | Width | Height |
|---|---:|---:|---:|---:|
| Orion | 33.0% | 32.9% | 34.2% | 34.2% |
| Shen | 33.2% | 32.1% | 33.8% | 35.2% |
| Rook | 33.3% | 33.3% | 33.6% | 33.6% |
| Lyra | 33.7% | 33.7% | 32.9% | 32.9% |
| Morrow | 33.4% | 33.4% | 33.2% | 33.2% |
| Nyx | 33.2% | 33.5% | 33.4% | 33.4% |
| Naal | 33.6% | 33.2% | 33.0% | 33.7% |
| Vesper | 33.2% | 33.0% | 33.6% | 33.8% |
| Yara | 33.0% | 32.9% | 34.0% | 34.0% |

The outer route uses the same per-scene cell pitch, one cell beyond the central grid on each side. The existing clockwise order is retained.
