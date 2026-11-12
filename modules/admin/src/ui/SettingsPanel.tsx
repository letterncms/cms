import type { ReactNode } from 'react'
import { cn } from './cn'

/** One group of settings, with dividers inset to the rows' content. */
export function SettingsPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-settings-panel className={cn('@container min-w-0 divide-y divide-border rounded-xl border border-border bg-surface/55 px-4 sm:px-5 dark:bg-float/65', className)}>{children}</div>
}

/** A setting's name and control. Longer editors and narrow panels stack. */
export function SettingRow({ label, children, layout = 'inline', className }: { label?: ReactNode; children: ReactNode; layout?: 'inline' | 'stacked' | 'end'; className?: string }) {
  const tracks = { inline: '@md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]', stacked: '', end: 'grid-cols-[minmax(0,1fr)_auto]' }
  return (
    <div className={cn('min-h-14 min-w-0 py-3', !!label && 'grid items-center gap-x-6 gap-y-2', !!label && tracks[layout], className)}>
      {label && <div className="min-w-0 break-words text-sm font-medium text-text">{label}</div>}
      <div className={cn('min-w-0', layout === 'end' && 'justify-self-end')}>{children}</div>
    </div>
  )
}
