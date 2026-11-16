import { useAbility } from '@letterncms/sdk'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { deviceWidths } from '@letterncms/ui'
import { Engine, themeReference, type Screen, type ThemeToken, type TokenGroup } from '../../../tailwind/engine'
import { Stylesheet } from '../../../tailwind/stylesheet'

/* The site's styling in the admin: its stylesheet, read once, and Tailwind's design system built from it, which
   every control of the Design tab asks what a class does. The compiler is a chunk of its own, loaded when a
   screen first needs it. */

/** What Tailwind compiles the site's CSS from (the ability `styling/source`). */
export interface StylingSource {
  signature: string
  /** The site's stylesheet: content/styling/theme.css. */
  css: string
  /** The stylesheets it imports by name: "cms" is the kernel's. */
  files: Record<string, string>
  /** Every class the content uses. */
  candidates: string[]
  /** The CSS that stands before Tailwind's on a page: the font faces and the page transition. */
  faces: string
}

export interface Breakpoint {
  name: string
  /** Where it starts, in CSS pixels. */
  width: number
}

export interface Styling {
  /** Null while the stylesheet loads, where there is no site, and for a stylesheet Tailwind can't read. */
  engine: Engine | null
  /** The theme's screen sizes, smallest first. */
  breakpoints: Breakpoint[]
  /** The site's own classes: the names of its @utility rules. */
  classes: string[]
  source: StylingSource | undefined
  loading: boolean
}

type Sheet = Pick<StylingSource, 'css' | 'files'>

const key = (sheet: Sheet) => `${sheet.css}\u0000${JSON.stringify(sheet.files)}`
const engines = new Map<string, Promise<Engine | null>>()
const built = new Map<string, Engine | null>()
const compilers = new Map<string, Promise<{ build: (candidates: string[]) => string }>>()

/** Only the stylesheet being edited and the one before it are kept: each holds a whole design system. */
function keep<T>(cache: Map<string, T>, id: string, value: T): T {
  cache.set(id, value)
  for (const old of [...cache.keys()].slice(0, -2)) cache.delete(old)
  return value
}

/** The design system of a stylesheet, built once per stylesheet. Null when Tailwind can't read it. */
export function loadEngine(sheet: Sheet): Promise<Engine | null> {
  const id = key(sheet)
  return engines.get(id) ?? keep(engines, id, import('../../../tailwind/compile')
    .then(({ designSystem }) => designSystem(sheet))
    .then((ds) => new Engine(ds))
    .catch((error) => {
      console.error('[cms] The stylesheet could not be read.', error)
      return null
    })
    .then((engine) => keep(built, id, engine)))
}

/** Tailwind's own theme (theme.css): every value a site has before it names its own. */
export function loadTailwindTheme(): Promise<string> {
  return import('../../../tailwind/defaults').then((module) => module.default)
}

/** Tailwind's compiler for a stylesheet: `build` adds classes and returns the whole CSS. One per stylesheet, so a canvas only ever adds. */
export function loadCompiler(sheet: Sheet): Promise<{ build: (candidates: string[]) => string }> {
  const id = key(sheet)
  return compilers.get(id) ?? keep(compilers, id, import('../../../tailwind/compile').then(({ compiler }) => compiler(sheet)))
}

/** The screens a page is seen and styled on: one vocabulary everywhere. */
export type Device = 'desktop' | 'tablet' | 'phone'

/**
 * What a device styles: a desktop every screen, at the width it is seen; a tablet what is below the first size
 * wider than it (max-lg); a phone what is below the size under that (max-md). Desktop first, as people design.
 */
export function screenFor(device: Device, width: number, breakpoints: Breakpoint[]): Screen {
  const sizes = Object.fromEntries(breakpoints.map((size) => [size.name, size.width]))
  if (device === 'desktop') return { variant: '', width, sizes }
  const wider = breakpoints.findIndex((size) => size.width > deviceWidths.tablet)
  const tablet = breakpoints[wider === -1 ? breakpoints.length - 1 : wider]
  const phone = breakpoints[(wider === -1 ? breakpoints.length - 1 : wider) - 1]
  const size = device === 'tablet' ? tablet : phone ?? tablet
  return { variant: size ? `max-${size.name}` : '', width: deviceWidths[device], sizes }
}

/** A length of the theme in CSS pixels (rem and em at 16px). */
function pixels(value: string): number {
  const n = parseFloat(value)
  return Number.isNaN(n) ? 0 : /r?em$/.test(value.trim()) ? n * 16 : n
}

/** The design system of a stylesheet that is at hand: the design hands its draft, the builder the site's. */
export function useEngine(sheet: Sheet | undefined): { engine: Engine | null; loading: boolean } {
  const id = sheet ? key(sheet) : ''
  const [, redraw] = useState(0)
  useEffect(() => {
    if (!sheet || built.has(id)) return
    let alive = true
    void loadEngine(sheet).then(() => alive && redraw((n) => n + 1))
    return () => { alive = false }
  }, [id])
  return { engine: (sheet && built.get(id)) || null, loading: !!sheet && !built.has(id) }
}

function describe(engine: Engine | null, source: StylingSource | undefined, loading: boolean): Styling {
  return {
    engine,
    breakpoints: engine ? engine.tokens('breakpoint').map((token) => ({ name: token.name, width: pixels(token.value) })).filter((size) => size.width > 0).sort((a, b) => a.width - b.width) : [],
    classes: source ? siteClasses(source.css) : [],
    source,
    loading,
  }
}

const Draft = createContext<Styling | null>(null)

/**
 * A stylesheet that is being edited, in place of the site's saved one, for everything inside: the controls,
 * their pickers and chips read the draft's theme and classes. The design wraps its panels in it.
 */
export function StylingProvider({ source, children }: { source: StylingSource; children: ReactNode }) {
  const { engine, loading } = useEngine(source)
  const value = useMemo(() => describe(engine, source, loading), [engine, source, loading])
  return <Draft.Provider value={value}>{children}</Draft.Provider>
}

/** The site's styling, or the draft of it a `StylingProvider` around gives. */
export function useStyling(): Styling {
  const draft = useContext(Draft)
  const query = useAbility<StylingSource>('styling/source', {}, { staleTime: 60_000, retry: false, enabled: !draft })
  const source = draft ? undefined : query.data
  const { engine, loading } = useEngine(source)
  const own = useMemo(() => describe(engine, source, query.isLoading || loading), [engine, source, query.isLoading, loading])
  return draft ?? own
}

/** The names of a stylesheet's own classes. A class with a value of its own ("tab-*") is not one a block can carry by its name. */
function siteClasses(css: string): string[] {
  try {
    return new Stylesheet(css).utilities().map((rule) => rule.name).filter((name) => /^[\w-]+$/.test(name))
  } catch {
    return []
  }
}

export interface Tokens {
  /** The theme's values of one kind, in the order the stylesheet names them. */
  of: (group: TokenGroup) => ThemeToken[]
  /** The token a value is ("var(--color-primary)", or that colour mixed with an opacity), if it is one. */
  find: (value: unknown) => { token: ThemeToken; alpha?: string } | null
  /** A value with the theme's variables worked out, for a swatch or a preview. */
  resolve: (value: string) => string
}

/** The theme's tokens, for the pickers and chips of the controls. Empty while the stylesheet loads. */
export function useThemeTokens(): Tokens {
  const { engine } = useStyling()
  return useMemo(() => tokensOf(engine), [engine])
}

const GROUPS: TokenGroup[] = ['color', 'font', 'text', 'weight', 'leading', 'tracking', 'spacing', 'radius', 'shadow', 'container', 'breakpoint', 'ease']

const empty: Tokens = { of: () => [], find: () => null, resolve: (value) => value }
const tokenSets = new WeakMap<Engine, Tokens>()

/** One reading of a theme for every control that asks: its lists are made once per stylesheet. */
export function tokensOf(engine: Engine | null): Tokens {
  if (!engine) return empty
  let tokens = tokenSets.get(engine)
  if (!tokens) tokenSets.set(engine, (tokens = readTokens(engine)))
  return tokens
}

function readTokens(engine: Engine): Tokens {
  const lists = new Map<TokenGroup, ThemeToken[]>()
  const of = (group: TokenGroup) => {
    let list = lists.get(group)
    if (!list) lists.set(group, (list = engine.tokens(group)))
    return list
  }
  let byVariable: Map<string, ThemeToken> | null = null
  return {
    of,
    find: (value) => {
      const reference = typeof value === 'string' ? themeReference(value) : null
      if (!reference) return null
      byVariable ??= new Map(GROUPS.flatMap((group) => of(group)).map((token) => [token.variable, token]))
      const token = byVariable.get(reference.variable)
      return token ? { token, ...(reference.alpha === undefined ? {} : { alpha: reference.alpha }) } : null
    },
    resolve: (value) => engine.resolve(value),
  }
}
