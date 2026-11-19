import { t, type FieldDef } from '@letterncms/sdk'
import { ARTICLE, FORM, MORE_ELEMENTS, styleSample, type SampleNode, type StyleLayer as Layer, type Stylesheet } from '@letterncms/blocks'

/* What the site's styles are, and the ones it was given: its elements, the parts of its long-form text and of its
   forms, each with the sample it is drawn as and what it is styled with, and the elements it can add. A class of its
   own or a style for one element's id is made the same way (classStyle, idStyle). */

/** Words, one by one. */
const join = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ')

/** What a sample is drawn in: the state being styled, the classes that draw it so (hover:x worn as x!), and the classes being edited. */
export interface Look {
  state: string[]
  shown: string[]
  classes: string[]
}

/** One value of a style that no class sets: a property of its rule (or of another's, `selector`), or a value read and written its own way. */
export interface PartValue {
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
export interface Part {
  title: string
  values: PartValue[]
}

/** How a style is written: a class of the site's (@utility), an element's rule, a rule for one element's id, or a part of a form or of long-form text. */
export type Kind = 'class' | 'element' | 'id' | 'part'

/**
 * One style: what it is called, the rule it is (its selector, in its layer; a class by its name), how it is drawn and
 * what it is styled with. `id` is its place in the address and in the arrangement. One the site was given is always
 * there, in its group; one the site made can go in any.
 */
export interface Style {
  id: string
  kind: Kind
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
  /** Given by the site: always listed, in its own group. */
  given?: boolean
}

export const TEXT_GROUPS = ['typography', 'spacing', 'fill', 'border', 'effects', 'transition'] as const
const FIELD_GROUPS = ['size', 'spacing', 'typography', 'fill', 'border', 'effects', 'transition'] as const
const BOX_GROUPS = ['fill', 'border', 'effects', 'transition'] as const

/** One element as its sample: the tag with its words, wearing what draws the state being styled. */
const plain = (node: SampleNode) => (look: Look): SampleNode => ({ ...node, className: join(node.className, ...look.shown) || undefined })

/** Words a sample shows, made safe to stand in markup. */
const text = (said: string) => said.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Markup of our own: what a sample holds that is more than one element. */
const markup = (html: string): SampleNode => ({ tag: 'div', text: '', markup: html })

/** Every element the site styles, the page first, then its text, then the details of a page. */
export const ELEMENT_LIST = (): Style[] => {
  const element = (id: string, label: string, node: SampleNode, groups?: readonly string[]): Style => ({ id, kind: 'element', selector: id, layer: 'base', label, sample: plain(node), groups, given: true })
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
    { id: 'selection', kind: 'element', given: true, selector: '::selection', layer: 'base', label: t('Selection'), groups: ['typography', 'fill'], sample: (look) => ({ tag: 'span', text: t('Selection'), className: join(...look.classes, ...look.shown) }) },
    { id: 'focus', kind: 'element', given: true, selector: ':focus-visible', layer: 'base', label: t('Focus Ring'), groups: ['border', 'effects'], sample: (look) => ({ tag: 'span', text: t('Focus Ring'), className: join('inline-block rounded-sm px-2', ...look.classes, ...look.shown) }) },
  ]
}

/** A picture's stand-in, the same in every sample. */
const PICTURE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 100%22%3E%3Crect width=%22160%22 height=%22100%22 fill=%22%23a3a3a3%22/%3E%3Cpath d=%22M0 100 55 45l35 35 22-22 48 42z%22 fill=%22%23737373%22/%3E%3C/svg%3E'

/** The elements a site may add to those it styles, by their tag. */
export const MORE_ELEMENT_LIST = (): Style[] => {
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
    return { id, kind: 'element' as const, selector: id, layer: 'base' as const, label, groups, sample: sample.markup ? () => sample : plain(sample) }
  })
}

/** A small table: its caption, a row of headers and one of cells. */
const TABLE = () => `<table><caption>${text(t('Table Caption'))}</caption><thead><tr><th>${text(t('Table Header'))}</th><th>${text(t('Table Header'))}</th></tr></thead><tbody><tr><td>${text(t('Table Cell'))}</td><td>${text(t('Table Cell'))}</td></tr></tbody></table>`

/** Long-form text: an element drawn inside it. Alone, an element's margins are no part of its look. */
const prose = (html: string) => () => markup(`<div class="cms-prose">${html}</div>`)

/** A length of long-form text, in em first: it grows with the text. */
const proseLength = (property: string, label: string): PartValue => ({ handle: property, property, label, field: { component: 'blocks-value', unit: 'em', units: ['em', 'rem', 'px'], min: 0, step: 0.125 } })

/** The parts of long-form text a site styles apart from the page's: the text as a whole, then its elements. */
export const ARTICLES = (): Style[] => [
  {
    id: 'article',
    kind: 'part',
    given: true,
    selector: ARTICLE.spacing,
    layer: 'components',
    label: t('Article'),
    sample: prose(`<h2 style="margin:0">${text(t('Heading 2'))}</h2><p>${text(t('Paragraph'))}</p><ul><li>${text(t('List Item'))}</li><li>${text(t('List Item'))}</li></ul>`),
   
    // The space in long-form text: between its blocks, around its headings and between the items of a list.
    parts: [{ title: t('Text Spacing'), values: [proseLength('--prose-blocks', t('Blocks')), proseLength('--prose-headings', t('Above Headings')), proseLength('--prose-after-headings', t('Below Headings')), proseLength('--prose-items', t('List Items'))] }],
  },
  { id: 'h2', kind: 'part', given: true, selector: ARTICLE.h2, layer: 'components', label: t('Heading 2'), sample: prose(`<h2 style="margin:0">${text(t('Heading 2'))}</h2>`) },
  { id: 'h3', kind: 'part', given: true, selector: ARTICLE.h3, layer: 'components', label: t('Heading 3'), sample: prose(`<h3 style="margin:0">${text(t('Heading 3'))}</h3>`) },
  { id: 'p', kind: 'part', given: true, selector: ARTICLE.p, layer: 'components', label: t('Paragraph'), sample: prose(`<p style="margin:0">${text(t('Paragraph'))}</p>`) },
  { id: 'li', kind: 'part', given: true, selector: ARTICLE.li, layer: 'components', label: t('List Item'), sample: prose(`<ul><li>${text(t('List Item'))}</li></ul>`) },
  { id: 'blockquote', kind: 'part', given: true, selector: ARTICLE.blockquote, layer: 'components', label: t('Quote'), sample: prose(`<blockquote style="margin:0">${text(t('Quote'))}</blockquote>`) },
  { id: 'figure', kind: 'part', given: true, selector: ARTICLE.figure, layer: 'components', label: t('Figure'), sample: prose(`<figure style="margin:0">${text(t('Figure'))}</figure>`), groups: ['spacing', 'border', 'effects'] },
  { id: 'a', kind: 'part', given: true, selector: ARTICLE.a, layer: 'components', label: t('Link'), sample: prose(`<p><a href="#">${text(t('Link'))}</a></p>`) },
]

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
export const FORM_PARTS = (): Style[] => {
  const field = (id: string, selector: string, label: string, sample: (look: Look) => SampleNode, parts?: Part[]): Style => ({ id, kind: 'part', given: true, selector, layer: 'components', label, sample, groups: FIELD_GROUPS, states: ['aria-invalid', 'disabled', 'placeholder'], parts })
  const choice = (id: string, selector: string, label: string, kinds: ('check' | 'radio' | 'switch')[], parts?: Part[]): Style => ({
    id, kind: 'part', given: true, selector, layer: 'components', label, groups: BOX_GROUPS, states: ['checked', 'aria-invalid', 'disabled'], parts,
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
    choice('switch', FORM.switch, t('Switch'), ['switch'], [{ title: t('Track'), values: [remLength('--field-switch-width', t('Width')), remLength('--field-switch-height', t('Height')), remLength('--field-switch-border-width', t('Border'), ['px', 'rem'])] }, { title: t('Knob'), values: [color('--field-switch-knob', t('Color')), color('--field-switch-knob-on', t('Color When On')), remLength('--field-switch-inset', t('Inset'), ['px', 'rem']), { handle: '--field-switch-knob-shadow', property: '--field-switch-knob-shadow', label: t('Shadow'), field: { component: 'site-shadow' } }] }]),
    {
      id: 'option', kind: 'part', given: true, selector: FORM.option, layer: 'components', label: t('Option Text'), groups: TEXT_GROUPS,
      sample: (look) => markup(`<div style="display:grid;gap:.75rem;white-space:nowrap"><label class="cms-choice ${wear(look, true)}"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${text(t('Send me the newsletter'))}</label><label class="cms-choice ${wear(look, true)}"><input type="radio" class="cms-radio" tabindex="-1"> ${text(t('Not now'))}</label></div>`),
    },
    {
      id: 'label', kind: 'part', given: true, selector: FORM.label, layer: 'components', label: t('Label'), groups: TEXT_GROUPS,
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
    { id: 'help', kind: 'part', given: true, selector: FORM.help, layer: 'components', label: t('Help Text'), groups: TEXT_GROUPS, sample: (look) => labelled(look, 'help') },
    { id: 'error', kind: 'part', given: true, selector: FORM.error, layer: 'components', label: t('Error Message'), groups: TEXT_GROUPS, sample: (look) => labelled(look, 'error') },
  ]
}


/** A class of the site's, as a style: its name is its selector and its place. */
export const classStyle = (name: string, groups?: readonly string[]): Style => ({ id: name, kind: 'class', selector: name, layer: 'base', label: name, sample: plain(styleSample(name)), groups })

/** A style for the one element with this id: drawn as a line of text carrying it. */
export const idStyle = (selector: string, groups?: readonly string[]): Style => ({ id: selector, kind: 'id', selector, layer: 'components', label: selector, sample: plain({ tag: 'p', text: selector.slice(1), attributes: { id: selector.slice(1) } }), groups })
