# Confluence sprite exports

Transparent, centered 512×512 WebP sprites. Each sprite’s visible alpha bounds are fitted proportionally inside a shared 410×410 px safe box, maintaining consistent sizing for board placement. Existing PNG sources are retained unchanged.

- `cultivation-sprites-webp/`: all current Cultivation PNGs from the repository
- `bloodline-sprites-webp/`: all current Bloodline PNGs from the repository
- `haunted-sprites/`: distinct subjects extracted from the four saved Haunted sheets
- `assets/sprite-exports/manifest.json`: source and output details for each export

`app.js` now uses the WebP exports for Cultivation and Bloodline, and for Haunted subjects that clearly match current game cards/forms. The Bus Apex remains one sprite with the terminal visibly beside it, matching the approved saved sheet composition.
