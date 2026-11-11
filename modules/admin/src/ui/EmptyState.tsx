import { t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'

/**
 * Nothing here yet, the one way to say so: the collection's own icon on a small tile, what's missing in a line, and one way forward.
 * A title and one action: no sentence under it, and no illustration. `compact` is the same thing inside a widget, a panel or a dialog.
 * Something that failed is a `QueryError`, a search that found nothing is `NoMatches`: never this.
 */
export function EmptyState({ icon = 'inbox', title, action, compact, className }: { icon?: string; title: string; action?: ReactNode; compact?: boolean; className?: string }) {
  if (compact) return (
    <div className={cn('flex flex-col items-center px-4 py-7 text-center', className)}>
      <span className="mb-3 grid size-8 place-items-center rounded-md border border-border bg-bg text-muted">
        <Icon name={icon} size={16} />
      </span>
      <p className="m-0 text-sm font-medium text-text">{title}</p>
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
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}

/** Something that isn't there (an entry, a menu, a screen): the same words everywhere, under crumbs that end in "Not Found", which it does not say again. */
export function NotFoundState({ icon = 'question', action, className }: { icon?: string; action?: ReactNode; className?: string }) {
  return <EmptyState icon={icon} title={t('Nothing at this address')} action={action} className={className} />
}

/**
 * A search or filter that finds nothing: the same words and the same way back everywhere, without a tile.
 * Only where someone searched or filtered: a list that has nothing in it at all is an `EmptyState`.
 */
export function NoMatches({ onClear, className }: { onClear?: () => void; className?: string }) {
  return (
    <div role="status" className={cn('flex flex-col items-center gap-2 px-6 text-center', className ?? 'py-12')}>
      <p className="m-0 text-sm text-muted">{t('No matches')}</p>
      {onClear && <Button size="xs" variant="ghost" onClick={onClear}>{t('Clear Filters')}</Button>}
    </div>
  )
}
