import { Combobox } from '@base-ui/react/combobox'
import { Select as Base } from '@base-ui/react/select'
import { navigate, t } from '@letterncms/sdk'
import { useState, type ReactNode } from 'react'
import { cn } from './cn'
import { NoMatches } from './EmptyState'
import { Icon } from './Icon'

export interface SelectOption {
  value: string
  label: string
  icon?: string
  description?: string
}

export interface SelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: SelectOption[]
  placeholder?: string
  /** A compact state hint beside the selected value, such as an inherited setting. */
  valueHint?: ReactNode
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
  invalid?: boolean
  className?: string
  clearable?: boolean
  clearLabel?: string
  /**
   * The option that applies while nothing is chosen ("Browser Language", "None"): drawn as
   * the value, not as a placeholder, and offered first in the list.
   */
  defaultLabel?: string
  /** What the list says when it has no options ("No options"). */
  empty?: ReactNode
  /** Something to do from the list, such as making the first option: shown when it has none. */
  action?: SelectAction
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export interface SelectAction {
  label: string
  icon?: string
  /** An admin path to open. */
  to?: string
  onClick?: () => void
}

/** Over this many options, the list opens with a search field at the top. */
const SEARCHABLE = 12

const triggerSizes = { xs: 'h-6 gap-1.5 rounded-xs pl-1.5 pr-1 text-xs', sm: 'h-7 gap-2 rounded-sm pl-2 pr-1.5 text-sm', md: 'h-8 gap-2 rounded-md pl-2.5 pr-2 text-sm' }
// Clipped: squeezed to nothing in a row, its chevrons stay inside its edge.
const triggerClass = 'cms-input flex w-full min-w-0 items-center overflow-hidden text-left'
const popupClass = 'cms-pop max-h-[min(360px,var(--available-height))] min-w-[max(var(--anchor-width),200px)] max-w-[var(--available-width)] overflow-auto overscroll-contain p-1 outline-none'
const itemClass = 'cms-menu-item py-1'

export function Select(props: SelectProps) {
  if (props.options.length > SEARCHABLE) return <SearchableSelect {...props} />
  const { value, onChange, options, placeholder, valueHint, size = 'md', disabled, invalid, className, clearable, clearLabel, defaultLabel, empty, action, id, 'aria-label': ariaLabel, 'aria-describedby': describedBy } = props
  const current = options.find((o) => o.value === value)
  // The default is an option like the others, chosen by choosing nothing.
  const fallback = defaultLabel !== undefined && clearable
  const [open, setOpen] = useState(false)
  return (
    <Base.Root value={value} open={open} onOpenChange={setOpen} onValueChange={(v) => onChange((v as string | null) ?? null)} disabled={disabled} items={[...(fallback ? [{ value: null, label: defaultLabel }] : []), ...options.map((o) => ({ value: o.value, label: o.label }))]}>
      <Base.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(triggerClass, triggerSizes[size], className)}
      >
        <TriggerValue current={current} placeholder={placeholder} defaultLabel={defaultLabel} valueHint={valueHint} />
        <Base.Icon render={<Icon name="chevrons-up-down" size={14} className="shrink-0 text-faint" />} />
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-overlay">
          <Base.Popup className={popupClass}>
            {fallback ? (
              <Base.Item value={null} className={itemClass}>
                <Base.ItemText className="block min-w-0 flex-1 truncate">{defaultLabel}</Base.ItemText>
                <Base.ItemIndicator render={<Icon name="check" size={16} className="shrink-0 text-ink" />} />
              </Base.Item>
            ) : clearable && value !== null && (
              <Base.Item value={null} className={cn(itemClass, 'text-muted')}>
                <Base.ItemText>{clearLabel ?? t('Clear')}</Base.ItemText>
              </Base.Item>
            )}
            {options.map((o) => (
              <Base.Item key={o.value} value={o.value} className={itemClass}>
                <OptionBody option={o} text={<Base.ItemText className="block truncate">{o.label}</Base.ItemText>} />
                <Base.ItemIndicator render={<Icon name="check" size={16} className="shrink-0 text-ink" />} />
              </Base.Item>
            ))}
            {options.length === 0 && <Empty empty={empty} action={action} onDone={() => setOpen(false)} />}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}

/** A list without options says so, and offers the field's way to make one. */
function Empty({ empty, action, onDone }: { empty?: ReactNode; action?: SelectAction; onDone: () => void }) {
  return <>
    <div className="px-2 py-1.5 text-sm text-muted">{empty ?? t('No options')}</div>
    {action && (
      <button type="button" className={cn(itemClass, 'w-full')} onClick={() => { onDone(); action.onClick?.(); if (action.to) navigate(action.to) }}>
        <Icon name={action.icon ?? 'plus'} size={16} />
        <span className="min-w-0 flex-1 truncate text-left">{action.label}</span>
      </button>
    )}
  </>
}

function TriggerValue({ current, placeholder, defaultLabel, valueHint }: { current?: SelectOption; placeholder?: string; defaultLabel?: string; valueHint?: ReactNode }) {
  return <>
    {current?.icon && <Icon name={current.icon} size={14} className="shrink-0 text-muted" />}
    <span className={cn('min-w-0 flex-1 truncate', !current && defaultLabel === undefined && 'text-ghost')}>{current?.label ?? defaultLabel ?? placeholder ?? t('Choose')}</span>
    {valueHint && <span title={typeof valueHint === 'string' ? valueHint : undefined} className="max-w-[45%] shrink-0 truncate text-xs font-normal text-faint">{valueHint}</span>}
  </>
}

function OptionBody({ option, text }: { option: SelectOption; text: ReactNode }) {
  return <>
    {option.icon && <Icon name={option.icon} size={16} />}
    <div className="min-w-0 flex-1">
      {text}
      {option.description && <div className="truncate text-xs text-faint">{option.description}</div>}
    </div>
  </>
}

/** A long list (time zones, countries): the same trigger, and a search field pinned above the options. */
function SearchableSelect({ value, onChange, options, placeholder, valueHint, size = 'md', disabled, invalid, className, clearable, clearLabel, defaultLabel, id, 'aria-label': ariaLabel, 'aria-describedby': describedBy }: SelectProps) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value) ?? null
  return (
    <Combobox.Root
      items={options}
      value={current}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(o) => onChange((o as SelectOption | null)?.value ?? null)}
      isItemEqualToValue={(a, b) => (a as SelectOption)?.value === (b as SelectOption)?.value}
      itemToStringLabel={(o) => (o as SelectOption).label}
      disabled={disabled}
      autoHighlight
    >
      <Combobox.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(triggerClass, triggerSizes[size], className)}
      >
        <TriggerValue current={current ?? undefined} placeholder={placeholder} defaultLabel={defaultLabel} valueHint={valueHint} />
        <Icon name="chevrons-up-down" size={14} className="shrink-0 text-faint" />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-overlay">
          <Combobox.Popup aria-label={ariaLabel} className={cn(popupClass, 'flex flex-col overflow-hidden !p-0')}>
            {/* The search sits flush in the popup: the popup already shows where focus is. */}
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
              <Icon name="search" size={14} className="shrink-0 text-faint" />
              <Combobox.Input aria-label={t('Search')} placeholder={t('Search')} className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none [@media(pointer:coarse)]:text-base" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
              {defaultLabel !== undefined && clearable ? (
                <button type="button" className={cn(itemClass, 'w-full')} onClick={() => { onChange(null); setOpen(false) }}>
                  <span className="min-w-0 flex-1 truncate text-left">{defaultLabel}</span>
                  {!current && <Icon name="check" size={16} className="shrink-0 text-ink" />}
                </button>
              ) : clearable && current && (
                <button type="button" className={cn(itemClass, 'w-full text-muted')} onClick={() => { onChange(null); setOpen(false) }}>{clearLabel ?? t('Clear')}</button>
              )}
              <Combobox.Empty><NoMatches className="py-3" /></Combobox.Empty>
              <Combobox.List>
                {(o: SelectOption) => (
                  <Combobox.Item key={o.value} value={o} className={itemClass}>
                    <OptionBody option={o} text={<span className="block truncate">{o.label}</span>} />
                    <Combobox.ItemIndicator render={<Icon name="check" size={16} className="shrink-0 text-ink" />} />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </div>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
