// The browser features of the media blocks (MediaBlocks, MapBlocks) → dist/media, as a plugin builds its own: each
// script an ES module whose start() runs on the pages that use it, each stylesheet copied as written (media/styles).
// The Map block's library, MapLibre, is published beside them as it ships (dist/media/maplibre): its worker is found
// next to its own file, and a page loads it only when a map scrolls near.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'

const maplibre = dirname(createRequire(import.meta.url).resolve('maplibre-gl/package.json'))
const version = JSON.parse(readFileSync(join(maplibre, 'package.json'), 'utf8')).version

const publishMapLibre = {
  name: 'cms-maplibre',
  writeBundle() {
    const target = 'dist/media/maplibre'
    mkdirSync(target, { recursive: true })
    for (const file of ['dist/maplibre-gl.mjs', 'dist/maplibre-gl-worker.mjs', 'dist/maplibre-gl-shared.mjs', 'dist/maplibre-gl.css', 'LICENSE.txt']) {
      copyFileSync(join(maplibre, file), join(target, file.replace(/^dist\//, '')))
    }
  },
}

export default defineConfig({
  publicDir: 'media/styles',
  plugins: [publishMapLibre],
  // The library's files keep their names: its version tells a browser when they changed.
  define: { __MAPLIBRE__: JSON.stringify(version) },
  build: {
    outDir: 'dist/media',
    emptyOutDir: true,
    target: 'es2022',
    modulePreload: false,
    rollupOptions: {
      input: { lightbox: 'media/lightbox.ts', autoplay: 'media/autoplay.ts', map: 'media/map.ts' },
      preserveEntrySignatures: 'exports-only',
      output: { entryFileNames: '[name].js', chunkFileNames: '[name]-[hash].js' },
    },
  },
})
