import { Link, panelsFor, registry, t, useScreenContext } from '@letterncms/sdk'
import { Fragment, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { WorkspaceContext } from './Slideover'

export interface Crumb {
  label: ReactNode
  to?: string
  icon?: string
}

/**
 * Sticky 48px bar at the top of every screen: where you are on the left (breadcrumbs,
 * or `back` and the `title` in the middle, for a screen about one thing), what can be
 * done on the right. On a screen with a state of the sidebar, its way back is the one by
 * the sidebar button, so `back` shows none of its own.
 */
export function Topbar({ crumbs = [], back, title, actions, children, className }: { crumbs?: Crumb[]; back?: { to: string; label: string } | null; title?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }) {
  // The last crumb names the screen, for whatever works alongside it.
  const last = crumbs[crumbs.length - 1]
  useScreenContext({ title: typeof last?.label === 'string' ? last.label : undefined, icon: last?.icon ?? crumbs[0]?.icon })
  // What every screen's bar has, before the screen's own actions.
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const ends = panelsFor('topbar.end', {})
  const claimed = useContext(WorkspaceContext)?.sidebar?.claimed
  return (
    <header className={cn('cms-topbar sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-bg/85 pr-3 backdrop-blur-md', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {back && !claimed && (
          <Link to={back.to} aria-label={t('Back to {label}', { label: back.label })} className="flex h-7 min-w-0 shrink items-center gap-1 rounded-sm pl-1 pr-2 text-sm text-muted no-underline transition-colors hover:bg-hover hover:text-text">
            <Icon name="chevron-left" size={14} className="shrink-0" />
            <span className="truncate max-sm:hidden">{back.label}</span>
          </Link>
        )}
        {crumbs.length > 0 && (
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
        )}
        {children}
      </div>
      {/* In the middle of the window, whatever is beside it: the bar itself starts after the sidebar. */}
      {title && <div className="cms-topbar-title absolute max-w-[28%] -translate-x-1/2 truncate text-sm font-medium text-ink max-lg:hidden">{title}</div>}
      {(actions || ends.length > 0) && (
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1">
          {ends.map(({ id, component: End }) => <End key={id} />)}
          {actions}
        </div>
      )}
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
