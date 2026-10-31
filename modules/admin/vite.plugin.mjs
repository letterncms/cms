// Shared Vite setup for plugin admin modules.
//
//   // plugins/acme/vite.config.mjs
//   import { cmsAdminModule } from '@letterncms/admin/vite'
//   export default cmsAdminModule({ entry: 'admin/src/index.tsx' })
//
// Modules other plugins expose (e.g. "@letterncms/blocks") are listed in `externals`.
//
// Module CSS imports utilities into the "plugins" layer:
//   @import "tailwindcss/theme" layer(theme);
//   @import "tailwindcss/utilities" layer(plugins);
//   @import "@letterncms/admin/theme.css";
//
// React, the SDK, the UI kit and dnd-kit are NOT bundled: the admin theme provides
// them through the import map, so every module shares one copy of each.
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export const SHARED = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@tanstack/react-query', '@letterncms/sdk', '@letterncms/ui', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']

/**
 * Every admin stylesheet — the theme's and each module's — is built on its own, so the
 * cascade cannot rely on Tailwind's ordering inside one file: a module's `lg:grid-cols-7`
 * would lose to the theme's own `.grid-cols-2`. This moves every variant utilities
 * (responsive, hover, dark, group-…) of a file into the shared `variants` layer, which the
 * theme declares last, so variants beat plain utilities whichever file they come from.
 */
export function layerVariants() {
  return {
    name: 'cms-layer-variants',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.css')) asset.source = splitVariants(String(asset.source))
      }
    },
  }
}

export function splitVariants(css) {
  return statements(css)
    .map((statement) => {
      const match = /^\s*@layer\s+(utilities|plugins)\s*\{/.exec(statement)
      if (!match) return statement
      const inner = statements(statement.slice(match[0].length, statement.lastIndexOf('}')))
      // A variant is a rule whose class has a prefix (`md\:`, `hover\:`…) or a breakpoint/container query;
      // @supports fallbacks of plain utilities stay with them.
      const variant = (rule) => {
        const text = rule.trimStart()
        if (/^@(media|container)\b/.test(text)) return true
        const inner = text.startsWith('@') ? text.slice(text.indexOf('{') + 1) : text
        return inner.slice(0, inner.indexOf('{')).includes('\\:')
      }
      const base = inner.filter((rule) => !variant(rule)).join('')
      const variants = inner.filter(variant).join('')
      return `@layer ${match[1]}{${base}}` + (variants ? `@layer variants{${variants}}` : '')
    })
    .join('')
}

/** Top-level statements of a stylesheet (rules and at-rules), quotes and escapes respected. */
function statements(css) {
  const out = []
  let depth = 0
  let start = 0
  let quote = null
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (c === '\\') {
      i++
    } else if (quote) {
      if (c === quote) quote = null
    } else if (c === '"' || c === "'") {
      quote = c
    } else if (c === '{') {
      depth++
    } else if (c === '}') {
      if (--depth === 0) {
        out.push(css.slice(start, i + 1))
        start = i + 1
      }
    } else if (c === ';' && depth === 0) {
      out.push(css.slice(start, i + 1))
      start = i + 1
    }
  }
  if (css.slice(start).trim()) out.push(css.slice(start))
  return out
}

// emptyOutDir stays off because a package can build more into dist/ (blocks has dist/runtime),
// so last build's chunks are cleared here. Left behind, they would ship in the release.
const cleanChunks = (outDir) => ({
  name: 'cms-clean-chunks',
  apply: 'build',
  buildStart: () => rmSync(resolve(outDir, 'chunks'), { recursive: true, force: true }),
})

export function cmsAdminModule({ entry, outDir = 'dist', externals = [] }) {
  return {
    plugins: [react(), tailwindcss(), layerVariants(), cleanChunks(outDir)],
    publicDir: false,
    build: {
      outDir,
      emptyOutDir: false,
      target: 'es2023',
      cssCodeSplit: false,
      lib: { entry, formats: ['es'], fileName: () => 'admin.js', cssFileName: 'admin' },
      rollupOptions: {
        external: (id) => SHARED.includes(id) || externals.includes(id),
        output: { chunkFileNames: 'chunks/[name]-[hash].js', assetFileNames: '[name][extname]' },
      },
    },
  }
}
