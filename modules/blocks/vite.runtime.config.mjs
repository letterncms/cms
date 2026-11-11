// The site runtime (runtime/src) → dist/runtime, with a manifest the PHP side reads to
// find the entry and preload chunks. Not part of the admin bundle.
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/runtime',
    emptyOutDir: true,
    target: 'es2022',
    manifest: 'manifest.json',
    // No preload helper: it asks for a chunk's dependencies at the site's root (/motion-….js), where they
    // are not, and a chunk's own imports already fetch them from beside it.
    modulePreload: false,
    rollupOptions: {
      input: 'runtime/src/index.ts',
      output: { entryFileNames: 'cms-[hash].js', chunkFileNames: '[name]-[hash].js' },
    },
  },
})
