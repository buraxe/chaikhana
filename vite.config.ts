import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Two builds from the same source:
 * - default (SPLIT=1, `npm run build`): a page plus one file per game and shared code, published
 *   as a multi-file artifact; each game loads only when it is opened.
 * - SINGLE=1 (`npm run build:single`): everything inlined into one page, kept as a fallback.
 */
const single = !!process.env.SINGLE;
export default defineConfig({
  base: './',
  plugins: single ? [react(), viteSingleFile()] : [react()],
  build: single ? { target: 'es2020' } : {
    target: 'es2020', outDir: 'dist-split', emptyOutDir: true, modulePreload: { polyfill: false },
    rollupOptions: { output: {
      // React changes rarely, so it gets a file of its own that stays the same between releases.
      manualChunks: (id: string) => (/node_modules\/(react|react-dom|scheduler)\//.test(id) ? 'react' : undefined),
      entryFileNames: 'app/[name]-[hash].js', chunkFileNames: (c: { facadeModuleId: string | null }) => {
        // Lessons and puzzle pools are named after their game, in folders of their own.
        const id = c.facadeModuleId ?? '', l = /games\/([\w-]+)\/learn\.ts$/.exec(id), p = /boards\/pools\/(\w+)\.json$/.exec(id);
        return l ? `app/lessons/${l[1]}-[hash].js` : p ? `app/puzzles/${p[1]}-[hash].js` : 'app/[name]-[hash].js';
      }, assetFileNames: 'app/[name]-[hash][extname]' } },
  },
  test: { environment: 'node', testTimeout: 60000 },
} as never);
