import { setQuery, t, useLocation, type FieldDef } from '@letterncms/sdk'
import { Button, IconButton, Menu, Tooltip, confirm, copyText, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { ARTICLE, ClassesSection, FIELDS, InspectorSection, PanelFields, Specimen, StateMenu, StylePanels, Stylesheet, parseClass, screenFor, styleApi, styleLabel, styleSample, useSpecimenSheet, useStyling, withVariants, type Device, type Engine, type SampleNode, type StyleLayer as Layer } from '@letterncms/blocks'
import { useMemo, useState, type ReactNode } from 'react'
import { Group, OpenRow, rowAction, type Editing } from './parts'

/* The site's styles: every look it has, in one list, by what it styles. The page itself, its text, its buttons, its
   form fields, its long-form text and the looks it names (a lede, a card). What an element looks like by default and
   a look with a name are the same thing to change: classes behind an @apply, edited with the controls of a block's
   Design tab beside a sample drawn by the site's own CSS. Form fields and the spacing of long-form text are the
   kernel's: their look is properties (--field-*, --prose-*) the site sets. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')
const words = (text: string) => text.split(/\s+/).filter(Boolean)

/** What a sample of the site is drawn with: the draft's compiler, and the screen the page is seen at. */
export interface Samples {
  compiler: { build: (candidates: string[]) => string } | null
  device: Device
}

/** The classes of the page's text, for a sample's frame: what `body` applies does not reach into a shadow root by itself. */
const pageClasses = (sheet: Stylesheet) => sheet.elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? ''

/** An element the site styles by default, in the words people use for it. */
interface Element {
  selector: string
  label: string
  node: SampleNode
  /** What it is styled with: text is type, colour and the space around it, a line is its border. */
  groups?: readonly string[]
}

const TEXT_GROUPS = ['typography', 'spacing', 'fill', 'border', 'effects', 'transition'] as const

const PAGE = (): Element[] => [
  { selector: 'body', label: t('Page'), node: { tag: 'p', text: t('Page') }, groups: ['typography', 'fill'] },
  { selector: '::selection', label: t('Selection'), node: { tag: 'span', text: t('Selection') }, groups: ['typography', 'fill'] },
  { selector: ':focus-visible', label: t('Focus Ring'), node: { tag: 'span', text: t('Focus Ring'), className: 'inline-block rounded-sm px-2' }, groups: ['border', 'effects'] },
  { selector: 'hr', label: t('Divider'), node: { tag: 'hr', text: '', className: 'w-40' }, groups: ['border', 'spacing', 'size'] },
]

const TEXT = (): Element[] => [
  { selector: 'h1', label: t('Heading 1'), node: { tag: 'h1', text: t('Heading 1') } },
  { selector: 'h2', label: t('Heading 2'), node: { tag: 'h2', text: t('Heading 2') } },
  { selector: 'h3', label: t('Heading 3'), node: { tag: 'h3', text: t('Heading 3') } },
  { selector: 'h4', label: t('Heading 4'), node: { tag: 'h4', text: t('Heading 4') } },
  { selector: 'h5', label: t('Heading 5'), node: { tag: 'h5', text: t('Heading 5') } },
  { selector: 'h6', label: t('Heading 6'), node: { tag: 'h6', text: t('Heading 6') } },
  { selector: 'p', label: t('Paragraph'), node: { tag: 'p', text: t('Paragraph') } },
  { selector: 'a', label: t('Link'), node: { tag: 'a', text: t('Link'), attributes: { href: '#' } } },
  { selector: 'strong', label: t('Bold'), node: { tag: 'strong', text: t('Bold') } },
  { selector: 'small', label: t('Small'), node: { tag: 'small', text: t('Small') } },
  { selector: 'blockquote', label: t('Quote'), node: { tag: 'blockquote', text: t('Quote') } },
  { selector: 'code', label: t('Code'), node: { tag: 'code', text: t('Code') } },
  { selector: 'figcaption', label: t('Caption'), node: { tag: 'figcaption', text: t('Caption') } },
]

/** Long-form text: an element drawn inside it. Alone, an element's margins are no part of its look. */
const prose = (markup: string): SampleNode => ({ tag: 'div', text: '', markup: `<div class="cms-prose">${markup}</div>` })

/** The elements of long-form text a site styles apart from the page's, keyed as `ARTICLE` names their rules. */
const ARTICLES = (): (Element & { key: keyof typeof ARTICLE })[] => [
  { key: 'h2', selector: ARTICLE.h2, label: t('Heading 2'), node: prose(`<h2 style="margin:0">${t('Heading 2')}</h2>`) },
  { key: 'h3', selector: ARTICLE.h3, label: t('Heading 3'), node: prose(`<h3 style="margin:0">${t('Heading 3')}</h3>`) },
  { key: 'p', selector: ARTICLE.p, label: t('Paragraph'), node: prose(`<p style="margin:0">${t('Paragraph')}</p>`) },
  { key: 'li', selector: ARTICLE.li, label: t('List Item'), node: prose(`<ul><li>${t('List Item')}</li></ul>`) },
  { key: 'blockquote', selector: ARTICLE.blockquote, label: t('Quote'), node: prose(`<blockquote style="margin:0">${t('Quote')}</blockquote>`) },
  { key: 'figure', selector: ARTICLE.figure, label: t('Figure'), node: prose(`<figure style="margin:0">${t('Figure')}</figure>`), groups: ['spacing', 'border', 'effects'] },
  { key: 'a', selector: ARTICLE.a, label: t('Link'), node: prose(`<p><a href="#">${t('Link')}</a></p>`) },
]

/** What makes a style one of text: it sets nothing but how text looks. */
function textOnly(engine: Engine | null, classes: string[]): boolean {
  if (!engine || classes.length === 0) return false
  return classes.every((raw) => {
    const declarations = engine.declarations(bare(parseClass(raw).utility))
    return !!declarations && declarations.every((d) => /^(font|text-(?!indent)|letter|line-height|color$|white-space|word|overflow-wrap|hyphens|--tw-(font|leading|tracking|ordinal|slashed|numeric|text))/.test(d.property))
  })
}

/** A style under another name, and under that name wherever the stylesheet itself applies it. */
function renameStyle(sheet: Stylesheet, from: string, to: string): Stylesheet {
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

/** A name as a class takes it, from words: "Big Quote" is big-quote. */
const className = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')

async function askName(engine: Engine | null, taken: string[], title: string, confirmLabel: string, prefix = '', current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: prefix ? 'outline' : 'lead', required: true, autofocus: true }], values: { name: current ? styleLabel(current) : '' }, confirm: confirmLabel })
  const key = className(asked?.name)
  if (!key) return null
  const name = `${prefix}${key}`
  if (name === current) return null
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    toast.error(t('A name is lowercase letters, numbers and hyphens, and starts with a letter.'))
    return null
  }
  // A name Tailwind has (flex, display) would be two classes under one name.
  if (taken.includes(name) || engine?.valid(name)) {
    toast.error(t('There is already a style “{name}”.', { name: styleLabel(name) }))
    return null
  }
  return name
}

/**
 * One style, edited as a block is: a large sample, the state being styled, a control for everything a class can
 * set (for the screen the preview shows) and the classes themselves.
 */
function StyleEditor({ edit, samples, label, name, node, classes, groups, write, onBack, menu }: { edit: Editing; samples: Samples; label: string; name?: string; node: SampleNode; classes: string[]; groups?: readonly string[]; write: (classes: string[]) => void; onBack: () => void; menu?: MenuItemDef[] }) {
  const styling = useStyling()
  const [state, setState] = useState<string[]>([])
  const screen = useMemo(() => screenFor(samples.device, 1280, styling.breakpoints), [samples.device, styling.breakpoints])
  // Without the right to change the styling the controls show what is set and write nothing.
  const s = styleApi(styling.engine, classes, screen, state, edit.readOnly ? () => {} : write)
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, [...words(page), ...classes.map((raw) => bare(parseClass(raw).utility)), ...classes, ...words(node.className ?? '')])
  return (
    // The inspector's sections bring their own gutter: they reach the column's edges, as they do in the builder.
    <div className="-mx-4 -mt-2">
      <Header label={label} name={name} onBack={onBack} menu={menu}>
        <StateMenu classes={classes} engine={styling.engine} state={state} onState={setState} />
      </Header>
      <div className="border-b border-border p-4">
        <Specimen sheet={sheet} node={node} page={page} mode={edit.mode} align="center" className="h-28 rounded-md border border-border" />
      </div>
      {/* Read only, the controls show what is set and take no input. */}
      <div inert={edit.readOnly}>
        <StylePanels s={s} groups={groups} />
        <ClassesSection s={s} site={styling.classes} disabled={edit.readOnly} />
      </div>
    </div>
  )
}

/** An editor's head: the way back, what it edits (a class's name to copy beside it), and what is done to it. */
function Header({ label, name, onBack, menu, children }: { label: string; name?: string; onBack: () => void; menu?: MenuItemDef[]; children?: ReactNode }) {
  return (
    <div className="flex h-10 items-center gap-1 border-b border-border px-2">
      <Button variant="ghost" size="sm" icon="arrow-left" onClick={onBack} className="min-w-0 shrink !justify-start !px-2">
        <span className="truncate">{label}</span>
      </Button>
      {name && (
        <Tooltip content={t('Copy Name')}>
          <Button variant="ghost" size="xs" onClick={() => void copyText(name, { copied: t('Copied {reference}', { reference: name }) })} className="min-w-0 shrink !px-1 font-mono !font-normal !text-faint hover:!text-text">
            <span className="truncate">{name}</span>
          </Button>
        </Tooltip>
      )}
      <span className="flex-1" />
      {children}
      {menu && menu.length > 0 && <Menu align="end" trigger={<IconButton icon="more" label={t('Style Actions')} size="xs" />} items={menu} />}
    </div>
  )
}

/** A value as the property editors write it: one property of the site's (--field-*, --prose-*), or the kernel's default. */
interface FieldValue {
  property: string
  label: string
  field: Partial<FieldDef>
}

const color = (property: string, label: string): FieldValue => ({ property, label, field: { type: 'color', component: 'blocks-color' } })
const length = (property: string, label: string, unit = 'px', units = ['px', 'rem']): FieldValue => ({ property, label, field: { component: 'blocks-value', unit, units, min: 0, step: unit === 'px' ? 1 : 0.125 } })
const WEIGHTS = (): Record<string, string> => ({ 'var(--font-weight-normal)': t('Regular'), 'var(--font-weight-medium)': t('Medium'), 'var(--font-weight-semibold)': t('Semibold'), 'var(--font-weight-bold)': t('Bold') })

/** A look made of properties: where the site sets them, a sample drawn with them, and the values by section. */
interface Properties {
  key: string
  label: string
  selector: string
  layer: Layer
  sample: SampleNode
  sections: { title: string; values: FieldValue[] }[]
}

/** What each part of a form is made of: the look of its fields, its labels and help, and its choices. */
const FORM = (): Properties[] => [
  {
    key: 'form:fields',
    label: t('Fields'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: `<input class="cms-input" placeholder="you@example.com" tabindex="-1" style="width:16rem">` },
    sections: [
      { title: t('Field'), values: [color('--field-background', t('Fill')), color('--field-color', t('Text')), color('--field-placeholder', t('Placeholder')), length('--field-border-width', t('Border')), color('--field-border-color', t('Border Color')), length('--field-radius', t('Radius'), 'rem', ['rem', 'px']), { property: '--field-shadow', label: t('Shadow'), field: { component: 'site-shadow' } }] },
      { title: t('Pointed At'), values: [color('--field-hover-background', t('Fill')), color('--field-hover-border-color', t('Border Color'))] },
      { title: t('Focus'), values: [color('--field-focus-background', t('Fill')), color('--field-focus-border-color', t('Border Color')), color('--field-focus-ring-color', t('Ring')), length('--field-focus-ring-width', t('Ring Width'))] },
      { title: t('Error'), values: [color('--field-invalid-color', t('Color'))] },
    ],
  },
  {
    key: 'form:labels',
    label: t('Labels'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: `<div class="cms-field"><label class="cms-label">${t('Email')}</label><p class="cms-help">${t('We never share it.')}</p></div>` },
    sections: [
      { title: t('Label'), values: [{ property: '--field-label-font-size', label: t('Size'), field: { component: 'site-size' } }, { property: '--field-label-font-weight', label: t('Weight'), field: { type: 'select', options: WEIGHTS() } }, color('--field-label-color', t('Color'))] },
      { title: t('Help'), values: [{ property: '--field-help-font-size', label: t('Size'), field: { component: 'site-size' } }, color('--field-help-color', t('Color'))] },
      { title: t('Spacing'), values: [length('--field-spacing-fields', t('Between Fields'), 'rem', ['rem', 'px']), length('--field-spacing-label', t('Under Label'), 'rem', ['rem', 'px'])] },
    ],
  },
  {
    key: 'form:choices',
    label: t('Choices'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: CHOICES() },
    sections: [
      { title: t('Checkbox'), values: [length('--field-checkbox-size', t('Size'), 'rem', ['rem', 'px']), length('--field-checkbox-radius', t('Radius')), color('--field-checkbox-checked', t('Checked')), color('--field-checkbox-mark-color', t('Mark'))] },
      { title: t('Radio Button'), values: [color('--field-radio-checked', t('Checked'))] },
      { title: t('Switch'), values: [color('--field-switch-off', t('Off')), color('--field-switch-on', t('On'))] },
    ],
  },
]

/** Each kind of choice, checked. Markup of our own. */
const CHOICES = () => `<div style="display:flex;gap:1rem;white-space:nowrap"><label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${t('Newsletter')}</label><label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${t('Lunch')}</label><label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${t('Reminders')}</label></div>`

/** A form as the site draws it: a label, a field with help, a dropdown and each kind of choice. */
const FORM_SAMPLE = (): SampleNode => ({
  tag: 'form',
  text: '',
  markup: `<div class="cms-form" style="white-space:normal">
<div class="cms-field"><label class="cms-label">${t('Email')}</label><input class="cms-input" placeholder="you@example.com" tabindex="-1"><p class="cms-help">${t('We never share it.')}</p></div>
<div class="cms-field"><select class="cms-input" tabindex="-1"><option>${t('Dinner for two')}</option></select></div>
${CHOICES()}
</div>`,
})

/** The space in long-form text: between its blocks, around its headings and between the items of a list. */
const SPACING = (): Properties => ({
  key: 'article:spacing',
  label: t('Spacing in Articles'),
  selector: ARTICLE.spacing,
  layer: 'components',
  sample: prose(`<h2 style="margin:0">${t('Heading 2')}</h2><p>${t('Paragraph')}</p><p>${t('Paragraph')}</p><ul><li>${t('List Item')}</li><li>${t('List Item')}</li></ul>`),
  sections: [
    {
      title: 'spacing',
      values: [length('--prose-blocks', t('Blocks'), 'em', ['em', 'rem', 'px']), length('--prose-headings', t('Above Headings'), 'em', ['em', 'rem', 'px']), length('--prose-after-headings', t('Below Headings'), 'em', ['em', 'rem', 'px']), length('--prose-items', t('List Items'), 'em', ['em', 'rem', 'px'])],
    },
  ],
})

/** A look made of properties, value by value, beside a sample drawn with them: the editor's sample is the whole form or article. */
function PropertiesEditor({ edit, samples, part, onBack }: { edit: Editing; samples: Samples; part: Properties; onBack: () => void }) {
  const { source } = useStyling()
  const kernel = useMemo(() => new Stylesheet(source?.files.cms ?? ''), [source?.files.cms])
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, words(page))
  const own = (property: string) => edit.sheet.property(part.selector, property, part.layer)
  const sample = part.layer === 'base' ? FORM_SAMPLE() : part.sample
  return (
    <div className="-mx-4 -mt-2">
      <Header label={part.label} onBack={onBack} menu={resetProperties(edit, part)} />
      <div className="border-b border-border p-4">
        <Specimen sheet={sheet} node={sample} page={page} mode={edit.mode} align="center" className="h-64 rounded-md border border-border" />
      </div>
      <div inert={edit.readOnly}>
        {part.sections.map((section) => {
          const fields = (
            <PanelFields
              fields={section.values.map((value) => ({ handle: value.property, type: 'text', size: 'sm', label: value.label, ...value.field, status: own(value.property) !== undefined ? 'own' : undefined, reset: () => edit.change((s) => s.setProperty(part.selector, value.property, null, part.layer)) }) as FieldDef)}
              values={Object.fromEntries(section.values.map((value) => [value.property, own(value.property) ?? kernel.property(part.selector, value.property, part.layer) ?? null]))}
              onChange={(property, next) => edit.change((s) => s.setProperty(part.selector, property, next === null || next === undefined || next === '' ? null : String(next), part.layer))}
            />
          )
          // One section is the editor's whole content: no heading to fold it under.
          return part.sections.length === 1 ? <div key={section.title} className="space-y-1 px-4 py-3">{fields}</div> : <InspectorSection key={section.title} title={section.title}>{fields}</InspectorSection>
        })}
      </div>
    </div>
  )
}

/** Reset for a look made of properties, when the site sets any of them. */
function resetProperties(edit: Editing, part: Properties): MenuItemDef[] {
  const values = part.sections.flatMap((section) => section.values)
  if (edit.readOnly || !values.some((value) => edit.sheet.property(part.selector, value.property, part.layer) !== undefined)) return []
  return [{ label: t('Reset'), icon: 'undo', onSelect: () => edit.change((s) => values.reduce((next, value) => next.setProperty(part.selector, value.property, null, part.layer), s)) }]
}

/**
 * Every look of the site, in one list by what it styles: the page, text, buttons, forms and boxes. Each is drawn
 * as the site draws it and opens on its editor in place of the list, named in the address (`?style=`) so a block's
 * Edit Style leads straight to it.
 */
export function Styles({ edit, samples }: { edit: Editing; samples: Samples }) {
  const { engine } = useStyling()
  const open = useLocation().query.style ?? ''
  const show = (key: string | null) => setQuery({ style: key, tab: 'styles' }, false)
  // A style made here has nothing to apply yet, and Tailwind refuses an empty one: it waits for its first change.
  const [fresh, setFresh] = useState<{ name: string; text: boolean } | null>(null)
  const elements = [...edit.sheet.elements(), ...edit.sheet.elements('components')]
  const classesOf = (selector: string) => elements.find((rule) => rule.name === selector)?.classes ?? []
  const all = edit.sheet.utilities().filter((rule) => /^[a-z][\w-]*$/.test(rule.name) && !rule.name.startsWith('scheme-'))
  const buttons = all.filter((rule) => rule.name.startsWith('btn-'))
  const named = all.filter((rule) => !rule.name.startsWith('btn-'))
  const text = named.filter((rule) => textOnly(engine, rule.classes) || (fresh?.name === rule.name && fresh.text))
  const boxes = named.filter((rule) => !text.includes(rule))
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, [...words(page), ...classesOf('::selection'), ...classesOf(':focus-visible'), ...PAGE().flatMap((entry) => words(entry.node.className ?? '')), ...all.map((rule) => rule.name)])
  const taken = edit.sheet.utilities().map((rule) => rule.name)

  // The sample of an element: the selection and the focus ring can't be shown by selecting or focusing, so they wear their classes.
  const sampleOf = (element: Element): SampleNode => (['::selection', ':focus-visible'].includes(element.selector) ? { ...element.node, className: [element.node.className, ...classesOf(element.selector)].filter(Boolean).join(' ') } : element.node)

  const create = async (kind: 'text' | 'button' | 'box') => {
    const name = await askName(engine, taken, kind === 'button' ? t('New Button') : t('New Style'), kind === 'button' ? t('Create Button') : t('Create Style'), kind === 'button' ? 'btn-' : '')
    if (!name) return
    // A new button starts as a copy of the first one, a style as text of the page's size or a box with room inside.
    if (kind === 'button' && buttons[0]) edit.change((s) => s.duplicateUtility(buttons[0].name, name))
    else edit.change((s) => s.setUtility(name, kind === 'text' ? ['text-base'] : kind === 'box' ? ['p-6'] : ['inline-flex']))
    setFresh({ name, text: kind === 'text' })
    show(name)
  }
  const rename = async (from: string) => {
    const name = await askName(engine, taken, t('Rename'), t('Rename'), from.startsWith('btn-') ? 'btn-' : '', from)
    if (name) {
      edit.change((s) => renameStyle(s, from, name))
      if (open === from) show(name)
    }
  }
  const duplicate = async (from: string) => {
    const name = await askName(engine, taken, t('Duplicate'), t('Duplicate'), from.startsWith('btn-') ? 'btn-' : '')
    if (name) edit.change((s) => s.duplicateUtility(from, name))
  }
  const remove = async (name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name: styleLabel(name) }), confirm: t('Delete'), danger: true }))) return
    edit.change((s) => s.removeUtility(name))
    if (open === name) show(null)
  }
  const styleMenu = (name: string): MenuItemDef[] => (edit.readOnly ? [] : [
    { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(name) },
    { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(name) },
    { separator: true, label: '' },
    { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => void remove(name) },
  ])
  const resetMenu = (selector: string, layer: Layer = 'base'): MenuItemDef[] => (edit.readOnly || classesOf(selector).length === 0 ? [] : [{ label: t('Reset'), icon: 'undo', onSelect: () => edit.change((s) => s.removeElement(selector, layer)) }])

  // An element of the page or of its text.
  const element = [...PAGE(), ...TEXT()].find((entry) => `element:${entry.selector}` === open)
  if (element) {
    return <StyleEditor key={open} edit={edit} samples={samples} label={element.label} node={sampleOf(element)} classes={classesOf(element.selector)} groups={element.groups ?? TEXT_GROUPS} onBack={() => show(null)} menu={resetMenu(element.selector)} write={(classes) => edit.change((s) => s.setElement(element.selector, classes))} />
  }
  const article = ARTICLES().find((entry) => `article:${entry.key}` === open)
  if (article) {
    return <StyleEditor key={open} edit={edit} samples={samples} label={t('{name} in Articles', { name: article.label })} node={article.node} classes={classesOf(article.selector)} groups={article.groups ?? TEXT_GROUPS} onBack={() => show(null)} menu={resetMenu(article.selector, 'components')} write={(classes) => edit.change((s) => s.setElement(article.selector, classes, 'components'))} />
  }
  const properties = [...FORM(), SPACING()].find((part) => part.key === open)
  if (properties) return <PropertiesEditor key={open} edit={edit} samples={samples} part={properties} onBack={() => show(null)} />
  const rule = all.find((entry) => entry.name === open)
  if (rule) {
    return (
      <StyleEditor
        key={open}
        edit={edit}
        samples={samples}
        label={styleLabel(rule.name)}
        name={rule.name}
        node={styleSample(rule.name)}
        classes={rule.classes}
        groups={text.includes(rule) ? TEXT_GROUPS : undefined}
        onBack={() => show(null)}
        menu={styleMenu(rule.name)}
        // With nothing left to apply the style goes, unless it holds CSS of its own.
        write={(classes) => edit.change((s) => (classes.length > 0 || s.utilities().find((entry) => entry.name === rule.name)?.custom ? s.setUtility(rule.name, classes) : s.removeUtility(rule.name)))}
      />
    )
  }

  const row = (key: string, label: string, node: SampleNode, menu: MenuItemDef[], tall = false) => (
    <OpenRow
      key={key}
      onOpen={() => show(key)}
      sample={<Specimen sheet={sheet} node={node} page={page} mode={edit.mode} className={tall ? 'h-14 min-w-0 flex-1 rounded-sm' : 'h-11 min-w-0 flex-1 rounded-sm'} />}
      label={<span className="sr-only">{label}</span>}
      menu={menu.length ? <Menu trigger={<IconButton icon="more" label={t('Style Actions')} size="xs" className={rowAction} />} items={menu} /> : undefined}
    />
  )
  const add = (kind: 'text' | 'button' | 'box') => (edit.readOnly ? undefined : () => void create(kind))
  return (
    <>
      <Group title={t('Page')}>
        {PAGE().map((entry) => row(`element:${entry.selector}`, entry.label, sampleOf(entry), resetMenu(entry.selector)))}
      </Group>
      <Group title={t('Text')} onAdd={add('text')} addLabel={t('New Text Style')}>
        {TEXT().map((entry) => row(`element:${entry.selector}`, entry.label, entry.node, resetMenu(entry.selector), entry.selector.startsWith('h')))}
        {text.map((entry) => row(entry.name, styleLabel(entry.name), styleSample(entry.name), styleMenu(entry.name), true))}
      </Group>
      <Group title={t('Buttons')} onAdd={add('button')} addLabel={t('New Button')}>
        {buttons.map((entry) => row(entry.name, styleLabel(entry.name), styleSample(entry.name), styleMenu(entry.name), true))}
      </Group>
      <Group title={t('Forms')}>
        {FORM().map((part) => row(part.key, part.label, part.sample, resetProperties(edit, part), true))}
      </Group>
      <Group title={t('Articles')}>
        <OpenRow onOpen={() => show('article:spacing')} label={t('Spacing')} summary="" menu={resetProperties(edit, SPACING()).length ? <Menu trigger={<IconButton icon="more" label={t('Style Actions')} size="xs" className={rowAction} />} items={resetProperties(edit, SPACING())} /> : undefined} />
        {ARTICLES().map((entry) => row(`article:${entry.key}`, entry.label, entry.node, resetMenu(entry.selector, 'components'), ['h2', 'h3', 'blockquote'].includes(entry.key)))}
      </Group>
      <Group title={t('Boxes')} onAdd={add('box')} addLabel={t('New Style')}>
        {boxes.map((entry) => row(entry.name, styleLabel(entry.name), { ...styleSample(entry.name), className: `${entry.name} inline-block` }, styleMenu(entry.name), true))}
      </Group>
    </>
  )
}
