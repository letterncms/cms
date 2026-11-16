// The site's stylesheet (content/styling/theme.css) as the admin edits it: theme variables, the site's
// own classes and its element styles are found in the CSS and changed where they stand. Everything
// else in the file, comments and hand-written CSS included, is left exactly as it was written, so
// the design, an agent and a person with an editor can all work on the same file.
//
//   @theme { --color-primary: #1d4ed8; }                      a theme variable
//   @utility btn-primary { @apply bg-primary text-white; }    a class: the utilities it applies
//   @layer base { h1 { @apply text-5xl font-semibold; } }     an element
//   /* group: Cards */ @utility card { … }                    a class in a group of the site's own

interface Block {
  /** Where the statement starts and ends in the CSS (its closing brace or semicolon included). */
  start: number
  end: number
  /** What stands before the brace: "@utility btn-primary", "h1", "@layer base". */
  prelude: string
  /** Where its content starts and ends, between the braces; undefined for a statement without a block. */
  inner?: [number, number]
}

/** The statements between two places of a stylesheet, quotes, comments and nested blocks respected. */
function blocks(css: string, from = 0, to = css.length): Block[] {
  const out: Block[] = []
  let start = -1
  let depth = 0
  let open = -1
  for (let i = from; i < to; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? to : end + 1
      continue
    }
    if (c === '"' || c === "'") {
      if (start === -1) start = i
      for (i++; i < to && css[i] !== c; i++) if (css[i] === '\\') i++
      continue
    }
    if (start === -1) {
      if (/\s/.test(c)) continue
      start = i
    }
    if (c === '{') {
      if (depth++ === 0) open = i
    } else if (c === '}') {
      if (--depth === 0) {
        out.push({ start, end: i + 1, prelude: css.slice(start, open).trim(), inner: [open + 1, i] })
        start = -1
      }
    } else if (c === ';' && depth === 0) {
      out.push({ start, end: i + 1, prelude: css.slice(start, i).trim() })
      start = -1
    }
  }
  return out
}

export interface Variable {
  /** --color-primary */
  name: string
  value: string
}

export interface StyleRule {
  /** A class's name ("btn-primary") or an element's selector ("h1", "a:hover"). */
  name: string
  /** The classes its @apply lists, variants included: ["bg-primary", "hover:opacity-90"]. */
  classes: string[]
  /** Whether it holds CSS besides one @apply, which the controls leave alone. */
  custom: boolean
  /** A class's group, as the comment right before it names it (`/* group: Cards *\/`); none for an element. */
  group?: string
}

/** The comment that puts a class in a group, standing right before its @utility. */
const GROUP = /\/\*[ \t]*group:[ \t]*([^*\n]*?)[ \t]*\*\/\s*$/

const indentOf = (css: string, at: number) => /[ \t]*$/.exec(css.slice(0, at))![0]

/** The elements the design styles, by their selectors: everything else in `@layer base` is the site's own CSS. */
export const ELEMENTS = ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'small', 'blockquote', 'code', 'figcaption', 'hr', '::selection', ':focus-visible'] as const

/** Where a site sets what its form fields look like: the `--field-*` properties, for the page and every section with a colour mode of its own. */
export const FIELDS = ':root, [data-theme]'

/** A layer of rules the design reads: elements and fields in `base`, long-form text in `components`. */
export type Layer = 'base' | 'components'

/** An element inside long-form text, and not a block of its own there (a Box or a Repeat drawn as one). */
const inProse = (element: string) => `.cms-prose ${element}:where(:not(.cms-box, .cms-repeat))`

/** Long-form text (any block with Prose on): its spacing, and its elements where they differ from the page's. In `@layer components`. */
export const ARTICLE = {
  spacing: '.cms-prose',
  h2: inProse('h2'),
  h3: inProse('h3'),
  p: inProse('p'),
  li: '.cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li',
  blockquote: inProse('blockquote'),
  figure: inProse('figure'),
  a: inProse('a'),
} as const

/** The rules each layer's sections show; every other rule of the layer is the site's own CSS. */
const MANAGED: Record<Layer, string[]> = { base: [...ELEMENTS, FIELDS], components: Object.values(ARTICLE) }

/** The theme variables the design shows, kind by kind: every other variable is the site's own CSS. */
const KINDS = 'color|font(?!-weight-)|text(?!-shadow-)|tracking|leading|breakpoint|container|spacing|radius|shadow|inset-shadow|drop-shadow|text-shadow|blur|perspective|ease|animate|duration|control'
const SHOWN = new RegExp(`^--(?:(?:${KINDS})-(?!.*--)[a-z0-9][\\w.-]*|spacing|default-transition-duration|default-transition-timing-function)$`)
/** `--text-*: initial`: Tailwind's values of a kind taken away, so only the site's are listed. The sections follow it. */
const CLEARED = new RegExp(`^--(?:(?:${KINDS})-)?\\*$`)

/** Whether the design shows a theme variable in one of its sections. */
export const shownVariable = (name: string) => SHOWN.test(name)

/** The variables of every @theme block of a stylesheet, the defaults among them: Tailwind's own theme, the kernel's. */
export function themeDefaults(css: string): Variable[] {
  const sheet = new Stylesheet(css)
  return blocks(css).filter((block) => block.inner && /^@theme\b/.test(block.prelude)).flatMap((block) => sheet.declarationsOf(block))
}

/** Whether the braces, brackets and quotes of a text close: a stylesheet being typed is read only when they do. */
export function balanced(css: string): boolean {
  const open: string[] = []
  const pairs: Record<string, string> = { '}': '{', ')': '(', ']': '[' }
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      if (end === -1) return false
      i = end + 1
    } else if (c === '"' || c === "'") {
      for (i++; i < css.length && css[i] !== c; i++) if (css[i] === '\\') i++
      if (i >= css.length) return false
    } else if (c === '{' || c === '(' || c === '[') open.push(c)
    else if (c in pairs && open.pop() !== pairs[c]) return false
  }
  return open.length === 0
}

export class Stylesheet {
  readonly css: string

  constructor(css: string) {
    this.css = css
  }

  /** The variables of the site's own @theme blocks, in the order they stand. */
  variables(): Variable[] {
    return this.themes().flatMap((theme) => this.declarations(theme).map(({ name, value }) => ({ name, value })))
  }

  variable(name: string): string | undefined {
    return this.variables().findLast((variable) => variable.name === name)?.value
  }

  /**
   * A variable set where it stands, added to the theme when it is new, or taken out (null). A new one stands
   * after the others of its kind, or before them (`first`): `--color-*: initial` only clears what comes before it.
   */
  setVariable(name: string, value: string | null, where: 'last' | 'first' = 'last'): Stylesheet {
    const themes = this.themes()
    for (const theme of [...themes].reverse()) {
      const found = this.declarations(theme).findLast((declaration) => declaration.name === name)
      if (!found) continue
      if (value === null) return this.splice(this.lineStart(found.start), this.lineEnd(found.end), '')
      return this.splice(found.start, found.end, `${name}: ${value};`)
    }
    if (value === null) return this
    const theme = themes[0]
    if (!theme) return this.append(`@theme {\n  ${name}: ${value};\n}`, 'after-imports')
    // Beside the others of its kind (--color-… after the last --color-…), else at the end of the theme.
    const kind = this.declarations(theme).filter((declaration) => namespace(declaration.name) === namespace(name))
    if (where === 'first' && kind[0]) return this.splice(kind[0].start, kind[0].start, `${name}: ${value};\n${indentOf(this.css, kind[0].start)}`)
    const kin = kind[kind.length - 1]
    if (kin) {
      // After its line, a comment at the end of it included.
      const line = this.css.indexOf('\n', kin.end)
      const at = line === -1 || line > theme.inner![1] ? kin.end : line
      return this.splice(at, at, `\n${indentOf(this.css, kin.start)}${name}: ${value};`)
    }
    return this.insertLast(theme, `  ${name}: ${value};`)
  }

  /**
   * A variable under another name, where it stands, with what belongs to it (--text-lg--line-height). What reads
   * it in the stylesheet as var(--name) reads the new name.
   */
  renameVariable(from: string, to: string): Stylesheet {
    let next: Stylesheet = this
    const found = this.themes().flatMap((theme) => this.declarations(theme)).filter((declaration) => declaration.name === from || declaration.name.startsWith(`${from}--`))
    if (found.length === 0) return this
    for (const declaration of found.sort((a, b) => b.start - a.start)) next = next.splice(declaration.start, declaration.start + declaration.name.length, to + declaration.name.slice(from.length))
    const reads = new RegExp(`var\\(\\s*${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=(--[\\w-]+)?\\s*[,)])`, 'g')
    return new Stylesheet(next.css.replace(reads, `var(${to}`))
  }

  /** The site's own classes: every @utility, with the classes it applies. */
  utilities(): StyleRule[] {
    return blocks(this.css).filter((block) => /^@utility\s/.test(block.prelude) && block.inner).map((block) => {
      const group = this.groupComment(block)?.name
      return { ...this.rule(block.prelude.replace(/^@utility\s+/, ''), block), ...(group ? { group } : {}) }
    })
  }

  /** A class put in a group (its comment written or rewritten right before it), or out of every group (null). */
  setUtilityGroup(name: string, group: string | null): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${name}`)
    if (!block) return this
    const label = group?.replace(/\*\/|\n/g, '').trim() || null
    const found = this.groupComment(block)
    if (found) return label ? this.splice(found.start, found.end, `/* group: ${label} */`) : this.splice(this.lineStart(found.start), block.start, indentOf(this.css, block.start))
    if (!label) return this
    return this.splice(block.start, block.start, `/* group: ${label} */\n${indentOf(this.css, block.start)}`)
  }

  /** Every class of a group in another one, or out of every group (null). */
  renameGroup(from: string, to: string | null): Stylesheet {
    return this.utilities().filter((rule) => rule.group === from).reduce<Stylesheet>((next, rule) => next.setUtilityGroup(rule.name, to), this)
  }

  /** Where the comment naming a class's group stands, and the group's name. */
  private groupComment(block: Block): { start: number; end: number; name: string } | null {
    const before = this.css.slice(Math.max(0, block.start - 200), block.start)
    const found = GROUP.exec(before)
    if (!found) return null
    const start = block.start - before.length + found.index
    return { start, end: start + found[0].trimEnd().length, name: found[1].trim() }
  }

  /** A class with these classes applied: changed where it stands, or added at the end. An empty list keeps the class, empty. */
  setUtility(name: string, classes: string[]): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${name}`)
    if (block) return this.setApply(block, classes)
    return this.append(`@utility ${name} {\n  @apply ${classes.join(' ')};\n}`)
  }

  /** A class taken out, with the comment that put it in a group. */
  removeUtility(name: string): Stylesheet {
    const next = this.setUtilityGroup(name, null)
    const block = blocks(next.css).find((b) => b.prelude === `@utility ${name}`)
    return block ? next.remove(block) : this
  }

  renameUtility(from: string, to: string): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${from}`)
    return block ? this.splice(block.start, block.start + block.prelude.length, `@utility ${to}`) : this
  }

  /** A class once more under another name, after the one it was made from: all of it, its own CSS and its group included. */
  duplicateUtility(from: string, to: string): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${from}`)
    if (!block) return this
    const body = this.css.slice(block.start + block.prelude.length, block.end)
    const group = this.groupComment(block)?.name ?? null
    return this.splice(block.end, block.end, `\n\n@utility ${to}${body}`).setUtilityGroup(to, group)
  }

  /** What a class declares itself, besides what it applies: its custom properties (`--scheme`) and plain CSS. */
  utilityProperties(name: string): Variable[] {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${name}`)
    return block ? this.properties(block).map(({ name: property, value }) => ({ name: property, value })) : []
  }

  /**
   * A class with these declarations and these classes applied: each declaration set where it stands (a new one after
   * the others), what else the class holds left as it is; a class it doesn't have yet is added at the end.
   */
  writeUtility(name: string, declarations: Variable[], classes: string[]): Stylesheet {
    const find = (sheet: Stylesheet) => blocks(sheet.css).find((b) => b.inner && b.prelude === `@utility ${name}`)
    if (!find(this)) {
      const body = [...declarations.map((d) => `  ${d.name}: ${d.value};`), ...(classes.length ? [`  @apply ${classes.join(' ')};`] : [])].join('\n')
      return this.append(`@utility ${name} {\n${body}\n}`)
    }
    let next: Stylesheet = this
    for (const declaration of declarations) {
      const block = find(next)!
      const line = `${declaration.name}: ${declaration.value};`
      const own = next.properties(block)
      const found = own.findLast((property) => property.name === declaration.name)
      if (found) {
        next = next.splice(found.start, found.end, line)
        continue
      }
      const indent = `${indentOf(next.css, block.start)}  `
      const last = own[own.length - 1]
      const first = blocks(next.css, ...block.inner!)[0]
      if (last) next = next.splice(next.lineEnd(last.end), next.lineEnd(last.end), `${indent}${line}\n`)
      else if (first) next = next.splice(next.lineStart(first.start), next.lineStart(first.start), `${indent}${line}\n`)
      else next = next.insertLast(block, `${indent}${line}`)
    }
    return next.setApply(find(next)!, classes)
  }

  /** Element styles: the rules of `@layer base` (or of another layer), with the classes each applies. */
  elements(layer: Layer = 'base'): StyleRule[] {
    return this.bases(layer).flatMap((base) => blocks(this.css, ...base.inner!).filter((block) => block.inner && !block.prelude.startsWith('@')).map((block) => this.rule(block.prelude.replace(/\s+/g, ' '), block)))
  }

  /** An element with these classes applied; with none, a rule that held nothing else goes. */
  setElement(selector: string, classes: string[], layer: Layer = 'base'): Stylesheet {
    for (const base of this.bases(layer)) {
      const block = blocks(this.css, ...base.inner!).find((b) => b.prelude.replace(/\s+/g, ' ') === selector)
      if (!block) continue
      return classes.length === 0 && !this.rule(selector, block).custom ? this.remove(block) : this.setApply(block, classes)
    }
    if (classes.length === 0) return this
    const rule = `  ${selector} {\n    @apply ${classes.join(' ')};\n  }`
    const base = this.bases(layer)[0]
    if (!base) return this.append(`@layer ${layer} {\n${rule}\n}`)
    return this.insertLast(base, rule)
  }

  /** An element's rule taken out, whatever it holds. */
  removeElement(selector: string, layer: Layer = 'base'): Stylesheet {
    for (const base of this.bases(layer)) {
      const block = blocks(this.css, ...base.inner!).find((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)
      if (block) return this.remove(block)
    }
    return this
  }

  /**
   * The site's own CSS: everything in the stylesheet the design has no section for. Tailwind's imports,
   * the theme's variables it shows, the elements it styles and the site's styles are not in it; a variable of
   * another kind, a rule of another selector, a variant of the site's own (@custom-variant) and plain CSS are.
   */
  extra(): string {
    const { theme, layers, rest } = this.extraParts()
    const out: string[] = []
    if (theme.length) out.push(`@theme {\n${theme.map((part) => this.piece(part, '  ')).join('\n')}\n}`)
    for (const part of rest) out.push(typeof part === 'string' ? `@layer ${part} {\n${layers[part].map((rule) => this.piece(rule, '  ')).join('\n')}\n}` : this.piece(part, ''))
    return out.join('\n\n')
  }

  /**
   * The site's own CSS replaced. What is as it was stays where it stands (the order of CSS can matter: a
   * `--text-*: initial` clears only what comes before it); what was taken out goes; what is new stands at the
   * end, a namespace cleared at the start of the theme.
   */
  setExtra(text: string): Stylesheet {
    const before = this.extraParts()
    const after = new Stylesheet(text).pieces()
    const same = (a: string, b: string) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim()
    const kept = (list: string[], range: [number, number]) => {
      const at = list.findIndex((piece) => same(piece, this.css.slice(...range)))
      if (at === -1) return false
      list.splice(at, 1)
      return true
    }
    const gone = [
      ...before.theme.filter((range) => !kept(after.theme, range)),
      ...before.layers.base.filter((range) => !kept(after.layers.base, range)),
      ...before.layers.components.filter((range) => !kept(after.layers.components, range)),
      ...before.rest.filter((part): part is [number, number] => typeof part !== 'string').filter((range) => !kept(after.rest, range)),
    ].sort((a, b) => b[0] - a[0])
    let next: Stylesheet = this
    for (const [start, end] of gone) next = next.splice(next.lineStart(start), next.lineEnd(end), '')
    // A theme or a layer left with nothing in it goes too.
    for (const block of blocks(next.css).filter((b) => b.inner && (/^@theme(\s+(inline|static))*$/.test(b.prelude) || b.prelude === '@layer base' || b.prelude === '@layer components')).reverse()) {
      if (next.css.slice(...block.inner!).replace(/\/\*[\s\S]*?\*\//g, '').trim() === '') next = next.remove(block)
    }
    const indent = (piece: string) => piece.split('\n').map((line) => (line.trim() ? `  ${line}` : '')).join('\n')
    // A namespace cleared clears what comes before it: it opens the theme.
    const clears = after.theme.filter((piece) => /^--[\w-]*\*\s*:\s*initial\b/.test(piece.replace(/^\/\*[\s\S]*?\*\/\s*/, '')))
    const values = after.theme.filter((piece) => !clears.includes(piece))
    if (clears.length) {
      const theme = blocks(next.css).find((b) => b.inner && /^@theme(\s+(inline|static))*$/.test(b.prelude))
      next = theme ? next.splice(theme.inner![0], theme.inner![0], `\n${clears.map(indent).join('\n')}`) : next.append(`@theme {\n${clears.map(indent).join('\n')}\n}`, 'after-imports')
    }
    const added = [
      ...(values.length ? [`@theme {\n${values.map(indent).join('\n')}\n}`] : []),
      ...(['base', 'components'] as const).flatMap((layer) => (after.layers[layer].length ? [`@layer ${layer} {\n${after.layers[layer].map(indent).join('\n')}\n}`] : [])),
      ...after.rest,
    ]
    const body = next.css.replace(/\s+$/, '')
    return new Stylesheet(`${body}${added.length ? `\n\n${added.join('\n\n')}` : ''}\n`)
  }

  /** Every part of a stylesheet one by one, as it is written: what `setExtra` reads a text as. */
  private pieces(): { theme: string[]; layers: Record<Layer, string[]>; rest: string[] } {
    const out = { theme: [] as string[], layers: { base: [] as string[], components: [] as string[] }, rest: [] as string[] }
    const text = (start: number, end: number) => {
      const own = indentOf(this.css, start)
      return this.css.slice(start, end).split('\n').map((line, i) => (i === 0 ? line : line.startsWith(own) ? line.slice(own.length) : line.trimStart())).join('\n')
    }
    for (const block of blocks(this.css)) {
      if (block.inner && /^@theme(\s+(inline|static))*$/.test(block.prelude)) out.theme.push(...blocks(this.css, ...block.inner).map((statement) => text(this.leading(statement.start), statement.end)))
      else if (block.inner && (block.prelude === '@layer base' || block.prelude === '@layer components')) out.layers[block.prelude.slice(7) as Layer].push(...blocks(this.css, ...block.inner).map((rule) => text(this.leading(rule.start), rule.end)))
      else out.rest.push(text(this.leading(block.start), block.end))
    }
    return out
  }

  /** Where the site's own CSS stands: theme declarations and rules of the base layer one by one, everything else whole. */
  private extraParts(): { theme: [number, number][]; layers: Record<Layer, [number, number][]>; rest: ([number, number] | Layer)[] } {
    const theme: [number, number][] = []
    const layers: Record<Layer, [number, number][]> = { base: [], components: [] }
    const rest: ([number, number] | Layer)[] = []
    const plainTheme = /^@theme(\s+(inline|static))*$/
    for (const block of blocks(this.css)) {
      if (!block.inner && /^@import\s/.test(block.prelude)) continue
      if (block.inner && plainTheme.test(block.prelude)) {
        for (const statement of blocks(this.css, ...block.inner)) {
          const name = /^(--[\w.*-]+)\s*:/.exec(statement.prelude)?.[1]
          if (!statement.inner && name && (SHOWN.test(name) || (CLEARED.test(name) && /:\s*initial\s*$/.test(statement.prelude)))) continue
          theme.push([this.leading(statement.start), statement.end])
        }
        continue
      }
      if (block.inner && (block.prelude === '@layer base' || block.prelude === '@layer components')) {
        const layer = block.prelude.slice(7) as Layer
        for (const rule of blocks(this.css, ...block.inner)) {
          if (rule.inner && MANAGED[layer].includes(rule.prelude.replace(/\s+/g, ' '))) continue
          if (!rest.includes(layer)) rest.push(layer)
          layers[layer].push([this.leading(rule.start), rule.end])
        }
        continue
      }
      if (block.inner && /^@utility\s+[a-z][\w-]*$/.test(block.prelude)) continue
      rest.push([this.leading(block.start), block.end])
    }
    return { theme, layers, rest }
  }

  /** Where a statement starts with the comment on the lines right before it, which belongs to it. */
  private leading(at: number): number {
    let end = at
    while (end > 0 && /\s/.test(this.css[end - 1])) end--
    if (this.css.slice(end - 2, end) !== '*/') return at
    const open = this.css.lastIndexOf('/*', end - 2)
    if (open === -1) return at
    const line = this.css.lastIndexOf('\n', open - 1) + 1
    // A comment after a statement on its line is that statement's.
    return /^[ \t]*$/.test(this.css.slice(line, open)) ? open : at
  }

  /** A part of the stylesheet as it stands, its lines moved so its first one is indented by `indent`. */
  private piece([start, end]: [number, number], indent: string): string {
    const own = indentOf(this.css, start)
    return this.css.slice(start, end).split('\n').map((line, i) => (i === 0 ? indent + line : line.trim() === '' ? '' : indent + (line.startsWith(own) ? line.slice(own.length) : line.trimStart()))).join('\n')
  }

  /** What a rule of `@layer base` declares for a property, written as CSS: the `color-scheme` of `:root`. */
  property(selector: string, property: string, layer: Layer = 'base'): string | undefined {
    for (const base of this.bases(layer)) {
      for (const block of blocks(this.css, ...base.inner!).filter((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)) {
        const found = this.properties(block).findLast((declaration) => declaration.name === property)
        if (found) return found.value
      }
    }
    return undefined
  }

  /** A property of a rule of `@layer base` set where it stands, added (with its rule, first in the layer) or taken out (null): a rule left empty goes. */
  setProperty(selector: string, property: string, value: string | null, layer: Layer = 'base'): Stylesheet {
    for (const base of this.bases(layer)) {
      for (const block of blocks(this.css, ...base.inner!).filter((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)) {
        const found = this.properties(block).findLast((declaration) => declaration.name === property)
        if (found && value !== null) return this.splice(found.start, found.end, `${property}: ${value};`)
        if (found) return blocks(this.css, ...block.inner!).length === 1 ? this.remove(block) : this.splice(this.lineStart(found.start), this.lineEnd(found.end), '')
      }
    }
    if (value === null) return this
    const base = this.bases(layer)[0]
    if (!base) return this.append(`@layer ${layer} {\n  ${selector} {\n    ${property}: ${value};\n  }\n}`)
    const rule = blocks(this.css, ...base.inner!).find((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)
    if (rule) return this.insertLast(rule, `${indentOf(this.css, rule.start)}  ${property}: ${value};`)
    return this.splice(base.inner![0], base.inner![0], `\n  ${selector} {\n    ${property}: ${value};\n  }`)
  }

  private properties(block: Block): (Variable & { start: number; end: number })[] {
    return blocks(this.css, ...block.inner!)
      .filter((statement) => !statement.inner && !statement.prelude.startsWith('@') && statement.prelude.includes(':'))
      .map((statement) => {
        const colon = statement.prelude.indexOf(':')
        return { name: statement.prelude.slice(0, colon).trim(), value: statement.prelude.slice(colon + 1).trim(), start: statement.start, end: statement.end }
      })
  }

  private themes(): Block[] {
    // `@theme default` and `@theme reference` blocks are not the site's own values: only what a plain or inline @theme says.
    return blocks(this.css).filter((block) => block.inner && /^@theme(\s+(inline|static))*$/.test(block.prelude))
  }

  private bases(layer: Layer = 'base'): Block[] {
    return blocks(this.css).filter((block) => block.inner && block.prelude === `@layer ${layer}`)
  }

  /** The variables a block declares, as they are written. */
  declarationsOf(block: Block): Variable[] {
    return this.declarations(block).map(({ name, value }) => ({ name, value }))
  }

  private declarations(block: Block): (Variable & { start: number; end: number })[] {
    return blocks(this.css, ...block.inner!)
      .filter((statement) => !statement.inner && statement.prelude.startsWith('--') && statement.prelude.includes(':'))
      .map((statement) => {
        const colon = statement.prelude.indexOf(':')
        return { name: statement.prelude.slice(0, colon).trim(), value: statement.prelude.slice(colon + 1).trim(), start: statement.start, end: statement.end }
      })
  }

  private rule(name: string, block: Block): StyleRule {
    const inside = blocks(this.css, ...block.inner!)
    const applies = inside.filter((statement) => !statement.inner && statement.prelude.startsWith('@apply'))
    return {
      name,
      classes: applies.flatMap((statement) => statement.prelude.slice(6).trim().split(/\s+/).filter(Boolean)),
      custom: inside.length !== applies.length || applies.length > 1,
    }
  }

  /** The block's first @apply rewritten (others folded into it), or one added as its first line. */
  private setApply(block: Block, classes: string[]): Stylesheet {
    const applies = blocks(this.css, ...block.inner!).filter((statement) => !statement.inner && statement.prelude.startsWith('@apply'))
    const line = classes.length ? `@apply ${classes.join(' ')};` : ''
    if (applies.length === 0) {
      if (line === '') return this
      const indent = `${indentOf(this.css, block.start)}  `
      return this.splice(block.inner![0], block.inner![0], `\n${indent}${line}`)
    }
    let next: Stylesheet = this
    // From the last to the first, so the places before them stay where they are.
    for (const [i, statement] of [...applies].reverse().entries()) {
      const first = i === applies.length - 1
      next = first && line !== '' ? next.splice(statement.start, statement.end, line) : next.splice(next.lineStart(statement.start), next.lineEnd(statement.end), '')
    }
    return next
  }

  private remove(block: Block): Stylesheet {
    const end = this.lineEnd(block.end)
    // The blank line that set it apart goes with it.
    const blank = /^[ \t]*\n/.exec(this.css.slice(end))?.[0].length ?? 0
    return this.splice(this.lineStart(block.start), end + (this.lineStart(block.start) === 0 || this.css[this.lineStart(block.start) - 2] === '\n' ? blank : 0), '')
  }

  private append(text: string, where: 'end' | 'after-imports' = 'end'): Stylesheet {
    if (where === 'after-imports') {
      const imports = blocks(this.css).filter((block) => !block.inner && block.prelude.startsWith('@import'))
      const last = imports[imports.length - 1]
      if (last) return this.splice(last.end, last.end, `\n\n${text}`)
    }
    const body = this.css.replace(/\s+$/, '')
    return new Stylesheet(`${body}${body === '' ? '' : '\n\n'}${text}\n`)
  }

  /** A line added as the last of a block, before its closing brace. */
  private insertLast(block: Block, line: string): Stylesheet {
    const [open, close] = block.inner!
    const trailing = /\s*$/.exec(this.css.slice(open, close))![0].length
    return this.splice(close - trailing, close, `\n${line}\n${indentOf(this.css, block.start)}`)
  }

  private splice(start: number, end: number, text: string): Stylesheet {
    return new Stylesheet(this.css.slice(0, start) + text + this.css.slice(end))
  }

  /** The start of the line a place is on, when only white space stands before it there. */
  private lineStart(at: number): number {
    const line = this.css.lastIndexOf('\n', at - 1) + 1
    return /^[ \t]*$/.test(this.css.slice(line, at)) ? line : at
  }

  /** The end of the line a place is on (its line break included), when only white space follows it there. */
  private lineEnd(at: number): number {
    const rest = /^[ \t]*(\n|$)/.exec(this.css.slice(at))
    return rest ? at + rest[0].length : at
  }
}

/** The kind of a theme variable: --color of --color-primary, --font-weight of --font-weight-bold. */
function namespace(name: string): string {
  return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(name)?.[0] ?? name
}
