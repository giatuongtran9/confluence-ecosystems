# Leader-specific battlefield update

## Files
- `app.js` — chooses and displays the battlefield assigned to the selected leader for the run. The ready panel names the battlefield; combat keeps the 3×3 center deployment slots and the 16-tile clockwise outer enemy route.
- `style.css` — uses the selected scene art behind the existing 5×5 game board while preserving the art's aspect ratio stretched to the square board bounds so its full edge stays under the fixed 5×5 coordinate grid.
- `assets/battlefields/*.jpg` — the nine supplied battlefield images, renamed for the game.

## Install
Replace the repository-root `app.js` and `style.css` with these files. Copy the whole `assets/battlefields/` folder into the repository's existing `assets/` folder. Keep the existing `assets/battlefield-realistic.png` as a fallback.

## Leader mapping
| Leader | Battlefield | Source image |
|---|---|---|
| Shen (`shen`) | Cultivation | IMG_1841 |
| Yara (`yara`) | Haunted | IMG_1833 |
| Vesper (`vesper`) | Bloodline Fantasy | IMG_1851 |
| Lyra (`lyra`) | Arcane Magic | IMG_1844 |
| Rook (`rook`) | Post-Apocalyptic | IMG_1832 |
| Orion (`orion`) | Science Fiction | IMG_1835 |
| Nyx (`nyx`) | Cyberpunk | IMG_1834 |
| Morrow (`morrow`) | Dark Fantasy | IMG_1836 |
| Naal (`naal`) | Cosmic Horror | IMG_1838 |

The combat engine itself is unchanged: card coordinates remain the nine inner cells and the enemy route remains the sixteen perimeter cells. The supplied art has perspective differences; the game overlay still uses the same square 5×5 logical coordinates for all scenes, so inspect the alignment in a browser before release. The art is fitted to the full board bounds to prevent the image crop from shifting the outer track and center grid.
