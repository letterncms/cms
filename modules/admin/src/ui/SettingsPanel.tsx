import type { ReactNode } from 'react'
import { cn } from './cn'

/** One group of settings, with dividers inset to the rows' content. */
export function SettingsPanel({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'dl' }) {
  return <Tag data-settings-panel className={cn('@container m-0 min-w-0 divide-y divide-border rounded-xl border border-border bg-surface/55 px-4 sm:px-5 dark:bg-float/65', className)}>{children}</Tag>
}

/** A setting's name and control. Longer editors and narrow panels stack. */
export function SettingRow({ label, children, layout = 'inline', className, definition }: { label?: ReactNode; children: ReactNode; layout?: 'inline' | 'stacked' | 'end'; className?: string; definition?: boolean }) {
  const tracks = { inline: '@md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]', stacked: '', end: 'grid-cols-[minmax(0,1fr)_auto]' }
  const Label = definition ? 'dt' : 'div'
  const Value = definition ? 'dd' : 'div'
  return (
    <div className={cn('min-h-14 min-w-0 py-3', !!label && 'grid items-center gap-x-6 gap-y-2', !!label && tracks[layout], className)}>
      {label && <Label className="min-w-0 break-words text-sm font-medium text-text">{label}</Label>}
      <Value className={cn('m-0 min-w-0', definition && 'break-words text-sm text-text', layout === 'end' && 'justify-self-end')}>{children}</Value>
    </div>
  )
}
