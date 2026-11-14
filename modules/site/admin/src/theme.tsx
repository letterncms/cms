import { t, type FieldDef } from '@letterncms/sdk'
import { Button, EmptyState, Icon, IconButton, NEW_COLOR, Switch, Tooltip, cn, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { lightDark, parseClass, tokensOf, useStyling, withVariants, type Engine, type Stylesheet } from '@letterncms/blocks'
import type { ReactNode } from 'react'
import { familyOf, fallbackOf, fontStack, stackFor, type Fallback, type SiteFont } from './fields'
import { Control, Group, Setting, TokenRow, px, type Editing } from './parts'

/* The theme sections of the Styling page: the site's own `@theme` variables, kind by kind. Each row is one
   variable of the stylesheet, changed where it stands; a kind the site has none of says so and offers the first. */

export interface Face {
  family: string
  src: string
  weight?: string | number
  style?: string
  preload?: boolean
  fallback?: string | string[]
}

export interface Transition {
  type: 'none' | 'fade' | 'slide' | 'scale'
  duration: number
  navigation: 'document' | 'client'
}

/** The fonts the site serves, and what is done with them at once: they are files of the site. */
export interface FontTools {
  faces: Face[]
  add: (kind: string) => Promise<{ family: string; fallback: boolean } | null>
  remove: (family: string) => void
  preload: (family: string, on: boolean) => void
}

interface Own {
  /** --color-primary */
  name: string
  /** primary */
  key: string
  value: string
}

/** The site's own variables of one kind, in the order they stand: --text-lg, not --text-lg--line-height and not --text-*. */
function own(sheet: Stylesheet, prefix: string): Own[] {
  const found = new Map<string, Own>()
  for (const variable of sheet.variables()) {
    if (!variable.name.startsWith(prefix)) continue
    const key = variable.name.slice(prefix.length)
    if (key === '' || key === '*' || key.includes('--') || (prefix === '--font-' && key.startsWith('weight-'))) continue
    found.set(variable.name, { name: variable.name, key, value: variable.value })
  }
  return [...found.values()]
}

/** A name as a variable takes it: lowercase letters, numbers and hyphens. */
const clean = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')

async function askName(sheet: Stylesheet, prefix: string, title: string, confirm: string, current = '', placeholder = 'md'): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, required: true, placeholder }], values: { name: current }, confirm })
  const next = clean(asked?.name)
  if (!next || next === current) return null
  if (sheet.variable(`${prefix}${next}`) !== undefined) {
    toast.error(t('“{name}” already exists', { name: next }))
    return null
  }
  return next
}

/**
 * A variable under another name, and the classes the stylesheet itself applies it with: `bg-primary` in an
 * @apply becomes `bg-brand`. Only a class that reads exactly this variable is rewritten.
 */
function rename(sheet: Stylesheet, engine: Engine | null, from: Own, key: string): Stylesheet {
  const to = from.name.slice(0, from.name.length - from.key.length) + key
  const pattern = new RegExp(`^(!?.*-)${from.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}((?:/[^!]+)?!?)$`)
  const swap = (raw: string): string => {
    const { variants, utility } = parseClass(raw)
    const match = pattern.exec(utility)
    if (!match || !engine?.declarations(utility.replace(/^!|!$/g, ''))?.some((declaration) => declaration.value.includes(`var(${from.name})`))) return raw
    return withVariants(variants, `${match[1]}${key}${match[2]}`)
  }
  let next = sheet
  for (const rule of sheet.utilities()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setUtility(rule.name, classes)
  }
  for (const rule of sheet.elements()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setElement(rule.name, classes)
  }
  return next.renameVariable(from.name, to)
}

interface Kind {
  prefix: string
  title: string
  /** What the button says ("Add Radius"), what its dialog is called ("New Radius") and what an empty group says. */
  add: string
  fresh: string
  none: string
  icon: string
  /** What a new one starts as, and a name to suggest. */
  start: string
  placeholder?: string
}

/** What a row's menu offers: Rename and Delete, after anything of the row's own. */
function useRowMenu(edit: Editing, kind: Kind) {
  const { engine } = useStyling()
  return (variable: Own, extra: MenuItemDef[] = []): MenuItemDef[] => (edit.readOnly ? [] : [
    {
      label: t('Rename…'), icon: 'edit', onSelect: async () => {
        const key = await askName(edit.sheet, kind.prefix, t('Rename'), t('Rename'), variable.key, kind.placeholder)
        if (key) edit.change((sheet) => rename(sheet, engine, variable, key))
      },
    },
    ...extra,
    { separator: true, label: '' },
    // What belongs to it goes with it: a text size's line height.
    { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => edit.change((sheet) => sheet.variables().filter((other) => other.name === variable.name || other.name.startsWith(`${variable.name}--`)).reduce((next, other) => next.setVariable(other.name, null), sheet)) },
  ])
}

const addTo = (edit: Editing, kind: Kind) => async () => {
  const key = await askName(edit.sheet, kind.prefix, kind.fresh, kind.add, '', kind.placeholder)
  if (key) edit.change((sheet) => sheet.setVariable(`${kind.prefix}${key}`, kind.start))
}

/** The site's variables of one kind as rows; with none, the kit's empty state and the way to add the first. */
function Tokens({ edit, kind, row }: { edit: Editing; kind: Kind; row: (variable: Own, set: (value: string | null) => void, menu: (extra?: MenuItemDef[]) => MenuItemDef[]) => ReactNode }) {
  const menu = useRowMenu(edit, kind)
  const rows = own(edit.sheet, kind.prefix)
  const add = addTo(edit, kind)
  return (
    <Group title={kind.title} onAdd={!edit.readOnly && rows.length > 0 ? () => void add() : undefined} addLabel={kind.add}>
      {rows.length === 0 && <EmptyState compact icon={kind.icon} title={kind.none} action={edit.readOnly ? undefined : <Button icon="plus" onClick={() => void add()}>{kind.add}</Button>} />}
      {/* A value taken out of its control keeps what it was: a variable without a value is no CSS. */}
      {rows.map((variable) => row(variable, (value) => value !== null && edit.change((sheet) => sheet.setVariable(variable.name, value)), (extra) => menu(variable, extra)))}
    </Group>
  )
}

/** The inspector's value control: a number with its unit. */
const number = (unit: string, extra: Partial<FieldDef> = {}): Partial<FieldDef> => ({ component: 'blocks-value', unit, ...extra })
const LENGTH = number('rem', { units: ['rem', 'px', 'em', '%', 'vw'], step: 0.125 })

/** A length as a bar, relative to the largest in its group. */
function Bar({ value, of }: { value: string; of: Own[] }) {
  const max = Math.max(...of.map((variable) => px(variable.value)), 1)
  if (px(value) <= 0) return null
  return <span className="h-1.5 min-w-px rounded-full bg-border-strong" style={{ width: `${(px(value) / max) * 100}%` }} />
}

/** The width of a colour column (light, dark). */
const COLOR = 'w-[108px] shrink-0 max-sm:order-3 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1 max-sm:basis-[40%]'

/**
 * The site's colours. Dark mode is the stylesheet saying `color-scheme: light dark`: a colour then has a second
 * value, written light-dark(a, b). Tailwind's palette stays beside the site's colours until it is turned off.
 */
export function Colors({ edit }: { edit: Editing }) {
  const kind: Kind = { prefix: '--color-', title: t('Colors'), add: t('Add Color'), fresh: t('New Color'), none: t('No colors'), icon: 'palette', start: NEW_COLOR, placeholder: 'brand' }
  const menu = useRowMenu(edit, kind)
  const rows = own(edit.sheet, kind.prefix)
  const add = addTo(edit, kind)
  const palette = edit.sheet.variable('--color-*') !== 'initial'
  const write = (variable: Own, light: string, dark: string | undefined) => edit.change((sheet) => sheet.setVariable(variable.name, dark && dark !== light ? `light-dark(${light}, ${dark})` : light))
  return (
    <>
      <Group>
        <Setting label={t('Dark Mode')}>
          <Switch size="sm" aria-label={t('Dark Mode')} checked={edit.dark} disabled={edit.readOnly} onChange={(on) => edit.change((sheet) => sheet.setProperty(':root', 'color-scheme', on ? 'light dark' : null))} />
        </Setting>
      </Group>
      <Group>
        {/* The list's column heads are its head, with the way to add where each row has its menu. */}
        <div className="flex min-h-9 items-center gap-2 border-b border-border text-2xs text-faint max-sm:flex-wrap max-sm:py-1">
          <span className="min-w-0 flex-1 max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]">{t('Name')}</span>
          {edit.dark && <span className={cn(COLOR, 'flex items-center gap-1')}><Icon name="sun" size={11} />{t('Light')}</span>}
          {edit.dark && <span className={cn(COLOR, 'flex items-center gap-1')}><Icon name="moon" size={11} />{t('Dark')}</span>}
          {!edit.dark && <span className={COLOR}>{t('Value')}</span>}
          {edit.readOnly || rows.length === 0 ? <span className="size-6 shrink-0 max-sm:order-2" /> : (
            <Tooltip content={kind.add}>
              <IconButton icon="plus" label={kind.add} title={undefined} size="xs" className="shrink-0 max-sm:order-2" onClick={() => void add()} />
            </Tooltip>
          )}
        </div>
        {rows.length === 0 && <EmptyState compact icon={kind.icon} title={kind.none} action={edit.readOnly ? undefined : <Button icon="plus" onClick={() => void add()}>{kind.add}</Button>} />}
        {rows.map((variable) => {
          const { light, dark } = lightDark(variable.value)
          return (
            <TokenRow key={variable.name} name={variable.key} wide menu={menu(variable)}>
              <div className={COLOR}><Control handle={`${variable.name}:light`} label={edit.dark ? t('{name} in Light Mode', { name: variable.key }) : variable.key} value={light} disabled={edit.readOnly} field={{ type: 'color', component: 'blocks-color' }} onChange={(value) => value && write(variable, value, dark)} /></div>
              {edit.dark && <div className={COLOR}><Control handle={`${variable.name}:dark`} label={t('{name} in Dark Mode', { name: variable.key })} value={dark ?? null} disabled={edit.readOnly} field={{ type: 'color', component: 'blocks-color', placeholder: t('Same'), swatch: light }} onChange={(value) => write(variable, light, value ?? undefined)} /></div>}
            </TokenRow>
          )
        })}
      </Group>
      <Group>
        <Setting label={t('Tailwind Palette')}>
          {/* Off, the stylesheet clears Tailwind's colours before its own, so only the site's exist. */}
          <Switch size="sm" aria-label={t('Tailwind Palette')} checked={palette} disabled={edit.readOnly} onChange={(on) => edit.change((sheet) => sheet.setVariable('--color-*', on ? null : 'initial', 'first'))} />
        </Setting>
      </Group>
    </>
  )
}

/** The weights a family's files cover, short: 400, 400–700, 100–900; and Italic when it has italics. */
function styles(files: Face[]): string {
  const weights = files.flatMap((font) => String(font.weight ?? '400').split(/\s+/).map(Number)).filter((n) => n > 0)
  const low = Math.min(...weights)
  const high = Math.max(...weights)
  const range = weights.length === 0 ? '400' : low === high ? String(low) : `${low}–${high}`
  return files.some((font) => font.style === 'italic') ? `${range} · ${t('Italic')}` : range
}

/** The fonts of the theme (sans, display, mono…), each picking, or adding, the font it uses; then the scales of type. */
export function Typography({ edit, fonts }: { edit: Editing; fonts: FontTools }) {
  const families = [...new Set(fonts.faces.map((font) => font.family))]
  const used = new Set(own(edit.sheet, '--font-').map((variable) => familyOf(fontStack(variable.value))))
  const served: SiteFont[] = families.map((family) => {
    const files = fonts.faces.filter((font) => font.family === family)
    return { family, styles: styles(files), fallback: files.some((font) => (Array.isArray(font.fallback) ? font.fallback.length > 0 : !!font.fallback)), used: used.has(family) }
  })
  const system = stackFor('', 'sans', false)
  const display = edit.sheet.variable('--font-display') ?? own(edit.sheet, '--font-')[0]?.value
  const fallbacks = (): [Fallback, string][] => [['sans', t('Sans')], ['serif', t('Serif')], ['mono', t('Mono')]]
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--font-', title: t('Fonts'), add: t('Add Font Family'), fresh: t('New Font Family'), none: t('No fonts'), icon: 'typography', start: system, placeholder: 'display' }}
        row={(variable, set, menu) => {
          const stack = fontStack(variable.value)
          const family = familyOf(stack)
          const files = fonts.faces.filter((font) => font.family === family)
          const preloaded = files.some((font) => font.preload)
          return (
            <TokenRow
              key={variable.name}
              name={variable.key}
              sample={<span className="block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink" style={{ fontFamily: variable.value }}>Aa</span>}
              menu={menu([
                { separator: true, label: '' },
                { heading: true, label: t('Fallback') },
                ...fallbacks().map(([value, label]) => ({ label, checked: fallbackOf(stack) === value, onSelect: () => set(stackFor(family, value, stack.includes(`${family} Fallback`))) })),
                // A font the first screen is written in is fetched with the page instead of when the CSS asks for it.
                ...(files.length ? [{ separator: true, label: '' }, { label: t('Preload'), checked: preloaded, onSelect: () => fonts.preload(family, !preloaded) }] : []),
              ])}
            >
              <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={{ component: 'site-font-stack', fonts: served, ...(edit.readOnly ? {} : { onAdd: fonts.add, onRemove: fonts.remove }) }} onChange={set} />
            </TokenRow>
          )
        }}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--text-', title: t('Text Sizes'), add: t('Add Text Size'), fresh: t('New Text Size'), none: t('No text sizes'), icon: 'typography', start: '1.25rem', placeholder: 'lead' }}
        row={(variable, set, menu) => {
          const leading = `${variable.name}--line-height`
          return (
            <TokenRow
              key={variable.name}
              name={variable.key}
              menu={menu()}
              // The sample is the size itself, up to what the column can show.
              below={<p className="m-0 truncate pb-2.5 text-ink" style={{ fontSize: `min(${variable.value}, 3rem)`, lineHeight: 1.1, fontFamily: display }}>{t('Ship It')}</p>}
            >
              <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={LENGTH} onChange={set} />
              <Control handle={leading} label={t('Line Height of {name}', { name: variable.key })} value={edit.sheet.variable(leading) ?? null} disabled={edit.readOnly} className="!flex-none w-20" field={number('', { step: 0.05, min: 0, placeholder: '–' })} onChange={(value) => edit.change((sheet) => sheet.setVariable(leading, value))} />
            </TokenRow>
          )
        }}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--font-weight-', title: t('Weights'), add: t('Add Weight'), fresh: t('New Weight'), none: t('No weights'), icon: 'typography', start: '600', placeholder: 'strong' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()} sample={<span className="text-base text-ink" style={{ fontWeight: Number(variable.value) || 400 }}>Ag</span>}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={number('', { step: 100, min: 100, max: 900 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--leading-', title: t('Line Heights'), add: t('Add Line Height'), fresh: t('New Line Height'), none: t('No line heights'), icon: 'typography', start: '1.5', placeholder: 'relaxed' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()} sample={<span className="flex w-4 flex-col" style={{ gap: `${Math.max(1, (Number(variable.value) - 0.8) * 6)}px` }}>{[0, 1, 2].map((i) => <span key={i} className={cn('h-0.5 rounded-full bg-muted', i === 2 && 'w-2/3')} />)}</span>}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={number('', { step: 0.05, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--tracking-', title: t('Letter Spacing'), add: t('Add Letter Spacing'), fresh: t('New Letter Spacing'), none: t('No letter spacing'), icon: 'typography', start: '0em', placeholder: 'wide' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()} sample={<span className="text-xs font-medium text-ink" style={{ letterSpacing: variable.value }}>Aa</span>}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={number('em', { units: ['em', 'px'], step: 0.005 })} onChange={set} />
          </TokenRow>
        )}
      />
    </>
  )
}

/** Tailwind's own screen sizes: rows that are always there, and a value of the site's replaces one. */
const SCREENS = ['sm', 'md', 'lg', 'xl', '2xl']

/** The unit every step of spacing is a multiple of, the spaces with a name, the widths of containers and the screen sizes. */
export function Layout({ edit }: { edit: Editing }) {
  const { engine } = useStyling()
  const spacing: Kind = { prefix: '--spacing-', title: t('Spacing'), add: t('Add Spacing'), fresh: t('New Spacing'), none: t('No named spacing'), icon: 'spacing', start: '2rem', placeholder: 'gutter' }
  const container: Kind = { prefix: '--container-', title: t('Containers'), add: t('Add Container'), fresh: t('New Container'), none: t('No containers'), icon: 'ruler', start: '72rem', placeholder: 'content' }
  const breakpoint: Kind = { prefix: '--breakpoint-', title: t('Breakpoints'), add: t('Add Breakpoint'), fresh: t('New Breakpoint'), none: '', icon: 'desktop', start: '120rem', placeholder: '3xl' }
  const menu = useRowMenu(edit, breakpoint)
  const mine = own(edit.sheet, breakpoint.prefix)
  // Tailwind's sizes as the theme has them, then what the site wrote: the draft's own value is the one on screen.
  const screens = new Map<string, Own>(tokensOf(engine).of('breakpoint').filter((token) => SCREENS.includes(token.name)).map((token) => [token.variable, { name: token.variable, key: token.name, value: token.value }]))
  for (const variable of mine) screens.set(variable.name, variable)
  const sizes = [...screens.values()].sort((a, b) => px(a.value) - px(b.value))
  const add = addTo(edit, breakpoint)
  const lengths = (kind: Kind) => (variable: Own, set: (value: string | null) => void, rowMenu: (extra?: MenuItemDef[]) => MenuItemDef[]) => (
    <TokenRow key={variable.name} name={variable.key} menu={rowMenu()} after={<Bar value={variable.value} of={own(edit.sheet, kind.prefix)} />}>
      <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={LENGTH} onChange={set} />
    </TokenRow>
  )
  return (
    <>
      <Group>
        <Setting label={t('Spacing Unit')}>
          <Control handle="--spacing" label={t('Spacing Unit')} value={edit.sheet.variable('--spacing') ?? null} disabled={edit.readOnly} field={number('rem', { units: ['rem', 'px'], step: 0.0625, min: 0, placeholder: '0.25rem' })} onChange={(value) => edit.change((sheet) => sheet.setVariable('--spacing', value))} />
        </Setting>
      </Group>
      <Tokens edit={edit} kind={spacing} row={lengths(spacing)} />
      <Tokens edit={edit} kind={container} row={lengths(container)} />
      <Group title={breakpoint.title} onAdd={edit.readOnly ? undefined : () => void add()} addLabel={breakpoint.add}>
        {sizes.map((variable) => {
          const written = mine.some((other) => other.name === variable.name)
          const reset: MenuItemDef[] = written && !edit.readOnly ? [{ label: t('Reset'), icon: 'undo', onSelect: () => edit.change((sheet) => sheet.setVariable(variable.name, null)) }] : []
          return (
            // One of Tailwind's sizes keeps its name and goes back to Tailwind's value; a size of the site's own is renamed and deleted like any value.
            <TokenRow key={variable.name} name={variable.key} menu={SCREENS.includes(variable.key) ? reset : menu(variable)} after={<Bar value={variable.value} of={sizes} />}>
              <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={number('rem', { units: ['rem', 'px', 'em'], min: 0 })} onChange={(value) => value !== null && edit.change((sheet) => sheet.setVariable(variable.name, value))} />
            </TokenRow>
          )
        })}
      </Group>
    </>
  )
}

/** Corners and shadows. */
export function Shape({ edit }: { edit: Editing }) {
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--radius-', title: t('Radius'), add: t('Add Radius'), fresh: t('New Radius'), none: t('No radius'), icon: 'radius', start: '0.5rem', placeholder: 'card' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()} sample={<span className="size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted" style={{ borderTopLeftRadius: `min(${variable.value}, 20px)` }} />}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={number('rem', { units: ['rem', 'px', '%'], step: 0.125, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--shadow-', title: t('Shadows'), add: t('Add Shadow'), fresh: t('New Shadow'), none: t('No shadows'), icon: 'layers', start: '0 4px 16px -4px rgb(0 0 0 / 0.12)', placeholder: 'card' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()} sample={<span className="size-5 shrink-0 rounded-xs border border-border bg-bg" style={{ boxShadow: variable.value }} />}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={{ component: 'site-shadow' }} onChange={set} />
          </TokenRow>
        )}
      />
    </>
  )
}

/** A duration typed in the inspector's control (`250ms`, `0.3s`) in seconds, as the page transition stores it. */
function seconds(value: unknown, fallback: number): number {
  const m = String(value ?? '').trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/)
  if (!m) return fallback
  const n = m[2] === 's' ? Number(m[1]) : Number(m[1]) / 1000
  return Math.min(2, Math.max(0.05, Math.round(n * 1000) / 1000))
}

/** The easing curves of the theme, and how one page gives way to the next. */
export function Motion({ edit, transition, onTransition }: { edit: Editing; transition: Transition; onTransition: (transition: Transition) => void }) {
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--ease-', title: t('Easings'), add: t('Add Easing'), fresh: t('New Easing'), none: t('No easings'), icon: 'speed', start: 'cubic-bezier(0.2, 0.8, 0.2, 1)', placeholder: 'out' }}
        row={(variable, set, menu) => (
          <TokenRow key={variable.name} name={variable.key} menu={menu()}>
            <Control handle={variable.name} label={variable.key} value={variable.value} disabled={edit.readOnly} field={{ component: 'ease' }} onChange={set} />
          </TokenRow>
        )}
      />
      <Group title={t('Page Transition')}>
        <Setting label={t('Effect')}>
          <Control handle="type" label={t('Effect')} value={transition.type} disabled={edit.readOnly} field={{ type: 'select', mono: false, required: true, options: { none: t('None'), fade: t('Fade'), slide: t('Slide'), scale: t('Scale') } }} onChange={(value) => onTransition({ ...transition, type: (value ?? 'none') as Transition['type'] })} />
        </Setting>
        {transition.type !== 'none' && (
          <Setting label={t('Duration')}>
            <Control handle="duration" label={t('Duration')} value={`${Math.round(transition.duration * 1000)}ms`} disabled={edit.readOnly} field={number('ms', { units: ['ms'], step: 10, min: 50, max: 2000 })} onChange={(value) => onTransition({ ...transition, duration: seconds(value, transition.duration) })} />
          </Setting>
        )}
        <Setting label={t('Page Loads')}>
          <Control handle="navigation" label={t('Page Loads')} value={transition.navigation} disabled={edit.readOnly} field={{ type: 'select', mono: false, required: true, options: { document: t('Full Page'), client: t('Instant') } }} onChange={(value) => onTransition({ ...transition, navigation: value === 'client' ? 'client' : 'document' })} />
        </Setting>
      </Group>
    </>
  )
}
