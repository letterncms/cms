import { Link, t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { IconButton } from './Button'

export type BannerTone = 'warning' | 'danger'

const tones: Record<BannerTone, string> = {
  warning: 'text-warning',
  danger: 'text-danger',
}

export interface BannerProps {
  tone?: BannerTone
  children: ReactNode
  /** Where the one action goes: a screen of the admin. */
  action?: { to: string; label: string }
  /** Gives the banner a way to be put away. */
  onDismiss?: () => void
}

/**
 * A line on the desk above the sheet, for what someone who can act on it should see. It is part
 * of the shell's layout, never over a screen, and the sidebar button and the way back sit below it.
 */
export function Banner({ tone = 'warning', children, action, onDismiss }: BannerProps) {
  return (
    // On the desk, above the sheet: no edge of its own, the tone only in its icon.
    <div role="status" className="flex min-h-9 shrink-0 items-center gap-2.5 bg-surface py-1.5 pl-4 pr-2 text-sm text-text">
      <Icon name="warning" size={16} className={cn('shrink-0', tones[tone])} />
      <span className="min-w-0 flex-1 line-clamp-2 leading-snug">{children}</span>
      {action && (
        <Link to={action.to} className="shrink-0 rounded-xs px-1 font-medium text-ink underline decoration-muted decoration-1 underline-offset-[3px] transition-colors duration-120 hover:decoration-ink">
          {action.label}
        </Link>
      )}
      {onDismiss && <IconButton icon="close" label={t('Dismiss')} size="xs" onClick={onDismiss} />}
    </div>
  )
}
