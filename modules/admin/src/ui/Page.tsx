import { Link, panelsFor, registry, t, useLocation, useManifestIfLoaded, useScreenContext, useTab } from '@letterncms/sdk'
import { Fragment, Suspense, isValidElement, useContext, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { homedSettings, inSettings, placeAt, wayBack } from './place'
import { WorkspaceContext } from './Slideover'
import { Tabs } from './Segmented'
import { Spinner } from './Spinner'

export interface Crumb {
  label: ReactNode
  to?: string
  icon?: string
}

/**
 * Sticky 48px bar at the top of every screen, its one header: where you are on the left,
 * what can be done on the right. `crumbs` lead to the screen; the last one is the screen
 * itself, its name in ink. On a phone only that last one shows. A screen about one thing has `back` (its list), which returns to where it was opened
 * from in this visit when that was elsewhere; on a screen with a state of the sidebar,
 * the way back is the one by the sidebar button, so `back` shows none of its own.
 * `title` stands in the middle of the window (an editor's document).
 */
export function Topbar({ crumbs: own = [], back, title, actions, children, className }: { crumbs?: Crumb[]; back?: { to: string; label: string } | null; title?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }) {
  const manifest = useManifestIfLoaded()
  const { path } = useLocation()
  // A place of the settings sidebar says so first, on every one of its screens.
  const settings = !!manifest && inSettings(manifest, path)
  const crumbs = settings ? [{ label: t('Settings'), to: '/settings', icon: undefined }, ...own.map((c) => ({ ...c, icon: undefined }))] : own
  // The last crumb names the screen, for whatever works alongside it.
  const last = crumbs[crumbs.length - 1]
  // An editor's document (`title`) names the screen before its crumbs do: "Home", not "Pages".
  const named = firstText(title)
  useScreenContext({ title: named ?? firstText(last?.label), icon: last?.icon ?? crumbs[0]?.icon })
  // What every screen's bar has, before the screen's own actions.
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const ends = panelsFor('topbar.end', {})
  const claimed = useContext(WorkspaceContext)?.sidebar?.claimed
  const way = back && manifest ? wayBack(manifest, back) : back
  return (
    <header className={cn('cms-topbar sticky top-0 z-sticky flex h-12 shrink-0 items-center gap-3 bg-bg pr-3 max-md:pr-2', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {way && !claimed && (
          <Link to={way.to} aria-label={t('Back to {label}', { label: way.label })} className="flex h-7 min-w-0 shrink items-center gap-1 rounded-sm pl-1 pr-2 text-sm text-muted no-underline transition-colors hover:bg-hover hover:text-text">
            <Icon name="chevron-left" size={14} className="shrink-0" />
            <span className="truncate max-sm:hidden">{way.label}</span>
          </Link>
        )}
        {crumbs.length > 0 && (
          <nav aria-label={t('Breadcrumb')} className="flex min-w-0 items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => {
              // The screen itself; on a phone the only crumb that shows, and whole: never two cut short.
              const here = i === crumbs.length - 1
              return (
                <Fragment key={i}>
                  {i > 0 && <span aria-hidden className="shrink-0 text-faint max-sm:hidden">/</span>}
                  {c.to && !here ? (
                    <Link to={c.to} className="flex min-w-0 items-center gap-1.5 rounded-xs px-1 py-0.5 text-muted no-underline hover:bg-hover hover:text-text max-sm:hidden">
                      {c.icon && <Icon name={c.icon} size={14} className="shrink-0" />}
                      <span className="truncate">{c.label}</span>
                    </Link>
                  ) : (
                    <span aria-current={here ? 'page' : undefined} className={cn('flex min-w-0 items-center gap-1.5 px-1', here ? 'font-semibold text-ink' : 'text-muted max-sm:hidden')}>
                      {c.icon && <Icon name={c.icon} size={14} className="shrink-0 text-muted" />}
                      <span className="truncate">{c.label}</span>
                    </span>
                  )}
                </Fragment>
              )
            })}
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

/** The first words in a node: a title drawn with a status beside it is still named by its text. */
function firstText(node: ReactNode): string | undefined {
  if (typeof node === 'string') return node.trim() || undefined
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = firstText(child)
      if (found) return found
    }
    return undefined
  }
  return isValidElement<{ children?: ReactNode }>(node) ? firstText(node.props.children) : undefined
}

/**
 * Standard screen: one compact bar that names the screen (its crumbs, the last one being
 * the screen) with what can be done on the right, then the content at a readable width.
 * No second, bigger title under it, and no line explaining the screen: it explains itself.
 * `narrow` is the form column of settings and accounts.
 */
export function Page({ crumbs = [], actions, title, children, width = 'default', className }: { crumbs?: Crumb[]; actions?: ReactNode; title?: ReactNode; children: ReactNode; width?: 'narrow' | 'default' | 'wide' | 'full'; className?: string }) {
  const max = { narrow: 'max-w-[688px]', default: 'max-w-[1080px]', wide: 'max-w-[1400px]', full: 'max-w-none' }[width]
  const trail = crumbs.length > 0 ? crumbs : title ? [{ label: title }] : []
  return (
    <div className="flex min-h-full flex-col">
      <Topbar crumbs={trail} actions={actions} />
      <main className={cn('mx-auto w-full flex-1 px-4 pb-24 pt-3 md:px-6 md:pt-4', max, className)}>
        {children}
      </main>
    </div>
  )
}

/** The settings namespace the screen on view keeps as its Settings tab (see `ScreenTabs`): on the screen itself, not on a page under it (a form of Forms). */
function useHomedSettings(): string | undefined {
  const manifest = useManifestIfLoaded()
  const { path } = useLocation()
  const item = manifest ? placeAt(manifest.nav, path) : undefined
  return manifest && item && item.path.split('?')[0] === path ? homedSettings(manifest, item.id) : undefined
}

/**
 * The tab on view of a screen with `ScreenTabs`, from the address (`?tab=`): one of its
 * own, or `settings` when its plugin keeps its settings here.
 */
export function useScreenTabs<T extends string>(values: readonly T[]): [T | 'settings', (tab: T | 'settings') => void] {
  const namespace = useHomedSettings()
  return useTab<T | 'settings'>(namespace ? [...values, 'settings'] : values)
}

/**
 * A screen's tabs, under its page header: its own, then Settings when its plugin keeps
 * its settings with this screen (a settings page whose `home` is the screen's sidebar
 * item). That tab is the core's settings form, with the same save bar as every settings
 * page; /settings/<namespace> leads to it. `children` is what the screen's own tab on
 * view shows. One tab of its own is a screen with Settings beside it.
 *
 *   const [tab, setTab] = useScreenTabs(['library'])
 *   <ScreenTabs value={tab} onChange={setTab} tabs={[{ value: 'library', label: libraryLabel }]}>…</ScreenTabs>
 */
export function ScreenTabs<T extends string>({ value, onChange, tabs, className, children }: { value: T | 'settings'; onChange: (tab: T | 'settings') => void; tabs: { value: T; label: string; count?: number; indicator?: boolean }[]; className?: string; children?: ReactNode }) {
  const namespace = useHomedSettings()
  const manifest = useManifestIfLoaded()
  const { path } = useLocation()
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const Form = namespace ? panelsFor('screen.settings', { namespace })[0]?.component : undefined
  const [dirty, setDirty] = useState(false)
  const settings = value === 'settings' && !!namespace
  // Once opened the form stays, hidden, so changes made there wait for their save bar while another tab is on view.
  const [opened, setOpened] = useState(false)
  if (settings && !opened) setOpened(true)
  const all = [...tabs, ...(namespace ? [{ value: 'settings' as const, label: t('Settings'), indicator: dirty }] : [])]
  // Opened as a place of the settings sidebar, the screen is its settings alone: its own tabs belong to the main sidebar's place.
  const alone = settings && !!manifest && inSettings(manifest, path)
  return (
    <>
      {all.length > 1 && !alone && <Tabs id="screen-tabs" className={cn('mb-6', className)} value={value} onChange={onChange} tabs={all} />}
      {!settings && <div id={`screen-tabs-${value}-panel`} role={all.length > 1 ? 'tabpanel' : undefined} aria-labelledby={all.length > 1 ? `screen-tabs-${value}` : undefined}>{children}</div>}
      {opened && Form && namespace && (
        <div id="screen-tabs-settings-panel" role={alone ? undefined : 'tabpanel'} aria-labelledby={alone ? undefined : 'screen-tabs-settings'} hidden={!settings}>
          <Suspense fallback={<div className="grid place-items-center py-10 text-faint"><Spinner /></div>}>
            <Form namespace={namespace} onDirty={setDirty} />
          </Suspense>
        </div>
      )}
    </>
  )
}

/**
 * A titled group inside a page, and the one heading of a group anywhere: settings sections,
 * account sections, a screen's groups. The title stands on its own, without a rule; a `List`
 * under it brings its own hairline. Groups sit 32px apart.
 */
export function Section({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('mb-8 last:mb-0', className)}>
      {(title || actions) && <SectionHeading title={title} actions={actions} />}
      {children}
    </section>
  )
}

/** A group's heading: its title, and what can be done with the group on the right. */
export function SectionHeading({ title, actions, as: Tag = 'h2' }: { title?: ReactNode; actions?: ReactNode; as?: 'h2' | 'h3' }) {
  return (
    <div data-section-head className="mb-3 flex min-h-7 items-center gap-3">
      <div className="min-w-0 flex-1">
        {title && <Tag className="m-0 text-base font-semibold text-ink">{title}</Tag>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
