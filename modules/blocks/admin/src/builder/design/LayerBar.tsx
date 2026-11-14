import { t } from '@letterncms/sdk'
import { Button, IconButton, Menu, Tooltip, cn, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { parseClass, type Engine } from '../../../../tailwind/engine'
import type { Breakpoint } from '../../core/styling'
import { usedVariants } from '../styleApi'

/* Which layer of an element's classes the Design tab edits: a screen size and a state. In Tailwind both are
   the variants of a class ("md:hover:bg-primary"), so the bar only chooses which variants the controls write. */

const BASE_STATES = () => [
  { value: '', label: t('Default') },
  { value: 'hover', label: t('Hover') },
  { value: 'active', label: t('Pressed') },
  { value: 'focus-visible', label: t('Focus') },
]

const MORE = () => [
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
function stateLabel(value: string): string {
  if (value === '') return t('Default')
  const known = [...BASE_STATES(), ...MORE()].find((item) => item.value === value)
  if (known) return known.label
  if (value.startsWith('in-data-')) return t('in {state}', { state: value.slice(8) })
  if (value.startsWith('data-')) return value.slice(5)
  const below = /^max-(\w+)$/.exec(value)
  return below ? t('Below {size}', { size: below[1] }) : value
}

interface Choice {
  value: string
  label: string
  tooltip?: string
  dot?: boolean
}

/** A track like a segmented control: the layer being edited lies on it; one with classes of its own carries a dot. */
function Track({ label, value, choices, onChange }: { label: string; value: string; choices: Choice[]; onChange: (value: string) => void }) {
  return (
    <div data-wrap className="flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5" role="radiogroup" aria-label={label}>
      {choices.map((choice) => {
        const button = (
          <Button
            key={choice.value || 'all'}
            variant="ghost"
            size="xs"
            role="radio"
            aria-checked={value === choice.value}
            onClick={() => onChange(choice.value)}
            className={cn('relative flex-[1_0_auto] !rounded-sm !px-1.5', value === choice.value ? '!bg-float !text-ink shadow-raise dark:!bg-fill' : '!bg-transparent !text-muted hover:!text-text')}
          >
            <span>{choice.label}</span>
            {choice.dot && value !== choice.value && <span className="size-1 shrink-0 rounded-full bg-current opacity-70" aria-hidden />}
          </Button>
        )
        return choice.tooltip ? <Tooltip key={choice.value || 'all'} content={choice.tooltip}>{button}</Tooltip> : button
      })}
    </div>
  )
}

export interface LayerBarProps {
  classes: string[]
  engine: Engine | null
  /** The theme's screen sizes, smallest first. With none, only states are chosen. */
  breakpoints: Breakpoint[]
  breakpoint: string
  state: string[]
  onBreakpoint: (breakpoint: string) => void
  onState: (state: string[]) => void
  /** The element's data states and those of the elements around it, by name. */
  states?: { own: string[]; inherited: string[] }
}

/** The layer bar at the top of the Design tab: the screen size, then the state. */
export function LayerBar({ classes, engine, breakpoints, breakpoint, state, onBreakpoint, onState, states }: LayerBarProps) {
  const used = usedVariants(classes)
  const current = state.join(':')
  const set = (value: string) => onState(value ? parseClass(`${value}:x`).variants : [])
  const base = BASE_STATES()
  const data = [...(states?.own ?? []).map((name) => `data-${name}`), ...(states?.inherited ?? []).map((name) => `in-data-${name}`)]
  // A variant Tailwind can't use writes classes that do nothing: only what the site's stylesheet knows is offered.
  const valid = (variant: string) => !engine || engine.valid(`${variant}:flex`)
  const custom = async () => {
    const values = await prompt({
      title: t('Custom Variant'),
      fields: [{ handle: 'name', type: 'text', label: t('Variant'), placeholder: 'aria-expanded, peer-checked, md:hover', mono: true }],
      confirm: t('Edit Variant'),
    })
    const name = String(values?.name ?? '').trim().replace(/:+$/, '')
    if (!name) return
    if (/\s/.test(name) || !valid(name)) return void toast.error(t('Tailwind has no variant “{name}”.', { name }))
    set(name)
  }

  const item = (value: string): MenuItemDef => ({ label: stateLabel(value), checked: current === value, hint: used.has(value) ? '•' : undefined, onSelect: () => set(value) })
  const sizes: Choice[] = [
    { value: '', label: t('All'), tooltip: t('Every Screen') },
    ...breakpoints.map((size) => ({ value: size.name, label: size.name, tooltip: t('{width}px and up', { width: size.width }), dot: used.has(size.name) })),
  ]
  // The four everyone uses lie on the track; the state being edited joins them, whatever menu it came from.
  const shown: Choice[] = base.map((choice) => ({ ...choice, dot: !!choice.value && used.has(choice.value) }))
  if (current && !shown.some((choice) => choice.value === current)) shown.push({ value: current, label: state.map(stateLabel).join(' · ') })

  return (
    <div className="space-y-2 border-b border-border px-4 py-3" data-layer-bar>
      {breakpoints.length > 0 && <Track label={t('Screen')} value={breakpoint} choices={sizes} onChange={onBreakpoint} />}
      <div className="flex items-start gap-1">
        <Track label={t('State')} value={current} choices={shown} onChange={set} />
        <Menu
          align="end"
          trigger={<IconButton icon="plus" label={t('More States')} />}
          items={[
            ...MORE().map((entry) => item(entry.value)),
            ...(data.filter(valid).length ? [{ label: t('States of This Element'), heading: true }, ...data.filter(valid).map(item)] : []),
            ...(breakpoints.length ? [{ label: t('Smaller Screens Only'), heading: true }, ...breakpoints.map((size) => item(`max-${size.name}`))] : []),
            { separator: true, label: '' },
            { label: t('Custom Variant…'), onSelect: () => void custom() },
          ]}
        />
      </div>
    </div>
  )
}
