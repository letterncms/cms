import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'signal'

// Every tone keeps its text at 4.5:1 or more on its own wash. `signal` is the one yellow badge: Live, Published site.
const tones: Record<Tone, string> = {
  neutral: 'bg-active text-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-focus-soft text-[color-mix(in_srgb,var(--cms-focus)_84%,var(--cms-ink))]',
  signal: 'bg-signal text-signal-ink',
}

/** A state on a detail screen, a plugin or an order. Tables use StatusDot instead. `dot` puts a 6px dot of the tone before the label. */
export function Badge({ tone = 'neutral', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xs px-1.5 text-xs font-medium tabular-nums', tones[tone], className)}>
      {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const dotTones: Record<string, string> = {
  published: 'bg-success',
  draft: 'bg-faint',
  // Changes not yet live: the brand's yellow, with a halo so it holds on white.
  changed: 'bg-signal ring-2 ring-signal-soft',
  scheduled: 'bg-warning',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-faint',
}

/** A status as a small dot plus label — no colored pills everywhere. */
export function StatusDot({ status, label, className }: { status: string; label?: ReactNode; className?: string }) {
  return (
    // The label takes the size of the text around it: a table row's, a card's, a panel's.
    <span className={cn('inline-flex min-w-0 items-center gap-1.5 text-muted', className)}>
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', dotTones[status] ?? 'bg-faint')} />
      {label ?? statusLabel(status)}
    </span>
  )
}

export function statusLabel(status: string): string {
  return { published: t('Published'), draft: t('Draft'), changed: t('Changes'), scheduled: t('Scheduled') }[status] ?? status
}
