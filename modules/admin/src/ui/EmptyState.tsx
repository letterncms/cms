import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'

/**
 * Nothing here yet: the collection's own icon on a small tile, what's missing in a line, and one way forward. No illustrations.
 * `compact` is the same thing inside a widget or a panel. Something that failed is a `QueryError`, never this.
 */
export function EmptyState({ icon = 'inbox', title, description, action, compact, className }: { icon?: string; title: string; description?: ReactNode; action?: ReactNode; compact?: boolean; className?: string }) {
  if (compact) return (
    <div className={cn('flex flex-col items-center px-4 py-7 text-center', className)}>
      <span className="mb-3 grid size-8 place-items-center rounded-md border border-border bg-bg text-muted">
        <Icon name={icon} size={16} />
      </span>
      <p className="m-0 text-sm font-medium text-text">{title}</p>
      {description && <p className="m-0 mt-0.5 max-w-64 text-xs text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
  return (
    // Without a className of its own it sits a little above the middle of the content area.
    <div className={cn('mx-auto flex max-w-[320px] flex-col items-center justify-center px-6 text-center', className ?? 'pb-16 pt-[min(15vh,128px)]')}>
      <div className="mb-4 grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-sunken text-muted">
        <Icon name={icon} size={20} />
      </div>
      <h3 className="m-0 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="m-0 mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}

/** Something that isn't there (an entry, a menu, a screen): the same words everywhere, under crumbs that end in "Not Found". */
export function NotFoundState({ icon = 'question', description, action, className }: { icon?: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return <EmptyState icon={icon} title={t('Not Found')} description={description ?? t('It may have been moved or deleted.')} action={action} className={className} />
}

/** A search or filter that finds nothing: the same words and the same way back everywhere, without a tile. */
export function NoMatches({ onClear, className }: { onClear?: () => void; className?: string }) {
  return (
    <div role="status" className={cn('flex flex-col items-center gap-2 px-6 text-center', className ?? 'py-12')}>
      <p className="m-0 text-sm text-muted">{t('No matches')}</p>
      {onClear && <Button size="xs" variant="ghost" onClick={onClear}>{t('Clear Filters')}</Button>}
    </div>
  )
}
