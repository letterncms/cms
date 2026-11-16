import { can, invalidate, navigate, run, t } from '@letterncms/sdk'
import { Icon, IconButton, Menu, Pressable, cn, copyText, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { parseClass, screenVariant, withVariants, type Engine } from '../../../../tailwind/engine'
import { Stylesheet } from '../../../../tailwind/stylesheet'
import type { StylingSource } from '../../core/styling'
import { SCHEME } from '../palette'
import { splitSiteClasses, usedVariants } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { ClassChips } from './Classes'
import { RowLabel, Section } from '../controls'

/* The top of the Design tab: the state being styled, as a row of the panel's own, then the classes the element
   wears, as written, in one field to type in, a section like the others (folded until opened). A class of the site is a look it keeps under a name (in its
   stylesheet): the same on every element that wears it, changed in one place, under Design › Classes. */

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
export function StateMenu({ classes, engine, state, onState, states, className }: StateMenuProps & { className?: string }) {
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
  // A state that has styles of its own carries the mark a section with styles does.
  const item = (value: string, label = stateLabel(value)): MenuItemDef => ({ label, checked: current === value, mark: value && used.has(value) ? t('Has Styles') : undefined, onSelect: () => set(value) })
  const more = MORE_STATES().map((entry) => entry.value).filter(valid)
  const own = data.filter(valid)
  const styling = current !== ''

  return (
    <Menu
      align="end"
      trigger={
        // A field like every other of the panel: the state the controls below write for, plain whichever it is.
        <Pressable compact aria-label={t('State: {state}', { state: state.map(stateLabel).join(' · ') || t('Default') })} className={cn('cms-input flex !h-7 min-w-0 items-center gap-1.5 !rounded-sm !px-2 text-left text-xs', className)}>
          <span className="min-w-0 flex-1 truncate">{styling ? state.map(stateLabel).join(' · ') : t('Default')}</span>
          {/* The dot of its list: the chosen state has styles of its own, not only because it is chosen. */}
          {styling && used.has(current) && <span role="img" aria-label={t('Has Styles')} className="size-1.5 shrink-0 rounded-full bg-focus" />}
          <Icon name="chevron-down" size={12} className="shrink-0 text-faint" />
        </Pressable>
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

/** A class's name as the stylesheet takes it. */
const styleName = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')

/**
 * Ask a name for a new class of the site and check it: lowercase letters, numbers and hyphens, and no name
 * Tailwind or the site already has (two classes under one name).
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
    toast.error(t('There is already a class “{name}”.', { name }))
    return null
  }
  return name
}

export interface StyleBarProps {
  s: StyleApi
  /** The site's classes: the names of its stylesheet's own. */
  site: string[]
  /** The site's stylesheet, where a class made here is written. Without it nothing is made or detached. */
  source?: StylingSource
  state: StateMenuProps
  disabled?: boolean
  /** What else is done to what is edited, first in the bar's ⋯ (a class's Rename and Delete). */
  menu?: MenuItemDef[]
  /** Whether what it sets can be saved as a class of the site: not for a class itself. */
  saveAs?: boolean
}

/**
 * The bar at the top of the Design tab, every control one height: the classes the element wears, as written, in one
 * field to type in (see ClassChips), the state being styled, and what else is done with the classes. The same bar
 * for a block and for a class of the site under Design › Classes.
 */
export function StyleBar({ s, site, source, state, disabled, menu = [], saveAs = true }: StyleBarProps) {
  const engine = s.engine
  const parts = splitSiteClasses(engine, s.classes, site)
  const manages = can('settings.manage') && !!source && !!engine && !disabled
  // A class of the site holds on every screen and in every state: what this element sets for a tablet or a phone stays its own.
  const sizes = s.screen.sizes
  const sized = (raw: string) => parseClass(raw).variants.some((variant) => !!screenVariant(variant, sizes))
  const moving = parts.utilities.filter((raw) => !sized(raw))

  /** What it sets, saved as a class of the site under a name, and worn instead. */
  const create = async () => {
    if (!engine || !source) return
    const name = await askStyleName(engine, site, t('Save as Class'), t('Save Class'))
    if (!name) return
    try {
      await run('styling/update', { css: new Stylesheet(source.css).setUtility(name, engine.sort(moving)).css })
      invalidate('styling/')
      s.apply([...parts.site, name, ...parts.utilities.filter(sized)], 'classes')
      toast.success(t('Class “{name}” saved', { name }))
    } catch (error) {
      toast.error(error)
    }
  }

  /** The class off, and what it applies in its place, under the variants it was worn with. */
  const detach = (raw: string) => {
    if (!engine || !source) return
    const { variants, utility } = parseClass(raw)
    const rule = new Stylesheet(source.css).utilities().find((entry) => entry.name === bare(utility))
    const applied = (rule?.classes ?? []).map((name) => withVariants(variants, name))
    s.apply(engine.sort([...new Set([...s.classes.filter((name) => name !== raw), ...applied])]), 'classes')
  }

  const siteMenu = (raw: string): MenuItemDef[] => {
    const name = bare(parseClass(raw).utility)
    return [
      // What it is, said where it is chosen from: the chip's look alone needn't tell.
      { label: t('Class of the Site'), heading: true },
      ...(manages ? [{ label: t('Edit Class'), icon: 'edit', onSelect: () => navigate(name.startsWith(SCHEME) ? '/design/colors' : `/design/classes/${name.startsWith('btn-') ? 'buttons' : 'ungrouped'}/${encodeURIComponent(name)}`) }] : []),
      ...(source ? [{ label: t('Detach Class'), icon: 'unlink', onSelect: () => detach(raw) }] : []),
      { label: t('Remove Class'), icon: 'trash', danger: true, onSelect: () => s.apply(s.classes.filter((other) => other !== raw), 'classes') },
    ]
  }

  return (
    // The top of the Design tab: the state its controls write for, as a row of the panel's own; then the classes,
    // a section like the others, folded until opened (and remembered so), with what else is done with them in its ⋯.
    <div data-style-bar>
      <div className="flex min-h-11 items-center gap-2 border-b border-border px-4 py-2">
        <RowLabel field={{ handle: 'state', type: 'select', label: t('State') }} />
        <StateMenu {...state} className="flex-1" />
      </div>
      <Section
        title={t('Classes')}
        detail={s.classes.length || undefined}
        open={false}
        actionsOpen={false}
        actions={
          <Menu
            align="end"
            trigger={<IconButton icon="more" size="xs" label={t('Class Actions')} />}
            items={[
              ...menu,
              ...(menu.length ? [{ separator: true, label: '' }] : []),
              ...(manages && saveAs ? [{ label: t('Save as Class…'), icon: 'plus', disabled: moving.length === 0, onSelect: () => void create() }] : []),
              { label: t('Copy Classes'), icon: 'copy', disabled: s.classes.length === 0, onSelect: () => void copyText(s.classes.join(' '), { copied: t('Classes copied') }) },
            ]}
          />
        }
      >
        <ClassChips s={s} site={site} disabled={disabled} siteMenu={siteMenu} />
      </Section>
    </div>
  )
}
