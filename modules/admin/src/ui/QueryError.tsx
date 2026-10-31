import { t } from '@letterncms/sdk'
import { Button } from './Button'
import { Icon } from './Icon'
import { cn } from './cn'

/** A failed request remains distinguishable from a valid empty result. */
export function QueryError({ message = t('Couldn’t load this content.'), onRetry, compact }: { message?: string; onRetry: () => void; compact?: boolean }) {
  return <div role="alert" className={cn('flex items-start gap-2 text-sm text-muted', compact ? 'p-3 text-xs' : 'border-y border-danger/20 px-3 py-4')}>
    <Icon name="warning" size={15} className="mt-0.5 shrink-0 text-danger" />
    <p className="m-0 min-w-0 flex-1 [overflow-wrap:anywhere]">{message}</p>
    <Button size="xs" onClick={onRetry}>{t('Retry')}</Button>
  </div>
}
