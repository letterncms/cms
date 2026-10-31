import { Link, t } from '@letterncms/sdk'
import { Fragment, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

export interface Crumb {
  label: ReactNode
  to?: string
  icon?: string
}

/** Sticky 48px bar at the top of every screen: breadcrumbs left, actions right. */
export function Topbar({ crumbs = [], actions, children, className }: { crumbs?: Crumb[]; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn('sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md', className)}>
      <nav aria-label={t('Breadcrumb')} className="flex min-w-0 items-center gap-1 overflow-hidden text-sm">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <Icon name="chevron-right" size={12} className="shrink-0 text-faint" />}
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="flex min-w-0 items-center gap-1.5 truncate rounded-xs px-1 py-0.5 text-muted no-underline hover:bg-hover hover:text-text">
                {c.icon && <Icon name={c.icon} size={14} />}
                {c.label}
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5 truncate px-1 font-medium text-ink">
                {c.icon && <Icon name={c.icon} size={14} className="text-muted" />}
                {c.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
      {children}
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  )
}

/** Standard screen: topbar + scrolling body with a readable max width. A title, no subtitle: the screen explains itself. */
export function Page({ crumbs, actions, title, headerActions, children, width = 'default', className }: { crumbs?: Crumb[]; actions?: ReactNode; title?: ReactNode; headerActions?: ReactNode; children: ReactNode; width?: 'narrow' | 'default' | 'wide' | 'full'; className?: string }) {
  const max = { narrow: 'max-w-[720px]', default: 'max-w-[1080px]', wide: 'max-w-[1400px]', full: 'max-w-none' }[width]
  return (
    <div className="flex min-h-full flex-col">
      <Topbar crumbs={crumbs} actions={actions} />
      <main className={cn('mx-auto w-full flex-1 px-4 pb-16 pt-8 md:px-6', max, className)}>
        {(title || headerActions) && (
          <div className="mb-6 flex items-end gap-4">
            <div className="min-w-0 flex-1">
              {title && <h1 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>}
            </div>
            {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

/** A titled group inside a page — rows and dividers, not a card. */
export function Section({ title, description, actions, children, className }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('mb-10', className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-end gap-3 border-b border-border pb-2">
          <div className="min-w-0 flex-1">
            {title && <h2 className="m-0 text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="m-0 mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}
