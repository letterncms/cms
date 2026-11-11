import { Link } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'

/** A list of 40px rows on hairlines. */
export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <div role="list" className={cn('divide-y divide-border border-y border-border', className)}>{children}</div>
}

export function Row({ to, onClick, children, selected, className, actions }: { to?: string; onClick?: () => void; children: ReactNode; selected?: boolean; className?: string; actions?: ReactNode }) {
  const body = <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
  const cls = cn('group flex min-h-10 items-center gap-3 px-3 text-sm no-underline text-text transition-colors duration-base', (to || onClick) && 'hover:bg-hover', selected && 'bg-focus-soft hover:bg-focus-hover', className)
  // What opens the row reaches the row's edges, so its focus ring is the row's: inset, with the kit's radius.
  const target = cn('-ml-3 flex min-w-0 flex-1 items-center gap-3 self-stretch rounded-sm pl-3 -outline-offset-2', !actions && '-mr-3 pr-3')
  return (
    <div role="listitem" className={cls}>
      {to ? (
        <Link to={to} className={cn(target, 'text-inherit no-underline')}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={cn(target, 'text-left')}>
          {body}
        </button>
      ) : (
        body
      )}
      {/* With a pointer, actions show on hover or focus; on touch they are always there. */}
      {actions && <div className="flex shrink-0 items-center gap-1 transition-opacity duration-base [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-[[data-popup-open]]:opacity-100">{actions}</div>}
    </div>
  )
}
