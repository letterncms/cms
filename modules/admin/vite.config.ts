import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
// @ts-expect-error — plain ESM helper shared with module builds
import { layerVariants } from './vite.plugin.mjs'
// @ts-expect-error — plain ESM helper, also run by the tests
import { standaloneCss, standaloneIcons } from './scripts/standalone.mjs'

/**
 * Shared modules exposed to plugin modules through the import map.
 * Each becomes an entry chunk with a stable export surface.
 */
const shared: Record<string, string> = {
  react: 'src/entries/react.ts',
  'react/jsx-runtime': 'src/entries/jsx-runtime.ts',
  'react-dom': 'src/entries/react-dom.ts',
  'react-dom/client': 'src/entries/react-dom-client.ts',
  '@tanstack/react-query': 'src/entries/react-query.ts',
  '@letterncms/sdk': 'src/entries/sdk.ts',
  '@letterncms/ui': 'src/entries/ui.ts',
  // Drag and drop: the sidebar editor, entry trees, the canvas layers — one copy for every module.
  '@dnd-kit/core': 'src/entries/dnd-core.ts',
  '@dnd-kit/sortable': 'src/entries/dnd-sortable.ts',
  '@dnd-kit/utilities': 'src/entries/dnd-utilities.ts',
}

const entryName = (specifier: string) => specifier.replace(/^@/, '').replace(/[/]/g, '-')

/** Writes dist/admin.json — the contract the CMS's AdminShell reads. */
function adminManifest(): Plugin {
  return {
    name: 'cms-admin-manifest',
    enforce: 'post',
    writeBundle(options, bundle) {
      const files: Record<string, string> = {}
      const css: string[] = []
      const fonts: string[] = []
      let main: string[] = []
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) files[chunk.name] = chunk.fileName
        if (chunk.type === 'chunk' && chunk.isEntry && chunk.name === 'main') main = chunk.imports
        if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) css.push(chunk.fileName)
        // The UI font, so the first paint is already set in it (the mono one waits until code shows up).
        if (chunk.type === 'asset' && /\/InstrumentSans-Latin-[\w-]{8}\.woff2$/.test(chunk.fileName)) fonts.push(chunk.fileName)
      }
      const imports = Object.fromEntries(Object.keys(shared).map((s) => [s, files[entryName(s)]]))
      // Everything the entry imports, fetched in parallel with it instead of one level at a time.
      const preload = [...new Set([...main, files.react, files['cms-ui']])].filter(Boolean)
      writeFileSync(resolve(options.dir!, 'admin.json'), JSON.stringify({ entry: files.main, css, fonts, imports, preload }, null, 2))
      // The pages outside the admin (installer, an app's consent) wear the same tokens: Cms\Admin\StandaloneStyle reads this.
      writeFileSync(resolve(options.dir!, 'standalone.css'), standaloneCss(resolve(import.meta.dirname, 'src/styles')))
      writeFileSync(resolve(options.dir!, 'standalone-icons.json'), JSON.stringify(standaloneIcons(resolve(import.meta.dirname, 'src/lib'))))
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), layerVariants(), adminManifest()],
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode !== 'development',
    target: 'es2023',
    cssCodeSplit: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        main: 'src/main.tsx',
        ...Object.fromEntries(Object.entries(shared).map(([s, file]) => [entryName(s), file])),
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}))
