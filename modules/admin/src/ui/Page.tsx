import { Link, panelsFor, registry, t, useLocation, useManifestIfLoaded, useScreenContext, useTab } from '@letterncms/sdk'
import { Fragment, Suspense, createContext, isValidElement, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'
import { homedSettings, noteParent, placeAt, roomAt } from './place'
import { Tabs } from './Segmented'
import { Spinner } from './Spinner'

export interface Crumb {
  label: ReactNode
  to?: string
  icon?: string
}

/**
 * Sticky 48px bar at the top of every screen, its one header: where the screen stands on the left, what can be
 * done on the right. The trail names each level down to the screen: the room it is in, then its `crumbs`, the
 * last one the screen itself in ink. The admin's one way back, beside the sidebar button, goes to the level just
 * before the screen in this trail, so the trail always says where it leads; a level can also be clicked.
 * A screen about one thing gives `back` (its list) where its crumbs don't already name it.
 * `title` stands in the middle of the window (an editor's document): the trail then ends with the level above it.
 * On a phone only the screen's own name shows. Over panes that scroll on their own (a panel beside a preview),
 * `divided` keeps the line under it, as a scrolled screen has.
 */
export function Topbar({ crumbs = [], back, title, actions, children, className, slot, divided }: { crumbs?: Crumb[]; back?: { to: string; label: string } | null; title?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string; slot?: (el: HTMLElement | null) => void; divided?: boolean }) {
  const manifest = useManifestIfLoaded()
  const { path } = useLocation()
  // The last crumb names the screen, for whatever works alongside it.
  const last = crumbs[crumbs.length - 1]
  // An editor's document (`title`) names the screen before its crumbs do: "Home", not "Pages".
  const named = firstText(title)
  useScreenContext({ title: named ?? firstText(last?.label), icon: last?.icon ?? crumbs[0]?.icon })
  // What every screen's bar has, after the screen's own actions: the chat is always last, at the edge it opens from.
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const ends = panelsFor('topbar.end', {})
  // The levels above the screen: its crumbs before its name (all of them under a document's title), and its list when they don't name it.
  const above = title ? crumbs : crumbs.slice(0, -1)
  const levels: Crumb[] = back && !above.some((c) => c.to === back.to) ? [...above, back] : above
  // A room (Design, Settings) leads the trail, as its name heads the sidebar; it is no screen of its own to open.
  const room = manifest ? roomAt(manifest, path) : undefined
  const trail: Crumb[] = room && firstText(crumbs[0]?.label) !== room.label ? [{ label: room.label }, ...levels] : levels
  const here = title ? undefined : last
  // The way back goes to the level just before the screen.
  const up = [...levels].reverse().find((c) => c.to)
  const upTo = up?.to
  const upLabel = firstText(up?.label)
  useEffect(() => {
    if (!upTo || !upLabel) return
    noteParent({ to: upTo, label: upLabel })
    return () => noteParent(null)
  }, [upTo, upLabel])
  return (
    <header data-divided={divided || undefined} className={cn('cms-topbar sticky top-0 z-sticky flex h-12 shrink-0 items-center gap-3 bg-bg pr-3 max-md:pr-4', className)}>
      <div className="flex min-w-0 items-center gap-3 max-sm:gap-1">
        {(trail.length > 0 || here) && (
          <nav aria-label={t('Breadcrumb')} className="flex min-w-0 items-center gap-1.5 text-sm">
            {trail.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden className="shrink-0 text-faint max-sm:hidden">/</span>}
                {c.to ? (
                  <Link to={c.to} className="min-w-0 truncate rounded-xs px-1 py-0.5 text-muted no-underline hover:bg-hover hover:text-text max-sm:hidden">{c.label}</Link>
                ) : (
                  <span className="min-w-0 truncate px-1 text-muted max-sm:hidden">{c.label}</span>
                )}
              </Fragment>
            ))}
            {here && (
              <>
                {trail.length > 0 && <span aria-hidden className="shrink-0 text-faint max-sm:hidden">/</span>}
                <h1 aria-current="page" className="m-0 min-w-0 shrink-0 truncate px-1 text-sm font-semibold text-ink max-sm:shrink">{here.label}</h1>
              </>
            )}
          </nav>
        )}
        {children}
      </div>
      {/* In the middle of the window, whatever is beside it: the bar itself starts after the sidebar. */}
      {title && <div className="cms-topbar-title absolute max-w-[28%] -translate-x-1/2 truncate text-sm font-medium text-ink max-lg:hidden">{title}</div>}
      {(actions || ends.length > 0 || slot) && (
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1">
          {slot && <span ref={slot} className="contents" />}
          {actions}
          {ends.map(({ id, component: End }) => <End key={id} />)}
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
 * `narrow` is the one column of every form-like page: settings, an account, a blueprint, a menu, a form.
 */
export function Page({ crumbs = [], back, actions, title, children, width = 'default', className }: { crumbs?: Crumb[]; back?: { to: string; label: string }; actions?: ReactNode; title?: ReactNode; children: ReactNode; width?: 'narrow' | 'default' | 'wide' | 'full'; className?: string }) {
  const max = { narrow: 'max-w-[688px]', default: 'max-w-[1080px]', wide: 'max-w-[1400px]', full: 'max-w-none' }[width]
  const trail = crumbs.length > 0 ? crumbs : title ? [{ label: title }] : []
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  return (
    <div className="flex min-h-full flex-col">
      <Topbar crumbs={trail} back={back} actions={actions} slot={setSlot} />
      <main className={cn('mx-auto w-full flex-1 px-4 pb-24 pt-3 md:px-6 md:pt-4', max, className)}>
        <TopbarSlot.Provider value={slot}>{children}</TopbarSlot.Provider>
      </main>
    </div>
  )
}

const TopbarSlot = createContext<HTMLElement | null>(null)

/** Something of what a page shows that belongs in its bar, before the page's actions: the language a list or a global is in. Outside a page it stays where it is. */
export function InTopbar({ children }: { children: ReactNode }) {
  const slot = useContext(TopbarSlot)
  return slot ? createPortal(children, slot) : <>{children}</>
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
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const Form = namespace ? panelsFor('screen.settings', { namespace })[0]?.component : undefined
  const [dirty, setDirty] = useState(false)
  const settings = value === 'settings' && !!namespace
  // Once opened the form stays, hidden, so changes made there wait for their save bar while another tab is on view.
  const [opened, setOpened] = useState(false)
  if (settings && !opened) setOpened(true)
  const all = [...tabs, ...(namespace ? [{ value: 'settings' as const, label: t('Settings'), indicator: dirty }] : [])]
  return (
    <>
      {all.length > 1 && <Tabs id="screen-tabs" className={cn('mb-6', className)} value={value} onChange={onChange} tabs={all} />}
      {!settings && <div id={`screen-tabs-${value}-panel`} role={all.length > 1 ? 'tabpanel' : undefined} aria-labelledby={all.length > 1 ? `screen-tabs-${value}` : undefined}>{children}</div>}
      {opened && Form && namespace && (
        <div id="screen-tabs-settings-panel" role="tabpanel" aria-labelledby="screen-tabs-settings" hidden={!settings}>
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
