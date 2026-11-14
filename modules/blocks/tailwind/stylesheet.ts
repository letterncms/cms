// The site's stylesheet (content/styling/theme.css) as the admin edits it: theme variables, the site's
// own classes and its element styles are found in the CSS and changed where they stand. Everything
// else in the file, comments and hand-written CSS included, is left exactly as it was written, so
// the Styling page, an agent and a person with an editor can all work on the same file.
//
//   @theme { --color-primary: #1d4ed8; }                      a theme variable
//   @utility btn-primary { @apply bg-primary text-white; }    a class: the utilities it applies
//   @layer base { h1 { @apply text-5xl font-semibold; } }     an element

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
}

const indentOf = (css: string, at: number) => /[ \t]*$/.exec(css.slice(0, at))![0]

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
    return blocks(this.css).filter((block) => /^@utility\s/.test(block.prelude) && block.inner).map((block) => this.rule(block.prelude.replace(/^@utility\s+/, ''), block))
  }

  /** A class with these classes applied: changed where it stands, or added at the end. An empty list keeps the class, empty. */
  setUtility(name: string, classes: string[]): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${name}`)
    if (block) return this.setApply(block, classes)
    return this.append(`@utility ${name} {\n  @apply ${classes.join(' ')};\n}`)
  }

  removeUtility(name: string): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${name}`)
    return block ? this.remove(block) : this
  }

  renameUtility(from: string, to: string): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${from}`)
    return block ? this.splice(block.start, block.start + block.prelude.length, `@utility ${to}`) : this
  }

  /** A class once more under another name, after the one it was made from: all of it, its own CSS included. */
  duplicateUtility(from: string, to: string): Stylesheet {
    const block = blocks(this.css).find((b) => b.prelude === `@utility ${from}`)
    if (!block) return this
    const body = this.css.slice(block.start + block.prelude.length, block.end)
    return this.splice(block.end, block.end, `\n\n@utility ${to}${body}`)
  }

  /** Element styles: the rules of `@layer base`, with the classes each applies. */
  elements(): StyleRule[] {
    return this.bases().flatMap((base) => blocks(this.css, ...base.inner!).filter((block) => block.inner && !block.prelude.startsWith('@')).map((block) => this.rule(block.prelude.replace(/\s+/g, ' '), block)))
  }

  /** An element with these classes applied; with none, a rule that held nothing else goes. */
  setElement(selector: string, classes: string[]): Stylesheet {
    for (const base of this.bases()) {
      const block = blocks(this.css, ...base.inner!).find((b) => b.prelude.replace(/\s+/g, ' ') === selector)
      if (!block) continue
      return classes.length === 0 && !this.rule(selector, block).custom ? this.remove(block) : this.setApply(block, classes)
    }
    if (classes.length === 0) return this
    const rule = `  ${selector} {\n    @apply ${classes.join(' ')};\n  }`
    const base = this.bases()[0]
    if (!base) return this.append(`@layer base {\n${rule}\n}`)
    return this.insertLast(base, rule)
  }

  /** What a rule of `@layer base` declares for a property, written as CSS: the `color-scheme` of `:root`. */
  property(selector: string, property: string): string | undefined {
    for (const base of this.bases()) {
      for (const block of blocks(this.css, ...base.inner!).filter((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)) {
        const found = this.properties(block).findLast((declaration) => declaration.name === property)
        if (found) return found.value
      }
    }
    return undefined
  }

  /** A property of a rule of `@layer base` set where it stands, added (with its rule, first in the layer) or taken out (null): a rule left empty goes. */
  setProperty(selector: string, property: string, value: string | null): Stylesheet {
    for (const base of this.bases()) {
      for (const block of blocks(this.css, ...base.inner!).filter((b) => b.inner && b.prelude.replace(/\s+/g, ' ') === selector)) {
        const found = this.properties(block).findLast((declaration) => declaration.name === property)
        if (found && value !== null) return this.splice(found.start, found.end, `${property}: ${value};`)
        if (found) return blocks(this.css, ...block.inner!).length === 1 ? this.remove(block) : this.splice(this.lineStart(found.start), this.lineEnd(found.end), '')
      }
    }
    if (value === null) return this
    const base = this.bases()[0]
    if (!base) return this.append(`@layer base {\n  ${selector} {\n    ${property}: ${value};\n  }\n}`)
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

  private bases(): Block[] {
    return blocks(this.css).filter((block) => block.inner && block.prelude === '@layer base')
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
