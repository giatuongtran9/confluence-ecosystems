// The UI source (the src/ modules, in their original app.js order) as one classic script, for tests that search it or
// evaluate a slice of it in a vm: imports and `export` keywords are stripped and S.<state> reads become plain names.
const fs = require('node:fs'), path = require('node:path');
const ORDER = ['screens', 'ui', 'sprites', 'battlefield', 'cards', 'map', 'board', 'lab', 'input', 'effects/core',
  'effects/sword-music', 'effects/formation-ink', 'effects/soul-blood', 'effects/elements', 'effects/environment',
  'effects/genre-attacks', 'effects/mythic', 'arena', 'main'];
module.exports = () => ORDER.map(m => fs.readFileSync(path.join(__dirname, '../src', m + '.js'), 'utf8')).join('\n')
  .replace(/^import .*$/gm, '').replace(/^export /gm, '').replace(/\bS\.(?=[A-Za-z_$])/g, '');
