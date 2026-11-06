import { t } from '@letterncms/sdk'
import { Icon, IconButton, Tooltip, cn } from '@letterncms/ui'
import type { ReactNode } from 'react'

/** CSS custom property prefixes that differ from the group name — mirrors DesignJson::GROUPS. */
const PREFIX: Record<string, string> = { weight: 'font-weight' }
export const variable = (group: string, name: string) => `--${PREFIX[group] ?? group}-${name}`

/** CSS for a token value — mirrors the server's DesignCompiler (token references become var()). */
export function css(group: string, value: any): string {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'min' in value) return fluid(String(value.min), String(value.max))
  if (group === 'font' && Array.isArray(value)) return value.map((f: string) => (/\s/.test(f) && !f.includes('"') ? `"${f}"` : f)).join(', ')
  return String(value ?? '').replace(/token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (_, g: string, n: string, alpha?: string) => (alpha ? `color-mix(in srgb, var(${variable(g, n)}) ${alpha}%, transparent)` : `var(${variable(g, n)})`))
}

export function fluid(min: string, max: string): string {
  const rem = (v: string) => (v.endsWith('rem') ? parseFloat(v) : parseFloat(v) / 16)
  const a = rem(min)
  const b = rem(max)
  const slope = (b - a) / (80 - 22.5)
  const n = (x: number) => String(Math.round(x * 10000) / 10000)
  return `clamp(${n(Math.min(a, b))}rem, ${n(a - slope * 22.5)}rem + ${n(slope * 100)}vw, ${n(Math.max(a, b))}rem)`
}

/** A length in px (fluid values: their desktop size), for bars and samples. */
export function px(value: any): number {
  const v = value && typeof value === 'object' && 'max' in value ? value.max : value
  const n = parseFloat(String(v ?? ''))
  if (Number.isNaN(n)) return 0
  return /r?em$/.test(String(v)) ? n * 16 : n
}

/** A titled list of rows — hairlines, no card. */
export function Group({ title, onAdd, action, children }: { title: string; onAdd?: () => void; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex h-9 items-center justify-between border-b border-border">
        <h3 className="m-0 text-xs font-semibold text-ink">{title}</h3>
        {action}
        {onAdd && (
          <Tooltip content={t('Add Token')}>
            <IconButton icon="plus" label={t('Add Token')} size="xs" onClick={onAdd} />
          </Tooltip>
        )}
      </div>
      {children}
    </section>
  )
}

/** A row that opens to show its controls. */
export function Disclosure({ open, onToggle, label, aside, menu, children }: { open: boolean; onToggle: () => void; label: ReactNode; aside?: ReactNode; menu?: ReactNode; children: ReactNode }) {
  return (
    <div className="group border-b border-border last:border-b-0">
      <div className="flex min-h-10 items-center gap-2">
        <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-10 min-w-0 flex-1 items-center gap-1.5 rounded-xs text-left text-xs text-text outline-offset-[-2px] hover:text-ink">
          <Icon name="chevron-right" size={12} className={cn('shrink-0 text-faint transition-transform duration-120', open && 'rotate-90')} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {aside}
        </button>
        {menu}
      </div>
      {open && <div className="pb-3 pl-[18px]">{children}</div>}
    </div>
  )
}
