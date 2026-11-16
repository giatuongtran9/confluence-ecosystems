import { defineConfig } from 'vite';

// GitHub Pages serves the game from a sub-path, so every URL in the build is relative. Runtime art paths are plain
// strings ('assets/...'), so the build script copies assets/ into dist/ as-is; Vite's own output goes to bundle/.
export default defineConfig({
  base: './',
  build: { assetsDir: 'bundle', chunkSizeWarningLimit: 1000 }, // one game bundle by design
});
