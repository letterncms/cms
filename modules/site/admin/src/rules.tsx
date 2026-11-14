import { setQuery, t, useLocation } from '@letterncms/sdk'
import { Button, EmptyState, IconButton, Menu, confirm, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { ClassText, LayerBar, StylePanels, lightDark, parseClass, styleApi, useStyling, withVariants, type Engine, type Stylesheet, type StyleRule } from '@letterncms/blocks'
import { useMemo, useState, type CSSProperties } from 'react'
import { Group, OpenRow, rowAction, type Editing } from './parts'

/* The site's own classes and its element styles: both are a list of Tailwind classes behind an @apply, so
   both open on the same editor, the one a block's Design tab is made of. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/**
 * The classes of one rule, edited as a block's are: the layer (a screen size and a state, which are variants
 * inside the same @apply), the list as text, and a control for everything a class can set.
 */
function RuleEditor({ label, mono, classes, write, onBack, readOnly }: { label: string; mono?: boolean; classes: string[]; write: (classes: string[]) => void; onBack: () => void; readOnly: boolean }) {
  const styling = useStyling()
  const [breakpoint, setBreakpoint] = useState('')
  const [state, setState] = useState<string[]>([])
  const names = useMemo(() => styling.breakpoints.map((size) => size.name), [styling.breakpoints])
  // Without the right to change the styling the controls show what is set and write nothing.
  const s = styleApi(styling.engine, classes, names, breakpoint, state, readOnly ? () => {} : write)
  return (
    // The inspector's sections bring their own gutter: they reach the column's edges, as they do in the builder.
    <div className="-mx-4 -mt-2">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={onBack} className="min-w-0 shrink !justify-start !px-2">
          <span className={mono ? 'truncate font-mono' : 'truncate'}>{label}</span>
        </Button>
      </div>
      <LayerBar classes={classes} engine={styling.engine} breakpoints={styling.breakpoints} breakpoint={breakpoint} state={state} onBreakpoint={setBreakpoint} onState={setState} />
      <div className="border-b border-border px-4 py-3">
        <ClassText s={s} disabled={readOnly} />
      </div>
      {/* Read only, the controls show what is set and take no input. */}
      <div inert={readOnly}>
        <StylePanels s={s} />
      </div>
    </div>
  )
}

/** A class name as the stylesheet takes it. */
const className = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')

async function askClass(sheet: Stylesheet, engine: Engine | null, title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'card', mono: true, required: true, autofocus: true }], values: { name: current }, confirm: confirmLabel })
  const name = className(asked?.name)
  if (!name || name === current) return null
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    toast.error(t('A class name is lowercase letters, numbers and hyphens, and starts with a letter.'))
    return null
  }
  // A name Tailwind has (flex, card-title of the site) would be two classes under one name.
  if (sheet.utilities().some((rule) => rule.name === name) || engine?.valid(name)) {
    toast.error(t('There is already a class “{name}”.', { name }))
    return null
  }
  return name
}

/** A class under another name, and under that name wherever the stylesheet itself applies it. */
function renameClass(sheet: Stylesheet, from: string, to: string): Stylesheet {
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
 * The site's own classes, a plain list. One opens on its editor in place of the list; which one is in the
 * address (`?class=card`), so the builder's Edit Class leads straight to it.
 */
export function Classes({ edit }: { edit: Editing }) {
  const { engine } = useStyling()
  const open = useLocation().query.class ?? ''
  // Back from a class is back to this list, also for whoever came by a link that named only the class.
  const show = (name: string | null) => setQuery({ class: name, tab: 'classes' }, false)
  const rules = edit.sheet.utilities()
  const rule = rules.find((entry) => entry.name === open)
  // A class made here has nothing to apply yet, and Tailwind refuses an empty one: it is written with its first style.
  const [fresh, setFresh] = useState<string | null>(null)

  if (open && (rule || open === fresh)) {
    return (
      <RuleEditor
        key={open}
        label={open}
        mono
        classes={rule?.classes ?? []}
        readOnly={edit.readOnly}
        onBack={() => show(null)}
        // With nothing left to apply the class goes, unless it holds CSS of its own.
        write={(classes) => edit.change((sheet) => (classes.length > 0 || sheet.utilities().find((entry) => entry.name === open)?.custom ? sheet.setUtility(open, classes) : sheet.removeUtility(open)))}
      />
    )
  }

  const create = async () => {
    const name = await askClass(edit.sheet, engine, t('New Class'), t('Create Class'))
    if (!name) return
    setFresh(name)
    show(name)
  }
  const rename = async (from: string) => {
    const name = await askClass(edit.sheet, engine, t('Rename Class'), t('Rename'), from)
    if (name) edit.change((sheet) => renameClass(sheet, from, name))
  }
  const duplicate = async (from: string) => {
    const name = await askClass(edit.sheet, engine, t('Duplicate Class'), t('Duplicate Class'), `${from}-copy`)
    if (name) edit.change((sheet) => sheet.duplicateUtility(from, name))
  }
  const remove = async (name: string) => {
    if (await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete'), danger: true })) edit.change((sheet) => sheet.removeUtility(name))
  }
  const menu = (name: string): MenuItemDef[] => [
    { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(name) },
    { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(name) },
    { separator: true, label: '' },
    { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => void remove(name) },
  ]

  if (rules.length === 0) return <EmptyState compact icon="symbol" title={t('No classes')} action={edit.readOnly ? undefined : <Button icon="plus" onClick={() => void create()}>{t('New Class')}</Button>} />
  return (
    <Group onAdd={edit.readOnly ? undefined : () => void create()} addLabel={t('New Class')}>
      {rules.map((entry) => (
        <OpenRow
          key={entry.name}
          onOpen={() => show(entry.name)}
          label={<span className="font-mono">{entry.name}</span>}
          summary={entry.classes.join(' ')}
          menu={edit.readOnly ? undefined : <Menu trigger={<IconButton icon="more" label={t('Class Actions')} size="xs" className={rowAction} />} items={menu(entry.name)} />}
        />
      ))}
    </Group>
  )
}

/** The elements every site has, in the words people use for them. */
const ELEMENTS = (): [string, string][] => [
  ['body', t('Page')], ['h1', t('Heading 1')], ['h2', t('Heading 2')], ['h3', t('Heading 3')], ['h4', t('Heading 4')], ['h5', t('Heading 5')], ['h6', t('Heading 6')],
  ['p', t('Paragraph')], ['a', t('Link')], ['small', t('Small Text')], ['blockquote', t('Quote')], ['code', t('Code')], ['::selection', t('Selection')],
]

/** What a sample shows of an element's style: how its text looks. Its size and its box stay the row's. */
const SAMPLE: [keyof CSSProperties, string][] = [['fontFamily', 'fontFamily'], ['fontWeight', 'fontWeight'], ['fontStyle', 'fontStyle'], ['letterSpacing', 'letterSpacing'], ['textTransform', 'textTransform'], ['textDecorationLine', 'textDecorationLine'], ['color', 'color'], ['backgroundColor', 'backgroundColor']]

/** A value as the browser can draw it here: the theme's variables worked out, and the side of light-dark() the preview shows. */
function drawn(engine: Engine, value: string, mode: 'light' | 'dark'): string | undefined {
  const sides = lightDark(engine.resolve(value))
  const side = mode === 'dark' ? sides.dark ?? sides.light : sides.light
  return side.includes('var(') ? undefined : side
}

function sampleStyle(engine: Engine | null, classes: string[], mode: 'light' | 'dark'): CSSProperties {
  if (!engine) return {}
  const s = styleApi(engine, classes, [], '', [], () => {})
  const style: Record<string, string> = {}
  for (const [property, key] of SAMPLE) {
    const value = s.value(key)
    const shown = value === undefined ? undefined : drawn(engine, value, mode)
    if (shown !== undefined) style[property] = shown
  }
  return style
}

/** Whether a selector is one CSS can read, and one rule's worth: no braces, no at-rule, no list of statements. */
function validSelector(selector: string): boolean {
  if (!selector || /[{};@]/.test(selector)) return false
  try {
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}

/**
 * What elements look like before a block says otherwise: the rules of `@layer base`. The elements every site
 * has are always listed, styled or not; any other selector the stylesheet styles follows them.
 */
export function Elements({ edit }: { edit: Editing }) {
  const { engine } = useStyling()
  const [open, setOpen] = useState<string | null>(null)
  const rules = edit.sheet.elements()
  const known = ELEMENTS()
  const labels = new Map(known)
  const classesOf = (selector: string) => rules.find((entry) => entry.name === selector)?.classes ?? []
  // A rule that applies nothing (`:root { color-scheme: … }`) has nothing these controls could show.
  const others = rules.filter((entry: StyleRule) => !labels.has(entry.name) && entry.classes.length > 0).map((entry) => entry.name)

  if (open !== null) {
    return <RuleEditor key={open} label={labels.get(open) ?? open} mono={!labels.has(open)} classes={classesOf(open)} readOnly={edit.readOnly} onBack={() => setOpen(null)} write={(classes) => edit.change((sheet) => sheet.setElement(open, classes))} />
  }

  const add = async () => {
    const asked = await prompt({ title: t('Add Element'), fields: [{ handle: 'selector', type: 'text', label: t('Selector'), placeholder: 'figcaption', mono: true, required: true, autofocus: true }], confirm: t('Add Element') })
    const selector = String(asked?.selector ?? '').trim().replace(/\s+/g, ' ')
    if (!selector) return
    if (!validSelector(selector)) return void toast.error(t('“{selector}” is not a selector CSS can read.', { selector }))
    setOpen(selector)
  }
  const page = { background: engine ? drawn(engine, 'var(--color-background)', edit.mode) : undefined, color: engine ? drawn(engine, 'var(--color-foreground)', edit.mode) : undefined }
  const row = (selector: string) => {
    const classes = classesOf(selector)
    const label = labels.get(selector)
    return (
      <OpenRow
        key={selector}
        onOpen={() => setOpen(selector)}
        // A sample on the site's own background, in the site's text colour unless the element sets its own.
        sample={(
          <span aria-hidden="true" className="grid h-6 w-9 shrink-0 place-items-center overflow-hidden rounded-xs border border-border" style={page}>
            <span className="px-0.5 text-base leading-tight" style={sampleStyle(engine, classes, edit.mode)}>Aa</span>
          </span>
        )}
        label={label ?? <span className="font-mono">{selector}</span>}
        summary={classes.join(' ')}
        menu={edit.readOnly || classes.length === 0 ? undefined : <Menu trigger={<IconButton icon="more" label={t('Element Actions')} size="xs" className={rowAction} />} items={[{ label: t('Clear Styles'), icon: 'trash', danger: true, onSelect: () => edit.change((sheet) => sheet.setElement(selector, [])) }]} />}
      />
    )
  }
  return (
    <Group onAdd={edit.readOnly ? undefined : () => void add()} addLabel={t('Add Element')}>
      {known.map(([selector]) => row(selector))}
      {others.map(row)}
    </Group>
  )
}
