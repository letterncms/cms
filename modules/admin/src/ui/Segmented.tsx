import { cn } from './cn'
import { Icon } from './Icon'

export interface SegmentOption<T extends string> {
  value: T
  label?: string
  icon?: string
  title?: string
}

/**
 * Compact segmented control (lenses, breakpoints, alignment…). With no value, the
 * `placeholder` option (the default that applies) shows lighter than a chosen one.
 */
export function Segmented<T extends string>({ value, onChange, options, size = 'sm', block, className, placeholder, id, disabled, 'aria-label': ariaLabel }: { value: T; onChange: (v: T) => void; options: SegmentOption<T>[]; size?: 'xs' | 'sm'; block?: boolean; className?: string; placeholder?: T; id?: string; disabled?: boolean; 'aria-label'?: string }) {
  const implied = !options.some((o) => o.value === value) ? placeholder : undefined
  const tabStop = options.find((o) => o.value === value || o.value === implied)?.value ?? options[0]?.value
  return (
    <div id={id} role="radiogroup" aria-label={ariaLabel} aria-disabled={disabled || undefined} className={cn('min-w-0 max-w-full flex-wrap items-center gap-0.5 rounded-sm bg-sunken p-0.5', block ? 'flex w-full' : 'inline-flex', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title ?? o.label}
          aria-label={o.title ?? o.label}
          tabIndex={tabStop === o.value ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          onKeyDown={(event) => {
            const index = options.findIndex((option) => option.value === o.value)
            const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % options.length
              : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index - 1 + options.length) % options.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null
            if (next === null) return
            event.preventDefault()
            onChange(options[next].value)
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
          }}
          className={cn(
            'inline-flex min-w-0 max-w-full items-center justify-center gap-1.5 rounded-xs font-medium transition-[background-color,color,box-shadow] duration-120 disabled:pointer-events-none disabled:opacity-50',
            block && 'flex-[1_0_auto]',
            size === 'xs' ? 'min-h-5 px-1.5 py-0.5 text-2xs' : 'min-h-6 px-2 py-0.5 text-xs',
            !o.label && !block && (size === 'xs' ? 'w-6 px-0' : 'w-7 px-0'),
            value === o.value ? 'bg-bg text-ink shadow-[0_0_0_1px_var(--cms-border),0_1px_2px_rgb(0_0_0/0.06)]' : implied === o.value ? 'bg-bg/55 text-text' : 'text-muted hover:text-text',
          )}
        >
          {o.icon && <Icon name={o.icon} size={size === 'xs' ? 12 : 14} className="shrink-0" />}
          {o.label && <span className="min-w-0 [overflow-wrap:anywhere]">{o.label}</span>}
        </button>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, tabs, className, id, bordered = true, size = 'sm' }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; count?: number; indicator?: boolean }[]; className?: string; id?: string; bordered?: boolean; size?: 'xs' | 'sm' }) {
  return (
    // Many plugin tabs scroll sideways rather than wrapping their labels.
    <div role="tablist" className={cn('flex min-h-9 items-stretch gap-4 overflow-x-auto [scrollbar-width:none]', bordered && 'border-b border-border', className)}>
      {tabs.map((t, index) => (
        <button
          key={t.value}
          id={id ? `${id}-${t.value}` : undefined}
          aria-controls={id ? `${id}-${t.value}-panel` : undefined}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          tabIndex={value === t.value ? 0 : -1}
          onClick={() => onChange(t.value)}
          onKeyDown={(e) => {
            const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length
              : e.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
              : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null
            if (next === null) return
            e.preventDefault()
            onChange(tabs[next].value)
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
          }}
          className={cn('flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 font-medium transition-colors', bordered && '-mb-px', size === 'xs' ? 'text-xs' : 'text-sm', value === t.value ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-text')}
        >
          {t.label}
          {t.indicator && <span className="size-1.5 shrink-0 rounded-full bg-focus" aria-hidden />}
          {t.count !== undefined && <span className="text-xs text-faint">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
