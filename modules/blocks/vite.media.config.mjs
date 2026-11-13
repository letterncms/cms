// The browser features of the media blocks (MediaBlocks) → dist/media, as a plugin builds its own: each script an ES
// module whose start() runs on the pages that use it, each stylesheet copied as written (media/styles).
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'media/styles',
  build: {
    outDir: 'dist/media',
    emptyOutDir: true,
    target: 'es2022',
    modulePreload: false,
    rollupOptions: {
      input: { lightbox: 'media/lightbox.ts', autoplay: 'media/autoplay.ts' },
      preserveEntrySignatures: 'exports-only',
      output: { entryFileNames: '[name].js', chunkFileNames: '[name]-[hash].js' },
    },
  },
})
