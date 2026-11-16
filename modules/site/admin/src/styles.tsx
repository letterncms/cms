import { navigate, t, type FieldDef } from '@letterncms/sdk'
import { Button, IconButton, Menu, Tooltip, copyText, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { ARTICLE, FIELDS, InspectorSection, PanelFields, Specimen, StyleBar, StylePanels, Stylesheet, parseClass, screenFor, styleApi, styleLabel, styleSample, useSpecimenSheet, useStyling, withVariants, type Device, type Engine, type SampleNode, type StyleLayer as Layer } from '@letterncms/blocks'
import { useEffect, useMemo, useState } from 'react'
import { Group, OpenRow, rowMenu, type Editing } from './parts'

/* The site's styles, in groups, each a place of its own: the elements the site styles (its page, headings, text,
   divider, selection and focus), its buttons, its form fields and its long-form text, which it was given, then the
   groups it makes for the looks it names (a lede, a card), and those in none. What an element looks like by default
   and a look with a name are the same thing to change: classes behind an @apply, edited with the controls of a
   block's Design tab beside a sample drawn by the site's own CSS. Form fields and the spacing of long-form text are
   the kernel's: their look is properties (--field-*, --prose-*) the site sets. A style's group is written in the
   stylesheet, beside it, so it goes along with undo, versions and a site made from this one. */

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

/** An element the site styles by default, in the words people use for it, and its place in the address. */
interface Element {
  id: string
  selector: string
  label: string
  node: SampleNode
  /** What it is styled with: text is type, colour and the space around it, a line is its border. */
  groups?: readonly string[]
}

const TEXT_GROUPS = ['typography', 'spacing', 'fill', 'border', 'effects', 'transition'] as const

/** Every element the site styles, the page first, then its text, then the details of a page. */
const ELEMENT_LIST = (): Element[] => [
  { id: 'body', selector: 'body', label: t('Page'), node: { tag: 'p', text: t('Page') }, groups: ['typography', 'fill'] },
  { id: 'h1', selector: 'h1', label: t('Heading 1'), node: { tag: 'h1', text: t('Heading 1') } },
  { id: 'h2', selector: 'h2', label: t('Heading 2'), node: { tag: 'h2', text: t('Heading 2') } },
  { id: 'h3', selector: 'h3', label: t('Heading 3'), node: { tag: 'h3', text: t('Heading 3') } },
  { id: 'h4', selector: 'h4', label: t('Heading 4'), node: { tag: 'h4', text: t('Heading 4') } },
  { id: 'h5', selector: 'h5', label: t('Heading 5'), node: { tag: 'h5', text: t('Heading 5') } },
  { id: 'h6', selector: 'h6', label: t('Heading 6'), node: { tag: 'h6', text: t('Heading 6') } },
  { id: 'p', selector: 'p', label: t('Paragraph'), node: { tag: 'p', text: t('Paragraph') } },
  { id: 'a', selector: 'a', label: t('Link'), node: { tag: 'a', text: t('Link'), attributes: { href: '#' } } },
  { id: 'strong', selector: 'strong', label: t('Bold'), node: { tag: 'strong', text: t('Bold') } },
  { id: 'small', selector: 'small', label: t('Small'), node: { tag: 'small', text: t('Small') } },
  { id: 'blockquote', selector: 'blockquote', label: t('Quote'), node: { tag: 'blockquote', text: t('Quote') } },
  { id: 'code', selector: 'code', label: t('Code'), node: { tag: 'code', text: t('Code') } },
  { id: 'figcaption', selector: 'figcaption', label: t('Caption'), node: { tag: 'figcaption', text: t('Caption') } },
  { id: 'hr', selector: 'hr', label: t('Divider'), node: { tag: 'hr', text: '', className: 'w-40' }, groups: ['border', 'spacing', 'size'] },
  { id: 'selection', selector: '::selection', label: t('Selection'), node: { tag: 'span', text: t('Selection') }, groups: ['typography', 'fill'] },
  { id: 'focus', selector: ':focus-visible', label: t('Focus Ring'), node: { tag: 'span', text: t('Focus Ring'), className: 'inline-block rounded-sm px-2' }, groups: ['border', 'effects'] },
]

/** Long-form text: an element drawn inside it. Alone, an element's margins are no part of its look. */
const prose = (markup: string): SampleNode => ({ tag: 'div', text: '', markup: `<div class="cms-prose">${markup}</div>` })

/** The elements of long-form text a site styles apart from the page's, keyed as `ARTICLE` names their rules. */
const ARTICLES = (): (Element & { key: keyof typeof ARTICLE })[] => [
  { id: 'h2', key: 'h2', selector: ARTICLE.h2, label: t('Heading 2'), node: prose(`<h2 style="margin:0">${t('Heading 2')}</h2>`) },
  { id: 'h3', key: 'h3', selector: ARTICLE.h3, label: t('Heading 3'), node: prose(`<h3 style="margin:0">${t('Heading 3')}</h3>`) },
  { id: 'p', key: 'p', selector: ARTICLE.p, label: t('Paragraph'), node: prose(`<p style="margin:0">${t('Paragraph')}</p>`) },
  { id: 'li', key: 'li', selector: ARTICLE.li, label: t('List Item'), node: prose(`<ul><li>${t('List Item')}</li></ul>`) },
  { id: 'blockquote', key: 'blockquote', selector: ARTICLE.blockquote, label: t('Quote'), node: prose(`<blockquote style="margin:0">${t('Quote')}</blockquote>`) },
  { id: 'figure', key: 'figure', selector: ARTICLE.figure, label: t('Figure'), node: prose(`<figure style="margin:0">${t('Figure')}</figure>`), groups: ['spacing', 'border', 'effects'] },
  { id: 'a', key: 'a', selector: ARTICLE.a, label: t('Link'), node: prose(`<p><a href="#">${t('Link')}</a></p>`) },
]

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

/**
 * A name for a style, asked for: a class's name from the words typed, under `prefix` (btn-), not one the stylesheet
 * or Tailwind has. With `groups` (the site's, as suggestions) it also asks which group the style goes in.
 */
async function askName(engine: Engine | null, taken: string[], title: string, confirmLabel: string, prefix = '', current = '', groups?: string[]): Promise<{ name: string; group: string | null } | null> {
  const asked = await prompt({
    title,
    fields: [
      { handle: 'name', type: 'text', label: t('Name'), placeholder: prefix ? 'outline' : 'lead', required: true, autofocus: true },
      ...(groups ? [{ handle: 'group', type: 'text', label: t('Group'), placeholder: t('Cards'), suggestions: groups }] : []),
    ],
    values: { name: current ? styleLabel(current) : '' },
    confirm: confirmLabel,
  })
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
  const group = String(asked?.group ?? '').trim()
  if (group && reserved(group)) return null
  return { name, group: group || null }
}

/**
 * One style, edited as a block is: the same bar on top (its classes and the state being styled), a large sample,
 * and a control for everything a class can set (for the screen the preview shows). The bar at the top of the
 * page names it, with the way back to its group.
 */
function StyleEditor({ edit, samples, name, selector, node, classes, groups, write, menu }: { edit: Editing; samples: Samples; name?: string; selector?: string; node: SampleNode; classes: string[]; groups?: readonly string[]; write: (classes: string[]) => void; menu?: MenuItemDef[] }) {
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
      <div className="sticky top-0 z-raised bg-bg">
        <StyleBar s={s} site={styling.classes} source={styling.source} disabled={edit.readOnly} state={{ classes, engine: styling.engine, state, onState: setState }} lead={<Lead name={name} selector={selector} />} actions={<Actions menu={menu} />} />
      </div>
      <div className="border-b border-border p-4">
        <Specimen sheet={sheet} node={node} page={page} mode={edit.mode} align="center" className="h-28 rounded-md border border-border" />
      </div>
      {/* Read only, the controls show what is set and take no input. */}
      <div inert={edit.readOnly}>
        <StylePanels s={s} groups={groups} />
      </div>
    </div>
  )
}

/** What an editor edits, at the start of its bar: a class's name to copy, or the element it styles. */
function Lead({ name, selector }: { name?: string; selector?: string }) {
  return (
    <div className="flex min-h-8 min-w-0 flex-1 items-center">
      {name ? (
        <Tooltip content={t('Copy Name')}>
          <Button variant="ghost" size="xs" onClick={() => void copyText(name, { copied: t('Copied {reference}', { reference: name }) })} className="min-w-0 shrink !px-1.5 font-mono !font-normal !text-muted hover:!text-ink">
            <span className="truncate">.{name}</span>
          </Button>
        </Tooltip>
      ) : selector && <span className="min-w-0 truncate px-1.5 font-mono text-xs text-muted">{selector}</span>}
    </div>
  )
}

/** What is done to it, at the end of its bar. */
const Actions = ({ menu }: { menu?: MenuItemDef[] }) => (menu && menu.length > 0 ? <Menu align="end" trigger={<IconButton icon="more" label={t('Style Actions')} size="sm" />} items={menu} /> : null)

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

/** What each part of a form is made of: the look of its fields, its labels and help, and its choices. Each draws what it styles. */
const FORM = (): Properties[] => [
  {
    key: 'fields',
    label: t('Fields'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: FIELDS_SAMPLE() },
    sections: [
      { title: t('Field'), values: [color('--field-background', t('Fill')), color('--field-color', t('Text')), color('--field-placeholder', t('Placeholder')), length('--field-border-width', t('Border')), color('--field-border-color', t('Border Color')), length('--field-radius', t('Radius'), 'rem', ['rem', 'px']), { property: '--field-shadow', label: t('Shadow'), field: { component: 'site-shadow' } }] },
      { title: t('Pointed At'), values: [color('--field-hover-background', t('Fill')), color('--field-hover-border-color', t('Border Color'))] },
      { title: t('Focus'), values: [color('--field-focus-background', t('Fill')), color('--field-focus-border-color', t('Border Color')), color('--field-focus-ring-color', t('Ring')), length('--field-focus-ring-width', t('Ring Width'))] },
      { title: t('Error'), values: [color('--field-invalid-color', t('Color'))] },
    ],
  },
  {
    key: 'labels',
    label: t('Labels'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: LABELS_SAMPLE() },
    sections: [
      { title: t('Label'), values: [{ property: '--field-label-font-size', label: t('Size'), field: { component: 'site-size' } }, { property: '--field-label-font-weight', label: t('Weight'), field: { type: 'select', options: WEIGHTS() } }, color('--field-label-color', t('Color'))] },
      { title: t('Help'), values: [{ property: '--field-help-font-size', label: t('Size'), field: { component: 'site-size' } }, color('--field-help-color', t('Color'))] },
      { title: t('Spacing'), values: [length('--field-spacing-fields', t('Between Fields'), 'rem', ['rem', 'px']), length('--field-spacing-label', t('Under Label'), 'rem', ['rem', 'px'])] },
    ],
  },
  {
    key: 'choices',
    label: t('Choices'),
    selector: FIELDS,
    layer: 'base',
    sample: { tag: 'div', text: '', markup: CHOICES_SAMPLE() },
    sections: [
      { title: t('Checkbox'), values: [length('--field-checkbox-size', t('Size'), 'rem', ['rem', 'px']), length('--field-checkbox-radius', t('Radius')), color('--field-checkbox-checked', t('Checked')), color('--field-checkbox-mark-color', t('Mark'))] },
      { title: t('Radio Button'), values: [color('--field-radio-checked', t('Checked'))] },
      { title: t('Switch'), values: [color('--field-switch-off', t('Off')), color('--field-switch-on', t('On'))] },
    ],
  },
]

/** Words a sample shows, made safe to stand in markup. */
const text = (words: string) => words.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Every kind of field, at rest and in each state the Fields style sets: pointed at, focused, wrong. Markup of our own. */
const FIELDS_SAMPLE = () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;width:min(22rem,100%);white-space:normal">
<input class="cms-input" placeholder="${text(t('Text Field'))}" tabindex="-1">
<input class="cms-input" data-cms-state="hover" placeholder="${text(t('Pointed At'))}" tabindex="-1">
<input class="cms-input" data-cms-state="focus" placeholder="${text(t('Focused'))}" tabindex="-1">
<input class="cms-input" aria-invalid="true" value="${text(t('Invalid'))}" tabindex="-1">
<textarea class="cms-input" rows="2" placeholder="${text(t('Text Area'))}" tabindex="-1" style="grid-column:1/-1"></textarea>
<select class="cms-input" tabindex="-1" style="grid-column:1/-1"><option>${text(t('Dropdown'))}</option></select>
</div>`

/** Two fields as a form lays them out: each with its label over it and its help under it. */
const LABELS_SAMPLE = () => `<div class="cms-form" style="width:min(18rem,100%);white-space:normal">
<div class="cms-field"><label class="cms-label">${text(t('Name'))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${text(t('As it appears on your order.'))}</p></div>
<div class="cms-field"><label class="cms-label">${text(t('Email'))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${text(t('We never share it.'))}</p></div>
</div>`

/** Each kind of choice, on and off. */
const CHOICES_SAMPLE = () => `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:.75rem 1.5rem;white-space:nowrap">
<label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${text(t('Checked'))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${text(t('Chosen'))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${text(t('On'))}</label>
<label class="cms-choice"><input type="checkbox" class="cms-check" tabindex="-1"> ${text(t('Unchecked'))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" tabindex="-1"> ${text(t('Not Chosen'))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" tabindex="-1"> ${text(t('Off'))}</label>
</div>`

/** The space in long-form text: between its blocks, around its headings and between the items of a list. */
const SPACING = (): Properties => ({
  key: 'spacing',
  label: t('Spacing'),
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
function PropertiesEditor({ edit, samples, part }: { edit: Editing; samples: Samples; part: Properties }) {
  const { source } = useStyling()
  const kernel = useMemo(() => new Stylesheet(source?.files.cms ?? ''), [source?.files.cms])
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, words(page))
  const own = (property: string) => edit.sheet.property(part.selector, property, part.layer)
  return (
    <div className="-mx-4 -mt-2">
      {/* Its bar where a style's is, with what is done to it at the end. */}
      <div className="sticky top-0 z-raised flex h-11 items-center justify-end border-b border-border bg-bg px-3">
        <Actions menu={revertProperties(edit, part)} />
      </div>
      <div className="border-b border-border p-4">
        <Specimen sheet={sheet} node={part.sample} page={page} mode={edit.mode} align="center" className="h-72 rounded-md border border-border" />
      </div>
      <div inert={edit.readOnly}>
        {part.sections.map((section) => {
          const fields = (
            <PanelFields
              fields={section.values.map((value) => ({ handle: value.property, type: 'text', size: 'sm', label: value.label, placeholder: t('Default'), ...value.field, status: propertyChanged(edit, part, value.property) ? 'own' : undefined, reset: () => edit.change((s) => s.setProperty(part.selector, value.property, edit.saved.property(part.selector, value.property, part.layer) ?? null, part.layer)) }) as FieldDef)}
              values={Object.fromEntries(section.values.map((value) => [value.property, own(value.property) ?? plain(kernel.property(part.selector, value.property, part.layer))]))}
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

/**
 * What the kernel sets, as a field shows it: one value (a colour or size of the theme, a length, a word). One made of
 * other properties (`var(--field-background)`, a `color-mix()`) is no value to read: the field says Default.
 */
const plain = (value: string | undefined) => (value && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(value.trim()) ? value : null)

/** Whether a property of a look is otherwise in the draft than the site has it. */
const propertyChanged = (edit: Editing, part: Properties, property: string) => (edit.sheet.property(part.selector, property, part.layer) ?? null) !== (edit.saved.property(part.selector, property, part.layer) ?? null)

/** A look made of properties, changed and not yet saved. */
const propertiesChanged = (edit: Editing, part: Properties) => part.sections.some((section) => section.values.some((value) => propertyChanged(edit, part, value.property)))

/** A look made of properties: every property back as the site has it, while one is changed. */
function revertProperties(edit: Editing, part: Properties): MenuItemDef[] {
  const values = part.sections.flatMap((section) => section.values)
  return rowMenu(edit, { revert: propertiesChanged(edit, part) ? () => edit.change((s) => values.reduce((next, value) => next.setProperty(part.selector, value.property, edit.saved.property(part.selector, value.property, part.layer) ?? null, part.layer), s)) : null })
}

/** An element's classes, or a style's, as a stylesheet has them. */
const elementIn = (sheet: Stylesheet, selector: string, layer: Layer) => sheet.elements(layer).find((rule) => rule.name === selector)?.classes ?? []
const utilityIn = (sheet: Stylesheet, name: string) => sheet.utilities().find((rule) => rule.name === name)?.classes
const elementChanged = (edit: Editing, selector: string, layer: Layer = 'base') => elementIn(edit.sheet, selector, layer).join(' ') !== elementIn(edit.saved, selector, layer).join(' ')
const utilityChanged = (edit: Editing, name: string) => utilityIn(edit.sheet, name)?.join(' ') !== utilityIn(edit.saved, name)?.join(' ')

/** The groups the site was given, by their place in the address; the site's own come after them. */
const BUILT_IN = ['elements', 'buttons', 'forms', 'articles'] as const
/** The place of the styles in no group of the site's. */
const UNGROUPED = 'ungrouped'
const RESERVED: string[] = [...BUILT_IN, UNGROUPED]
const builtInLabel = (id: string) => ({ elements: t('Elements'), buttons: t('Buttons'), forms: t('Forms'), articles: t('Articles') })[id as (typeof BUILT_IN)[number]]

/** The site's own styles: every class of its stylesheet but its buttons and its colour schemes. */
const ownStyles = (sheet: Stylesheet) => sheet.utilities().filter((rule) => /^[a-z][\w-]*$/.test(rule.name) && !rule.name.startsWith('scheme-'))
const isButton = (name: string) => name.startsWith('btn-')

/** The site's groups, in the order its stylesheet first names them, each with its place in the address (never one the site was given). */
function siteGroups(sheet: Stylesheet): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = []
  for (const rule of ownStyles(sheet)) {
    if (!rule.group || isButton(rule.name) || out.some((group) => group.name === rule.group)) continue
    const base = className(rule.group) || 'group'
    let id = base
    for (let n = 2; RESERVED.includes(id) || out.some((group) => group.id === id); n++) id = `${base}-${n}`
    out.push({ id, name: rule.group })
  }
  return out
}

/** Where a style of the site's is: its buttons, a group of its own, or none. */
function groupOf(sheet: Stylesheet, name: string): string {
  if (isButton(name)) return 'buttons'
  const group = ownStyles(sheet).find((rule) => rule.name === name)?.group
  return siteGroups(sheet).find((each) => each.name === group)?.id ?? UNGROUPED
}

/** The address of a group of styles, or of a style in it. */
export const stylePath = (group?: string, key?: string) => ['/design/styles', group, key].filter(Boolean).map((part, i) => (i === 0 ? part : encodeURIComponent(part!))).join('/')

/** What a group is called. */
function groupLabel(sheet: Stylesheet, id: string): string | null {
  if (id === UNGROUPED) return t('Ungrouped')
  return builtInLabel(id) ?? siteGroups(sheet).find((group) => group.id === id)?.name ?? null
}

/** What a style is called, in its group. */
function itemLabel(sheet: Stylesheet, group: string, key: string): string | null {
  if (group === 'elements') return ELEMENT_LIST().find((element) => element.id === key)?.label ?? null
  if (group === 'forms') return FORM().find((part) => part.key === key)?.label ?? null
  if (group === 'articles') return key === 'spacing' ? SPACING().label : ARTICLES().find((element) => element.id === key)?.label ?? null
  return ownStyles(sheet).some((rule) => rule.name === key) ? styleLabel(key) : null
}

/**
 * Where the styles are, for the bar at the top of the page: a group says its name with the way back to every group,
 * a style its own with the way back to its group. Null on the list of groups, or for a place there is no longer.
 */
export function stylesPlace(sheet: Stylesheet, [group, key]: string[]): { title: string; back: { to: string; label: string } } | null {
  if (!group) return null
  const label = groupLabel(sheet, group)
  if (!label) return null
  if (!key) return { title: label, back: { to: stylePath(), label: t('Styles') } }
  const title = itemLabel(sheet, group, key)
  return title ? { title, back: { to: stylePath(group), label } } : null
}

/** A name for a group: any words, but none the site was given. */
async function askGroup(sheet: Stylesheet, title: string, confirmLabel: string, current = ''): Promise<string | null | undefined> {
  const asked = await prompt({ title, fields: [{ handle: 'group', type: 'text', label: t('Group'), placeholder: t('Cards'), autofocus: true, suggestions: siteGroups(sheet).map((group) => group.name) }], values: { group: current }, confirm: confirmLabel })
  if (!asked) return undefined
  const name = String(asked.group ?? '').trim()
  return name && reserved(name) ? undefined : name || null
}

/** A group's name the site was given (Buttons, Ungrouped): said so, and not taken. */
function reserved(name: string): boolean {
  const taken = RESERVED.includes(className(name)) || RESERVED.some((id) => (id === UNGROUPED ? t('Ungrouped') : builtInLabel(id))?.toLowerCase() === name.toLowerCase())
  if (taken) toast.error(t('“{name}” is a group the site already has.', { name }))
  return taken
}

/**
 * The site's styles at `path` (after /design/styles): its groups, a group's styles, or one style's editor. Each style
 * is drawn as the site draws it and opens on its editor in place of the list, so a block's Edit Style leads
 * straight to it.
 */
export function Styles({ edit, samples, path }: { edit: Editing; samples: Samples; path: string[] }) {
  const { engine } = useStyling()
  const [group, key] = path
  const elements = [...edit.sheet.elements(), ...edit.sheet.elements('components')]
  const classesOf = (selector: string) => elements.find((rule) => rule.name === selector)?.classes ?? []
  const own = ownStyles(edit.sheet)
  const groups = siteGroups(edit.sheet)
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, [...words(page), ...classesOf('::selection'), ...classesOf(':focus-visible'), ...ELEMENT_LIST().flatMap((entry) => words(entry.node.className ?? '')), ...own.map((rule) => rule.name)])
  const taken = edit.sheet.utilities().map((rule) => rule.name)
  const open = (to: string) => navigate(to)
  // A style reached by another group's address (a block's Edit Style knows the name, not the group): the address its group gives it.
  const misplaced = !!group && !!key && !['elements', 'forms', 'articles'].includes(group) && own.some((rule) => rule.name === key) && groupOf(edit.sheet, key) !== group
  useEffect(() => {
    if (misplaced) navigate(stylePath(groupOf(edit.sheet, key), key), { replace: true })
  }, [misplaced, edit.sheet, key])

  // The sample of an element: the selection and the focus ring can't be shown by selecting or focusing, so they wear their classes.
  const sampleOf = (element: Element): SampleNode => (['::selection', ':focus-visible'].includes(element.selector) ? { ...element.node, className: [element.node.className, ...classesOf(element.selector)].filter(Boolean).join(' ') } : element.node)

  /** A new button, or a new style in a group (null: in none; `choose`: the one asked for): it opens at once, on its first look. */
  const create = async (into: string | null, choose = false) => {
    const button = into === 'buttons'
    const asked = await askName(engine, taken, button ? t('New Button') : t('New Style'), button ? t('Create Button') : t('Create Style'), button ? 'btn-' : '', '', choose ? groups.map((each) => each.name) : undefined)
    if (!asked) return
    const { name } = asked
    const group = choose ? asked.group : groups.find((each) => each.id === into)?.name ?? null
    // A new button starts as a copy of the first one; a style as text of the page's size, which Tailwind can build.
    const first = own.find((rule) => isButton(rule.name))
    edit.change((s) => (button && first ? s.duplicateUtility(first.name, name).setUtilityGroup(name, null) : s.setUtility(name, ['text-base']).setUtilityGroup(name, group)))
    // Its group's address follows once the draft has it: the screen corrects a group it can't know yet.
    open(stylePath(button ? 'buttons' : UNGROUPED, name))
  }
  const rename = async (from: string) => {
    const name = (await askName(engine, taken, t('Rename “{name}”', { name: styleLabel(from) }), t('Rename'), isButton(from) ? 'btn-' : '', from))?.name
    if (!name) return
    edit.change((s) => renameStyle(s, from, name))
    if (key === from) navigate(stylePath(group, name), { replace: true })
  }
  const duplicate = async (from: string) => {
    const name = (await askName(engine, taken, t('Duplicate “{name}”', { name: styleLabel(from) }), isButton(from) ? t('Duplicate Button') : t('Duplicate Style'), isButton(from) ? 'btn-' : ''))?.name
    if (name) edit.change((s) => s.duplicateUtility(from, name))
  }
  const move = async (name: string) => {
    const current = own.find((rule) => rule.name === name)?.group ?? ''
    const next = await askGroup(edit.sheet, t('Move “{name}” to a Group', { name: styleLabel(name) }), t('Move Style'), current)
    if (next === undefined || (next ?? '') === current) return
    edit.change((s) => s.setUtilityGroup(name, next))
  }
  const remove = (name: string) => {
    edit.change((s) => s.removeUtility(name))
    if (key === name) navigate(stylePath(group))
  }
  const styleMenu = (name: string): MenuItemDef[] => rowMenu(edit, {
    copy: name,
    revert: utilityChanged(edit, name) && utilityIn(edit.saved, name) ? () => edit.change((s) => s.setUtility(name, utilityIn(edit.saved, name)!)) : null,
    own: [
      { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(name) },
      { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(name) },
      ...(isButton(name) ? [] : [{ label: t('Move to Group…'), icon: 'folder', onSelect: () => void move(name) }]),
      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => remove(name) },
    ],
  })
  // An element changed and not yet saved goes back to what the site has, or to nothing of its own when it had none.
  const elementMenu = (selector: string, layer: Layer = 'base'): MenuItemDef[] => rowMenu(edit, {
    revert: elementChanged(edit, selector, layer) ? () => {
      const saved = elementIn(edit.saved, selector, layer)
      edit.change((s) => (saved.length > 0 ? s.setElement(selector, saved, layer) : s.removeElement(selector, layer)))
    } : null,
  })

  // One style open, in place of its group.
  if (group && key) {
    const element = group === 'elements' ? ELEMENT_LIST().find((entry) => entry.id === key) : undefined
    if (element) return <StyleEditor key={key} edit={edit} samples={samples} selector={element.selector} node={sampleOf(element)} classes={classesOf(element.selector)} groups={element.groups ?? TEXT_GROUPS} menu={elementMenu(element.selector)} write={(classes) => edit.change((s) => s.setElement(element.selector, classes))} />
    const article = group === 'articles' ? ARTICLES().find((entry) => entry.id === key) : undefined
    if (article) return <StyleEditor key={key} edit={edit} samples={samples} selector={article.selector} node={article.node} classes={classesOf(article.selector)} groups={article.groups ?? TEXT_GROUPS} menu={elementMenu(article.selector, 'components')} write={(classes) => edit.change((s) => s.setElement(article.selector, classes, 'components'))} />
    const properties = group === 'forms' ? FORM().find((part) => part.key === key) : group === 'articles' && key === 'spacing' ? SPACING() : undefined
    if (properties) return <PropertiesEditor key={key} edit={edit} samples={samples} part={properties} />
    const rule = own.find((entry) => entry.name === key)
    if (rule) {
      return (
        <StyleEditor
          key={key}
          edit={edit}
          samples={samples}
          name={rule.name}
          node={styleSample(rule.name)}
          classes={rule.classes}
          menu={styleMenu(rule.name)}
          // With nothing left to apply the style goes, unless it holds CSS of its own.
          write={(classes) => edit.change((s) => (classes.length > 0 || s.utilities().find((entry) => entry.name === rule.name)?.custom ? s.setUtility(rule.name, classes) : s.removeUtility(rule.name)))}
        />
      )
    }
    return null
  }

  // Every row of a group the same: its name, then a sample of one height, scaled down to it when the look is larger.
  const row = (to: string, label: string, node: SampleNode, menu: MenuItemDef[], unsaved: boolean) => (
    <OpenRow key={to} onOpen={() => open(to)} label={label} changed={unsaved} menu={menu} sample={<Specimen sheet={sheet} node={node} page={page} mode={edit.mode} className="h-12 min-w-0 flex-1 rounded-sm shadow-edge" />} />
  )
  const styleRows = (rules: typeof own, at: string) => rules.map((rule) => row(stylePath(at, rule.name), styleLabel(rule.name), isButton(rule.name) ? styleSample(rule.name) : { ...styleSample(rule.name), className: `${rule.name} inline-block` }, styleMenu(rule.name), utilityChanged(edit, rule.name)))
  const add = (into: string | null, choose = false) => (edit.readOnly ? undefined : () => void create(into, choose))

  if (group === 'elements') return <Group>{ELEMENT_LIST().map((entry) => row(stylePath('elements', entry.id), entry.label, sampleOf(entry), elementMenu(entry.selector), elementChanged(edit, entry.selector)))}</Group>
  if (group === 'buttons') return <Group onAdd={add('buttons')} addLabel={t('New Button')}>{styleRows(own.filter((rule) => isButton(rule.name)), 'buttons')}</Group>
  if (group === 'forms') return <Group>{FORM().map((part) => row(stylePath('forms', part.key), part.label, part.sample, revertProperties(edit, part), propertiesChanged(edit, part)))}</Group>
  if (group === 'articles') {
    return (
      <Group>
        {row(stylePath('articles', 'spacing'), SPACING().label, SPACING().sample, revertProperties(edit, SPACING()), propertiesChanged(edit, SPACING()))}
        {ARTICLES().map((entry) => row(stylePath('articles', entry.id), entry.label, entry.node, elementMenu(entry.selector, 'components'), elementChanged(edit, entry.selector, 'components')))}
      </Group>
    )
  }
  const mine = groups.find((each) => each.id === group)
  if (mine || group === UNGROUPED) {
    const rules = own.filter((rule) => !isButton(rule.name) && groupOf(edit.sheet, rule.name) === group)
    return <Group onAdd={add(mine ? mine.id : null)} addLabel={t('New Style')}>{styleRows(rules, group)}</Group>
  }

  // Every group: those the site was given, its own, then the styles in none.
  const ungrouped = own.filter((rule) => !isButton(rule.name) && groupOf(edit.sheet, rule.name) === UNGROUPED)
  const changedIn = (rules: typeof own) => rules.some((rule) => utilityChanged(edit, rule.name))
  const groupMenu = (name: string): MenuItemDef[] => rowMenu(edit, {
    own: [
      {
        label: t('Rename…'), icon: 'edit', onSelect: async () => {
          const next = await askGroup(edit.sheet, t('Rename Group'), t('Rename'), name)
          if (next) edit.change((s) => s.renameGroup(name, next))
        },
      },
      // Its styles stay, in no group.
      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => edit.change((s) => s.renameGroup(name, null)) },
    ],
  })
  return (
    <Group onAdd={add(null, true)} addLabel={t('New Style')}>
      <OpenRow onOpen={() => open(stylePath('elements'))} label={t('Elements')} locked detail={ELEMENT_LIST().length} changed={ELEMENT_LIST().some((entry) => elementChanged(edit, entry.selector))} />
      <OpenRow onOpen={() => open(stylePath('buttons'))} label={t('Buttons')} locked detail={own.filter((rule) => isButton(rule.name)).length} changed={changedIn(own.filter((rule) => isButton(rule.name)))} />
      <OpenRow onOpen={() => open(stylePath('forms'))} label={t('Forms')} locked detail={FORM().length} changed={FORM().some((part) => propertiesChanged(edit, part))} />
      <OpenRow onOpen={() => open(stylePath('articles'))} label={t('Articles')} locked detail={ARTICLES().length + 1} changed={propertiesChanged(edit, SPACING()) || ARTICLES().some((entry) => elementChanged(edit, entry.selector, 'components'))} />
      {groups.map((each) => {
        const rules = own.filter((rule) => rule.group === each.name && !isButton(rule.name))
        return <OpenRow key={each.id} onOpen={() => open(stylePath(each.id))} label={each.name} detail={rules.length} changed={changedIn(rules)} menu={groupMenu(each.name)} />
      })}
      {ungrouped.length > 0 && <OpenRow onOpen={() => open(stylePath(UNGROUPED))} label={t('Ungrouped')} detail={ungrouped.length} changed={changedIn(ungrouped)} />}
    </Group>
  )
}
