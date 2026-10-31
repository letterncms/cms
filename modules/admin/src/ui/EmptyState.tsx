import type { ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

export function EmptyState({ icon = 'inbox', title, description, action, className }: { icon?: string; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-4 grid size-10 place-items-center rounded-lg border border-border bg-surface text-muted">
        <Icon name={icon} size={18} />
      </div>
      <h3 className="m-0 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="m-0 mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
