// The Tailwind compiler for Node (tailwind/cli.mjs) → dist/tailwind/compile.mjs: one file with
// Tailwind inside, so a server needs only `node` to build a site's stylesheet.
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/tailwind',
    emptyOutDir: true,
    target: 'node20',
    ssr: 'tailwind/cli.mjs',
    rollupOptions: { output: { entryFileNames: 'compile.mjs', inlineDynamicImports: true } },
  },
  ssr: { noExternal: true },
})
