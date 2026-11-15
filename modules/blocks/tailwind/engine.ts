// Reading and writing an element's Tailwind classes, for the controls of the Design tab and the Styling page.
//
// Nothing here knows Tailwind's utilities by heart: what a class does is asked of Tailwind's own design
// system, built from the site's stylesheet. So a site's own utilities, its theme and every later Tailwind
// version work in the controls as they do in the CSS.
//
//   variants   "md:hover:bg-primary/50" is the utility "bg-primary/50" under the variants md and hover.
//              Two classes are on the same layer when they have the same variants, in any order.
//   group      what a utility sets. Two utilities of one group can't both hold, so writing one replaces
//              the other: "p-4" and "p-[13px]" (padding), "flex" and "grid" (display), but not
//              "translate-x-4" and "translate-y-2", which share a property and not a variable.
import type { DesignSystem } from './compile'

export interface Declaration {
  property: string
  value: string
}

export interface ParsedClass {
  raw: string
  /** As written, outermost first: ["md", "hover"]. */
  variants: string[]
  utility: string
}

/** Splits at the colons outside brackets: "md:[&>a]:hover:p-4" → variants md, [&>a], hover and the utility p-4. */
export function parseClass(raw: string): ParsedClass {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (c === '[' || c === '(') depth++
    else if (c === ']' || c === ')') depth--
    else if (c === ':' && depth === 0) {
      parts.push(raw.slice(start, i))
      start = i + 1
    }
  }
  return { raw, variants: parts, utility: raw.slice(start) }
}

/** The layer a class is on: its variants, whatever their order. */
export function layerOf(variants: string[]): string {
  return [...variants].sort().join(':')
}

export function withVariants(variants: string[], utility: string): string {
  return [...variants, utility].join(':')
}

export function splitClasses(value: string | undefined | null): string[] {
  return (value ?? '').split(/\s+/).filter(Boolean)
}

/** A CSS value as an arbitrary value: spaces become underscores, and an underscore of its own is escaped. */
export function arbitrary(value: string): string {
  return value.trim().replace(/_/g, '\\_').replace(/\s+/g, '_')
}

/** The utility that sets a CSS property, where Tailwind names one. Anything else is written as "[property:value]". */
const ROOTS: Record<string, string> = {
  padding: 'p', 'padding-inline': 'px', 'padding-block': 'py', 'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl',
  margin: 'm', 'margin-inline': 'mx', 'margin-block': 'my', 'margin-top': 'mt', 'margin-right': 'mr', 'margin-bottom': 'mb', 'margin-left': 'ml',
  gap: 'gap', 'column-gap': 'gap-x', 'row-gap': 'gap-y',
  width: 'w', height: 'h', 'min-width': 'min-w', 'max-width': 'max-w', 'min-height': 'min-h', 'max-height': 'max-h',
  inset: 'inset', top: 'top', right: 'right', bottom: 'bottom', left: 'left', 'z-index': 'z', order: 'order',
  'flex-basis': 'basis', flex: 'flex', 'flex-grow': 'grow', 'flex-shrink': 'shrink',
  'grid-template-columns': 'grid-cols', 'grid-template-rows': 'grid-rows', 'grid-column': 'col', 'grid-row': 'row',
  'grid-auto-columns': 'auto-cols', 'grid-auto-rows': 'auto-rows', columns: 'columns', 'aspect-ratio': 'aspect',
  'font-family': 'font', 'font-size': 'text', 'font-weight': 'font', 'line-height': 'leading', 'letter-spacing': 'tracking',
  color: 'text', 'text-decoration-color': 'decoration', 'text-decoration-thickness': 'decoration', 'text-underline-offset': 'underline-offset',
  'text-indent': 'indent', 'text-shadow': 'text-shadow', 'list-style-type': 'list', 'vertical-align': 'align', content: 'content',
  'background-color': 'bg', 'background-image': 'bg', 'background-size': 'bg', 'background-position': 'bg',
  'border-color': 'border', 'border-width': 'border', 'border-top-width': 'border-t', 'border-right-width': 'border-r',
  'border-bottom-width': 'border-b', 'border-left-width': 'border-l', 'border-radius': 'rounded',
  'border-top-left-radius': 'rounded-tl', 'border-top-right-radius': 'rounded-tr', 'border-bottom-right-radius': 'rounded-br', 'border-bottom-left-radius': 'rounded-bl',
  'outline-color': 'outline', 'outline-width': 'outline', 'outline-offset': 'outline-offset',
  opacity: 'opacity', 'box-shadow': 'shadow', filter: 'filter', 'backdrop-filter': 'backdrop-filter', 'mix-blend-mode': 'mix-blend',
  cursor: 'cursor', 'accent-color': 'accent', fill: 'fill', stroke: 'stroke', 'stroke-width': 'stroke',
  'transform-origin': 'origin', translate: 'translate', rotate: 'rotate', scale: 'scale', perspective: 'perspective', 'perspective-origin': 'perspective-origin',
  'transition-property': 'transition', 'transition-duration': 'duration', 'transition-timing-function': 'ease', 'transition-delay': 'delay',
  'will-change': 'will-change', 'object-position': 'object', 'scroll-margin-top': 'scroll-mt', 'scroll-padding': 'scroll-p',
  'mask-image': 'mask', 'line-clamp': 'line-clamp', '-webkit-line-clamp': 'line-clamp',
}

/** Roots that take more than one kind of value say which they are given: text-[length:…] is a size, text-[color:…] a colour. */
const HINTS: Record<string, string> = {
  'font-size': 'length', color: 'color', 'font-family': 'family-name', 'font-weight': 'number',
  'background-color': 'color', 'background-image': 'image', 'background-size': 'size', 'background-position': 'position',
  'border-color': 'color', 'border-width': 'length', 'outline-color': 'color', 'outline-width': 'length',
  'text-decoration-color': 'color', 'text-decoration-thickness': 'length', stroke: 'color', 'stroke-width': 'length',
}

export class Engine {
  private readonly css = new Map<string, Declaration[] | null>()
  private readonly groups = new Map<string, string | null>()
  private exact: Map<string, string> | null = null
  readonly ds: DesignSystem

  constructor(ds: DesignSystem) {
    this.ds = ds
  }

  /** What a utility declares, without variants and without rules nested in it. Null when Tailwind doesn't know it. */
  declarations(utility: string): Declaration[] | null {
    let found = this.css.get(utility)
    if (found === undefined) {
      const [css] = this.ds.candidatesToCss([utility])
      found = css === null ? null : topDeclarations(css)
      this.css.set(utility, found)
    }
    return found
  }

  valid(cls: string): boolean {
    return this.ds.candidatesToCss([cls])[0] !== null
  }

  /** What a utility sets, as the name of its group (see the top of the file). Null for a class Tailwind doesn't know. */
  group(utility: string): string | null {
    let found = this.groups.get(utility)
    if (found === undefined) {
      const declarations = this.declarations(utility.replace(/^!|!$/g, ''))
      if (declarations === null) found = null
      else {
        const own = declarations.filter((d) => !d.property.startsWith('--'))
        const variables = declarations.filter((d) => d.property.startsWith('--')).map((d) => d.property)
        // What it is about: the first property it sets by itself, before one it only passes a variable on to (border is a width, not a style).
        const primary = own.find((d) => !d.value.includes('var(--tw-')) ?? own[0]
        // A utility that sets a variable its own property reads is one part of that property (translate-x of translate).
        const parts = primary ? variables.filter((name) => own.some((d) => d.value.includes(name))) : variables
        found = [primary?.property, ...parts.sort()].filter(Boolean).join('|') || utility
      }
      this.groups.set(utility, found)
    }
    return found
  }

  /** The class of a group on a layer, the last one written winning as in CSS. */
  find(classes: string[], variants: string[], group: string): string | null {
    const layer = layerOf(variants)
    let match: string | null = null
    for (const raw of classes) {
      const parsed = parseClass(raw)
      if (layerOf(parsed.variants) === layer && this.group(parsed.utility) === group) match = raw
    }
    return match
  }

  /** The classes with a utility put on a layer in place of whatever was in its group there. Null takes the group off. */
  put(classes: string[], variants: string[], group: string, utility: string | null): string[] {
    const layer = layerOf(variants)
    const next = classes.filter((raw) => {
      const parsed = parseClass(raw)
      return !(layerOf(parsed.variants) === layer && this.group(parsed.utility) === group)
    })
    if (utility) next.push(withVariants(variants, utility))
    return next
  }

  /**
   * The utility for a root and what somebody typed: a step of the theme's scale ("4", "lg", "primary/50", "1/2")
   * where there is one, and the value itself otherwise ("13px" → "p-[13px]").
   */
  make(root: string, input: string, hint?: string): string | null {
    const value = input.trim()
    if (value === '') return null
    const negative = value.startsWith('-') && /^-[\d.]/.test(value)
    const named = negative ? `-${root}-${value.slice(1)}` : `${root}-${value}`
    if (/^[\w./%-]+$/.test(value) && this.declarations(named) !== null) return named
    const written = `${root}-[${hint ? `${hint}:` : ''}${arbitrary(value)}]`
    return this.declarations(written) !== null ? written : null
  }

  /** The utility that declares exactly this, the theme's own name for it first: display:flex → "flex", padding:1rem → "p-4". */
  utilityFor(property: string, value: string): string {
    const root = ROOTS[property]
    // A value of the theme is its class: var(--color-primary) → text-primary, and with an opacity text-primary/50.
    const reference = root ? themeReference(value) : null
    if (root && reference) {
      const named = this.make(root, reference.alpha === undefined ? reference.key : `${reference.key}/${reference.alpha}`)
      if (named && this.declarations(named)?.some((d) => d.property === property && d.value.includes(reference.variable))) return named
    }
    const wanted = normal(this.resolve(value))
    const exact = this.index().get(`${property}:${wanted}`)
    if (exact) return exact
    // A value the theme has under a name is that name's class, also where the utility composes it: shadow-md.
    if (root) {
      for (const [variable, entry] of this.ds.theme.entries()) {
        const key = normal(entry.value) === wanted ? themeReference(`var(${variable})`)?.key : undefined
        const named = key ? this.make(root, key) : null
        if (named && normal(this.resolve(this.value(named, property) ?? '')) === wanted) return named
      }
    }
    // The short form where Tailwind reads it as this property by itself (text-[#f00] is a colour); the kind is said only where it must be.
    const plain = root ? this.make(root, value) : null
    const made = plain && this.declarations(plain)?.some((d) => d.property === property) ? plain : root ? this.make(root, value, HINTS[property]) : null
    // A bare number can name a step that means something else (leading-1.3 is 1.3 steps of spacing, opacity-0.5 half a percent): then the value is written out.
    const says = (utility: string) => (utility.includes('[') ? this.declarations(utility)?.some((d) => d.property === property) : normal(this.resolve(this.value(utility, property) ?? '')) === wanted)
    if (made && says(made)) return made
    const written = root ? `${root}-[${HINTS[property] ? `${HINTS[property]}:` : ''}${arbitrary(value)}]` : null
    if (written && written !== made && says(written)) return written
    return `[${property}:${arbitrary(value)}]`
  }

  /**
   * What a utility sets a property to, as a control shows it. A step of the spacing scale is its length in
   * pixels (p-4 → 16px); a value of the theme stays its variable (text-primary → var(--color-primary)); and a
   * property a utility composes from a variable of its own (a shadow, a ring) is that variable's value.
   */
  value(utility: string, property: string): string | undefined {
    const declarations = this.declarations(utility)
    const declared = declarations?.find((d) => d.property === property)
    if (!declarations || !declared) return undefined
    let value = declared.value
    if (value.includes('var(--tw-')) {
      const own = declarations.filter((d) => d.property.startsWith('--tw-') && value.includes(`var(${d.property}`))
      if (own.length === 1) value = own[0].value.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\([^()]*\))*)\)/g, '$1')
    }
    const step = /^calc\(var\(--spacing\) \* (-?[\d.]+)\)$/.exec(value)
    if (step) {
      const base = /^([\d.]+)rem$/.exec(this.ds.resolveThemeValue('--spacing') ?? '')
      return base ? `${+(Number(base[1]) * Number(step[1]) * 16).toFixed(3)}px` : this.resolve(value)
    }
    return value
  }

  /** The theme's values of one kind, in the order the stylesheet names them: the site's own after Tailwind's. */
  tokens(group: TokenGroup): ThemeToken[] {
    const out: ThemeToken[] = []
    for (const [variable, entry] of this.ds.theme.entries()) {
      const name = tokenName(group, variable)
      if (name !== null) out.push({ group, name, variable, ref: `var(${variable})`, value: entry.value })
    }
    return out
  }

  /** Classes in the order Tailwind writes their CSS, classes it doesn't know first as written. */
  sort(classes: string[]): string[] {
    const order = new Map(this.ds.getClassOrder(classes))
    return [...classes].sort((a, b) => {
      const x = order.get(a) ?? null
      const y = order.get(b) ?? null
      if (x === null || y === null) return x === y ? 0 : x === null ? -1 : 1
      return x < y ? -1 : x > y ? 1 : 0
    })
  }

  /** Every utility that is one declaration with a plain value, by what it declares. Theme values are compared resolved. */
  private index(): Map<string, string> {
    if (this.exact) return this.exact
    const exact = new Map<string, string>()
    const names = this.ds.getClassList().map(([name]) => name)
    const css = this.ds.candidatesToCss(names)
    names.forEach((name, i) => {
      if (css[i] === null) return
      const declarations = topDeclarations(css[i]!)
      this.css.set(name, declarations)
      if (declarations.length !== 1 || css[i]!.indexOf('{') !== css[i]!.lastIndexOf('{')) return
      const key = `${declarations[0].property}:${normal(this.resolve(declarations[0].value))}`
      const held = exact.get(key)
      // Of two names for one value the shorter is the one people write (p-4 before p-[1rem], flex before inline-…).
      if (!held || name.length < held.length) exact.set(key, name)
    })
    return (this.exact = exact)
  }

  /** A value with the theme's variables and its spacing scale worked out: calc(var(--spacing) * 4) → 1rem. */
  resolve(value: string): string {
    let out = value
    for (let i = 0; i < 4 && out.includes('var(--'); i++) {
      out = out.replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (all, name: string) => this.ds.resolveThemeValue(name) ?? all)
    }
    return out.replace(/calc\(([\d.]+)(rem|px|em) \* (-?[\d.]+)\)/g, (_, n: string, unit: string, times: string) => `${+(Number(n) * Number(times)).toFixed(4)}${unit}`)
  }
}

/** A value as it is compared: lower case, one space, a bare 0, and pixels as rems (16px is 1rem to a browser at its default). */
function normal(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
    .replace(/(^|[^\w.-])(-?\d*\.?\d+)px\b/g, (_, before: string, n: string) => `${before}${+(Number(n) / 16).toFixed(4)}rem`)
    .replace(/(^|[^\d.])0(?:rem|em)\b/g, '$10')
}

export type TokenGroup = 'color' | 'font' | 'text' | 'weight' | 'leading' | 'tracking' | 'spacing' | 'radius' | 'shadow' | 'container' | 'breakpoint' | 'ease'

export interface ThemeToken {
  group: TokenGroup
  /** The part of the class after its utility: "primary" of bg-primary, "4xl" of text-4xl. */
  name: string
  /** The theme variable: --color-primary. */
  variable: string
  /** What a control holds for it: var(--color-primary). */
  ref: string
  value: string
}

const NAMESPACES: Record<TokenGroup, string> = {
  color: '--color-', font: '--font-', text: '--text-', weight: '--font-weight-', leading: '--leading-', tracking: '--tracking-',
  spacing: '--spacing-', radius: '--radius-', shadow: '--shadow-', container: '--container-', breakpoint: '--breakpoint-', ease: '--ease-',
}

/** The name a theme variable has in a group, or null when it is not of that group. */
function tokenName(group: TokenGroup, variable: string): string | null {
  const namespace = NAMESPACES[group]
  if (!variable.startsWith(namespace)) return null
  const name = variable.slice(namespace.length)
  // --font-weight-bold is a weight, not a font; --text-sm--line-height belongs to text-sm.
  if (name === '' || name.includes('--') || (group === 'font' && name.startsWith('weight-'))) return null
  return name
}

/** A value that is one theme variable, with the opacity Tailwind mixes in: the key of its class and the variable. */
export function themeReference(value: string): { variable: string; key: string; alpha?: string } | null {
  const text = value.trim()
  const plain = /^var\((--[\w-]+)\)$/.exec(text)
  const mixed = plain ? null : /^color-mix\(in \w+, var\((--color-[\w-]+)\) ([\d.]+)%, transparent\)$/.exec(text)
  const variable = plain?.[1] ?? mixed?.[1]
  if (!variable) return null
  const namespace = Object.values(NAMESPACES).filter((prefix) => variable.startsWith(prefix)).sort((a, b) => b.length - a.length)[0]
  return namespace ? { variable, key: variable.slice(namespace.length), ...(mixed ? { alpha: mixed[2] } : {}) } : null
}

/** The declarations of the first rule of a utility's CSS, leaving out the rules nested in it. */
function topDeclarations(css: string): Declaration[] {
  const open = css.indexOf('{')
  const out: Declaration[] = []
  let depth = 0
  let start = open + 1
  let quote: string | null = null
  for (let i = open + 1; i < css.length; i++) {
    const c = css[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
    } else if (c === '"' || c === "'") quote = c
    else if (c === '(') depth += 100
    else if (c === ')') depth -= 100
    else if (c === '{') {
      depth++
      start = i + 1
    } else if (c === '}') {
      if (depth === 0) break
      depth--
      start = i + 1
    } else if (c === ';' && depth % 100 === 0) {
      if (depth === 0) {
        const text = css.slice(start, i)
        const colon = text.indexOf(':')
        if (colon > 0 && !text.trimStart().startsWith('@')) out.push({ property: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim() })
      }
      start = i + 1
    }
  }
  return out
}

/* An element's classes as the Design tab's controls see them: CSS properties with values, on the layer
   being edited. A layer is a screen and a state, which in Tailwind are the variants of a class:
   "max-lg:hover:bg-primary" is the background on tablets and phones, on hover.

   A screen is the width the page is seen at and the variant its own classes take: every screen (no variant),
   below lg (max-lg:) for a tablet, below md (max-md:) for a phone. What a control shows is what wins in CSS at
   that width: of the classes whose screen variants hold there (md: from 768px up, max-lg: below 1024px), the one
   Tailwind writes last. States fall back to the same classes without the state. */

export interface Found {
  value: string
  /** The class it comes from, and whether that is on the layer being edited. */
  from: string
  own: boolean
}

/** A screen the Design tab styles for. */
export interface Screen {
  /** The variant its own classes take: '' on every screen, 'max-lg' below the lg size. */
  variant: string
  /** The width it is seen at, in CSS pixels. */
  width: number
  /** The theme's screen sizes in CSS pixels, by name: sm → 640. */
  sizes: Record<string, number>
}

/** Every screen, seen at a desktop's width: what the Styling page and a reading without a canvas edit. */
export function everyScreen(sizes: Record<string, number>, width = 1280): Screen {
  return { variant: '', width, sizes }
}

/** A length of a variant in CSS pixels: "640px", "40rem". */
function lengthPx(text: string): number | null {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(text.trim())
  return m ? Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1) : null
}

/** What a variant says about the screen: from a width up (md, min-md, min-[800px]), below one (max-md), or nothing. */
export function screenVariant(variant: string, sizes: Record<string, number>): { from: number } | { below: number } | null {
  if (variant in sizes) return { from: sizes[variant] }
  const m = /^(min|max)-(?:\[(.+)\]|(.+))$/.exec(variant)
  if (!m) return null
  const width = m[2] !== undefined ? lengthPx(m[2]) : m[3] in sizes ? sizes[m[3]] : null
  if (width === null) return null
  return m[1] === 'min' ? { from: width } : { below: width }
}

export class ClassStyle {
  private readonly engine: Engine
  readonly classes: string[]
  /** The variants of the layer being edited: ["max-lg", "hover"]. */
  readonly variants: string[]
  private readonly screen: Screen
  private readonly state: string[]
  private order: Map<string, bigint | null> | null = null

  constructor(engine: Engine, classes: string[], screen: Screen, state: string[]) {
    this.engine = engine
    this.classes = classes
    this.screen = screen
    this.state = state
    this.variants = [...(screen.variant ? [screen.variant] : []), ...state]
  }

  /** Whether a class's screen variants hold at the width being seen; its other variants, as a layer. */
  private split(raw: string): { holds: boolean; rest: string; utility: string; variants: string[] } {
    const { variants, utility } = parseClass(raw)
    let holds = true
    const rest: string[] = []
    for (const variant of variants) {
      const said = screenVariant(variant, this.screen.sizes)
      if (!said) rest.push(variant)
      else if ('from' in said ? this.screen.width < said.from : this.screen.width >= said.below) holds = false
    }
    return { holds, rest: layerOf(rest), utility: utility.replace(/^!|!$/g, ''), variants }
  }

  /** Where a class stands in Tailwind's CSS: a later one wins. */
  private rank(raw: string): bigint | null {
    this.order ??= new Map(this.engine.ds.getClassOrder(this.classes))
    return this.order.get(raw) ?? null
  }

  /**
   * What a property is set to at this screen: of the classes in this state whose screen holds, the one Tailwind
   * writes last; without one, the same without the state. `own` when it comes from the layer being edited.
   */
  find(property: string): Found | undefined {
    const editing = layerOf(this.variants)
    for (const state of this.state.length ? [layerOf(this.state), ''] : ['']) {
      let best: { raw: string; value: string; rank: bigint | null; index: number } | null = null
      this.classes.forEach((raw, index) => {
        const parsed = this.split(raw)
        if (!parsed.holds || parsed.rest !== state) return
        const value = this.engine.value(parsed.utility, property)
        // A value that only reads a part another utility sets (the line height of text-xl, the style of `border`) is not what sets it.
        if (value === undefined || isReference(value)) return
        const rank = this.rank(raw)
        const later = !best || (rank !== null && (best.rank === null || rank > best.rank || (rank === best.rank && index > best.index))) || (rank === null && best.rank === null && index > best.index)
        if (later) best = { raw, value, rank, index }
      })
      if (best) {
        const found = best as { raw: string; value: string }
        return { value: found.value, from: found.raw, own: layerOf(parseClass(found.raw).variants) === editing }
      }
    }
    return undefined
  }

  /**
   * The variants a property is written with here: the layer being edited, unless a class of another layer that
   * holds at this width would still win over it there (md:grid-cols-3 seen on a desktop): then that class's.
   */
  target(property: string): string[] {
    const found = this.find(property)
    if (!found || found.own) return this.variants
    const { variants, utility } = parseClass(found.from)
    const rest = variants.filter((variant) => !screenVariant(variant, this.screen.sizes))
    if (layerOf(rest) !== layerOf(this.state)) return this.variants
    const mine = withVariants(this.variants, utility)
    const [, last] = this.engine.sort([found.from, mine])
    return last === found.from && mine !== found.from ? variants : this.variants
  }

  /** The classes with properties set on this layer; null or '' takes one off. */
  set(patch: Record<string, string | number | null | undefined>): string[] {
    let next = this.classes
    for (const [property, raw] of Object.entries(patch)) {
      const value = raw === null || raw === undefined ? '' : String(raw).trim()
      const variants = new ClassStyle(this.engine, next, this.screen, this.state).target(property)
      if (value === '') {
        const layer = layerOf(variants)
        next = next.filter((cls) => {
          const parsed = parseClass(cls)
          return !(layerOf(parsed.variants) === layer && this.engine.group(parsed.utility)?.split('|')[0] === property)
        })
      } else {
        const utility = this.engine.utilityFor(property, value)
        next = this.engine.put(next, variants, this.engine.group(utility) ?? utility, utility)
      }
    }
    return next
  }

  /** The class of a utility's group on this layer ("translate-x-4" for the group of translate-x-0), if any. */
  get(example: string): string | null {
    const group = this.engine.group(example)
    const found = group ? this.engine.find(this.classes, this.variants, group) : null
    return found ? parseClass(found).utility : null
  }

  /** The classes with a utility in place of its group on this layer; null takes the group of `example` off. */
  put(example: string, utility: string | null): string[] {
    const group = this.engine.group(utility ?? example)
    return group ? this.engine.put(this.classes, this.variants, group, utility) : this.classes
  }

  /** The properties classes of this layer set, for "what is set here" and clearing a layer. */
  own(): string[] {
    const layer = layerOf(this.variants)
    const out = new Set<string>()
    for (const cls of this.classes) {
      const parsed = parseClass(cls)
      if (layerOf(parsed.variants) !== layer) continue
      for (const d of this.engine.declarations(parsed.utility) ?? []) if (!d.property.startsWith('--')) out.add(d.property)
    }
    return [...out]
  }
}

/** Whether a value is nothing but a part another utility sets: "var(--tw-leading, var(--text-xl--line-height))". */
export function isReference(value: string): boolean {
  if (!value.startsWith('var(--tw-')) return false
  let depth = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')' && --depth === 0) return i === value.length - 1
  }
  return false
}
