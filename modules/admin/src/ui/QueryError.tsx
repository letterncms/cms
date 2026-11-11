import { t } from '@letterncms/sdk'
import { Button } from './Button'
import { Icon } from './Icon'
import { cn } from './cn'

/** A message as a status line: one sentence loses its closing period, more than one keeps theirs. */
const line = (message: string) => (/^[^.!?]+\.$/.test(message.trim()) ? message.trim().slice(0, -1) : message)

/**
 * The one way to say something failed: a request, a screen, a widget, the admin itself. Never an empty state,
 * so a failure stays distinguishable from a valid empty result. `message` is what to tell the person, in plain
 * words: an exception's own text goes to the console, not here. `title` names what failed when the message
 * says why. `onRetry` gives it "Try Again", busy while `retrying`. `compact` is for a panel, a picker or a widget.
 */
export function QueryError({ title, message, onRetry, retrying, compact, className }: { title?: string; message?: string; onRetry?: () => void; retrying?: boolean; compact?: boolean; className?: string }) {
  return <div role="alert" className={cn('flex items-start gap-2 text-sm text-muted', compact ? 'p-3' : 'border-y border-border px-3 py-4', className)}>
    <Icon name="warning" size={16} className="mt-0.5 shrink-0 text-danger" />
    <div className="min-w-0 flex-1 self-center [overflow-wrap:anywhere]">
      {title && <p className="m-0 font-medium text-ink">{title}</p>}
      <p className="m-0">{line(message || t('Couldn’t load this content'))}</p>
    </div>
    {onRetry && <Button size="xs" loading={retrying} onClick={onRetry}>{t('Try Again')}</Button>}
  </div>
}
