// Tailwind CSS, as the npm package ships it, compiling a site's stylesheet.
//
// A site's styling is one Tailwind stylesheet (content/styling/theme.css) and the classes its
// content uses. Tailwind's own compiler turns the two into CSS with only what is used, exactly
// as a Tailwind build does. It needs no Node and no file system, so the same code runs in the
// admin (the canvas, the Styling page, and for a server without Node) and in Node (`cli.mjs`).
import { __unstable__loadDesignSystem, compile } from 'tailwindcss'
import { version } from 'tailwindcss/package.json'
import index from 'tailwindcss/index.css?raw'
import preflight from 'tailwindcss/preflight.css?raw'
import theme from 'tailwindcss/theme.css?raw'
import utilities from 'tailwindcss/utilities.css?raw'

export { version }

/** What compiles: the site's stylesheet, the stylesheets it may import by name ("cms"), and the classes in use. */
export interface Source {
  css: string
  files: Record<string, string>
  candidates: string[]
}

export type DesignSystem = Awaited<ReturnType<typeof __unstable__loadDesignSystem>>

const PACKAGE: Record<string, string> = {
  tailwindcss: index,
  'tailwindcss/index.css': index,
  'tailwindcss/preflight': preflight,
  'tailwindcss/preflight.css': preflight,
  'tailwindcss/theme': theme,
  'tailwindcss/theme.css': theme,
  'tailwindcss/utilities': utilities,
  'tailwindcss/utilities.css': utilities,
}

function options(files: Record<string, string>) {
  return {
    base: '/',
    loadStylesheet: async (id: string, base: string) => {
      const content = PACKAGE[id] ?? files[id]
      if (content === undefined) throw new Error(`The stylesheet imports "${id}", which is not a stylesheet of the site.`)
      return { path: id, base, content }
    },
    // Plugins and JavaScript configs run code: a site's stylesheet is CSS only.
    loadModule: async (id: string): Promise<never> => {
      throw new Error(`The stylesheet loads "${id}". Plugins and config files are not supported: write @theme, @utility and @custom-variant instead.`)
    },
  }
}

/** A compiler for one stylesheet. `build` adds classes and returns the whole CSS: start a new one to drop classes. */
export async function compiler(source: Pick<Source, 'css' | 'files'>): Promise<{ build: (candidates: string[]) => string }> {
  return compile(source.css, options(source.files))
}

/** The stylesheet's CSS for the classes in use. */
export async function build(source: Source): Promise<string> {
  return minify((await compiler(source)).build(source.candidates))
}

/** What the stylesheet knows: its classes, variants and theme, for the editor's controls and completion. */
export async function designSystem(source: Pick<Source, 'css' | 'files'>): Promise<DesignSystem> {
  return __unstable__loadDesignSystem(source.css, options(source.files))
}

/** Comments and the white space between rules and declarations go; nothing inside a value or a string changes. */
export function minify(css: string): string {
  let out = ''
  let quote: string | null = null
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (quote) {
      out += c
      if (c === '\\') out += css[++i] ?? ''
      else if (c === quote) quote = null
    } else if (c === '"' || c === "'") {
      quote = c
      out += c
    } else if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 1
    } else if (/\s/.test(c)) {
      while (/\s/.test(css[i + 1] ?? '')) i++
      const before = out[out.length - 1]
      const after = css[i + 1]
      if (before !== undefined && after !== undefined && !'{};:,>'.includes(before) && !'{};,>'.includes(after)) out += ' '
    } else {
      out += c
    }
  }
  return out.replace(/;}/g, '}')
}
