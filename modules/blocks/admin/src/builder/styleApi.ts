// What the Design tab's controls read and write: CSS properties of one list of Tailwind classes, on the layer
// being edited (a screen size and a state). Nothing here knows React or a block: a block's `class`, a site
// class's `@apply` list and an element's style are all edited through the same thing.
import { ClassStyle, layerOf, parseClass, themeReference, withVariants, type Engine, type Screen, type ThemeToken } from '../../../tailwind/engine'
import type { BlockNode } from '../core/types'

export type ValueStatus = 'own' | 'inherited' | 'none'

type Patch = Record<string, string | number | null | undefined>

export interface StyleApi {
  /** Null while the site's stylesheet loads, or when it doesn't compile: nothing reads as set and nothing is written. */
  engine: Engine | null
  classes: string[]
  /** The variants of the layer being edited: ["max-lg", "hover"]. */
  variants: string[]
  screen: Screen
  state: string[]
  /** What a CSS property (camelCase, or a variable a utility sets: "--tw-blur") is at this screen and state: what wins in CSS there. */
  value: (key: string) => string | undefined
  status: (key: string) => ValueStatus
  set: (key: string, value: string | number | null | undefined) => void
  /** Several properties in one step; null or '' takes one off this layer. */
  write: (patch: Patch, group?: string) => void
  /** The properties classes of this layer set. */
  own: () => string[]
  /** The class of a utility's group on this layer ("translate-x-4" for the group of "translate-x-0"). */
  get: (example: string) => string | null
  put: (example: string, utility: string | null, group?: string) => void
  /**
   * Utilities in place of every class of this layer that declares one of `markers`: how the parts Tailwind
   * composes a property from are written ("--tw-duration" is what duration-200 sets; "border-width" is `border`).
   */
  swap: (markers: string | string[], utilities: string | (string | null)[] | null, group?: string) => void
  /** The whole list, as written. */
  apply: (classes: string[], group?: string) => void
  /** Several changes as one step: each call on the draft sees what the one before it wrote. */
  edit: (change: (draft: Pick<StyleApi, 'set' | 'write' | 'put' | 'swap' | 'value'>) => void, group?: string) => void
}

const kebab = (key: string) => (key.startsWith('-') ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))
const camel = (property: string) => (property.startsWith('-') ? property : property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()))
/** A utility without its important mark, as Tailwind is asked about it. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/** A value as a control shows it: the fractions and negations Tailwind writes as calc() worked out ("calc(1 / 2 * 100%)" is 50%). */
export function plain(value: string): string {
  let out = value.trim()
  for (let i = 0; i < 3; i++) {
    const next = out
      // What a utility falls back to when no other sets its part: "var(--tw-shadow-color, rgb(0 0 0 / 0.1))" is that colour.
      .replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, '$1')
      .replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (_, a: string, b: string) => `${+((Number(a) / Number(b)) * 100).toFixed(4)}%`)
      .replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (_, n: string, unit: string) => `${-Number(n)}${unit}`)
    if (next === out) break
    out = next
  }
  return out
}

/** What stands inside a function: "blur(8px)" → "8px". */
export const inner = (value: string | undefined) => value?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1]

export function styleApi(engine: Engine | null, classes: string[], screen: Screen, state: string[], write: (classes: string[], group?: string) => void): StyleApi {
  const variants = [...(screen.variant ? [screen.variant] : []), ...state]
  const own = layerOf(variants)
  const parsed = classes.map((raw) => {
    const { variants: on, utility } = parseClass(raw)
    return { raw, layer: layerOf(on), utility: bare(utility) }
  })
  const reading = engine ? new ClassStyle(engine, classes, screen, state) : null
  const lookup = (key: string): { value: string; own: boolean } | undefined => {
    const found = reading?.find(kebab(key))
    return found ? { value: plain(found.value), own: found.own } : undefined
  }

  const commit = (next: string[], group?: string) => {
    if (!engine || (next.length === classes.length && next.every((name, i) => name === classes[i]))) return
    write(engine.sort([...new Set(next)]), group)
  }
  const style = (list: string[]) => new ClassStyle(engine!, list, screen, state)

  const api: StyleApi = {
    engine,
    classes,
    variants,
    screen,
    state,
    value: (key) => lookup(key)?.value,
    status: (key) => {
      const found = lookup(key)
      return found ? (found.own ? 'own' : 'inherited') : 'none'
    },
    set: (key, value) => api.write({ [key]: value }),
    write: (patch, group) => {
      if (!engine) return
      // A class can't hold a double quote: a value says the same with single ones.
      const properties = Object.fromEntries(Object.entries(patch).map(([key, value]) => [kebab(key), typeof value === 'string' ? value.replace(/"/g, "'") : value]))
      // size-10 is a width and a height: changing one of them keeps the other.
      const list = 'width' in properties || 'height' in properties ? splitSizes(engine, classes, own) : classes
      commit(style(list).set(properties), group ?? Object.keys(patch).join(','))
    },
    own: () => (engine ? style(classes).own().map(camel) : []),
    get: (example) => (engine ? style(classes).get(example) : null),
    put: (example, utility, group) => {
      if (engine) commit(style(classes).put(example, utility), group ?? example)
    },
    swap: (markers, utilities, group) => {
      if (!engine) return
      const names = Array.isArray(markers) ? markers : [markers]
      const kept = parsed.filter((item) => item.layer !== own || !engine.declarations(item.utility)?.some((d) => names.includes(d.property))).map((item) => item.raw)
      const added = (Array.isArray(utilities) ? utilities : [utilities]).filter((utility): utility is string => !!utility)
      commit([...kept, ...added.map((utility) => withVariants(variants, utility))], group ?? names.join(','))
    },
    apply: (next, group) => {
      if (engine && !(next.length === classes.length && next.every((name, i) => name === classes[i]))) write(next, group)
    },
    edit: (change, group) => {
      if (!engine) return
      let current = classes
      const step = () => styleApi(engine, current, screen, state, (next) => { current = next })
      change({
        set: (key, value) => step().set(key, value),
        write: (patch) => step().write(patch),
        put: (example, utility) => step().put(example, utility),
        swap: (markers, utilities) => step().swap(markers, utilities),
        value: (key) => step().value(key),
      })
      commit(current, group ?? 'edit')
    },
  }
  return api
}

/** The classes with every size-* of a layer as its width and its height. */
function splitSizes(engine: Engine, classes: string[], layer: string): string[] {
  return classes.flatMap((raw) => {
    const { variants, utility } = parseClass(raw)
    if (layerOf(variants) !== layer || !/^-?size-/.test(bare(utility))) return [raw]
    const both = ['w', 'h'].map((root) => utility.replace('size-', `${root}-`))
    return both.every((name) => engine.valid(name)) ? both.map((name) => withVariants(variants, name)) : [raw]
  })
}

/** How a root counts: steps of the spacing scale (p-4), pixels (border-2), degrees (rotate-45), milliseconds (duration-200), percent (scale-105), or a plain number (z-10). */
export type Scale = 'spacing' | 'px' | 'deg' | 'ms' | 'percent' | 'number'

/**
 * The utility of a root for a value, as people write it: "16px" on the spacing scale is p-4, "2px" of a border
 * border-2 (and 1px the bare `border`), "200ms" duration-200, a value of the theme its name (blur-sm), and
 * anything else the value itself (p-[13px]). Null when Tailwind takes none of them.
 */
export function partUtility(engine: Engine, root: string, value: string, scale: Scale): string | null {
  const text = value.trim()
  if (text === '') return null
  const known = (utility: string) => (engine.declarations(utility) !== null ? utility : null)
  const reference = themeReference(text)
  const named = reference ? engine.make(root, reference.alpha === undefined ? reference.key : `${reference.key}/${reference.alpha}`) : null
  if (named && !named.includes('[')) return named
  if (/^currentcolor$/i.test(text) && known(`${root}-current`)) return `${root}-current`
  const number = /^(-?)(\d*\.?\d+)([a-z%]*)$/i.exec(text)
  if (number) {
    const [, minus, digits, unit] = number
    const n = Number(digits)
    const step = (count: number) => (count === 1 && scale === 'px' && !minus ? known(root) : null) ?? known(`${minus}${root}-${+count.toFixed(4)}`)
    let found: string | null = null
    if (scale === 'spacing' && n === 0) found = step(0)
    else if (scale === 'spacing' && (unit === 'px' || unit === 'rem')) {
      const base = /^([\d.]+)rem$/.exec(engine.ds.resolveThemeValue('--spacing') ?? '')
      const steps = base ? (unit === 'px' ? n / 16 : n) / Number(base[1]) : NaN
      // Halves are steps people write (p-2.5); a finer value is written out.
      if (Number.isInteger(steps * 2)) found = step(steps)
    } else if (scale === 'spacing' && unit === '%') {
      // The fractions people write: w-1/2, -translate-y-full.
      const fraction = FRACTIONS[String(+n.toFixed(2))]
      if (fraction) found = known(`${minus}${root}-${fraction}`)
    } else if (scale === 'px' && (unit === 'px' || (unit === '' && n === 0))) found = step(n)
    else if (scale === 'deg' && (unit === 'deg' || unit === '')) found = step(n)
    else if (scale === 'ms' && (unit === 'ms' || unit === 's')) found = step(unit === 's' ? n * 1000 : n)
    else if (scale === 'percent' && unit === '%') found = step(n)
    else if (scale === 'percent' && unit === '') found = step(n * 100)
    else if (scale === 'number' && unit === '') found = step(n)
    if (found) return found
  }
  return engine.make(root, text)
}

const FRACTIONS: Record<string, string> = { '100': 'full', '50': '1/2', '25': '1/4', '75': '3/4', '33.33': '1/3', '66.67': '2/3', '20': '1/5', '40': '2/5', '60': '3/5', '80': '4/5' }

export interface GradientStop {
  color: string
  at: string
}

export interface Gradient {
  kind: 'linear' | 'radial'
  angle: string
  stops: GradientStop[]
}

const DEGREES: Record<string, string> = { 'to top': '0deg', 'to right': '90deg', 'to bottom': '180deg', 'to left': '270deg' }

const SIDES: Record<string, string> = {
  'to top': 't', 'to top right': 'tr', 'to right': 'r', 'to bottom right': 'br', 'to bottom': 'b', 'to bottom left': 'bl', 'to left': 'l', 'to top left': 'tl',
  '0deg': 't', '90deg': 'r', '180deg': 'b', '270deg': 'l',
}

/** Every part a gradient written as classes is made of, and a background image written whole. */
export const GRADIENT_MARKERS = ['background-image', '--tw-gradient-from', '--tw-gradient-via', '--tw-gradient-to', '--tw-gradient-from-position', '--tw-gradient-via-position', '--tw-gradient-to-position']

/**
 * A gradient as the classes people write for it (bg-linear-to-r from-primary via-white to-transparent), where
 * it is linear with two or three stops; any other as one background image.
 */
export function gradientUtilities(engine: Engine, gradient: Gradient): string[] {
  const whole = () => {
    const css = `${gradient.kind}-gradient(${[gradient.angle, ...gradient.stops.map((stop) => `${stop.color}${stop.at ? ` ${stop.at}` : ''}`)].filter(Boolean).join(', ')})`
    // Tailwind reads a gradient as an image by itself: no need to say which kind of background value it is.
    const written = engine.make('bg', css)
    return [written && engine.declarations(written)?.some((d) => d.property === 'background-image') ? written : engine.utilityFor('background-image', css)]
  }
  if (gradient.kind !== 'linear' || gradient.stops.length < 2 || gradient.stops.length > 3) return whole()
  const angle = gradient.angle.trim().replace(/\s+/g, ' ')
  const degrees = /^(-?\d+)deg$/.exec(angle)
  const direction = SIDES[angle] ? `bg-linear-to-${SIDES[angle]}` : degrees ? `${degrees[1].startsWith('-') ? '-' : ''}bg-linear-${degrees[1].replace('-', '')}` : null
  if (!direction || engine.declarations(direction) === null) return whole()
  const names = gradient.stops.length === 3 ? ['from', 'via', 'to'] : ['from', 'to']
  const out = [direction]
  for (const [i, stop] of gradient.stops.entries()) {
    const color = partUtility(engine, names[i], stop.color, 'number')
    const position = stop.at ? engine.make(names[i], stop.at) : null
    if (!color || (stop.at && !position)) return whole()
    out.push(color, ...(position ? [position] : []))
  }
  return out
}

/** The gradient the classes of a layer draw, as CSS, from the parts `value` reads; undefined when they draw none. */
export function gradientOf(value: (key: string) => string | undefined): string | undefined {
  const position = value('--tw-gradient-position')
  const from = value('--tw-gradient-from')
  const to = value('--tw-gradient-to')
  if (!position && !from && !to) return undefined
  const via = value('--tw-gradient-via')
  const stop = (color: string | undefined, name: string) => {
    const at = value(`--tw-gradient-${name}-position`)
    return `${color ?? 'transparent'}${at ? ` ${at}` : ''}`
  }
  // Tailwind names the colour space the stops are mixed in ("to right in oklab"): the direction is what a control shows.
  const side = (position ?? 'to bottom').replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, '')
  const angle = DEGREES[side] ?? side
  return `linear-gradient(${[angle, stop(from, 'from'), ...(via ? [stop(via, 'via')] : []), stop(to, 'to')].join(', ')})`
}

/** The variants an element has classes on, for the dots of the layer bar. */
export function usedVariants(classes: string[]): Set<string> {
  return new Set(classes.flatMap((raw) => parseClass(raw).variants))
}

/** Whether classes stand on exactly this layer. */
export function layerUsed(classes: string[], variants: string[]): boolean {
  const layer = layerOf(variants)
  return classes.some((raw) => layerOf(parseClass(raw).variants) === layer)
}

/** A class on the layer being edited, unless it was typed with variants of its own. */
export function onLayer(name: string, variants: string[]): string {
  return parseClass(name).variants.length ? name : withVariants(variants, name)
}

/** The element's classes that are the site's own or that Tailwind doesn't know, and the rest. */
export function splitSiteClasses(engine: Engine | null, classes: string[], site: string[]): { site: string[]; utilities: string[] } {
  const own = new Set(site)
  const out = { site: [] as string[], utilities: [] as string[] }
  for (const raw of classes) {
    const { utility } = parseClass(raw)
    if (own.has(bare(utility)) || (engine && !engine.valid(raw))) out.site.push(raw)
    else out.utilities.push(raw)
  }
  return out
}

/** A name that can stand in a class attribute at all (Document::CLASS_NAME on the server). */
export const writable = (name: string) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(name)
/** A name with Tailwind's punctuation that Tailwind can't read is a mistake; a plain word may be a class the site styles in its own CSS. */
export const broken = (engine: Engine | null, name: string) => !writable(name) || (!!engine && /[:[\]/()]/.test(name) && !engine.valid(name))

const lists = new WeakMap<Engine, string[]>()
/** Every class Tailwind suggests for this stylesheet, read once: some twenty thousand names. */
export function classList(engine: Engine): string[] {
  let list = lists.get(engine)
  if (!list) lists.set(engine, (list = engine.ds.getClassList().map(([name]) => name)))
  return list
}


const LIMIT = 40

/** The classes a search finds: the site's own first, then Tailwind's, those that start with what was typed before those that hold it. */
export function searchClasses(engine: Engine, site: string[], query: string, exclude: Set<string>): string[] {
  const q = query.trim().toLowerCase()
  const out = site.filter((name) => !exclude.has(name) && name.toLowerCase().includes(q))
  if (!q) return out.slice(0, LIMIT)
  const own = new Set(site)
  const starts: string[] = []
  const holds: string[] = []
  for (const name of classList(engine)) {
    if (own.has(name) || exclude.has(name)) continue
    const at = name.indexOf(q)
    if (at === 0) starts.push(name)
    else if (at > 0 && holds.length < LIMIT) holds.push(name)
    if (starts.length >= LIMIT) break
  }
  // What was typed is itself a class when Tailwind reads it (p-[13px], md:flex, bg-primary/50): then it is the first choice.
  // A plain name Tailwind doesn't know may be a class the site styles in its own CSS: the last choice, after every match.
  const typed = query.trim()
  const listed = [...out, ...starts.sort((a, b) => a.length - b.length), ...holds]
  if (!typed || exclude.has(typed) || listed.includes(typed) || !writable(typed) || broken(engine, typed)) return listed.slice(0, LIMIT)
  return engine.valid(typed) ? [typed, ...listed].slice(0, LIMIT) : [...listed.slice(0, LIMIT - 1), typed]
}


/** The states scripts, behaviours and data set on a block (as `data-<name>`), and those of the blocks around it. */
export function dataStates(node: BlockNode, ancestors: BlockNode[]): { own: string[]; inherited: string[] } {
  const of = (block: BlockNode) => [
    ...Object.keys(block.logic?.states ?? {}),
    ...Object.keys(block.bind ?? {}).filter((key) => key.startsWith('state:')).map((key) => key.slice(6)),
    ...(block.logic?.behaviors?.scroll ? ['scrolled', ...(block.logic.behaviors.scroll.hide ? ['hidden'] : [])] : []),
    ...(block.logic?.behaviors?.spy ? ['current'] : []),
  ]
  const own = [...new Set(of(node))]
  return { own, inherited: [...new Set(ancestors.flatMap(of))] }
}


/** The theme's colours as the picker lists them: the site's own names, then Tailwind's palette by family. */
export function colorGroups(tokens: ThemeToken[]): { own: ThemeToken[]; families: { name: string; shades: ThemeToken[] }[] } {
  const own: ThemeToken[] = []
  const families = new Map<string, ThemeToken[]>()
  for (const token of tokens) {
    const shade = /^(.+)-(\d{2,3})$/.exec(token.name)
    if (!shade) own.push(token)
    else families.set(shade[1], [...(families.get(shade[1]) ?? []), token])
  }
  // Tailwind's black and white stand with the palette, after the names the site gave its own colours.
  const plain = (token: ThemeToken) => token.name === 'black' || token.name === 'white'
  return { own: [...own.filter((token) => !plain(token)), ...own.filter(plain)], families: [...families].map(([name, shades]) => ({ name, shades })) }
}


/** Both sides of a value that differs in dark mode: `light-dark(#fff, #000)`. */
export function lightDark(value: string): { light: string; dark?: string } {
  const text = value.trim()
  if (!text.startsWith('light-dark(') || !text.endsWith(')')) return { light: text }
  const body = text.slice(11, -1)
  let depth = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') depth++
    else if (body[i] === ')') depth--
    else if (body[i] === ',' && depth === 0) return { light: body.slice(0, i).trim(), dark: body.slice(i + 1).trim() }
  }
  return { light: text }
}


/** The steps of the spacing scale people reach for, then the theme's own named spaces. */
const STEPS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]

export interface SpacingChoice {
  label: string
  /** What a control holds for it: a length, or a named space's variable. */
  value: string
  title: string
}

export function spacingChoices(engine: Engine | null, named: ThemeToken[]): SpacingChoice[] {
  const base = /^([\d.]+)rem$/.exec(engine?.ds.resolveThemeValue('--spacing') ?? '')
  const steps = base ? STEPS.map((step) => {
    const value = `${+(Number(base[1]) * step * 16).toFixed(3)}px`
    return { label: String(step), value, title: value }
  }) : []
  return [...steps, ...named.map((token) => ({ label: token.name, value: token.ref, title: `${token.variable} · ${token.value}` }))]
}

