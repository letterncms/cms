import { navigate, t, type FieldDef } from '@letterncms/sdk'
import { Button, EmptyState, Fields, NoMatches, SettingsPanel, SortableTree, prompt, toast, type MenuItemDef, type TreeItem } from '@letterncms/ui'
import { ARTICLE, ELEMENTS, FORM, InspectorSection, MORE_ARTICLE, MORE_ELEMENTS, PanelFields, STYLE_GROUPS, Specimen, StyleBar, StylePanels, Stylesheet, parseClass, screenFor, shownInState, styleApi, styleSample, useSpecimenSheet, useStyling, withVariants, type Device, type Engine, type SampleNode, type StyleLayer as Layer } from '@letterncms/blocks'
import { useEffect, useMemo, useState } from 'react'
import { Group, TreeRow, rowMenu, type Arrangement, type Editing, type Entry } from './parts'

/* The site's styles, in groups, each a place of its own: the elements the site styles (its page, headings, text,
   divider, selection and focus, and any it adds), its buttons, the parts of its forms and of its long-form text,
   which it was given, then the groups it makes for the looks it names (a lede, a card), and those in none. Every
   one is edited the same way: classes behind an @apply, with the controls of a block's Design tab, beside a sample
   drawn by the site's own CSS, in the state being styled. What a part draws that no class reaches (a dropdown's
   arrow, a checkbox's mark, where a label stands) is a section of its own below the sample. Any group holds the
   site's own classes too; a class's group is written in the stylesheet, beside it, so it goes along with undo,
   versions and a site made from this one. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')
const words = (text: string) => text.split(/\s+/).filter(Boolean)
const join = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ')

/** What a sample of the site is drawn with: the draft's compiler, and the screen the page is seen at. */
export interface Samples {
  compiler: { build: (candidates: string[]) => string } | null
  device: Device
}

/** The classes of the page's text, for a sample's frame: what `body` applies does not reach into a shadow root by itself. */
const pageClasses = (sheet: Stylesheet) => sheet.elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? ''

/** What a sample is drawn in: the state being styled, the classes that draw it so (hover:x worn as x!), and the classes being edited. */
interface Look {
  state: string[]
  shown: string[]
  classes: string[]
}

/** One value of a style that no class sets: a property of its rule (or of another's, `selector`), or a value read and written its own way. */
interface PartValue {
  handle: string
  label: string
  field: Partial<FieldDef>
  /** A property, `--field-select-arrow-color`, of the style's rule or of `selector`'s. */
  property?: string
  selector?: string
  /** A value of its own (where a label stands): read from the draft, and written into it. */
  read?: (sheet: Stylesheet) => unknown
  write?: (sheet: Stylesheet, value: unknown) => Stylesheet
}

/** A section of such values under its title (Arrow, Check Mark, Layout). */
interface Part {
  title: string
  values: PartValue[]
}

/** A style the site was given, an element, a part of long-form text or of a form, edited as a class is. */
interface Element {
  id: string
  selector: string
  layer: Layer
  label: string
  /** Its sample, in the state being styled. */
  sample: (look: Look) => SampleNode
  /** The control groups it is styled with; text's when left out. */
  groups?: readonly string[]
  /** States offered beside Hover, Pressed and Focus: a field's Invalid, a checkbox's Checked. */
  states?: string[]
  /** What it draws that no class reaches, section by section. */
  parts?: Part[]
}

const TEXT_GROUPS = ['typography', 'spacing', 'fill', 'border', 'effects', 'transition'] as const
const FIELD_GROUPS = ['size', 'spacing', 'typography', 'fill', 'border', 'effects', 'transition'] as const
const BOX_GROUPS = ['fill', 'border', 'effects', 'transition'] as const

/** One element as its sample: the tag with its words, wearing what draws the state being styled. */
const plain = (node: SampleNode) => (look: Look): SampleNode => ({ ...node, className: join(node.className, ...look.shown) || undefined })

/** Words a sample shows, made safe to stand in markup. */
const text = (said: string) => said.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Markup of our own: what a sample holds that is more than one element. */
const markup = (html: string): SampleNode => ({ tag: 'div', text: '', markup: html })

/** Every element the site styles, the page first, then its text, then the details of a page. */
const ELEMENT_LIST = (): Element[] => {
  const element = (id: string, label: string, node: SampleNode, groups?: readonly string[]): Element => ({ id, selector: id, layer: 'base', label, sample: plain(node), groups })
  const tag = (id: string, label: string, groups?: readonly string[]) => element(id, label, { tag: id, text: label }, groups)
  return [
    element('body', t('Page'), { tag: 'p', text: t('Page') }, ['typography', 'fill']),
    tag('h1', t('Heading 1')),
    tag('h2', t('Heading 2')),
    tag('h3', t('Heading 3')),
    tag('h4', t('Heading 4')),
    tag('h5', t('Heading 5')),
    tag('h6', t('Heading 6')),
    tag('p', t('Paragraph')),
    element('a', t('Link'), { tag: 'a', text: t('Link'), attributes: { href: '#' } }),
    tag('strong', t('Bold')),
    tag('small', t('Small')),
    tag('blockquote', t('Quote')),
    tag('code', t('Code')),
    tag('figcaption', t('Caption')),
    element('hr', t('Divider'), { tag: 'hr', text: '', className: 'w-40' }, ['border', 'spacing', 'size']),
    // The selection and the focus ring can't be shown by selecting or focusing: their sample wears their classes.
    { id: 'selection', selector: '::selection', layer: 'base', label: t('Selection'), groups: ['typography', 'fill'], sample: (look) => ({ tag: 'span', text: t('Selection'), className: join(...look.classes, ...look.shown) }) },
    { id: 'focus', selector: ':focus-visible', layer: 'base', label: t('Focus Ring'), groups: ['border', 'effects'], sample: (look) => ({ tag: 'span', text: t('Focus Ring'), className: join('inline-block rounded-sm px-2', ...look.classes, ...look.shown) }) },
  ]
}

/** A picture's stand-in, the same in every sample. */
const PICTURE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 100%22%3E%3Crect width=%22160%22 height=%22100%22 fill=%22%23a3a3a3%22/%3E%3Cpath d=%22M0 100 55 45l35 35 22-22 48 42z%22 fill=%22%23737373%22/%3E%3C/svg%3E'

/** The elements a site may add to those it styles, by their tag. */
const MORE_ELEMENT_LIST = (): Element[] => {
  const node = (id: (typeof MORE_ELEMENTS)[number]): { label: string; node: SampleNode; groups?: readonly string[] } => {
    const words = (label: string, groups?: readonly string[]) => ({ label, node: { tag: id, text: label } as SampleNode, groups })
    switch (id) {
      case 'em': return words(t('Emphasis'))
      case 'mark': return words(t('Highlight'))
      case 'del': return words(t('Deleted Text'))
      case 'sup': return words(t('Superscript'))
      case 'sub': return words(t('Subscript'))
      case 'abbr': return words(t('Abbreviation'))
      case 'cite': return words(t('Citation'))
      case 'kbd': return words(t('Keyboard Key'))
      case 'pre': return words(t('Code Block'))
      case 'address': return words(t('Address'))
      case 'summary': return words(t('Summary'))
      case 'details': return { label: t('Details'), node: markup(`<details open><summary>${text(t('Summary'))}</summary>${text(t('Details'))}</details>`) }
      case 'ul': return { label: t('Bulleted List'), node: markup(`<ul><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ul>`) }
      case 'ol': return { label: t('Numbered List'), node: markup(`<ol><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ol>`) }
      case 'li': return { label: t('List Item'), node: markup(`<ul><li>${text(t('List Item'))}</li></ul>`) }
      case 'dl': return { label: t('Description List'), node: markup(`<dl><dt>${text(t('Term'))}</dt><dd>${text(t('Description'))}</dd></dl>`) }
      case 'dt': return { label: t('Term'), node: markup(`<dl><dt>${text(t('Term'))}</dt></dl>`) }
      case 'dd': return { label: t('Description'), node: markup(`<dl><dd>${text(t('Description'))}</dd></dl>`) }
      case 'table': return { label: t('Table'), node: markup(TABLE()), groups: ['spacing', 'typography', 'fill', 'border', 'effects'] }
      case 'caption': return { label: t('Table Caption'), node: markup(TABLE()) }
      case 'th': return { label: t('Table Header'), node: markup(TABLE()) }
      case 'td': return { label: t('Table Cell'), node: markup(TABLE()) }
      case 'img': return { label: t('Image'), node: { tag: 'img', text: '', attributes: { src: PICTURE, alt: '', width: '160', height: '100' } }, groups: ['size', 'border', 'effects'] }
      case 'figure': return { label: t('Figure'), node: markup(`<figure><img src="${PICTURE}" alt="" width="160" height="100" style="display:block"><figcaption>${text(t('Caption'))}</figcaption></figure>`), groups: ['spacing', 'fill', 'border', 'effects'] }
    }
  }
  return MORE_ELEMENTS.map((id) => {
    const { label, node: sample, groups } = node(id)
    // Markup wears no state: what it shows is the element among others.
    return { id, selector: id, layer: 'base' as const, label, groups, sample: sample.markup ? () => sample : plain(sample) }
  })
}

/** A small table: its caption, a row of headers and one of cells. */
const TABLE = () => `<table><caption>${text(t('Table Caption'))}</caption><thead><tr><th>${text(t('Table Header'))}</th><th>${text(t('Table Header'))}</th></tr></thead><tbody><tr><td>${text(t('Table Cell'))}</td><td>${text(t('Table Cell'))}</td></tr></tbody></table>`

/** Long-form text: an element drawn inside it. Alone, an element's margins are no part of its look. */
const prose = (html: string) => () => markup(`<div class="cms-prose">${html}</div>`)

/** A length of long-form text, in em first: it grows with the text. */
const proseLength = (property: string, label: string): PartValue => ({ handle: property, property, label, field: { component: 'blocks-value', unit: 'em', units: ['em', 'rem', 'px'], min: 0, step: 0.125 } })

/** The parts of long-form text a site styles apart from the page's: the text as a whole, then its elements. */
const ARTICLES = (): Element[] => [
  {
    id: 'article',
    selector: ARTICLE.spacing,
    layer: 'components',
    label: t('Article'),
    sample: prose(`<h2 style="margin:0">${text(t('Heading 2'))}</h2><p>${text(t('Paragraph'))}</p><ul><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ul>`),
   
    // The space in long-form text: between its blocks, around its headings and between the items of a list.
    parts: [{ title: t('Text Spacing'), values: [proseLength('--prose-blocks', t('Blocks')), proseLength('--prose-headings', t('Above Headings')), proseLength('--prose-after-headings', t('Below Headings')), proseLength('--prose-items', t('List Items'))] }],
  },
  { id: 'h2', selector: ARTICLE.h2, layer: 'components', label: t('Heading 2'), sample: prose(`<h2 style="margin:0">${text(t('Heading 2'))}</h2>`) },
  { id: 'h3', selector: ARTICLE.h3, layer: 'components', label: t('Heading 3'), sample: prose(`<h3 style="margin:0">${text(t('Heading 3'))}</h3>`) },
  { id: 'p', selector: ARTICLE.p, layer: 'components', label: t('Paragraph'), sample: prose(`<p style="margin:0">${text(t('Paragraph'))}</p>`) },
  { id: 'li', selector: ARTICLE.li, layer: 'components', label: t('List Item'), sample: prose(`<ul><li>${text(t('List Item'))}</li></ul>`) },
  { id: 'blockquote', selector: ARTICLE.blockquote, layer: 'components', label: t('Quote'), sample: prose(`<blockquote style="margin:0">${text(t('Quote'))}</blockquote>`) },
  { id: 'figure', selector: ARTICLE.figure, layer: 'components', label: t('Figure'), sample: prose(`<figure style="margin:0">${text(t('Figure'))}</figure>`), groups: ['spacing', 'border', 'effects'] },
  { id: 'a', selector: ARTICLE.a, layer: 'components', label: t('Link'), sample: prose(`<p><a href="#">${text(t('Link'))}</a></p>`) },
]

/** The elements of long-form text a site may add to those it styles. */
const MORE_ARTICLE_LIST = (): Element[] => {
  const entry = (id: keyof typeof MORE_ARTICLE, label: string, html: string, groups?: readonly string[]): Element => ({ id, selector: MORE_ARTICLE[id], layer: 'components', label, sample: prose(html), groups })
  return [
    entry('h4', t('Heading 4'), `<h4 style="margin:0">${text(t('Heading 4'))}</h4>`),
    entry('h5', t('Heading 5'), `<h5 style="margin:0">${text(t('Heading 5'))}</h5>`),
    entry('h6', t('Heading 6'), `<h6 style="margin:0">${text(t('Heading 6'))}</h6>`),
    entry('ul', t('Bulleted List'), `<ul><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ul>`),
    entry('ol', t('Numbered List'), `<ol><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ol>`),
    entry('strong', t('Bold'), `<p><strong>${text(t('Bold'))}</strong></p>`),
    entry('em', t('Emphasis'), `<p><em>${text(t('Emphasis'))}</em></p>`),
    entry('code', t('Code'), `<p><code>${text(t('Code'))}</code></p>`),
    entry('pre', t('Code Block'), `<pre>${text(t('Code Block'))}</pre>`),
    entry('img', t('Image'), `<img src="${PICTURE}" alt="" width="160" height="100">`, ['size', 'spacing', 'border', 'effects']),
    entry('figcaption', t('Caption'), `<figure style="margin:0"><figcaption>${text(t('Caption'))}</figcaption></figure>`),
    entry('hr', t('Divider'), '<hr style="width:10rem">', ['border', 'spacing', 'size']),
    entry('table', t('Table'), TABLE(), ['spacing', 'typography', 'fill', 'border', 'effects']),
    entry('th', t('Table Header'), TABLE()),
    entry('td', t('Table Cell'), TABLE()),
  ].map((element) => ({ ...element }))
}

/* Forms. Each part is drawn as a form draws it, in the state being styled: an attribute where the browser knows the
   state (aria-invalid, disabled, checked) and the kernel's data-cms-state where it can't be made (hover, focus), the
   site's classes for that state worn by the part being edited. */

/** The attributes a control carries in the state being styled. */
function stateAttributes(state: string[], checked = false): string {
  const shown = state.flatMap((variant) => (variant === 'hover' ? ['hover'] : variant === 'focus-visible' || variant === 'focus' ? ['focus'] : variant === 'active' ? ['hover'] : []))
  return join(shown.length > 0 && `data-cms-state="${shown.join(' ')}"`, state.includes('aria-invalid') && 'aria-invalid="true"', state.includes('disabled') && 'disabled', (checked || state.includes('checked')) && 'checked', 'tabindex="-1"')
}

/** A form's sample: its markup in a form's grid, in the size of a sample's column. */
const form = (html: string) => markup(`<div class="cms-form" style="white-space:normal">${html}</div>`)

/** Controls one under the other, a sample's own distance apart: what a form spaces them by is the Label's to show. */
const stack = (html: string) => markup(`<div style="display:grid;gap:.75rem;white-space:normal">${html}</div>`)

/** What `edits` names wears the state's classes: the part being edited is the one that shows them. */
const wear = (look: Look, edits: boolean) => (edits ? look.shown.join(' ') : '')

/** A field with its label over it, as a form draws one: an empty one and one filled in. */
const labelled = (look: Look, part: 'label' | 'help' | 'error') => {
  const field = (label: string, value: string, placeholder: string, after: string, invalid = false) => {
    return `<div class="cms-field"><label class="cms-label ${part === 'label' ? wear(look, true) : ''}">${text(label)}</label><input class="cms-input" placeholder="${text(placeholder)}" value="${text(value)}" ${invalid ? 'aria-invalid="true"' : ''} tabindex="-1">${after}</div>`
  }
  const help = (said: string) => (part === 'help' ? `<p class="cms-help ${wear(look, true)}">${text(said)}</p>` : '')
  const error = part === 'error' ? `<p class="cms-msg ${wear(look, true)}">${text(t('Enter an email address.'))}</p>` : ''
  return form(field(t('Name'), '', t('Your name'), help(t('As it appears on your order.'))) + field(t('Email'), part === 'error' ? '' : 'ada@example.com', 'ada@example.com', help(t('We never share it.')) + error, part === 'error'))
}

/** A length in rem first, as a form's sizes are. */
const remLength = (property: string, label: string, units = ['rem', 'px']): PartValue => ({ handle: property, property, label, field: { component: 'blocks-value', unit: units[0], units, min: 0, step: units[0] === 'px' ? 1 : 0.125 } })
const color = (property: string, label: string): PartValue => ({ handle: property, property, label, field: { type: 'color', component: 'blocks-color' } })

/** Where a label stands: a class of the field around it (none: above it). */
const POSITIONS = ['label-beside', 'label-inside'] as const
const positionOf = (sheet: Stylesheet) => sheet.elements('components').find((rule) => rule.name === FORM.field)?.classes.find((name) => (POSITIONS as readonly string[]).includes(name)) ?? 'above'
const setPosition = (sheet: Stylesheet, value: unknown) => {
  const others = sheet.elements('components').find((rule) => rule.name === FORM.field)?.classes.filter((name) => !(POSITIONS as readonly string[]).includes(name)) ?? []
  return sheet.setElement(FORM.field, value && value !== 'above' ? [...others, String(value)] : others, 'components')
}

/** Every part of a form: what boxed fields share and each kind, what choices share and each kind, then the words around them. */
const FORM_PARTS = (): Element[] => {
  const field = (id: string, selector: string, label: string, sample: (look: Look) => SampleNode, parts?: Part[]): Element => ({ id, selector, layer: 'components', label, sample, groups: FIELD_GROUPS, states: ['aria-invalid', 'disabled', 'placeholder'], parts })
  const choice = (id: string, selector: string, label: string, kinds: ('check' | 'radio' | 'switch')[], parts?: Part[]): Element => ({
    id, selector, layer: 'components', label, groups: BOX_GROUPS, states: ['checked', 'aria-invalid', 'disabled'], parts,
    sample: (look) => markup(`<div style="display:grid;grid-template-columns:repeat(${kinds.length},auto);gap:.75rem 1.5rem;justify-content:center;white-space:nowrap">${[false, true].map((on) => kinds.map((kind) => {
      const input = kind === 'radio' ? `<input type="radio" class="cms-radio ${wear(look, true)}" ${stateAttributes(look.state, on)}>` : `<input type="checkbox"${kind === 'switch' ? ' role="switch"' : ''} class="cms-${kind} ${wear(look, true)}" ${stateAttributes(look.state, on)}>`
      return `<label class="cms-choice">${input} ${text(on || look.state.includes('checked') ? t('On') : t('Off'))}</label>`
    }).join('')).join('')}</div>`),
  })
  const input = (look: Look, edits: boolean, placeholder: string, value = '') => `<input class="cms-input ${wear(look, edits)}" placeholder="${text(placeholder)}" value="${text(value)}" ${stateAttributes(look.state)}>`
  const textarea = (look: Look, edits: boolean) => `<textarea class="cms-input ${wear(look, edits)}" rows="3" placeholder="${text(t('Text Area'))}" ${stateAttributes(look.state)}></textarea>`
  const select = (look: Look, edits: boolean) => `<select class="cms-input ${wear(look, edits)}" ${stateAttributes(look.state)}><option>${text(t('Dropdown'))}</option></select>`
  return [
    field('fields', FORM.fields, t('All Fields'), (look) => stack(input(look, true, t('Text Field')) + select(look, true) + textarea(look, true))),
    field('text', FORM.text, t('Text Field'), (look) => stack(input(look, true, t('Text Field')) + input(look, true, t('Text Field'), 'ada@example.com'))),
    field('textarea', FORM.textarea, t('Text Area'), (look) => stack(textarea(look, true))),
    field('select', FORM.select, t('Dropdown'), (look) => stack(select(look, true)), [{ title: t('Arrow'), values: [color('--field-select-arrow-color', t('Color')), remLength('--field-select-arrow-size', t('Size'))] }]),
    choice('choices', FORM.choices, t('All Choices'), ['check', 'radio', 'switch']),
    choice('checkbox', FORM.checkbox, t('Checkbox'), ['check'], [{ title: t('Box'), values: [remLength('--field-checkbox-size', t('Size'))] }, { title: t('Check Mark'), values: [color('--field-checkbox-mark-color', t('Color')), { handle: '--field-checkbox-mark-size', property: '--field-checkbox-mark-size', label: t('Size'), field: { component: 'blocks-value', unit: '%', units: ['%'], min: 0, max: 100, step: 5 } }] }]),
    choice('radio', FORM.radio, t('Radio Button'), ['radio'], [{ title: t('Circle'), values: [remLength('--field-radio-size', t('Size'))] }, { title: t('Dot'), values: [color('--field-radio-on-dot', t('Color')), { handle: '--field-radio-dot-size', property: '--field-radio-dot-size', label: t('Size'), field: { component: 'blocks-value', unit: '%', units: ['%'], min: 0, max: 100, step: 5 } }] }]),
    choice('switch', FORM.switch, t('Switch'), ['switch'], [{ title: t('Track'), values: [remLength('--field-switch-width', t('Width')), remLength('--field-switch-height', t('Height'))] }, { title: t('Knob'), values: [color('--field-switch-knob', t('Color')), remLength('--field-switch-inset', t('Inset'), ['px', 'rem']), { handle: '--field-switch-knob-shadow', property: '--field-switch-knob-shadow', label: t('Shadow'), field: { component: 'site-shadow' } }] }]),
    {
      id: 'option', selector: FORM.option, layer: 'components', label: t('Option Text'), groups: TEXT_GROUPS,
      sample: (look) => markup(`<div style="display:grid;gap:.75rem;white-space:nowrap"><label class="cms-choice ${wear(look, true)}"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${text(t('Send me the newsletter'))}</label><label class="cms-choice ${wear(look, true)}"><input type="radio" class="cms-radio" tabindex="-1"> ${text(t('Not now'))}</label></div>`),
    },
    {
      id: 'label', selector: FORM.label, layer: 'components', label: t('Label'), groups: TEXT_GROUPS,
      sample: (look) => labelled(look, 'label'),
      parts: [{
        title: t('Layout'),
        values: [
          {
            handle: 'position', label: t('Position'),
            field: { type: 'select', display: 'segmented', block: true, options: [{ value: 'above', label: t('Above') }, { value: 'label-beside', label: t('Beside') }, { value: 'label-inside', label: t('Inside') }] },
            read: positionOf, write: setPosition,
          },
          { ...remLength('--field-label-width', t('Label Width')), selector: FORM.field, field: { ...remLength('--field-label-width', '').field, if: { position: 'label-beside' } } },
          { ...remLength('--field-spacing-label', t('Under Label')), selector: FORM.field },
          { ...remLength('--field-spacing-fields', t('Between Fields')), selector: FORM.form },
        ],
      }],
    },
    { id: 'help', selector: FORM.help, layer: 'components', label: t('Help Text'), groups: TEXT_GROUPS, sample: (look) => labelled(look, 'help') },
    { id: 'error', selector: FORM.error, layer: 'components', label: t('Error Message'), groups: TEXT_GROUPS, sample: (look) => labelled(look, 'error') },
  ]
}

/** The rule a part's value is written in: its own, or the one it names. */
const ruleOf = (element: Element, value: PartValue) => value.selector ?? element.selector

/** A part's value as the draft has it. */
function partValue(sheet: Stylesheet, element: Element, value: PartValue): unknown {
  if (value.read) return value.read(sheet)
  return sheet.property(ruleOf(element, value), value.property!, element.layer) ?? null
}

/** A part's value written into the draft: nothing, and it goes. */
function setPart(sheet: Stylesheet, element: Element, value: PartValue, next: unknown): Stylesheet {
  if (value.write) return value.write(sheet, next)
  return sheet.setProperty(ruleOf(element, value), value.property!, next === null || next === undefined || next === '' ? null : String(next), element.layer)
}

/** A style's classes, as a stylesheet has them. */
const classesIn = (sheet: Stylesheet, selector: string, layer: Layer) => sheet.elements(layer).find((rule) => rule.name === selector)?.classes ?? []

/** Whether a style is otherwise in the draft than the site has it: its classes, or a value of a part. */
function elementChanged(edit: Editing, element: Element): boolean {
  if (classesIn(edit.sheet, element.selector, element.layer).join(' ') !== classesIn(edit.saved, element.selector, element.layer).join(' ')) return true
  return (element.parts ?? []).some((part) => part.values.some((value) => JSON.stringify(partValue(edit.sheet, element, value)) !== JSON.stringify(partValue(edit.saved, element, value))))
}

/** A style back as the site has it: its classes, or nothing of its own when it had none, and every value of its parts. */
function revertElement(edit: Editing, element: Element) {
  edit.change((sheet) => {
    // A rule the site doesn't have goes whole; one it has gets its classes back, then its values.
    if (!edit.saved.elements(element.layer).some((rule) => rule.name === element.selector)) return [...(element.parts ?? []).flatMap((part) => part.values)].reduce((next, value) => (value.selector || value.write ? setPart(next, element, value, partValue(edit.saved, element, value)) : next), sheet.removeElement(element.selector, element.layer))
    let next = sheet.setElement(element.selector, classesIn(edit.saved, element.selector, element.layer), element.layer)
    for (const part of element.parts ?? []) for (const value of part.values) next = setPart(next, element, value, partValue(edit.saved, element, value))
    return next
  })
}

/**
 * One style, edited as a block is: the same bar on top (the state being styled and its classes, with its ⋯), the
 * sample in that state, the sections of what it draws that no class reaches, and a control for everything a class
 * can set (for the screen the preview shows). The bar at the top of the page names it, with the way back to its
 * group. Nothing in it sticks: it scrolls as one page.
 */
function StyleEditor({ edit, samples, element, classes, write, menu }: { edit: Editing; samples: Samples; element: Element; classes: string[]; write: (classes: string[]) => void; menu?: MenuItemDef[] }) {
  const styling = useStyling()
  const [state, setState] = useState<string[]>([])
  const screen = useMemo(() => screenFor(samples.device, 1280, styling.breakpoints), [samples.device, styling.breakpoints])
  // Without the right to change the styling the controls show what is set and write nothing.
  const s = styleApi(styling.engine, classes, screen, state, edit.readOnly ? () => {} : write)
  const page = pageClasses(edit.sheet)
  // The sample in the state being styled (Hover, Pressed, Focus), as the canvas shows a block in it.
  const shown = shownInState(classes, state)
  const sample = element.sample({ state, shown, classes })
  const sheet = useSpecimenSheet(samples.compiler, [...words(page), ...classes.map((raw) => bare(parseClass(raw).utility)), ...classes, ...shown, ...words(sample.className ?? '')])
  return (
    // The inspector's sections bring their own gutter: they reach the column's edges, as they do in the builder.
    <div className="-mx-4 -mt-2">
      {/* The sample first, as the canvas stands over a block's Design tab: on the page's own background, from edge to edge, as tall as it is. */}
      <div className="border-b border-border">
        <Specimen sheet={sheet} node={sample} page={page} mode={edit.mode} align="center" auto className="min-h-32" />
      </div>
      <div className="border-b border-border">
        <StyleBar s={s} site={styling.classes} source={styling.source} disabled={edit.readOnly} state={{ classes, engine: styling.engine, state, onState: setState, primary: element.states }} menu={menu} saveAs={false} />
      </div>
      {/* Read only, the controls show what is set and take no input. */}
      <div inert={edit.readOnly}>
        {(element.parts ?? []).map((part) => <PartSection key={part.title} edit={edit} element={element} part={part} />)}
        <StylePanels s={s} groups={element.groups ?? TEXT_GROUPS} />
      </div>
    </div>
  )
}

/** Where the --field-* and --prose-* properties are set for every form and section: the kernel's defaults, and a site's own. */
const ROOT = ':root, [data-theme]'

/** A section of what a style draws that no class reaches, value by value, each with the way back to the site's. */
function PartSection({ edit, element, part }: { edit: Editing; element: Element; part: Part }) {
  const { source } = useStyling()
  const kernel = useMemo(() => new Stylesheet(source?.files.cms ?? ''), [source?.files.cms])
  // What holds where the style sets nothing: the site's own on every :root (its --field-* properties), else the kernel's.
  const fallback = (value: PartValue) => (value.property ? plainValue(edit.sheet.property(ROOT, value.property, 'base') ?? kernel.property(ruleOf(element, value), value.property, element.layer) ?? kernel.property(ROOT, value.property, 'base')) : null)
  const values = Object.fromEntries(part.values.map((value) => [value.handle, partValue(edit.sheet, element, value) ?? fallback(value)]))
  const changed = (value: PartValue) => JSON.stringify(partValue(edit.sheet, element, value)) !== JSON.stringify(partValue(edit.saved, element, value))
  const own = part.values.some((value) => (value.read ? value.read(edit.sheet) !== 'above' : partValue(edit.sheet, element, value) !== null))
  return (
    <InspectorSection title={part.title} empty={!own}>
      <PanelFields
        fields={part.values.map((value) => ({ type: 'text', size: 'sm', placeholder: t('Default'), ...value.field, handle: value.handle, label: value.label, status: changed(value) ? 'own' : undefined, reset: () => edit.change((sheet) => setPart(sheet, element, value, partValue(edit.saved, element, value))) }) as FieldDef)}
        values={values}
        onChange={(handle, next) => {
          const value = part.values.find((each) => each.handle === handle)
          if (value) edit.change((sheet) => setPart(sheet, element, value, next))
        }}
      />
    </InspectorSection>
  )
}

/**
 * What the kernel sets, as a field shows it: one value (a colour or size of the theme, a length, a word). One made of
 * other properties (`var(--field-background)`, a `color-mix()`) is no value to read: the field says Default.
 */
const plainValue = (value: string | undefined) => (value && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(value.trim()) ? value : null)

/** The groups the site was given, by their place in the address; the site's own come after them. */
const BUILT_IN = ['elements', 'buttons', 'forms', 'articles'] as const
type BuiltIn = (typeof BUILT_IN)[number]
/** Those of them a class of the site's goes in: a button is a button by its name. */
const HOLDS_CLASSES = ['elements', 'forms', 'articles'] as const
/** The place of the styles in no group of the site's. */
const UNGROUPED = 'ungrouped'
const RESERVED: string[] = [...BUILT_IN, UNGROUPED]
const builtInLabel = (id: string) => ({ elements: t('Elements'), buttons: t('Buttons'), forms: t('Forms'), articles: t('Articles') })[id as BuiltIn]

/** What a group the site was given holds, the site's own additions among them, in order. */
function elementsOf(sheet: Stylesheet, group: string): Element[] {
  if (group === 'elements') return [...ELEMENT_LIST(), ...MORE_ELEMENT_LIST().filter((element) => sheet.elements('base').some((rule) => rule.name === element.selector))]
  if (group === 'articles') return [...ARTICLES(), ...MORE_ARTICLE_LIST().filter((element) => sheet.elements('components').some((rule) => rule.name === element.selector))]
  if (group === 'forms') return FORM_PARTS()
  return []
}

/** What a group can be given: the elements it can add, those it has not yet. */
function addable(sheet: Stylesheet, group: string): Element[] {
  const shown = new Set(elementsOf(sheet, group).map((element) => element.id))
  return (group === 'elements' ? MORE_ELEMENT_LIST() : group === 'articles' ? MORE_ARTICLE_LIST() : []).filter((element) => !shown.has(element.id))
}

/** A style of the group by its place in the address, also one being added. */
const elementAt = (sheet: Stylesheet, group: string, key: string) => elementsOf(sheet, group).find((element) => element.id === key) ?? (group === 'elements' ? MORE_ELEMENT_LIST() : group === 'articles' ? MORE_ARTICLE_LIST() : []).find((element) => element.id === key)

/** The site's own styles: every class of its stylesheet but its colour schemes. */
const ownStyles = (sheet: Stylesheet) => sheet.utilities().filter((rule) => /^[a-z][\w-]*$/.test(rule.name) && !rule.name.startsWith('scheme-'))
const isButton = (name: string) => name.startsWith('btn-')

/** A group a class names that is one the site was given: it is written by its id, `/* group: forms *\/`. */
const builtInGroup = (name: string | null | undefined): string | null => (name && (HOLDS_CLASSES as readonly string[]).includes(name.toLowerCase()) ? name.toLowerCase() : null)

/** A name as a class takes it, from words: "Big Quote" is big-quote. */
const className = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')

/**
 * The site's groups, in the order its stylesheet first names them, those with no class yet included, each with its
 * place in the address (never one the site was given).
 */
function siteGroups(sheet: Stylesheet): { id: string; name: string }[] {
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

/** Which group a class goes in, as a list to pick from: none, one the site was given, or one of its own. */
const groupField = (groups: { id: string; name: string }[]): FieldDef => ({
  handle: 'group',
  type: 'select',
  label: t('Group'),
  placeholder: t('No Group'),
  options: [...HOLDS_CLASSES.map((id) => ({ value: id, label: builtInLabel(id)! })), ...groups.map((group) => ({ value: group.name, label: group.name }))],
} as FieldDef)

/** A group a class has left stays, with no class in it, until it is deleted. One the site was given is always there. */
const keepGroup = (sheet: Stylesheet, group: string | null | undefined) => (group && !builtInGroup(group) && !sheet.groups().includes(group) ? sheet.addGroup(group) : sheet)

/** Where a style of the site's is: its buttons, a group it was given, a group of its own, or none. */
function groupOf(sheet: Stylesheet, name: string): string {
  if (isButton(name)) return 'buttons'
  const group = ownStyles(sheet).find((rule) => rule.name === name)?.group
  return builtInGroup(group) ?? siteGroups(sheet).find((each) => each.name === group)?.id ?? UNGROUPED
}

/** The address of a group of styles, or of a style in it. */
export const stylePath = (group?: string, key?: string) => ['/design/classes', group, key].filter(Boolean).map((part, i) => (i === 0 ? part : encodeURIComponent(part!))).join('/')

/** What a group is called. */
function groupLabel(sheet: Stylesheet, id: string): string | null {
  if (id === UNGROUPED) return t('Ungrouped')
  return builtInLabel(id) ?? siteGroups(sheet).find((group) => group.id === id)?.name ?? null
}

/** What a style is called, in its group. */
function itemLabel(sheet: Stylesheet, group: string, key: string): string | null {
  const element = elementAt(sheet, group, key)
  if (element) return element.label
  // A class is named as written, as it is worn.
  return ownStyles(sheet).some((rule) => rule.name === key) ? key : null
}

/**
 * Where a group or a class stands, for the bar at the top of the page: each level a crumb, Classes, its group, the
 * class. Null on the list of groups, or for a place there is no longer.
 */
export function stylesPlace(sheet: Stylesheet, [group, key]: string[]): { label: string; to?: string }[] | null {
  if (!group) return null
  const label = groupLabel(sheet, group)
  if (!label) return null
  if (!key) return [{ label: t('Classes'), to: stylePath() }, { label }]
  const title = itemLabel(sheet, group, key)
  return title ? [{ label: t('Classes'), to: stylePath() }, { label, to: stylePath(group) }, { label: title }] : null
}

/** Names a class can't take: the place of a style the site was given in its group's address. */
const TAKEN_BY_STYLES = () => new Set([...ELEMENTS, ...MORE_ELEMENTS, ...ELEMENT_LIST().map((each) => each.id), ...ARTICLES().map((each) => each.id), ...Object.keys(MORE_ARTICLE), ...FORM_PARTS().map((each) => each.id)])

/**
 * A name for a style, asked for: a class's name from the words typed, under `prefix` (btn-), not one the stylesheet
 * or Tailwind has. With `groups` (the site's) it also asks which group the style goes in, `group` chosen at first.
 */
async function askName(engine: Engine | null, taken: string[], title: string, confirmLabel: string, prefix = '', current = '', groups?: { list: { id: string; name: string }[]; group: string | null }): Promise<{ name: string; group: string | null } | null> {
  const asked = await prompt({
    title,
    fields: [
      { handle: 'name', type: 'text', label: t('Name'), placeholder: prefix ? 'outline' : 'lead', required: true, autofocus: true },
      ...(groups ? [groupField(groups.list)] : []),
    ],
    values: { name: current ? current.slice(prefix.length) : '', group: groups?.group ?? null },
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
  // A name Tailwind has (flex, display) would be two classes under one name; one of an element would share its address.
  if (taken.includes(name) || engine?.valid(name) || TAKEN_BY_STYLES().has(name)) {
    toast.error(t('There is already a class “{name}”.', { name }))
    return null
  }
  return { name, group: groups ? String(asked?.group ?? '') || null : null }
}

/** A name for a group: any words, but none the site was given or has already. */
async function askGroup(sheet: Stylesheet, title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'group', type: 'text', label: t('Name'), placeholder: t('Cards'), required: true, autofocus: true }], values: { group: current }, confirm: confirmLabel })
  const name = String(asked?.group ?? '').replace(/\*\/|\n/g, '').trim()
  if (!name || name === current || reserved(name)) return null
  if (sheet.groups().includes(name)) {
    toast.error(t('There is already a group “{name}”.', { name }))
    return null
  }
  return name
}

/** A group's name the site was given (Buttons, Ungrouped): said so, and not taken. */
function reserved(name: string): boolean {
  const taken = RESERVED.includes(className(name)) || RESERVED.some((id) => (id === UNGROUPED ? t('Ungrouped') : builtInLabel(id))?.toLowerCase() === name.toLowerCase())
  if (taken) toast.error(t('“{name}” is a group the site already has.', { name }))
  return taken
}

/** A row of a list in the tree it is dragged in: a style that opens, or a group of the site's inside the list. */
type Node = TreeItem & { kind: 'item' | 'group'; label: string; to?: string; menu: MenuItemDef[]; changed?: boolean; locked?: boolean; detail?: number }

/** Keys in the order the site put them, those it didn't name after them as they stand. */
const ordered = (keys: string[], order: string[]) => [...order.filter((key) => keys.includes(key)), ...keys.filter((key) => !order.includes(key))]

/** A group's rows as arranged, among the styles it has: what is gone is left out, what is new comes last. Its own groups stay, empty or not. */
function arranged(entries: Entry[], keys: string[]): Entry[] {
  const placed = new Set<string>()
  const keep = (list: Entry[]): Entry[] => list.flatMap((entry): Entry[] => {
    if (typeof entry !== 'string') return [{ name: entry.name, items: keep(entry.items) }]
    if (!keys.includes(entry) || placed.has(entry)) return []
    placed.add(entry)
    return [entry]
  })
  const kept = keep(entries)
  return [...kept, ...keys.filter((key) => !placed.has(key))]
}

/** A style taken out of a list, wherever it stands in it. */
const removeEntry = (entries: Entry[], key: string): Entry[] => entries.flatMap((entry): Entry[] => (typeof entry === 'string' ? (entry === key ? [] : [entry]) : [{ name: entry.name, items: removeEntry(entry.items, key) }]))

/** The group of a list a style stands in, if any. */
const groupHolding = (entries: Entry[], key: string, within: string | null = null): string | null => {
  for (const entry of entries) {
    if (entry === key) return within
    if (typeof entry !== 'string') {
      const found = groupHolding(entry.items, key, entry.name)
      if (found) return found
    }
  }
  return null
}

/** The names of a list's own groups, at every depth. */
const groupNames = (entries: Entry[]): string[] => entries.flatMap((entry) => (typeof entry === 'string' ? [] : [entry.name, ...groupNames(entry.items)]))

/** How many styles a group holds, in its groups too. */
const countIn = (node: Node): number => ((node.children ?? []) as Node[]).reduce((sum, child) => sum + (child.kind === 'group' ? countIn(child) : 1), 0)

/** Rows as the tree draws them. */
function toNodes(entries: Entry[], itemOf: (key: string) => Node | undefined, menuOf: (name: string) => MenuItemDef[]): Node[] {
  return entries.flatMap((entry): Node[] => {
    if (typeof entry !== 'string') return [{ id: `group:${entry.name}`, kind: 'group', label: entry.name, menu: menuOf(entry.name), children: toNodes(entry.items, itemOf, menuOf) }]
    const node = itemOf(entry)
    return node ? [node] : []
  })
}

/** What the tree holds after a drag, as the arrangement writes it. */
const fromNodes = (nodes: Node[]): Entry[] => nodes.map((node) => (node.kind === 'group' ? { name: node.label, items: fromNodes((node.children ?? []) as Node[]) } : node.id.slice(5)))

/** A group of a list changed where it stands, or taken out (null), its rows staying where it stood. */
function mapGroup(entries: Entry[], name: string, change: ((group: { name: string; items: Entry[] }) => Entry) | null): Entry[] {
  return entries.flatMap((entry): Entry[] => {
    if (typeof entry === 'string') return [entry]
    if (entry.name === name) return change ? [change(entry)] : entry.items
    return [{ name: entry.name, items: mapGroup(entry.items, name, change) }]
  })
}

/** A style renamed wherever the arrangement names it. */
function renameEntry(arrangement: Arrangement, from: string, to: string): Arrangement {
  const swap = (entries: Entry[]): Entry[] => entries.map((entry) => (typeof entry === 'string' ? (entry === from ? to : entry) : { name: entry.name, items: swap(entry.items) }))
  return { ...arrangement, groups: Object.fromEntries(Object.entries(arrangement.groups).map(([at, entries]) => [at, swap(entries)])) }
}

/** A group of the site's renamed in the arrangement, or gone from it (null). */
function renameGroupKey(arrangement: Arrangement, from: string, to: string | null): Arrangement {
  const groups = Object.fromEntries(Object.entries(arrangement.groups).flatMap(([at, entries]) => (at !== from ? [[at, entries]] : to ? [[to, entries]] : [])))
  const order = arrangement.order.flatMap((name) => (name !== from ? [name] : to ? [to] : []))
  return { order, groups }
}

/** A name for a group inside a list: any words, but not one the list has already. */
async function askInnerGroup(taken: string[], title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: t('Headings'), required: true, autofocus: true }], values: { name: current }, confirm: confirmLabel })
  const name = String(asked?.name ?? '').trim()
  if (!name || name === current) return null
  if (taken.includes(name)) {
    toast.error(t('There is already a group “{name}”.', { name }))
    return null
  }
  return name
}

/** A style of the site's renamed, and under its new name wherever the stylesheet itself applies it. */
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

/**
 * The site's styles at `path` (after /design/classes): its groups, a group's styles, or one style's editor. Each
 * style opens on its editor in place of the list, so a block's Edit Class leads straight to it.
 */
export function Classes({ edit, samples, path }: { edit: Editing; samples: Samples; path: string[] }) {
  const { engine } = useStyling()
  const [search, setSearch] = useState('')
  const [group, key] = path
  const own = ownStyles(edit.sheet)
  const groups = siteGroups(edit.sheet)
  const taken = edit.sheet.utilities().map((rule) => rule.name)
  const open = (to: string) => navigate(to)
  // A class reached by another group's address (a block's Edit Class knows the name, not the group): the address its group gives it.
  const misplaced = !!group && !!key && !elementAt(edit.sheet, group, key) && own.some((rule) => rule.name === key) && groupOf(edit.sheet, key) !== group
  useEffect(() => {
    if (misplaced) navigate(stylePath(groupOf(edit.sheet, key), key), { replace: true })
  }, [misplaced, edit.sheet, key])

  /** The group a class made in `into` is written in: one the site was given by its id, one of its own by its name. */
  const groupName = (into: string | null) => (into && (HOLDS_CLASSES as readonly string[]).includes(into) ? into : groups.find((each) => each.id === into)?.name ?? null)

  /** A new button, or a new style, in the group it was made in (null: none) unless another is picked: it opens at once, on its first look. */
  const create = async (into: string | null) => {
    const button = into === 'buttons'
    const asked = await askName(engine, taken, button ? t('New Button') : t('New Class'), button ? t('Create Button') : t('Create Class'), button ? 'btn-' : '', '', button ? undefined : { list: groups, group: groupName(into) })
    if (!asked) return
    const { name, group: chosen } = asked
    // A new button starts as a copy of the first one; a style as text of the page's size, which Tailwind can build.
    const first = own.find((rule) => isButton(rule.name))
    edit.change((s) => (button && first ? s.duplicateUtility(first.name, name).setUtilityGroup(name, null) : s.setUtility(name, ['text-base']).setUtilityGroup(name, chosen)))
    // Its group's address follows once the draft has it: the screen corrects a group it can't know yet.
    open(stylePath(button ? 'buttons' : UNGROUPED, name))
  }
  /** An element more for the group to style: it opens at once, and stays in the list once it is styled. */
  const addElement = async (into: string) => {
    const choices = addable(edit.sheet, into)
    const asked = await prompt({ title: t('Add Element'), fields: [{ handle: 'element', type: 'select', label: t('Element'), required: true, options: choices.map((element) => ({ value: element.id, label: element.label })) } as FieldDef], values: { element: choices[0]?.id ?? null }, confirm: t('Add Element') })
    const id = String(asked?.element ?? '')
    if (id) open(stylePath(into, id))
  }
  const rename = async (from: string) => {
    const name = (await askName(engine, taken, t('Rename “{name}”', { name: from }), t('Rename'), isButton(from) ? 'btn-' : '', from))?.name
    if (!name) return
    edit.change((s) => renameStyle(s, from, name))
    edit.arrange((a) => renameEntry(a, from, name))
    if (key === from) navigate(stylePath(group, name), { replace: true })
  }
  const duplicate = async (from: string) => {
    const name = (await askName(engine, taken, t('Duplicate “{name}”', { name: from }), isButton(from) ? t('Duplicate Button') : t('Duplicate Class'), isButton(from) ? 'btn-' : ''))?.name
    if (name) edit.change((s) => s.duplicateUtility(from, name))
  }
  const move = async (name: string) => {
    const current = own.find((rule) => rule.name === name)?.group ?? null
    const asked = await prompt({ title: t('Move “{name}” to a Group', { name }), fields: [groupField(groups)], values: { group: current }, confirm: t('Move Class') })
    if (!asked) return
    const next = String(asked.group ?? '') || null
    if (next === current) return
    edit.change((s) => keepGroup(s.setUtilityGroup(name, next), current))
  }
  const remove = (name: string) => {
    const left = own.find((rule) => rule.name === name)?.group
    edit.change((s) => keepGroup(s.removeUtility(name), left))
    if (key === name) navigate(stylePath(group))
  }
  const styleMenu = (name: string): MenuItemDef[] => rowMenu(edit, {
    copy: name,
    revert: edit.sheet.utilities().find((rule) => rule.name === name)?.classes.join(' ') !== edit.saved.utilities().find((rule) => rule.name === name)?.classes.join(' ') && edit.saved.utilities().some((rule) => rule.name === name)
      ? () => edit.change((s) => s.setUtility(name, edit.saved.utilities().find((rule) => rule.name === name)!.classes))
      : null,
    own: [
      { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(name) },
      { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(name) },
      ...(isButton(name) ? [] : [{ label: t('Move to Group…'), icon: 'folder', onSelect: () => void move(name) }]),
      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => remove(name) },
    ],
  })
  /** A style the site was given: changed and not yet saved, back to what the site has; one it added, taken out again. */
  const elementMenu = (element: Element, at: string): MenuItemDef[] => {
    const added = [...MORE_ELEMENT_LIST(), ...MORE_ARTICLE_LIST()].some((each) => each.selector === element.selector && each.layer === element.layer)
    return rowMenu(edit, {
      revert: elementChanged(edit, element) ? () => revertElement(edit, element) : null,
      own: added ? [{
        label: t('Remove'), icon: 'trash', danger: true, onSelect: () => {
          edit.change((s) => s.removeElement(element.selector, element.layer))
          if (key === element.id) navigate(stylePath(at))
        },
      }] : [],
    })
  }

  // One style open, in place of its group.
  if (group && key) {
    const element = elementAt(edit.sheet, group, key)
    if (element) return <StyleEditor key={key} edit={edit} samples={samples} element={element} classes={classesIn(edit.sheet, element.selector, element.layer)} menu={elementMenu(element, group)} write={(classes) => edit.change((s) => s.setElement(element.selector, classes, element.layer))} />
    const rule = own.find((entry) => entry.name === key)
    if (rule) {
      const node = styleSample(rule.name)
      return (
        <StyleEditor
          key={key}
          edit={edit}
          samples={samples}
          element={{ id: rule.name, selector: rule.name, layer: 'base', label: rule.name, sample: plain(node), groups: STYLE_GROUPS }}
          classes={rule.classes}
          menu={styleMenu(rule.name)}
          // With nothing left to apply the style goes, unless it holds CSS of its own.
          write={(classes) => edit.change((s) => (classes.length > 0 || s.utilities().find((entry) => entry.name === rule.name)?.custom ? s.setUtility(rule.name, classes) : s.removeUtility(rule.name)))}
        />
      )
    }
    return null
  }

  // A class is its name: what it looks like is shown where it is edited.
  type Item = { key: string; to: string; label: string; group: string; menu: MenuItemDef[]; changed: boolean }
  const item = (at: string, id: string, label: string, menu: MenuItemDef[], unsaved: boolean): Item => ({ key: id, to: stylePath(at, id), label, group: groupLabel(edit.sheet, at) ?? '', menu, changed: unsaved })
  const classItem = (rule: (typeof own)[number], at: string) => item(at, rule.name, rule.name, styleMenu(rule.name), rule.classes.join(' ') !== edit.saved.utilities().find((each) => each.name === rule.name)?.classes.join(' '))
  const ungrouped = own.filter((rule) => !isButton(rule.name) && groupOf(edit.sheet, rule.name) === UNGROUPED)
  /** A group's styles in the order they stand by default: what it was given, then its classes. */
  const itemsOf = (at: string): Item[] => {
    const elements = elementsOf(edit.sheet, at).map((element) => item(at, element.id, element.label, elementMenu(element, at), elementChanged(edit, element)))
    if (at === 'buttons') return own.filter((rule) => isButton(rule.name)).map((rule) => classItem(rule, 'buttons'))
    if (at === UNGROUPED) return ungrouped.map((rule) => classItem(rule, UNGROUPED))
    return [...elements, ...own.filter((rule) => !isButton(rule.name) && groupOf(edit.sheet, rule.name) === at).map((rule) => classItem(rule, at))]
  }
  /** Where a group's rows are arranged: one the site was given by its id, one of its own by its name. */
  const arrangedAs = (at: string) => groups.find((each) => each.id === at)?.name ?? at
  const ids = ordered([...BUILT_IN, ...groups.map((each) => each.id), ...(ungrouped.length ? [UNGROUPED] : [])], edit.arrangement.order.map((name) => groups.find((each) => each.name === name)?.id ?? name))
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const found = (entry: Item) => terms.every((word) => `${entry.label} ${entry.key}`.toLowerCase().includes(word))
  const searchField = (placeholder: string) => (
    <div className="mb-4">
      <Fields bare fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder }]} values={{ search }} onChange={(_, next) => setSearch(String(next ?? ''))} />
    </div>
  )
  /** What a search finds, wherever it stands, with the group it is in. */
  const matches = (items: Item[], detail?: (entry: Item) => string) => {
    const shown = items.filter(found)
    return shown.length ? (
      <Group plain>
        <SettingsPanel className="overflow-hidden">
          <div className="-mx-4 divide-y divide-border sm:-mx-5">
            {shown.map((entry) => <TreeRow key={entry.to} handle={null} onOpen={() => open(entry.to)} label={entry.label} changed={entry.changed} menu={entry.menu} detail={detail?.(entry)} />)}
          </div>
        </SettingsPanel>
      </Group>
    ) : <NoMatches onClear={() => setSearch('')} />
  }
  // What is added under a list, in the same quiet buttons on every list.
  const adding = 'ml-0 !px-1.5 !font-normal !text-muted first:-ml-1.5 hover:!text-ink'
  const actions = (buttons: { label: string; icon: string; onClick: () => void }[]) => (edit.readOnly || buttons.length === 0 ? undefined : (
    <span className="flex items-center gap-3">
      {buttons.map((button) => <Button key={button.label} variant="ghost" size="xs" icon={button.icon} onClick={button.onClick} className={adding}>{button.label}</Button>)}
    </span>
  ))
  /** A list that can be put in another order by dragging, and into groups of its own: the same in every group. */
  const tree = (nodes: Node[], onChange: (nodes: Node[]) => void, depth: number) => (
    <SettingsPanel className="overflow-hidden">
      <SortableTree<Node>
        items={nodes}
        onChange={onChange}
        maxDepth={depth}
        canNest={(node) => node.kind === 'group'}
        indent={20}
        className="-mx-4 !space-y-0 divide-y divide-border sm:-mx-5"
        renderItem={(node, { handle }) => node.kind === 'group'
          ? <TreeRow heading handle={edit.readOnly ? null : handle} label={node.label} detail={countIn(node)} menu={node.menu} />
          : <TreeRow handle={edit.readOnly ? null : handle} onOpen={() => open(node.to ?? stylePath())} label={node.label} locked={node.locked} detail={node.detail} changed={node.changed} menu={node.menu} />}
      />
    </SettingsPanel>
  )

  // A group: its styles and the site's classes in it, in the order the site put them and in groups of its own.
  if (group) {
    const items = itemsOf(group)
    const button = group === 'buttons'
    const known = group === UNGROUPED || (BUILT_IN as readonly string[]).includes(group) || groups.some((each) => each.id === group)
    const more = addable(edit.sheet, group)
    const at = arrangedAs(group)
    const entries = edit.arrangement.groups[at] ?? []
    const write = (next: Entry[]) => edit.arrange((a) => ({ ...a, groups: { ...a.groups, [at]: next } }))
    const names = groupNames(entries)
    const newGroup = async () => {
      const name = await askInnerGroup(names, t('New Group'), t('Create Group'))
      // First in the list: what goes in it is dragged under it.
      if (name) write([{ name, items: [] }, ...arranged(entries, items.map((each) => each.key))])
    }
    /** A row into one of the list's groups, or out of them all (null), last in it: what dragging does, from a menu. */
    // A class of the site's can also go to another group of Classes; what the site was given stays in its own.
    const isClass = (key: string) => own.some((rule) => rule.name === key) && !isButton(key)
    const moveInto = async (key: string) => {
      const list = arranged(entries, items.map((each) => each.key))
      const here = groupLabel(edit.sheet, group) ?? group
      const elsewhere = isClass(key) ? [...HOLDS_CLASSES.map((id) => ({ value: `to:${id}`, label: builtInLabel(id)! })), ...groups.map((each) => ({ value: `to:${each.name}`, label: each.name }))].filter((option) => option.value !== `to:${arrangedAs(group)}`).concat(group === UNGROUPED ? [] : [{ value: 'to:', label: t('No Group') }]) : []
      const options = [{ value: 'here', label: here }, ...names.map((name) => ({ value: `in:${name}`, label: `${here} › ${name}` })), ...elsewhere]
      const holding = groupHolding(list, key)
      const asked = await prompt({ title: t('Move “{name}” to a Group', { name: items.find((each) => each.key === key)?.label ?? key }), fields: [{ handle: 'group', type: 'select', label: t('Group'), required: true, options } as FieldDef], values: { group: holding ? `in:${holding}` : 'here' }, confirm: t('Move to Group') })
      if (!asked) return
      const target = String(asked.group ?? '')
      if (target.startsWith('to:')) {
        const name = target.slice(3) || null
        const current = own.find((rule) => rule.name === key)?.group ?? null
        edit.change((sheet) => keepGroup(sheet.setUtilityGroup(key, name), current))
        write(removeEntry(list, key))
        return
      }
      const without = removeEntry(list, key)
      write(target.startsWith('in:') ? mapGroup(without, target.slice(3), (inner) => ({ ...inner, items: [...inner.items, key] })) : [...without, key])
    }
    const nodes = toNodes(arranged(entries, items.map((each) => each.key)), (key) => {
      const entry = items.find((each) => each.key === key)
      // One Move to Group… on every row: into a group of this list, or for a class to another group of Classes.
      const movable = !edit.readOnly && (names.length > 0 || isClass(key))
      const base = (entry?.menu ?? []).filter((each) => each.label !== t('Move to Group…'))
      const menu = movable ? [...base, ...(base.length ? [{ separator: true, label: '' }] : []), { label: t('Move to Group…'), icon: 'folder', onSelect: () => void moveInto(key) }] : base
      return entry && { id: `item:${key}`, kind: 'item' as const, label: entry.label, to: entry.to, menu, changed: entry.changed }
    }, (name) => rowMenu(edit, {
      own: [
        {
          label: t('Rename…'), icon: 'edit', onSelect: async () => {
            const next = await askInnerGroup(names, t('Rename Group'), t('Rename'), name)
            if (next) write(mapGroup(arranged(entries, items.map((each) => each.key)), name, (inner) => ({ ...inner, name: next })))
          },
        },
        // Its rows stay where it stood.
        { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => write(mapGroup(arranged(entries, items.map((each) => each.key)), name, null)) },
      ],
    }))
    const buttons = known ? [
      { label: button ? t('New Button') : t('New Class'), icon: 'plus', onClick: () => void create(group === UNGROUPED ? null : group) },
      ...(more.length ? [{ label: t('Add Element'), icon: 'plus', onClick: () => void addElement(group) }] : []),
      { label: t('New Group'), icon: 'folder', onClick: () => void newGroup() },
    ] : []
    // A group of the site's with no class in it yet: the way to make its first.
    if (items.length === 0 && names.length === 0) return <EmptyState compact icon="folder" title={t('No classes yet')} action={!edit.readOnly && known && <Button icon="plus" onClick={() => void create(group === UNGROUPED ? null : group)}>{button ? t('New Button') : t('New Class')}</Button>} />
    return (
      <>
        {items.length > 7 && searchField(t('Search {items}', { items: groupLabel(edit.sheet, group) ?? t('Classes') }))}
        {terms.length ? matches(items) : (
          <Group plain action={actions(buttons)}>
            {tree(nodes, (next) => write(fromNodes(next)), 3)}
          </Group>
        )}
      </>
    )
  }

  // Every group: those the site was given, its own, then the classes in none. A search finds a class in any of them.
  const changedIn = (items: Item[]) => items.some((entry) => entry.changed)
  const groupMenu = (name: string): MenuItemDef[] => rowMenu(edit, {
    own: [
      {
        label: t('Rename…'), icon: 'edit', onSelect: async () => {
          const next = await askGroup(edit.sheet, t('Rename Group'), t('Rename'), name)
          if (next) {
            edit.change((s) => s.renameGroup(name, next))
            edit.arrange((a) => renameGroupKey(a, name, next))
          }
        },
      },
      // Its classes stay, in no group.
      {
        label: t('Delete'), icon: 'trash', danger: true, onSelect: () => {
          edit.change((s) => s.renameGroup(name, null))
          edit.arrange((a) => renameGroupKey(a, name, null))
        },
      },
    ],
  })
  const newGroup = async () => {
    const name = await askGroup(edit.sheet, t('New Group'), t('Create Group'))
    if (name) edit.change((s) => s.addGroup(name))
  }
  return (
    <>
      {searchField(t('Search Classes'))}
      {terms.length ? matches(ids.flatMap(itemsOf), (entry) => entry.group) : (
        <Group plain action={actions([{ label: t('New Class'), icon: 'plus', onClick: () => void create(null) }, { label: t('New Group'), icon: 'folder', onClick: () => void newGroup() }])}>
          {tree(ids.map((id) => {
            const items = itemsOf(id)
            const mine = groups.find((each) => each.id === id)
            // A group made or renamed and not saved yet is marked like a class.
            return { id: `item:${id}`, kind: 'item' as const, label: groupLabel(edit.sheet, id) ?? id, to: stylePath(id), locked: !mine && id !== UNGROUPED, detail: items.length, changed: changedIn(items) || (!!mine && !edit.saved.groups().includes(mine.name)), menu: mine ? groupMenu(mine.name) : [] }
          }), (next) => edit.arrange((a) => ({ ...a, order: next.map((node) => arrangedAs(node.id.slice(5))) })), 0)}
        </Group>
      )}
    </>
  )
}
