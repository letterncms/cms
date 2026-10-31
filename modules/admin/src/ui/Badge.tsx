import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'signal'

const tones: Record<Tone, string> = {
  neutral: 'bg-sunken text-muted',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-focus/10 text-focus',
  signal: 'bg-signal/30 text-text',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex h-5 items-center gap-1 rounded-xs px-1.5 text-2xs font-medium', tones[tone], className)}>{children}</span>
}

const dotTones: Record<string, string> = {
  published: 'bg-success',
  draft: 'bg-faint',
  changed: 'bg-warning',
  scheduled: 'bg-focus',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-faint',
}

/** A status as a small dot plus label — no colored pills everywhere. */
export function StatusDot({ status, label, className }: { status: string; label?: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', dotTones[status] ?? 'bg-faint', status === 'changed' && 'ring-2 ring-warning/20')} />
      {label ?? statusLabel(status)}
    </span>
  )
}

export function statusLabel(status: string): string {
  return { published: t('Published'), draft: t('Draft'), changed: t('Changes'), scheduled: t('Scheduled') }[status] ?? status
}
