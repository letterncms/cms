import { setQuery, t, useLocation } from '@letterncms/sdk'
import { Button, EmptyState, IconButton, Menu, confirm, type MenuItemDef } from '@letterncms/ui'
import { ClassesSection, ELEMENTS, Specimen, buttonLabel, styleSample, StateMenu, StylePanels, askStyleName, parseClass, screenFor, styleApi, useSpecimenSheet, useStyling, withVariants, type Device, type SampleNode, type Stylesheet } from '@letterncms/blocks'
import { useMemo, useState } from 'react'
import { Group, OpenRow, rowAction, type Editing } from './parts'

/* The site's text, its buttons and its other styles. Each is a list of Tailwind classes behind an @apply (an
   element's in `@layer base`, a style's in `@utility`), so each opens on the same editor, the one a block's
   Design tab is made of, beside a sample the site's own CSS draws. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/** What a sample of the site is drawn with: the draft's compiler and the classes of its body. */
export interface Samples {
  compiler: { build: (candidates: string[]) => string } | null
  /** The screen the page is seen at: a rule's editor styles for it, as the builder does. */
  device: Device
}

/** The classes of the page's text, for a sample's frame: what `body` applies does not reach into a shadow root by itself. */
const pageClasses = (sheet: Stylesheet) => sheet.elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? ''

/**
 * The classes of one rule, edited as a block's are: a large sample of it, the state being styled, a control for
 * everything a class can set (for the screen the preview shows) and the classes themselves.
 */
function RuleEditor({ edit, samples, label, node, classes, write, onBack, menu, groups }: { edit: Editing; samples: Samples; label: string; node: SampleNode; classes: string[]; write: (classes: string[]) => void; onBack: () => void; menu?: MenuItemDef[]; groups?: readonly string[] }) {
  const styling = useStyling()
  const [state, setState] = useState<string[]>([])
  const screen = useMemo(() => screenFor(samples.device, 1280, styling.breakpoints), [samples.device, styling.breakpoints])
  // Without the right to change the styling the controls show what is set and write nothing.
  const s = styleApi(styling.engine, classes, screen, state, edit.readOnly ? () => {} : write)
  const page = pageClasses(edit.sheet)
  const sheet = useSpecimenSheet(samples.compiler, [...splitWords(page), ...classes.map((raw) => bare(parseClass(raw).utility)), ...classes, ...splitWords(node.className ?? '')])
  return (
    // The inspector's sections bring their own gutter: they reach the column's edges, as they do in the builder.
    <div className="-mx-4 -mt-2">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={onBack} className="min-w-0 shrink !justify-start !px-2">
          <span className="truncate">{label}</span>
        </Button>
        <span className="flex-1" />
        <StateMenu classes={classes} engine={styling.engine} state={state} onState={setState} />
        {menu && menu.length > 0 && <Menu align="end" trigger={<IconButton icon="more" label={t('Style Actions')} size="xs" />} items={menu} />}
      </div>
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

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean)

/** What an element of the text is styled with. */
const TEXT_GROUPS = ['typography', 'spacing', 'fill', 'border', 'effects', 'transition'] as const

/** The elements of the site's text, in the words people use for them, and what their sample says. */
const TEXT = (): { selector: (typeof ELEMENTS)[number]; label: string; tag: string }[] => [
  { selector: 'body', label: t('Body'), tag: 'p' },
  { selector: 'h1', label: t('Heading 1'), tag: 'h1' },
  { selector: 'h2', label: t('Heading 2'), tag: 'h2' },
  { selector: 'h3', label: t('Heading 3'), tag: 'h3' },
  { selector: 'h4', label: t('Heading 4'), tag: 'h4' },
  { selector: 'h5', label: t('Heading 5'), tag: 'h5' },
  { selector: 'h6', label: t('Heading 6'), tag: 'h6' },
  { selector: 'p', label: t('Paragraph'), tag: 'p' },
  { selector: 'a', label: t('Link'), tag: 'a' },
  { selector: 'strong', label: t('Bold'), tag: 'strong' },
  { selector: 'small', label: t('Small'), tag: 'small' },
  { selector: 'blockquote', label: t('Quote'), tag: 'blockquote' },
  { selector: 'code', label: t('Code'), tag: 'code' },
  { selector: 'figcaption', label: t('Caption'), tag: 'figcaption' },
  { selector: '::selection', label: t('Selection'), tag: 'span' },
]

/**
 * The site's text: how the page's text, its headings, links and the rest look before a block says otherwise.
 * Each is shown as the site draws it; one opens on its editor in place of the list.
 */
export function Text({ edit, samples }: { edit: Editing; samples: Samples }) {
  const open = useLocation().query.element ?? ''
  const show = (selector: string | null) => setQuery({ element: selector, tab: 'text' }, false)
  const rules = edit.sheet.elements()
  const classesOf = (selector: string) => rules.find((rule) => rule.name === selector)?.classes ?? []
  const page = pageClasses(edit.sheet)
  // The selection is a highlight that can't be shown without selecting: its sample wears its classes.
  const nodeOf = (entry: ReturnType<typeof TEXT>[number]): SampleNode => (entry.selector === '::selection' ? { tag: 'span', text: entry.label, className: classesOf('::selection').join(' ') } : { tag: entry.tag, text: entry.label, ...(entry.tag === 'a' ? { attributes: { href: '#' } } : {}) })
  const sheet = useSpecimenSheet(samples.compiler, [...splitWords(page), ...classesOf('::selection')])
  const current = TEXT().find((entry) => entry.selector === open)

  if (current) {
    return (
      <RuleEditor
        key={current.selector}
        edit={edit}
        samples={samples}
        label={current.label}
        node={nodeOf(current)}
        classes={classesOf(current.selector)}
        onBack={() => show(null)}
        // Text is type, colour and the space around it: no layout of its own.
        groups={TEXT_GROUPS}
        write={(classes) => edit.change((sheet) => sheet.setElement(current.selector, classes))}
        menu={edit.readOnly || classesOf(current.selector).length === 0 ? [] : [{ label: t('Reset'), icon: 'undo', onSelect: () => edit.change((sheet) => sheet.removeElement(current.selector)) }]}
      />
    )
  }

  return (
    <Group>
      {TEXT().map((entry) => (
        <OpenRow
          key={entry.selector}
          onOpen={() => show(entry.selector)}
          sample={<Specimen sheet={sheet} node={nodeOf(entry)} page={page} mode={edit.mode} className="h-12 min-w-0 flex-1 rounded-sm" />}
          label={<span className="sr-only">{entry.label}</span>}
          menu={edit.readOnly || classesOf(entry.selector).length === 0 ? undefined : <Menu trigger={<IconButton icon="more" label={t('Actions')} size="xs" className={rowAction} />} items={[{ label: t('Reset'), icon: 'undo', onSelect: () => edit.change((sheet) => sheet.removeElement(entry.selector)) }]} />}
        />
      ))}
    </Group>
  )
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
  for (const rule of next.elements()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setElement(rule.name, classes)
  }
  return next
}

/**
 * The site's styles of one kind: its buttons (btn-*, the looks a Button block has) or its other styles. Each is
 * shown as the site draws it; one opens on its editor in place of the list, named in the address (`?style=`)
 * so the builder's Edit Style leads straight to it.
 */
function Styles({ edit, samples, buttons }: { edit: Editing; samples: Samples; buttons: boolean }) {
  const { engine } = useStyling()
  const tab = buttons ? 'buttons' : 'styles'
  const open = useLocation().query.style ?? ''
  const show = (name: string | null) => setQuery({ style: name, tab }, false)
  const all = edit.sheet.utilities()
  const rules = all.filter((rule) => /^[\w-]+$/.test(rule.name) && rule.name.startsWith('btn-') === buttons)
  const rule = rules.find((entry) => entry.name === open)
  // A style made here has nothing to apply yet, and Tailwind refuses an empty one: it is written with its first change.
  const [fresh, setFresh] = useState<string | null>(null)
  const page = pageClasses(edit.sheet)
  const nodeOf = (name: string): SampleNode => styleSample(name)
  const sheet = useSpecimenSheet(samples.compiler, [...splitWords(page), ...rules.map((entry) => entry.name)])
  const taken = all.map((entry) => entry.name)
  const ask = (title: string, label: string, current = '') => askStyleName(engine, taken, title, label, current)
  // A button's name is written without its btn-: what is asked is the look's own name.
  const named = (name: string | null) => (name && buttons && !name.startsWith('btn-') ? `btn-${name}` : name)

  const create = async () => {
    const name = named(await (buttons ? ask(t('New Button'), t('Create Button')) : ask(t('New Style'), t('Create Style'))))
    if (!name) return
    // A new button starts as a copy of the first one: a button with no look would not read as one.
    if (buttons && rules[0]) edit.change((sheet) => sheet.duplicateUtility(rules[0].name, name))
    else setFresh(name)
    show(name)
  }
  const rename = async (from: string) => {
    const name = named(await ask(t('Rename'), t('Rename'), buttons ? from.replace(/^btn-/, '') : from))
    if (name && name !== from) {
      edit.change((sheet) => renameStyle(sheet, from, name))
      if (open === from) show(name)
    }
  }
  const duplicate = async (from: string) => {
    const name = named(await ask(t('Duplicate'), t('Duplicate'), `${buttons ? from.replace(/^btn-/, '') : from}-copy`))
    if (name) edit.change((sheet) => sheet.duplicateUtility(from, name))
  }
  const remove = async (name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name: buttons ? buttonLabel(name) : name }), confirm: t('Delete'), danger: true }))) return
    edit.change((sheet) => sheet.removeUtility(name))
    if (open === name) show(null)
  }
  const menu = (name: string): MenuItemDef[] => (edit.readOnly ? [] : [
    { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(name) },
    { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(name) },
    { separator: true, label: '' },
    { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => void remove(name) },
  ])

  if (open && (rule || open === fresh)) {
    return (
      <RuleEditor
        key={open}
        edit={edit}
        samples={samples}
        label={buttons ? buttonLabel(open) : open}
        node={nodeOf(open)}
        classes={rule?.classes ?? []}
        onBack={() => show(null)}
        menu={menu(open)}
        // With nothing left to apply the style goes, unless it holds CSS of its own.
        write={(classes) => edit.change((sheet) => (classes.length > 0 || sheet.utilities().find((entry) => entry.name === open)?.custom ? sheet.setUtility(open, classes) : sheet.removeUtility(open)))}
      />
    )
  }

  const addLabel = buttons ? t('New Button') : t('New Style')
  if (rules.length === 0) return <EmptyState compact icon={buttons ? 'button' : 'symbol'} title={buttons ? t('No buttons') : t('No styles')} action={edit.readOnly ? undefined : <Button icon="plus" onClick={() => void create()}>{addLabel}</Button>} />
  return (
    <Group onAdd={edit.readOnly ? undefined : () => void create()} addLabel={addLabel}>
      {rules.map((entry) => (
        <OpenRow
          key={entry.name}
          onOpen={() => show(entry.name)}
          sample={<Specimen sheet={sheet} node={nodeOf(entry.name)} page={page} mode={edit.mode} className="h-14 min-w-0 flex-1 rounded-sm" />}
          label={<span className="sr-only">{buttons ? buttonLabel(entry.name) : entry.name}</span>}
          menu={edit.readOnly ? undefined : <Menu trigger={<IconButton icon="more" label={t('Style Actions')} size="xs" className={rowAction} />} items={menu(entry.name)} />}
        />
      ))}
    </Group>
  )
}

export function Buttons(props: { edit: Editing; samples: Samples }) {
  return <Styles {...props} buttons />
}

export function SavedStyles(props: { edit: Editing; samples: Samples }) {
  return <Styles {...props} buttons={false} />
}

