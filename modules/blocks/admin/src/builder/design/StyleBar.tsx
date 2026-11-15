import { can, invalidate, navigate, run, t } from '@letterncms/sdk'
import { Button, Icon, Menu, Popover, Pressable, cn, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useEffect, useMemo, useState } from 'react'
import { parseClass, screenVariant, withVariants, type Engine } from '../../../../tailwind/engine'
import { Stylesheet } from '../../../../tailwind/stylesheet'
import { loadCompiler, type StylingSource } from '../../core/styling'
import { Specimen, styleSample, useSpecimenSheet } from '../specimen'
import { splitSiteClasses, usedVariants } from '../styleApi'
import type { StyleApi } from '../useStyle'

/* The top of the Design tab: the styles of the site the element wears, by name, and the state being styled.
   A style is a look the site keeps under a name (a class of its stylesheet): the same on every element that
   wears it, and changed in one place, under Styling. */

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

export interface StyleBarProps {
  s: StyleApi
  /** The site's styles: the names of its stylesheet's classes. */
  site: string[]
  /** The site's stylesheet, where a style made here is written. Without it nothing is made or detached. */
  source?: StylingSource
  state: StateMenuProps
  disabled?: boolean
}

/** The bar at the top of the Design tab: the element's styles, Add Style, and the state being styled. */
export function StyleBar({ s, site, source, state, disabled }: StyleBarProps) {
  const engine = s.engine
  const [open, setOpen] = useState(false)
  const parts = splitSiteClasses(engine, s.classes, site)
  const worn = parts.site.filter((raw) => site.includes(bare(parseClass(raw).utility)))
  const manages = can('settings.manage') && !!source && !!engine && !disabled
  // A style holds on every screen and in every state: what this element sets for a tablet or a phone stays its own.
  const sizes = s.screen.sizes
  const sized = (raw: string) => parseClass(raw).variants.some((variant) => !!screenVariant(variant, sizes))
  const moving = parts.utilities.filter((raw) => !sized(raw))
  const styles = site.filter((name) => !name.startsWith('btn-'))
  const buttons = site.filter((name) => name.startsWith('btn-'))
  // Each style is shown as the site draws it: the site's CSS, compiled here once the list is opened.
  const [compiler, setCompiler] = useState<{ build: (candidates: string[]) => string } | null>(null)
  useEffect(() => {
    if (!open || !source) return
    let alive = true
    void loadCompiler(source).then((made) => alive && setCompiler(made), () => {})
    return () => { alive = false }
  }, [open, source])
  const page = useMemo(() => (source ? new Stylesheet(source.css).elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? '' : ''), [source])
  const sheet = useSpecimenSheet(open ? compiler : null, [...page.split(/\s+/).filter(Boolean), ...site])

  const wear = (name: string) => {
    if (!engine) return
    s.apply(engine.sort([...s.classes.filter((raw) => raw !== name), name]), 'classes')
    setOpen(false)
  }

  const create = async () => {
    setOpen(false)
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

  const option = (name: string) => (
    <Pressable compact key={name} role="option" aria-selected={false} aria-label={name} onClick={() => wear(name)} className="flex h-11 w-full items-center rounded-xs p-1 text-left hover:bg-hover">
      <Specimen sheet={sheet} node={styleSample(name)} page={page} mode="light" className="pointer-events-none h-full min-w-0 flex-1 rounded-xs" />
    </Pressable>
  )
  const available = (names: string[]) => names.filter((name) => !worn.some((raw) => bare(parseClass(raw).utility) === name))

  return (
    <div className="flex min-h-11 items-center gap-1 border-b border-border px-4 py-1.5" data-style-bar>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        {worn.map((raw) => {
          const name = bare(parseClass(raw).utility)
          return (
            <Menu
              key={raw}
              align="start"
              trigger={
                <Button variant="ghost" size="xs" disabled={disabled} className="max-w-full !gap-1 !rounded-sm !bg-active !px-1.5 !font-normal !text-ink">
                  <Icon name="symbol" size={11} className="shrink-0 text-faint" />
                  <span className="truncate">{raw}</span>
                  <Icon name="chevron-down" size={10} className="shrink-0 text-faint" />
                </Button>
              }
              items={[
                manages && { label: t('Edit Style'), icon: 'edit', onSelect: () => navigate(`/styling?tab=${name.startsWith('btn-') ? 'buttons' : 'styles'}&style=${encodeURIComponent(name)}`) },
                !!source && { label: t('Detach Style'), icon: 'unlink', onSelect: () => detach(raw) },
                { label: t('Remove Style'), icon: 'trash', danger: true, onSelect: () => s.apply(s.classes.filter((other) => other !== raw), 'classes') },
              ]}
            />
          )
        })}
        {!disabled && engine && (site.length > 0 || manages) && (
          <Popover
            open={open}
            onOpenChange={setOpen}
            align="start"
            className="flex w-64 flex-col overflow-hidden !p-0"
            trigger={<Button variant="ghost" size="xs" icon="plus" className="!px-1.5 !font-normal !text-muted hover:!text-ink">{t('Add Style')}</Button>}
          >
            <div role="listbox" aria-label={t('Add Style')} className="max-h-72 overflow-y-auto overscroll-contain p-1">
              {available(styles).map(option)}
              {available(buttons).length > 0 && <div className="cms-label flex h-7 items-center px-2">{t('Buttons')}</div>}
              {available(buttons).map(option)}
            </div>
            {manages && (
              <div className="border-t border-border p-1">
                <Button variant="ghost" size="sm" icon="symbol" disabled={moving.length === 0} onClick={() => void create()} className="w-full !justify-start !px-2 !font-normal">{t('Save as Style…')}</Button>
              </div>
            )}
          </Popover>
        )}
      </div>
      <StateMenu {...state} />
    </div>
  )
}
