import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { useId, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

export function Switch({ checked, onChange, disabled, label, size = 'md', 'aria-label': ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: ReactNode; size?: 'sm' | 'md'; 'aria-label'?: string }) {
  // md: a 32×18 track with a 14px thumb; sm: 26×16 with 12px.
  const track = size === 'sm' ? 'h-4 w-[26px]' : 'h-[18px] w-8'
  const thumb = size === 'sm' ? 'size-3 data-[checked]:translate-x-2.5' : 'size-3.5 data-[checked]:translate-x-3.5'
  const labelId = useId()
  const control = (
    <BaseSwitch.Root
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
      checked={checked}
      onCheckedChange={(v) => onChange(v)}
      disabled={disabled}
      className={cn('relative inline-flex shrink-0 items-center rounded-full bg-border-strong p-0.5 transition-colors duration-base ease-out hover:bg-border-hover data-[checked]:bg-signal data-[checked]:hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45', track)}
    >
      {/* Dark: a light thumb on the off track, a dark one on the light ink track. */}
      <BaseSwitch.Thumb className={cn('block rounded-full bg-float shadow-raise transition-[translate,background-color] duration-base ease-out dark:bg-muted data-[checked]:bg-knob dark:data-[checked]:bg-knob', thumb)} />
    </BaseSwitch.Root>
  )
  return label ? (
    // `align-top`: on the baseline, a box with a tick in it and an empty one sit at different heights, and their rows differ by 2px.
    <label className="inline-flex items-center gap-2 align-top text-sm">
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
      // 16px to see, 28px to hit.
      className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-xs border border-border-strong bg-bg transition-[background-color,border-color] duration-base ease-out before:absolute before:-inset-1.5 before:content-[''] hover:border-[color-mix(in_srgb,var(--cms-border-strong),var(--cms-ink)_16%)] data-[checked]:border-signal data-[checked]:bg-signal data-[indeterminate]:border-signal data-[indeterminate]:bg-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45"
    >
      <BaseCheckbox.Indicator className="flex text-signal-ink">
        {indeterminate ? <span className="block h-0.5 w-2 rounded-full bg-current" /> : <Icon name="check" size={12} />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
  return label ? (
    // `align-top`: on the baseline, a box with a tick in it and an empty one sit at different heights, and their rows differ by 2px.
    <label className="inline-flex items-center gap-2 align-top text-sm">
      {control}
      <span id={labelId}>{label}</span>
    </label>
  ) : (
    control
  )
}
