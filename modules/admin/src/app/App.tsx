import { events, matchPath, navigate, onLinkIntent, panelsFor, registry, ScreenLocation, t, useManifest, useScreenContext, useScreenLocation, type Location, type RouteDef } from '@letterncms/sdk'
import { Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { NotFound } from '../screens/NotFound'
import { cn } from '../ui'
import { CommandPalette } from './CommandPalette'
import { CustomizeSidebar } from './CustomizeSidebar'
import { ErrorBoundary } from './ErrorBoundary'
import { Sidebar } from './Sidebar'
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('cms.sidebar') === 'collapsed')
  const [palette, setPalette] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  // Editors ask for a compact sidebar while they are open; opening it there lasts until the editor closes.
  const [compact, setCompact] = useState(false)
  const [peek, setPeek] = useState(false)
  // Below tablet width the sidebar keeps to its rail; expanding it there lasts until the next screen.
  const narrow = useMedia('(max-width: 767px)')
  const [expanded, setExpanded] = useState(false)
  const full = route?.layout === 'full'
  const content = useRef<HTMLDivElement>(null)
  const [workspace, setWorkspace] = useState<HTMLDivElement | null>(null)
  // A panel docked beside the rail. Taking the whole window, it pushes the workspace out at the size it has, so nothing on it reflows.
  const [dock, setDock] = useState<DockState>({ open: false, full: false })
  const [pushed, setPushed] = useState<number | undefined>()
  const scrolls = useRef(new Map<string, number>())

  useEffect(() => events.on<boolean>('shell.compact', (on) => { setCompact(!!on); setPeek(false) }), [])
  useLayoutEffect(() => {
    setDock(dockState())
    return events.on<DockState>('shell.dock', (next) => {
      setPushed(next.full ? workspace?.offsetWidth : undefined)
      setDock(next)
      setPeek(false)
    })
  }, [workspace])
  // Beside a docked panel, as in an editor, the sidebar keeps to its rail unless asked.
  const railed = compact || dock.open
  const toggleSidebar = () => (railed ? setPeek((p) => !p) : setCollapsed((c) => !c))

  useEffect(() => localStorage.setItem('cms.sidebar', collapsed ? 'collapsed' : 'open'), [collapsed])
  useShortcut('mod+k', () => setPalette((p) => !p))
  useShortcut(SETTINGS_SHORTCUT, toggleSettings)
  useEffect(() => events.on('sidebar.customize', () => setCustomizing(true)), [])
  // Modules pin and unpin their own items (the assistant's setup offers to put New Chat away).
  useEffect(() => events.on<{ id: string; pinned: boolean }>('sidebar.pin', ({ id, pinned }) => (pinned ? setPinned(id, true) : unpin(id))), [])
  useShortcut('mod+\\', () => (narrow ? setExpanded((e) => !e) : toggleSidebar()))

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
  // A column of its own between the sidebar and the workspace; `Dock` from the UI kit draws it and reports its state.
  const docks = panelsFor('shell.dock', { full })
  const sidebarOpen = !narrow && !(railed ? !peek : collapsed)

  return (
    <div className="relative flex h-screen overflow-hidden bg-bg" style={{ '--cms-rail': full ? '0px' : sidebarOpen ? '248px' : '52px' } as CSSProperties}>
      {!full &&
        (narrow ? (
          // Narrow screens: the rail holds its place; the expanded sidebar opens over the screen.
          <div className="relative flex w-[52px] shrink-0">
            {expanded && <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setExpanded(false)} aria-hidden="true" />}
            <div className={cn('flex h-full', expanded && 'fixed inset-y-0 left-0 z-50 border-r border-border-modal shadow-pop')}>
              <Sidebar collapsed={!expanded} onToggle={() => setExpanded((e) => !e)} onSearch={() => setPalette(true)} onNavigate={() => setExpanded(false)} />
            </div>
          </div>
        ) : (
          <Sidebar collapsed={railed ? !peek : collapsed} onToggle={toggleSidebar} onSearch={() => setPalette(true)} />
        ))}
      {docks.map(({ id, component: Dock }) => (
        <ErrorBoundary key={id}>
          <Dock full={full} />
        </ErrorBoundary>
      ))}
      <WorkspaceContext value={{ host: workspace, content, dock }}>
        <div ref={setWorkspace} inert={dock.full || (dock.open && narrow)} style={pushed ? { minWidth: pushed, flexShrink: 0 } : undefined} className={cn('relative isolate min-w-0 flex-1', !full && 'border-l border-border')}>
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
      <CommandPalette open={palette} onOpenChange={setPalette} />
      <CustomizeSidebar open={customizing} onOpenChange={setCustomizing} />
    </div>
  )
}
