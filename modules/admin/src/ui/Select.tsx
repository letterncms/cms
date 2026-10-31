import { Select as Base } from '@base-ui/react/select'
import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'
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
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function Select({ value, onChange, options, placeholder, valueHint, size = 'md', disabled, invalid, className, clearable, clearLabel, id, 'aria-label': ariaLabel, 'aria-describedby': describedBy }: SelectProps) {
  const current = options.find((o) => o.value === value)
  return (
    <Base.Root value={value} onValueChange={(v) => onChange((v as string | null) ?? null)} disabled={disabled} items={options.map((o) => ({ value: o.value, label: o.label }))}>
      <Base.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(
          'cms-focus-ring flex w-full items-center gap-2 rounded-sm border border-border-strong bg-bg text-left transition-[border-color,box-shadow] duration-120 data-[popup-open]:border-focus aria-[invalid=true]:border-danger disabled:opacity-50',
          size === 'xs' ? 'h-6 px-1.5 text-2xs' : size === 'sm' ? 'h-7 px-2.5 text-sm' : 'h-8 px-2.5 text-sm',
          className,
        )}
      >
        {current?.icon && <Icon name={current.icon} size={14} className="text-muted" />}
        <span className={cn('flex-1 truncate', !current && 'text-faint')}>{current?.label ?? placeholder ?? t('Select…')}</span>
        {valueHint && <span title={typeof valueHint === 'string' ? valueHint : undefined} className="max-w-[45%] shrink-0 truncate text-xs font-normal text-faint">{valueHint}</span>}
        <Base.Icon render={<Icon name="chevrons-up-down" size={13} className="text-faint" />} />
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-50">
          <Base.Popup className="cms-pop max-h-[min(360px,var(--available-height))] min-w-[var(--anchor-width)] overflow-auto p-1 outline-none">
            {clearable && value !== null && (
              <Base.Item value={null} className="flex h-7 items-center rounded-xs px-2 text-sm text-muted outline-none data-[highlighted]:bg-hover">
                <Base.ItemText>{clearLabel ?? t('Clear')}</Base.ItemText>
              </Base.Item>
            )}
            {options.map((o) => (
              <Base.Item key={o.value} value={o.value} className="flex min-h-7 items-center gap-2 rounded-xs px-2 py-1 text-sm outline-none data-[highlighted]:bg-hover">
                {o.icon && <Icon name={o.icon} size={14} className="text-muted" />}
                <div className="min-w-0 flex-1">
                  <Base.ItemText className="block truncate">{o.label}</Base.ItemText>
                  {o.description && <div className="truncate text-xs text-faint">{o.description}</div>}
                </div>
                <Base.ItemIndicator render={<Icon name="check" size={14} />} />
              </Base.Item>
            ))}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
