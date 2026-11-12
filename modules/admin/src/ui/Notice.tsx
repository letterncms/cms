import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'

export type NoticeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const tones: Record<NoticeTone, { box: string; icon: string | null; color: string }> = {
  neutral: { box: 'border-border bg-sunken', icon: null, color: 'text-muted' },
  info: { box: 'border-border bg-sunken', icon: 'info', color: 'text-muted' },
  success: { box: 'border-success/30 bg-success/5', icon: 'success', color: 'text-success' },
  warning: { box: 'border-warning/40 bg-warning/5', icon: 'warning', color: 'text-warning' },
  danger: { box: 'border-danger/30 bg-danger/5', icon: 'warning', color: 'text-danger' },
}

export interface NoticeProps {
  tone?: NoticeTone
  /** In place of the tone's own icon; `null` for none. */
  icon?: string | null
  /** The line that says it, in ink; `children` say more under it, or say it all. */
  title?: ReactNode
  children?: ReactNode
  /** What to do about it, at the end: a button. */
  action?: ReactNode
  /** Gives it a way to be put away. */
  onDismiss?: () => void
  className?: string
}

/**
 * Something on a screen or in a dialog that someone should see before going on: a problem,
 * a step still to take. A view's `ui/notice` is drawn with it, so both look the same.
 */
export function Notice({ tone = 'info', icon, title, children, action, onDismiss, className }: NoticeProps) {
  const look = tones[tone]
  const shown = icon === undefined ? look.icon : icon
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm', title && children ? 'items-start' : 'items-center', look.box, className)}>
      {/* One line sits level with its icon (and a button beside it); two lines start at the first. */}
      {shown && <Icon name={shown} size={16} className={cn('shrink-0', !!title && !!children && 'mt-0.5', look.color)} />}
      <div className="min-w-0 flex-1 self-center [overflow-wrap:anywhere]">
        {title && <div className="font-medium text-ink">{title}</div>}
        {children && <div className={title ? 'mt-0.5 text-muted' : 'text-text'}>{children}</div>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 self-center">{action}</div>}
      {onDismiss && <IconButton icon="close" label={t('Dismiss')} size="xs" className="-my-0.5 shrink-0" onClick={onDismiss} />}
    </div>
  )
}
