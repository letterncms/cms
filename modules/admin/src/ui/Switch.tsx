import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { useId, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

export function Switch({ checked, onChange, disabled, label, size = 'md', 'aria-label': ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: ReactNode; size?: 'sm' | 'md'; 'aria-label'?: string }) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'
  const thumb = size === 'sm' ? 'size-3 data-[checked]:translate-x-3' : 'size-4 data-[checked]:translate-x-4'
  const labelId = useId()
  const control = (
    <BaseSwitch.Root
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
      checked={checked}
      onCheckedChange={(v) => onChange(v)}
      disabled={disabled}
      className={cn('relative inline-flex shrink-0 items-center rounded-full bg-border-strong p-0.5 transition-colors duration-180 data-[checked]:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40', track)}
    >
      <BaseSwitch.Thumb className={cn('block rounded-full bg-bg shadow-sm transition-transform duration-180 ease-spring', thumb)} />
    </BaseSwitch.Root>
  )
  return label ? (
    <label className="inline-flex items-center gap-2 text-sm">
      {control}
      <span id={labelId}>{label}</span>
    </label>
  ) : (
    control
  )
}

export function Checkbox({ checked, onChange, disabled, label, indeterminate }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: ReactNode; indeterminate?: boolean }) {
  const labelId = useId()
  const control = (
    <BaseCheckbox.Root
      aria-labelledby={label ? labelId : undefined}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(v) => onChange(v)}
      disabled={disabled}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-strong bg-bg transition-colors data-[checked]:border-ink data-[checked]:bg-ink data-[indeterminate]:border-ink data-[indeterminate]:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
    >
      <BaseCheckbox.Indicator className="text-ink-contrast">
        <Icon name={indeterminate ? 'minus' : 'check'} size={11} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
  return label ? (
    <label className="inline-flex items-center gap-2 text-sm">
      {control}
      <span id={labelId}>{label}</span>
    </label>
  ) : (
    control
  )
}
