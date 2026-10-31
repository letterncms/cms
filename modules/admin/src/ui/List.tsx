import { Link } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'

/** Dense row list (36px rows, hairline dividers). */
export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <div role="list" className={cn('divide-y divide-border border-y border-border', className)}>{children}</div>
}

export function Row({ to, onClick, children, selected, className, actions }: { to?: string; onClick?: () => void; children: ReactNode; selected?: boolean; className?: string; actions?: ReactNode }) {
  const body = <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
  const cls = cn('group flex min-h-9 items-center gap-3 px-2 text-sm no-underline text-text transition-colors duration-120 hover:bg-surface', selected && 'bg-focus/6 hover:bg-focus/8', className)
  return (
    <div role="listitem" className={cls}>
      {to ? (
        <Link to={to} className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-inherit no-underline outline-none">
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left outline-none">
          {body}
        </button>
      ) : (
        body
      )}
      {actions && <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{actions}</div>}
    </div>
  )
}
