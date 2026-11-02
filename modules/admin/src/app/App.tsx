import { events, matchPath, navigate, onLinkIntent, panelsFor, registry, ScreenLocation, t, useManifest, useScreenContext, useScreenLocation, type Location, type RouteDef } from '@letterncms/sdk'
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { NotFound } from '../screens/NotFound'
import { cn, IconButton, Tooltip } from '../ui'
import { CommandPalette } from './CommandPalette'
import { CustomizeSidebar } from './CustomizeSidebar'
import { ErrorBoundary } from './ErrorBoundary'
import { Sidebar, type OwnSidebar } from './Sidebar'
import { inSettings, itemAt, leaveSettings, setPinned, SETTINGS_SHORTCUT, toggleSettings, unpin } from './sidebarStore'
import { useShortcut } from '../ui/shortcuts'
import { WorkspaceContext } from '../ui/Slideover'
import { dockState, type DockState } from '../ui/Dock'

function specificity(path: string): number {
  return path.split('/').filter(Boolean).reduce((score, seg) => score + (seg === '*' ? 0 : seg.startsWith(':') ? 1 : 3), 0)
}

function resolve(path: string): { route: RouteDef | null; params: Record<string, string> } {
  const routes = registry.routes.all().slice().sort((a, b) => specificity(b.path) - specificity(a.path))
  for (const route of routes) {
    const params = matchPath(route.path, path)
    if (params) return { route, params }
  }
  return { route: null, params: {} }
}

/**
 * Screens are code-split (`lazy`). Start loading one's code before it is shown
 * (on idle for all of them, on hover for the one about to be opened), so opening
 * it does not wait for the network.
 */
function warm(component: unknown): Promise<unknown> {
  const lazy = component as { $$typeof?: symbol; _payload?: unknown; _init?: (payload: unknown) => unknown } | null
  if (lazy?.$$typeof !== Symbol.for('react.lazy') || typeof lazy._init !== 'function') return Promise.resolve()
  try {
    lazy._init(lazy._payload)
    return Promise.resolve()
  } catch (pending) {
    // Still loading (a thenable) or failed: either way the screen reports it when it is opened.
    return pending && typeof (pending as PromiseLike<unknown>).then === 'function' ? Promise.resolve(pending as PromiseLike<unknown>).catch(() => {}) : Promise.resolve()
  }
}

onLinkIntent((path) => void screenReady(path))

/** Resolves once the screen at a path can be drawn without waiting (used at boot, so the first screen appears whole). */
export function screenReady(path: string, search = ''): Promise<unknown> {
  const url = new URL(path + search, window.location.origin)
  const { route, params } = resolve(url.pathname)
  const location: Location = { path: url.pathname, search: url.search, query: Object.fromEntries(url.searchParams), action: 'push' }
  // Loading failures belong to the destination screen, never an unhandled hover promise.
  return Promise.allSettled([warm(route?.component), Promise.resolve().then(() => route?.load?.(params, location))])
}

const prepareScreen = (location: Location) => screenReady(location.path, location.search)

const idle = (fn: () => void) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300))

function useMedia(query: string): boolean {
  const [list] = useState(() => window.matchMedia(query))
  return useSyncExternalStore(
    (onChange) => {
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => list.matches,
  )
}

export function App() {
  // The screen stays on view until the next one is ready: no loading flash between screens.
  const { location: live, pending } = useScreenLocation(prepareScreen)
  const routesVersion = useSyncExternalStore(registry.routes.subscribe, registry.routes.version)
  // A route drawn over the screen it was opened from leaves that screen on, untouched underneath.
  const under = useRef<Location | null>(null)
  const over = resolve(live.path).route?.overlay === true
  if (!over) under.current = live
  const location = over && under.current ? under.current : live
  const { route, params } = resolve(location.path)
  // The left panel stays as it is left: there or hidden, on every screen, until someone changes it.
  const [hidden, setHidden] = useState(() => localStorage.getItem('cms.sidebar') === 'collapsed')
  const [palette, setPalette] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  // Below tablet width it opens over the screen and goes again with the next screen.
  const narrow = useMedia('(max-width: 767px)')
  const [expanded, setExpanded] = useState(false)
  const full = route?.layout === 'full'
  const content = useRef<HTMLDivElement>(null)
  const [workspace, setWorkspace] = useState<HTMLDivElement | null>(null)
  const [dock, setDock] = useState<DockState>({ open: false, full: false })
  // A screen can bring a state of its own to the sidebar (the builder's outline), folded away to start with, so the screen has the room.
  const [own, setOwn] = useState<OwnSidebar | null>(null)
  const [ownOpen, setOwnOpen] = useState(false)
  const [ownHost, setOwnHost] = useState<HTMLElement | null>(null)
  const claimSidebar = useCallback((state: OwnSidebar) => {
    setOwn(state)
    return () => setOwn(null)
  }, [])
  const scrolls = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    setDock(dockState())
    return events.on<DockState>('shell.dock', setDock)
  }, [])
  const toggleSidebar = () => {
    if (narrow) setExpanded((e) => !e)
    else if (own) setOwnOpen((o) => !o)
    else setHidden((h) => !h)
  }

  useEffect(() => localStorage.setItem('cms.sidebar', hidden ? 'collapsed' : 'open'), [hidden])
  useShortcut('mod+k', () => setPalette((p) => !p))
  useShortcut(SETTINGS_SHORTCUT, toggleSettings)
  useEffect(() => events.on('sidebar.customize', () => setCustomizing(true)), [])
  // Modules pin and unpin their own items (the assistant's setup offers to put New Chat away).
  useEffect(() => events.on<{ id: string; pinned: boolean }>('sidebar.pin', ({ id, pinned }) => (pinned ? setPinned(id, true) : unpin(id))), [])
  useShortcut('mod+\\', toggleSidebar)

  // Every screen's code, fetched while the admin is idle.
  useEffect(() => {
    idle(() => registry.routes.all().forEach((r) => warm(r.component)))
  }, [routesVersion])

  // A new screen starts at the top; back and forward return to where you were.
  const key = location.path + location.search
  useEffect(() => setExpanded(false), [live.path, narrow])
  useShortcut('escape', () => setExpanded(false), narrow && expanded)
  useLayoutEffect(() => {
    const el = content.current
    if (el) el.scrollTop = location.action === 'pop' ? (scrolls.current.get(key) ?? 0) : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.path])

  // Without a home screen (letterncms/dashboard off) the admin opens on the first pinned item of the sidebar.
  const manifest = useManifest()
  const screenItem = itemAt(manifest.nav, location.path)
  useScreenContext({ title: screenItem?.label, icon: screenItem?.icon, private: route?.private === true }, { fallback: true })
  const pinned = manifest.sidebar.sections.flatMap((s) => s.items).find((id) => !manifest.sidebar.hidden.includes(id))
  const first = manifest.nav.find((n) => n.id === pinned)?.path

  // Esc leaves settings, unless something on top of the screen takes it (a dialog, a menu, a field).
  const settings = inSettings(manifest, location.path)
  useShortcut('escape', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"], [role="listbox"], .cms-dock')) return
    if (!document.querySelector('[role="dialog"], [role="menu"], [role="listbox"], [data-popup-open]')) leaveSettings()
  }, settings && !palette && !customizing && !(narrow && expanded))
  useEffect(() => {
    if (!route && location.path === '/' && first && first !== '/') navigate(first, { replace: true })
  }, [route, location.path, first])

  const Screen = route?.component ?? NotFound
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  // Workspace panels decide their own placement and visibility (e.g. the assistant overlay).
  const asides = panelsFor('shell.aside', { full })
  // A line across the top of the workspace for what its module needs someone to see.
  const banners = panelsFor('shell.banner', { full })
  // A column of its own at the right edge; `Dock` from the UI kit draws it and reports its state.
  const docks = panelsFor('shell.dock', { full })
  const sidebarShown = !full && !narrow && (own ? ownOpen : !hidden)
  const sidebar = (onHide: () => void, onNavigate?: () => void) => <Sidebar own={own} onOwnHost={setOwnHost} onHide={onHide} onSearch={() => setPalette(true)} onNavigate={onNavigate} />
  const showLabel = own ? t('Show {name}', { name: own.title }) : t('Show Sidebar')

  return (
    <div
      className="cms-shell relative flex h-screen overflow-hidden bg-bg"
      style={{ '--cms-sidebar-width': sidebarShown ? '248px' : '0px', '--cms-sidebar-toggle': !full && !sidebarShown ? '32px' : '0px' } as CSSProperties}
    >
      {!full && (narrow ? (
        expanded && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setExpanded(false)} aria-hidden="true" />
            <div className="fixed inset-y-0 left-0 z-50 flex border-r border-border-modal shadow-pop">
              {sidebar(() => setExpanded(false), () => setExpanded(false))}
            </div>
          </>
        )
      ) : (
        <div className="cms-shell-sidebar" data-hidden={!sidebarShown || undefined} inert={!sidebarShown}>
          {sidebar(toggleSidebar)}
        </div>
      ))}
      {!full && !sidebarShown && !(dock.open && narrow) && (
        <div className="absolute left-2 top-2.5 z-30">
          <Tooltip content={showLabel} shortcut="mod+\\" side="bottom">
            <IconButton icon="sidebar" label={showLabel} title={undefined} size="sm" onClick={toggleSidebar} />
          </Tooltip>
        </div>
      )}
      <WorkspaceContext value={{ host: workspace, content, sidebar: { host: ownHost, open: narrow ? expanded : ownOpen, setOpen: narrow ? setExpanded : setOwnOpen, claim: claimSidebar } }}>
        <div ref={setWorkspace} inert={dock.full || (dock.open && narrow)} className={cn('relative isolate min-w-0 flex-1', sidebarShown && 'border-l border-border')}>
          {pending && <div className="cms-progress" role="progressbar" aria-label={t('Loading…')} />}
          <div ref={content} data-cms-screen className="h-full overflow-y-auto" onScroll={(e) => scrolls.current.set(key, e.currentTarget.scrollTop)}>
            {!full && banners.map(({ id, component: Banner }) => (
              <ErrorBoundary key={id}>
                <Banner full={full} />
              </ErrorBoundary>
            ))}
            <ScreenLocation location={location}>
              {/* Only the very first screen can show this; later ones wait in the background (see useScreenLocation). */}
              <Suspense fallback={null}>
                <ErrorBoundary key={route?.path + JSON.stringify(params)}>
                  <Screen params={params} />
                </ErrorBoundary>
              </Suspense>
            </ScreenLocation>
          </div>
          {asides.map(({ id, component: Aside }) => (
            <ErrorBoundary key={id}>
              <Aside full={full} />
            </ErrorBoundary>
          ))}
        </div>
      </WorkspaceContext>
      {docks.map(({ id, component: Dock }) => (
        <ErrorBoundary key={id}>
          <Dock full={full} />
        </ErrorBoundary>
      ))}
      <CommandPalette open={palette} onOpenChange={setPalette} />
      <CustomizeSidebar open={customizing} onOpenChange={setCustomizing} />
    </div>
  )
}
