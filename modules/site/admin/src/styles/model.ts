import { t } from '@letterncms/sdk'
import { ELEMENTS, ID_STYLE, MORE_ELEMENTS, STYLE_GROUPS, Stylesheet, parseClass, withVariants } from '@letterncms/blocks'
import type { Editing } from '../parts'
import { ARTICLES, ELEMENT_LIST, FORM_PARTS, MORE_ELEMENT_LIST, classStyle, idStyle, type PartValue, type Style } from './catalog'

/* Every style of the site in one list, whatever it is written as, each in the group it stands in: what the site was
   given in its own group, and what it made (a class, an element, an id) in the group the comment right before its
   rule names, as a class's always was. Read, written, renamed and moved the same way for every kind. */

/** The groups the site was given, by their place in the address; the site's own come after them. */
export const BUILT_IN = ['elements', 'buttons', 'forms', 'articles'] as const
type BuiltIn = (typeof BUILT_IN)[number]
/** Those a style the site made can go in: a button is a button by its name. */
export const HOLDS_STYLES = ['elements', 'forms', 'articles'] as const
/** The place of the styles in no group of the site's. */
export const UNGROUPED = 'ungrouped'
const RESERVED: string[] = [...BUILT_IN, UNGROUPED]
export const builtInLabel = (id: string) => ({ elements: t('Elements'), buttons: t('Buttons'), forms: t('Forms'), articles: t('Articles') })[id as BuiltIn]

/** A style where it stands: the group it is listed in. */
export type Placed = Style & { home: string }

/** A utility without its important mark. */
export const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/** A name as a class or an id takes it, from words: "Big Quote" is big-quote. */
export const className = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')

export const isButton = (name: string) => name.startsWith('btn-')

/** The site's own classes: every class of its stylesheet but its colour schemes. */
export const ownClasses = (sheet: Stylesheet) => sheet.utilities().filter((rule) => /^[a-z][\w-]*$/.test(rule.name) && !rule.name.startsWith('scheme-'))

/** A group a comment names that is one the site was given: written by its id, `/* group: forms *\/`. */
export const builtInGroup = (name: string | null | undefined): string | null => (name && (HOLDS_STYLES as readonly string[]).includes(name.toLowerCase()) ? name.toLowerCase() : null)

/**
 * The site's groups, in the order its stylesheet first names them, those with nothing in them yet included, each
 * with its place in the address (never one the site was given).
 */
export function siteGroups(sheet: Stylesheet): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = []
  for (const name of sheet.groups()) {
    if (builtInGroup(name)) continue
    const base = className(name) || 'group'
    let id = base
    for (let n = 2; RESERVED.includes(id) || out.some((group) => group.id === id); n++) id = `${base}-${n}`
    out.push({ id, name })
  }
  return out
}

/** The group a comment names, by its place in the address; `fallback` without one. */
const placeOf = (sheet: Stylesheet, group: string | undefined, fallback: string) => builtInGroup(group) ?? siteGroups(sheet).find((each) => each.name === group)?.id ?? fallback

/** Every style of the site, where it stands: what it was given, then the elements, ids and classes it made. */
export function allStyles(sheet: Stylesheet): Placed[] {
  const given: Placed[] = [
    ...ELEMENT_LIST().map((style) => ({ ...style, home: 'elements' })),
    ...FORM_PARTS().map((style) => ({ ...style, home: 'forms' })),
    ...ARTICLES().map((style) => ({ ...style, home: 'articles' })),
  ]
  const more = MORE_ELEMENT_LIST()
  const elements = sheet.elements('base').flatMap((rule): Placed[] => {
    const style = more.find((each) => each.selector === rule.name)
    return style ? [{ ...style, home: placeOf(sheet, rule.group, 'elements') }] : []
  })
  const ids = sheet.elements('components').filter((rule) => ID_STYLE.test(rule.name)).map((rule) => ({ ...idStyle(rule.name, STYLE_GROUPS), home: placeOf(sheet, rule.group, UNGROUPED) }))
  const classes = ownClasses(sheet).map((rule) => ({ ...classStyle(rule.name, STYLE_GROUPS), home: isButton(rule.name) ? 'buttons' : placeOf(sheet, rule.group, UNGROUPED) }))
  return [...given, ...elements, ...ids, ...classes]
}

/** The style at a place: one of the group's own first (an article's Heading 2, not the page's), then any by its id. */
export function styleAt(sheet: Stylesheet, group: string, id: string): Placed | undefined {
  const styles = allStyles(sheet)
  return styles.find((style) => style.home === group && style.id === id) ?? styles.find((style) => style.id === id && !style.given)
}

/** The elements the site can still add: those it styles nowhere yet. */
export const addableElements = (sheet: Stylesheet) => MORE_ELEMENT_LIST().filter((style) => !sheet.elements('base').some((rule) => rule.name === style.selector))

/** The address of a group of styles, or of a style in it. */
export const stylePath = (group?: string, key?: string) => ['/design/styles', group, key].filter(Boolean).map((part, i) => (i === 0 ? part : encodeURIComponent(part!))).join('/')

/** What a group is called. */
export function groupLabel(sheet: Stylesheet, id: string): string | null {
  if (id === UNGROUPED) return t('Ungrouped')
  return builtInLabel(id) ?? siteGroups(sheet).find((group) => group.id === id)?.name ?? null
}

/**
 * Where a group or a style stands, for the bar at the top of the page: each level a crumb, Styles, its group, the
 * style. Null on the list of groups, or for a place there is no longer.
 */
export function stylesPlace(sheet: Stylesheet, [group, key]: string[]): { label: string; to?: string }[] | null {
  if (!group) return null
  const label = groupLabel(sheet, group)
  if (!label) return null
  if (!key) return [{ label: t('Styles'), to: stylePath() }, { label }]
  const style = styleAt(sheet, group, key) ?? (group === 'elements' ? MORE_ELEMENT_LIST().find((each) => each.id === key) : undefined)
  return style ? [{ label: t('Styles'), to: stylePath() }, { label, to: stylePath(group) }, { label: style.label }] : null
}

/** Names a class can't take: the place of a style the site was given, or of an element. */
export const takenByStyles = () => new Set<string>([...ELEMENTS, ...MORE_ELEMENTS, ...ELEMENT_LIST().map((each) => each.id), ...ARTICLES().map((each) => each.id), ...FORM_PARTS().map((each) => each.id)])

/** The classes a style applies, as a stylesheet has them. */
export const classesOf = (sheet: Stylesheet, style: Style) => (style.kind === 'class' ? sheet.utilities().find((rule) => rule.name === style.selector)?.classes : sheet.elements(style.layer).find((rule) => rule.name === style.selector)?.classes) ?? []

/** Whether the stylesheet has the style's rule at all. */
export const hasRule = (sheet: Stylesheet, style: Style) => (style.kind === 'class' ? sheet.utilities().some((rule) => rule.name === style.selector) : sheet.elements(style.layer).some((rule) => rule.name === style.selector))

/** A style applying these classes. With none, one the site made goes (unless it holds CSS of its own), as it came. */
export function writeClasses(sheet: Stylesheet, style: Style, classes: string[]): Stylesheet {
  if (style.kind !== 'class') return sheet.setElement(style.selector, classes, style.layer)
  const custom = sheet.utilities().find((rule) => rule.name === style.selector)?.custom
  return classes.length > 0 || custom ? sheet.setUtility(style.selector, classes) : sheet.removeUtility(style.selector)
}

/** A style the site made, put in a group (by its name, or a given one's id) or in none. */
export const setGroup = (sheet: Stylesheet, style: Style, group: string | null) => (style.kind === 'class' ? sheet.setUtilityGroup(style.selector, group) : sheet.setElementGroup(style.selector, group, style.layer))

/** The group a style the site made names, as written. */
export const groupNamed = (sheet: Stylesheet, style: Style) => (style.kind === 'class' ? ownClasses(sheet).find((rule) => rule.name === style.selector)?.group : sheet.elements(style.layer).find((rule) => rule.name === style.selector)?.group) ?? null

/** A group a style has left stays, with nothing in it, until it is deleted. One the site was given is always there. */
export const keepGroup = (sheet: Stylesheet, group: string | null | undefined) => (group && !builtInGroup(group) && !sheet.groups().includes(group) ? sheet.addGroup(group) : sheet)

/** A style the site made, gone: a class or a rule, with the comment that put it in a group. */
export const removeStyle = (sheet: Stylesheet, style: Style) => (style.kind === 'class' ? sheet.removeUtility(style.selector) : sheet.removeElement(style.selector, style.layer))

/** A class of the site's renamed, and under its new name wherever the stylesheet itself applies it. */
export function renameClass(sheet: Stylesheet, from: string, to: string): Stylesheet {
  const swap = (raw: string) => {
    const { variants, utility } = parseClass(raw)
    return bare(utility) === from ? withVariants(variants, utility.replace(from, to)) : raw
  }
  let next = sheet.renameUtility(from, to)
  for (const rule of next.utilities()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setUtility(rule.name, classes)
  }
  for (const layer of ['base', 'components'] as const) {
    for (const rule of next.elements(layer)) {
      const classes = rule.classes.map(swap)
      if (classes.some((name, i) => name !== rule.classes[i])) next = next.setElement(rule.name, classes, layer)
    }
  }
  return next
}

/** The rule a part's value is written in: its own, or the one it names. */
const ruleOf = (style: Style, value: PartValue) => value.selector ?? style.selector

/** A part's value as the draft has it. */
export function partValue(sheet: Stylesheet, style: Style, value: PartValue): unknown {
  if (value.read) return value.read(sheet)
  return sheet.property(ruleOf(style, value), value.property!, style.layer) ?? null
}

/** A part's value written into the draft: nothing, and it goes. */
export function setPart(sheet: Stylesheet, style: Style, value: PartValue, next: unknown): Stylesheet {
  if (value.write) return value.write(sheet, next)
  return sheet.setProperty(ruleOf(style, value), value.property!, next === null || next === undefined || next === '' ? null : String(next), style.layer)
}

/** Where the --field-* properties are set for every form and section: the kernel's defaults, and a site's own. */
export const ROOT = ':root, [data-theme]'

/** What holds where a style sets nothing: the site's own on every :root, else the kernel's for the rule or :root. */
export const fallbackOf = (sheet: Stylesheet, kernel: Stylesheet, style: Style, value: PartValue) => (value.property ? sheet.property(ROOT, value.property, 'base') ?? kernel.property(ruleOf(style, value), value.property, style.layer) ?? kernel.property(ROOT, value.property, 'base') : undefined)

/** Whether a style is otherwise in the draft than the site has it: its classes, or a value of a part. */
export function styleChanged(edit: Editing, style: Style): boolean {
  if (classesOf(edit.sheet, style).join(' ') !== classesOf(edit.saved, style).join(' ') || hasRule(edit.sheet, style) !== hasRule(edit.saved, style)) return true
  return (style.parts ?? []).some((part) => part.values.some((value) => JSON.stringify(partValue(edit.sheet, style, value)) !== JSON.stringify(partValue(edit.saved, style, value))))
}

/** A style back as the site has it: its classes, or no rule when it had none, and every value of its parts. */
export function revertStyle(edit: Editing, style: Style) {
  edit.change((sheet) => {
    const values = (style.parts ?? []).flatMap((part) => part.values)
    if (style.kind === 'class') {
      const saved = edit.saved.utilities().find((rule) => rule.name === style.selector)
      return saved ? sheet.setUtility(style.selector, saved.classes) : sheet
    }
    // A rule the site doesn't have goes whole; one it has gets its classes back, then its values.
    if (!hasRule(edit.saved, style)) return values.reduce((next, value) => (value.selector || value.write ? setPart(next, style, value, partValue(edit.saved, style, value)) : next), sheet.removeElement(style.selector, style.layer))
    return values.reduce((next, value) => setPart(next, style, value, partValue(edit.saved, style, value)), sheet.setElement(style.selector, classesOf(edit.saved, style), style.layer))
  })
}

