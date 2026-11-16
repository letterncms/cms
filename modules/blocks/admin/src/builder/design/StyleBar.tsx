import { can, invalidate, navigate, run, t } from '@letterncms/sdk'
import { Button, Icon, IconButton, Menu, NoMatches, Popover, Pressable, Tooltip, cn, copyText, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { parseClass, screenVariant, withVariants, type Engine } from '../../../../tailwind/engine'
import { Stylesheet } from '../../../../tailwind/stylesheet'
import { loadCompiler, type StylingSource } from '../../core/styling'
import { SCHEME, SchemeTile, schemesOf, type Scheme } from '../palette'
import { Specimen, styleLabel, styleSample, useSpecimenSheet } from '../specimen'
import { lightDark, splitSiteClasses, usedVariants } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { ClassChips } from './Classes'

/* The top of the Design tab, one bar: the styles of the site the element wears, its classes as written, and the
   state being styled. A style is a look the site keeps under a name (a class of its stylesheet): the same on
   every element that wears it, and changed in one place, under Design › Styles. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

const BASE_STATES = () => [
  { value: '', label: t('Default') },
  { value: 'hover', label: t('Hover') },
  { value: 'active', label: t('Pressed') },
  { value: 'focus-visible', label: t('Focus') },
]

const MORE_STATES = () => [
  { value: 'before', label: t('Before') },
  { value: 'after', label: t('After') },
  { value: 'placeholder', label: t('Placeholder') },
  { value: 'first', label: t('First Item') },
  { value: 'last', label: t('Last Item') },
  { value: 'odd', label: t('Odd Items') },
  { value: 'even', label: t('Even Items') },
  { value: 'current', label: t('Current Page') },
  { value: 'group-hover', label: t('Hover on Group') },
  { value: 'dark', label: t('Dark Mode') },
  { value: 'open', label: t('When Open') },
]

/** What a state is called: its own name, "open" for data-open, "in open" for a state of a block around it. */
export function stateLabel(value: string): string {
  if (value === '') return t('Default')
  const known = [...BASE_STATES(), ...MORE_STATES()].find((item) => item.value === value)
  if (known) return known.label
  if (value.startsWith('in-data-')) return t('in {state}', { state: value.slice(8) })
  if (value.startsWith('data-')) return value.slice(5)
  return value
}

export interface StateMenuProps {
  classes: string[]
  engine: Engine | null
  state: string[]
  onState: (state: string[]) => void
  /** The element's data states and those of the elements around it, by name. */
  states?: { own: string[]; inherited: string[] }
}

/**
 * The state being styled, one button: Default, or the state the controls write for (hover, pressed…), which
 * then stands out so nobody styles a hover thinking it is the element. A state with styles of its own is marked.
 */
export function StateMenu({ classes, engine, state, onState, states }: StateMenuProps) {
  const used = usedVariants(classes)
  const current = state.join(':')
  const set = (value: string) => onState(value ? parseClass(`${value}:x`).variants : [])
  const data = [...(states?.own ?? []).map((name) => `data-${name}`), ...(states?.inherited ?? []).map((name) => `in-data-${name}`)]
  // A variant Tailwind can't use writes classes that do nothing: only what the site's stylesheet knows is offered.
  const valid = (variant: string) => !engine || engine.valid(`${variant}:flex`)
  const custom = async () => {
    const values = await prompt({
      title: t('Custom Variant'),
      fields: [{ handle: 'name', type: 'text', label: t('Variant'), placeholder: 'aria-expanded, peer-checked', mono: true }],
      confirm: t('Edit Variant'),
    })
    const name = String(values?.name ?? '').trim().replace(/:+$/, '')
    if (!name) return
    if (/\s/.test(name) || !valid(name)) return void toast.error(t('Tailwind has no variant “{name}”.', { name }))
    set(name)
  }
  const item = (value: string, label = stateLabel(value)): MenuItemDef => ({ label, checked: current === value, hint: value && used.has(value) ? '•' : undefined, onSelect: () => set(value) })
  const more = MORE_STATES().map((entry) => entry.value).filter(valid)
  const own = data.filter(valid)
  const styling = current !== ''

  return (
    <Menu
      align="end"
      trigger={
        <Button variant="ghost" size="xs" aria-label={t('State: {state}', { state: state.map(stateLabel).join(' · ') || t('Default') })} className={cn('shrink-0 !gap-1 !px-1.5', styling ? '!bg-focus-soft !text-ink' : '!font-normal !text-muted hover:!text-ink')}>
          {styling && <span className="size-1.5 shrink-0 rounded-full bg-focus" aria-hidden />}
          <span className="max-w-28 truncate">{styling ? state.map(stateLabel).join(' · ') : t('Default')}</span>
          <Icon name="chevron-down" size={10} className="shrink-0 text-faint" />
        </Button>
      }
      items={[
        ...BASE_STATES().map((entry) => item(entry.value, entry.label)),
        { separator: true, label: '' },
        ...more.map((value) => item(value)),
        ...(own.length ? [{ separator: true, label: '' }, { label: t('States of This Element'), heading: true }, ...own.map((value) => item(value))] : []),
        // A state chosen by its variant, shown as long as it is the one being styled.
        ...(current && !BASE_STATES().some((entry) => entry.value === current) && !more.includes(current) && !own.includes(current) ? [item(current)] : []),
        { separator: true, label: '' },
        { label: t('Custom Variant…'), onSelect: () => void custom() },
      ]}
    />
  )
}

/** A style's name as the stylesheet takes it. */
const styleName = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')

/**
 * Ask a name for a new style and check it: lowercase letters, numbers and hyphens, and no name Tailwind or the
 * site already has (two classes under one name).
 */
export async function askStyleName(engine: Engine | null, taken: string[], title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'card', mono: true, required: true, autofocus: true }], values: { name: current }, confirm: confirmLabel })
  const name = styleName(asked?.name)
  if (!name || name === current) return null
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    toast.error(t('A name is lowercase letters, numbers and hyphens, and starts with a letter.'))
    return null
  }
  if (taken.includes(name) || engine?.valid(name)) {
    toast.error(t('There is already a style “{name}”.', { name }))
    return null
  }
  return name
}

/** What a scheme draws as: its two colours with the theme's variables worked out, on the light side. */
function drawn(engine: Engine | null, scheme: Scheme) {
  const side = (value: string) => lightDark(engine ? engine.resolve(value) : value).light
  return { background: side(scheme.background), text: side(scheme.text) }
}

/** The mark before a style's name: a scheme's tile in its colours, the style symbol for any other. */
function StyleMark({ name, schemes, engine }: { name: string; schemes: Map<string, Scheme>; engine: Engine | null }) {
  const scheme = schemes.get(name)
  if (scheme) return <SchemeTile size="mark" {...drawn(engine, scheme)} />
  return <span className="grid h-4 w-5 shrink-0 place-items-center text-faint"><Icon name={name.startsWith('btn-') ? 'button' : 'symbol'} size={12} /></span>
}

/**
 * The site's styles to wear, found by name: styles, buttons and schemes, each with its mark. The one pointed at
 * (or reached with the arrow keys) is drawn below the list as the site draws it.
 */
function StylePicker({ site, worn, source, engine, schemes, onWear, footer, trigger }: { site: string[]; worn: string[]; source?: StylingSource; engine: Engine | null; schemes: Map<string, Scheme>; onWear: (name: string) => void; footer?: (close: () => void) => ReactNode; trigger: ReactElement }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const id = useId()
  // Each style is drawn as the site draws it: the site's CSS, compiled here once the list is opened.
  const [compiler, setCompiler] = useState<{ build: (candidates: string[]) => string } | null>(null)
  useEffect(() => {
    if (!open || !source || compiler) return
    let alive = true
    void loadCompiler(source).then((made) => alive && setCompiler(made), () => {})
    return () => { alive = false }
  }, [open, source, compiler])
  const page = useMemo(() => (source ? new Stylesheet(source.css).elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? '' : ''), [source])
  const sheet = useSpecimenSheet(open ? compiler : null, [...page.split(/\s+/).filter(Boolean), ...site])

  const q = query.trim().toLowerCase()
  const fits = (name: string) => !worn.includes(name) && (!q || name.includes(q) || styleLabel(name).toLowerCase().includes(q))
  const groups = ([
    [t('Styles'), site.filter((name) => !name.startsWith(SCHEME) && !name.startsWith('btn-'))],
    [t('Buttons'), site.filter((name) => name.startsWith('btn-'))],
    [t('Schemes'), site.filter((name) => name.startsWith(SCHEME))],
  ] as [string, string[]][]).map(([label, names]) => [label, names.filter(fits)] as [string, string[]]).filter(([, names]) => names.length > 0)
  const flat = groups.flatMap(([, names]) => names)
  const pointed = flat[Math.min(active, flat.length - 1)]

  const close = () => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }
  const wear = (name: string) => {
    onWear(name)
    close()
  }
  const move = (to: number) => {
    setActive(to)
    list.current?.querySelector(`[data-index="${to}"]`)?.scrollIntoView({ block: 'nearest' })
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && flat.length) {
      e.preventDefault()
      move((Math.min(active, flat.length - 1) + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length)
    } else if (e.key === 'Enter' && pointed) {
      e.preventDefault()
      wear(pointed)
    }
  }

  return (
    <Popover open={open} onOpenChange={(next) => (next ? setOpen(true) : close())} align="start" className="flex w-72 flex-col overflow-hidden !p-0" trigger={trigger}>
      <div className="border-b border-border p-1.5">
        <input
          autoFocus
          value={query}
          role="combobox"
          aria-label={t('Search Styles')}
          aria-expanded
          aria-controls={id}
          placeholder={t('Search Styles')}
          spellCheck={false}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKey}
          className="cms-input h-8 w-full rounded-sm px-2 text-sm placeholder:text-ghost"
        />
      </div>
      <div ref={list} id={id} role="listbox" aria-label={t('Styles')} className="max-h-64 overflow-y-auto overscroll-contain p-1">
        {flat.length === 0 && <NoMatches className="py-6" />}
        {groups.map(([label, names]) => (
          <div key={label} role="group" aria-label={label}>
            <div className="cms-label flex h-7 items-center px-2">{label}</div>
            {names.map((name) => {
              const index = flat.indexOf(name)
              return (
                <Pressable compact key={name} role="option" data-index={index} aria-selected={name === pointed} onClick={() => wear(name)} onPointerMove={() => index !== active && setActive(index)} className={cn('flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left', name === pointed && 'bg-hover')}>
                  <StyleMark name={name} schemes={schemes} engine={engine} />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">{styleLabel(name)}</span>
                  <span className="max-w-24 shrink-0 truncate font-mono text-2xs text-faint">{name}</span>
                </Pressable>
              )
            })}
          </div>
        ))}
      </div>
      {pointed && (
        <div className="border-t border-border p-1.5">
          <Specimen sheet={sheet} node={styleSample(pointed)} page={page} mode="light" align="center" className="h-16 rounded-sm" />
        </div>
      )}
      {footer && <div className="border-t border-border p-1">{footer(close)}</div>}
    </Popover>
  )
}

const CLASSES = 'cms.inspector.classes'

/** Whether the classes are shown under the bar: remembered, as the inspector's sections are. */
function useClassesShown(): [boolean, (on: boolean) => void] {
  const [shown, setShown] = useState(() => {
    try { return localStorage.getItem(CLASSES) === '1' } catch { return false }
  })
  return [shown, (on) => {
    setShown(on)
    try { localStorage.setItem(CLASSES, on ? '1' : '0') } catch { /* Private mode: for this visit. */ }
  }]
}

export interface StyleBarProps {
  s: StyleApi
  /** The site's styles: the names of its stylesheet's classes. */
  site: string[]
  /** The site's stylesheet, where a style made here is written. Without it nothing is made or detached. */
  source?: StylingSource
  state: StateMenuProps
  disabled?: boolean
  /** What stands where the styles worn are: a style of the site, edited under Design › Styles, wears none of its own. */
  lead?: ReactNode
  /** What is done to what is edited, at the bar's end (a style's Rename and Delete). */
  actions?: ReactNode
}

/**
 * The bar at the top of the Design tab: the styles the element wears (a field of chips that adds one), its classes
 * as written (shown under it on demand), and the state being styled. The same bar for a block and for a style of
 * the site under Design › Styles.
 */
export function StyleBar({ s, site, source, state, disabled, lead, actions }: StyleBarProps) {
  const engine = s.engine
  const [classes, setClasses] = useClassesShown()
  const parts = splitSiteClasses(engine, s.classes, site)
  const worn = parts.site.filter((raw) => site.includes(bare(parseClass(raw).utility)))
  const wornNames = worn.map((raw) => bare(parseClass(raw).utility))
  const manages = can('settings.manage') && !!source && !!engine && !disabled
  // A style holds on every screen and in every state: what this element sets for a tablet or a phone stays its own.
  const sizes = s.screen.sizes
  const sized = (raw: string) => parseClass(raw).variants.some((variant) => !!screenVariant(variant, sizes))
  const moving = parts.utilities.filter((raw) => !sized(raw))
  const schemes = useMemo(() => new Map((source ? schemesOf(new Stylesheet(source.css)) : []).map((scheme) => [scheme.name, scheme])), [source])

  const wear = (name: string) => engine && s.apply(engine.sort([...s.classes.filter((raw) => raw !== name), name]), 'classes')

  const create = async () => {
    if (!engine || !source) return
    const name = await askStyleName(engine, site, t('Save as Style'), t('Save Style'))
    if (!name) return
    try {
      await run('styling/update', { css: new Stylesheet(source.css).setUtility(name, engine.sort(moving)).css })
      invalidate('styling/')
      s.apply([...parts.site, name, ...parts.utilities.filter(sized)], 'classes')
      toast.success(t('Style “{name}” saved', { name }))
    } catch (error) {
      toast.error(error)
    }
  }

  /** The style off, and what it applies in its place, under the variants it was worn with. */
  const detach = (raw: string) => {
    if (!engine || !source) return
    const { variants, utility } = parseClass(raw)
    const rule = new Stylesheet(source.css).utilities().find((entry) => entry.name === bare(utility))
    const applied = (rule?.classes ?? []).map((name) => withVariants(variants, name))
    s.apply(engine.sort([...new Set([...s.classes.filter((name) => name !== raw), ...applied])]), 'classes')
  }

  const picks = !disabled && !!engine && (site.length > 0 || manages)
  const picker = (trigger: ReactElement) => (
    <StylePicker
      site={site}
      worn={wornNames}
      source={source}
      engine={engine}
      schemes={schemes}
      onWear={wear}
      trigger={trigger}
      footer={manages ? (close) => <Button variant="ghost" size="sm" icon="symbol" disabled={moving.length === 0} onClick={() => { close(); void create() }} className="w-full !justify-start !px-2 !font-normal">{t('Save as Style…')}</Button> : undefined}
    />
  )

  return (
    <div className="space-y-2 border-b border-border py-2 pl-4 pr-3" data-style-bar>
      <div className="flex items-center gap-1">
        {lead ?? (!picks && worn.length === 0 ? <span className="flex-1" /> : (
          // The styles worn, as a field holds its values: a chip each, and the way to add one at its end.
          <div className="flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1 rounded-sm bg-bg p-1 shadow-edge">
            {worn.map((raw) => {
              const name = bare(parseClass(raw).utility)
              return (
                <Menu
                  key={raw}
                  align="start"
                  trigger={
                    <Button variant="ghost" size="xs" disabled={disabled} className="max-w-full !gap-1.5 !rounded-xs !bg-active !pl-1 !pr-1.5 !font-normal !text-ink">
                      <StyleMark name={name} schemes={schemes} engine={engine} />
                      <span className="truncate">{raw === name ? styleLabel(name) : raw}</span>
                    </Button>
                  }
                  items={[
                    manages && { label: t('Edit Style'), icon: 'edit', onSelect: () => navigate(name.startsWith(SCHEME) ? '/design/colors' : `/design/styles/${name.startsWith('btn-') ? 'buttons' : 'ungrouped'}/${encodeURIComponent(name)}`) },
                    !!source && { label: t('Detach Style'), icon: 'unlink', onSelect: () => detach(raw) },
                    { label: t('Remove Style'), icon: 'trash', danger: true, onSelect: () => s.apply(s.classes.filter((other) => other !== raw), 'classes') },
                  ]}
                />
              )
            })}
            {picks && (worn.length === 0
              ? picker(<Pressable compact className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-xs px-1.5 text-left text-xs text-faint hover:text-ink"><Icon name="plus" size={12} />{t('Add Style')}</Pressable>)
              : picker(<IconButton icon="plus" size="xs" label={t('Add Style')} className="ml-auto" />))}
          </div>
        ))}
        <Tooltip content={t('Classes')}>
          <IconButton icon="code" size="sm" label={t('Classes')} title={undefined} active={classes} onClick={() => setClasses(!classes)} className="shrink-0" />
        </Tooltip>
        <StateMenu {...state} />
        {actions}
      </div>
      {classes && (
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1"><ClassChips s={s} site={site} disabled={disabled} /></div>
          <Tooltip content={t('Copy Classes')}>
            <IconButton icon="copy" size="sm" label={t('Copy Classes')} title={undefined} disabled={s.classes.length === 0} onClick={() => void copyText(s.classes.join(' '), { copied: t('Classes copied') })} className="shrink-0" />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
