import { t } from '@letterncms/sdk'
import { Button, Icon, IconButton, Tooltip, cn } from '@letterncms/ui'
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

/**
 * A list of rows — hairlines, no card. A group that is its whole section has no title (the bar already
 * says it): the way to add is then a named button under the list.
 */
export function Group({ title, onAdd, addLabel, action, children }: { title?: string; onAdd?: () => void; addLabel?: string; action?: ReactNode; children: ReactNode }) {
  const label = addLabel ?? t('Add Token')
  return (
    <section className="mb-6">
      {title && (
        <div className="flex h-9 items-center justify-between border-b border-border">
          <h3 className="m-0 text-xs font-semibold text-ink">{title}</h3>
          {action}
          {onAdd && (
            <Tooltip content={label}>
              <IconButton icon="plus" label={label} title={undefined} size="xs" onClick={onAdd} />
            </Tooltip>
          )}
        </div>
      )}
      {children}
      {/* Without a title there is no head to hold a lone +: the way to add is a named button under the list. */}
      {!title && (action || onAdd) && (
        <div className="flex h-9 items-center border-t border-border">
          {action ?? <Button variant="ghost" size="xs" icon="plus" onClick={onAdd} className="-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink">{label}</Button>}
        </div>
      )}
    </section>
  )
}

/** A row that opens to show its controls. */
export function Disclosure({ open, onToggle, label, aside, menu, children }: { open: boolean; onToggle: () => void; label: ReactNode; aside?: ReactNode; menu?: ReactNode; children: ReactNode }) {
  return (
    <div className="cms-reveal-row group border-b border-border last:border-b-0">
      <div className="flex min-h-10 items-center gap-2">
        <Button variant="ghost" aria-expanded={open} onClick={onToggle} className="!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink">
          <Icon name="chevron-right" size={12} className={cn('shrink-0 text-faint transition-transform duration-fast', open && 'rotate-90')} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {aside}
        </Button>
        {menu}
      </div>
      {open && <div className="pb-3 pl-[18px]">{children}</div>}
    </div>
  )
}
