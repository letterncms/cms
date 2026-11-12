import { brand, confirmLeaving, events, matchPath, navigate, onLinkIntent, panelsFor, registry, ScreenLocation, t, useManifest, useScreen, useScreenContext, useScreenLocation, type Location, type RouteDef } from '@letterncms/sdk'
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { NotFound } from '../screens/NotFound'
import { cn, confirm, IconButton, ResizeHandle, ShortcutsDialog, SHORTCUTS_KEY, Tooltip } from '../ui'
import './commands'
import { CustomizeSidebar } from './CustomizeSidebar'
import { ErrorBoundary } from './ErrorBoundary'
import { Sidebar, StateBack, type OwnSidebar } from './Sidebar'
import { isPinned, leaveSettings, setPinned, SETTINGS_SHORTCUT, toggleSettings, unpin } from './sidebarStore'
import { inSettings, itemAt, noteLocation, placeAt } from '../ui/place'
import { useShortcut } from '../ui/shortcuts'
import { WorkspaceContext } from '../ui/WorkspaceContext'
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

// Leaving unsaved changes (a link, Back, the way out of settings) asks in the admin's own dialog. A stray Enter keeps them.
confirmLeaving((message) => confirm({ title: message, confirm: t('Discard'), danger: true }))

/** Resolves once the screen at a path can be drawn without waiting (used at boot, so the first screen appears whole). */
export function screenReady(path: string, search = ''): Promise<unknown> {
  const url = new URL(path + search, window.location.origin)
  const { route, params } = resolve(url.pathname)
  const location: Location = { path: url.pathname, search: url.search, query: Object.fromEntries(url.searchParams), action: 'push' }
  // Loading failures belong to the destination screen, never an unhandled hover promise.
  return Promise.allSettled([warm(route?.component), Promise.resolve().then(() => route?.load?.(params, location))])
}

const prepareScreen = (location: Location) => screenReady(location.path, location.search)

const SIDEBAR_WIDTH = 248
const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 400
const clampSidebar = (width: number) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Math.round(width)))

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Whether a screen's own sidebar was out when this person last left it. */
const remembered = (title: string) => stored(`cms.sidebar.${title}`) === 'open'
function remember(title: string, open: boolean) {
  try {
    localStorage.setItem(`cms.sidebar.${title}`, open ? 'open' : 'collapsed')
  } catch { /* private window: not remembered */ }
}

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

/** The browser tab is named after the screen, as its top bar names it. */
function DocumentTitle() {
  const { title } = useScreen()
  useEffect(() => {
    document.title = title ? `${title} · ${brand().name}` : brand().name
  }, [title])
  return null
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
  const [hidden, setHidden] = useState(() => stored('cms.sidebar') === 'collapsed')
  // As wide as it was dragged, on every screen.
  const [sidebarWidth, setSidebarWidth] = useState(() => clampSidebar(Number(stored('cms.sidebar.width')) || SIDEBAR_WIDTH))
  const [resizingSidebar, setResizingSidebar] = useState(false)
  const resizeSidebar = (width: number) => {
    const next = clampSidebar(width)
    setSidebarWidth(next)
    try { localStorage.setItem('cms.sidebar.width', String(next)) } catch { /* private window: not remembered */ }
  }
  const [customizing, setCustomizing] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  // Below tablet width it opens over the screen and goes again with the next screen.
  const narrow = useMedia('(max-width: 767px)')
  const [expanded, setExpanded] = useState(false)
  const content = useRef<HTMLDivElement>(null)
  const [workspace, setWorkspace] = useState<HTMLDivElement | null>(null)
  const [inspector, setInspector] = useState<HTMLDivElement | null>(null)
  const [dock, setDock] = useState<DockState>({ open: false, full: false })
  // A screen can bring a state of its own to the sidebar (the builder's outline): out or folded away as each person last left it.
  // Claims stack, so a screen can hold the sidebar while what fills it still loads. Taking it over or giving it back is
  // a new screen, not a movement: it happens at once, in the same frame as the screen.
  const [claims, setClaims] = useState<{ list: OwnSidebar[]; open: boolean; instant: boolean }>({ list: [], open: false, instant: false })
  const claim = claims.list.at(-1) ?? null
  const ownOpen = claims.open
  const setOwnOpen = useCallback((open: boolean) => setClaims((c) => ({ ...c, open })), [])
  const [ownHost, setOwnHost] = useState<HTMLElement | null>(null)
  const claimSidebar = useCallback((state: OwnSidebar) => {
    setClaims((c) => c.list.length ? { ...c, list: [...c.list, state] } : { list: [state], open: !!state.nested || remembered(state.title), instant: true })
    return () => setClaims((c) => {
      const list = c.list.filter((claim) => claim !== state)
      return { ...c, list, instant: c.instant || list.length === 0 }
    })
  }, [])
  useEffect(() => {
    if (!claims.instant) return
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setClaims((c) => ({ ...c, instant: false }))) })
    return () => cancelAnimationFrame(frame)
  }, [claims.instant])
  const scrolls = useRef(new Map<string, number>())
  // The bar at the top of a screen starts after the sidebar button and the way back, however long its name.
  const [leading, setLeading] = useState<HTMLElement | null>(null)
  const [leadingWidth, setLeadingWidth] = useState(28)
  useLayoutEffect(() => { if (leading) setLeadingWidth(leading.offsetWidth) })
  useEffect(() => {
    if (!leading) return
    const observer = new ResizeObserver(() => setLeadingWidth(leading.offsetWidth))
    observer.observe(leading)
    return () => observer.disconnect()
  }, [leading])

  const manifest = useManifest()
  const settings = inSettings(manifest, location.path)
  const place = placeAt(manifest.nav, location.path)
  // Sections of one screen (the design system's) go under its row, where the screen was opened; the sidebar stays the one it was.
  // Only when that row is not there (under More, or in settings) do they take the sidebar over, like any screen's own list.
  const nested = !!claim?.nested && !settings && !!place && manifest.sidebar.sections.some((s) => s.items.includes(place.id)) && isPinned(manifest.sidebar, place.id)
  const own = claim && !nested ? claim : null

  // Every screen on view, so a way back returns to where someone came from (see `cameFrom`).
  const noted = useRef('')
  if (noted.current !== location.path + location.search) {
    noted.current = location.path + location.search
    noteLocation(noted.current, route?.path ?? location.path, location.action)
  }

  // What is on the desk above the sheet, so the sidebar button stays in the sheet's top bar under it.
  const [banner, setBanner] = useState<HTMLElement | null>(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  useEffect(() => {
    if (!banner) return setBannerHeight(0)
    const observer = new ResizeObserver(() => setBannerHeight(banner.offsetHeight))
    observer.observe(banner)
    return () => observer.disconnect()
  }, [banner])

  useLayoutEffect(() => {
    setDock(dockState())
    return events.on<DockState>('shell.dock', setDock)
  }, [])
  const toggleSidebar = () => {
    if (narrow) setExpanded((e) => !e)
    else if (own) {
      // Under the name of the screen's first claim: the one its open state was read for.
      remember(claims.list[0].title, !ownOpen)
      setOwnOpen(!ownOpen)
    }
    else setHidden((h) => !h)
  }

  useEffect(() => { try { localStorage.setItem('cms.sidebar', hidden ? 'collapsed' : 'open') } catch { /* private window: not remembered */ } }, [hidden])
  // Search is the chat's `/`, with everything the admin finds and does: the chat opens it (see the workspace module).
  useShortcut('mod+k', () => events.emit('search.open'), true, t('Search and Commands'))
  useShortcut(SETTINGS_SHORTCUT, toggleSettings, true, t('Open Settings'))
  // `?` lists every key that works here. Not while a dialog is open: the key belongs to it.
  useShortcut(SHORTCUTS_KEY, () => { if (!document.querySelector('[role="dialog"], [role="alertdialog"]')) setShortcuts(true) }, true, t('Keyboard Shortcuts'))
  useEffect(() => events.on('shortcuts.open', () => setShortcuts(true)), [])
  useEffect(() => events.on('sidebar.customize', () => setCustomizing(true)), [])
  // Modules pin and unpin their own items.
  useEffect(() => events.on<{ id: string; pinned: boolean }>('sidebar.pin', ({ id, pinned }) => (pinned ? setPinned(id, true) : unpin(id))), [])
  useShortcut('mod+\\', toggleSidebar, true, t('Toggle Sidebar'))

  // Every screen's code, fetched while the admin is idle.
  useEffect(() => {
    idle(() => registry.routes.all().forEach((r) => warm(r.component)))
  }, [routesVersion])

  // A new screen starts at the top; back and forward return to where you were.
  const key = location.path + location.search
  // The overlay goes with the next screen.
  useEffect(() => setExpanded(false), [live.path, narrow])
  useShortcut('escape', () => setExpanded(false), narrow && expanded)
  // The top bar's hairline shows once there is something under it.
  const [scrolled, setScrolled] = useState(false)
  useLayoutEffect(() => {
    const el = content.current
    if (el) el.scrollTop = location.action === 'pop' ? (scrolls.current.get(key) ?? 0) : 0
    setScrolled(!!el && el.scrollTop > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.path])

  // Without a home screen (letterncms/dashboard off) the admin opens on the first pinned item of the sidebar.
  const screenItem = itemAt(manifest.nav, location.path)
  useScreenContext({ title: screenItem?.label, icon: screenItem?.icon, private: route?.private === true }, { fallback: true })
  const pinned = manifest.sidebar.sections.flatMap((s) => s.items).find((id) => !manifest.sidebar.hidden.includes(id))
  const first = manifest.nav.find((n) => n.id === pinned)?.path

  // Esc leaves settings, unless something on top of the screen takes it (a dialog, a menu, a field), or someone is at work in the page itself.
  useShortcut('escape', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"], [role="listbox"], .cms-dock, [data-cms-screen]')) return
    if (!document.querySelector('[role="dialog"], [role="menu"], [role="listbox"], [data-popup-open]')) leaveSettings()
  }, settings && !customizing && !(narrow && expanded))
  useEffect(() => {
    if (!route && location.path === '/' && first && first !== '/') navigate(first, { replace: true })
  }, [route, location.path, first])

  const Screen = route?.component ?? NotFound
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  // A line on the desk above the sheet for what its module needs someone to see (test mode, an update running): its own row, so it never sits over a screen.
  const banners = panelsFor('shell.banner', {})
  // A column of its own at the right edge; `Dock` from the UI kit draws it and reports its state.
  const docks = panelsFor('shell.dock', {})
  const sidebarShown = !narrow && (own ? ownOpen : !hidden)
  const sidebar = (onNavigate?: () => void) => <Sidebar own={own} nested={nested ? claim : null} drawer={!!onNavigate} onOwnHost={setOwnHost} onSearch={(e?: { currentTarget: EventTarget | null }) => { setExpanded(false); events.emit('search.open', { from: e?.currentTarget }) }} onNavigate={onNavigate} />
  const sidebarOut = narrow ? expanded : sidebarShown
  const toggleLabel = own
    ? sidebarOut ? t('Hide {name}', { name: own.title }) : t('Show {name}', { name: own.title })
    : sidebarOut ? t('Hide Sidebar') : t('Show Sidebar')
  // On the desk the sheet is inset from the window; the sidebar button sits in its top bar while the sidebar is away.
  const inset = !narrow

  return (
    <div className="flex h-screen bg-surface">
      <div
        className="cms-shell relative flex min-h-0 min-w-0 flex-1 overflow-hidden"
        data-sidebar={sidebarShown ? '' : undefined}
        data-inset={inset ? '' : undefined}
        data-resizing={resizingSidebar || undefined}
        style={{ '--cms-sidebar-size': `${sidebarWidth}px`, '--cms-sidebar-width': sidebarShown ? `${sidebarWidth}px` : '0px', '--cms-sidebar-toggle': !sidebarShown ? `${leadingWidth + 4}px` : '0px', '--cms-banner-height': `${bannerHeight}px`, ...(claims.instant ? { '--cms-panel-speed': '0s' } : {}) } as CSSProperties}
      >
        <DocumentTitle />
        {/* The first stop for the keyboard: straight to the screen, past the sidebar. */}
        <a href="#cms-content" className="cms-skip" onClick={(e) => { e.preventDefault(); content.current?.focus({ preventScroll: true }) }}>{t('Skip to Content')}</a>
        {/* One place, above whatever is there: the sidebar coming and going never moves these. First for the keyboard too, as they are on view. */}
        {!(dock.open && narrow) && (
          <div ref={setLeading} data-drawer={narrow && expanded ? '' : undefined} className={cn('cms-leading absolute flex max-w-[calc(var(--cms-sidebar-size)-16px)] items-center gap-1 [@media(pointer:coarse)]:gap-4', narrow && expanded ? 'z-tooltip' : 'z-bar')}>
            <Tooltip content={toggleLabel} shortcut="mod+\\" side="bottom">
              <IconButton icon="sidebar" label={toggleLabel} title={undefined} size="sm" onClick={toggleSidebar} />
            </Tooltip>
            {!dock.full && <StateBack own={own} drawer={narrow && expanded} onNavigate={() => setExpanded(false)} />}
          </div>
        )}
        {narrow ? (
          expanded && (
            <>
              <div className="fixed inset-0 z-drawer bg-overlay" onClick={() => setExpanded(false)} aria-hidden="true" />
              <div className="cms-sidebar-drawer fixed inset-y-0 left-0 z-overlay flex">
                {sidebar(() => setExpanded(false))}
              </div>
            </>
          )
        ) : (
          <>
            <div className="cms-side-panel" style={{ '--cms-side-panel-width': 'var(--cms-sidebar-size)' } as CSSProperties} data-hidden={!sidebarShown || undefined} inert={!sidebarShown}>
              {sidebar()}
            </div>
            {sidebarShown && <ResizeHandle value={sidebarWidth} min={SIDEBAR_MIN} max={SIDEBAR_MAX} grows="right" onResize={resizeSidebar} onReset={() => resizeSidebar(SIDEBAR_WIDTH)} onResizing={setResizingSidebar} label={t('Resize Sidebar')} className="cms-sidebar-handle" />}
          </>
        )}
        <div className="cms-desk-main flex min-w-0 flex-1 flex-col">
          {banners.length > 0 && (
            <div ref={setBanner} className="shrink-0">
              {banners.map(({ id, component: Banner }) => (
                <ErrorBoundary key={id}>
                  <Banner />
                </ErrorBoundary>
              ))}
            </div>
          )}
          <WorkspaceContext value={{ host: workspace, content, inspector, sidebar: { host: ownHost, open: narrow ? expanded : ownOpen, setOpen: narrow ? setExpanded : setOwnOpen, claim: claimSidebar, claimed: own !== null, nested } }}>
            <div ref={setWorkspace} inert={dock.full || (dock.open && narrow)} className="cms-sheet relative isolate min-h-0 min-w-0 flex-1">
              {pending && <div className="cms-progress" role="progressbar" aria-label={t('Loading…')} />}
              <div
                ref={content}
                id="cms-content"
                tabIndex={-1}
                data-cms-screen
                data-scrolled={scrolled ? '' : undefined}
                className="h-full overflow-y-auto"
                onScroll={(e) => {
                  scrolls.current.set(key, e.currentTarget.scrollTop)
                  const down = e.currentTarget.scrollTop > 0
                  if (down !== scrolled) setScrolled(down)
                }}
              >
                <ScreenLocation location={location}>
                  {/* Only the very first screen can show this; later ones wait in the background (see useScreenLocation). */}
                  <Suspense fallback={null}>
                    <ErrorBoundary key={route?.path + JSON.stringify(params)}>
                      <Screen params={params} />
                    </ErrorBoundary>
                  </Suspense>
                </ScreenLocation>
              </div>
            </div>
          </WorkspaceContext>
        </div>
        {/* A screen's inspector, on the desk beside the sheet (see InspectorPanel). */}
        <div ref={setInspector} className="flex shrink-0 py-2 empty:hidden max-md:hidden" />
        {docks.map(({ id, component: Dock }) => (
          <ErrorBoundary key={id}>
            <Dock />
          </ErrorBoundary>
        ))}
        <CustomizeSidebar open={customizing} onOpenChange={setCustomizing} />
        <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
      </div>
    </div>
  )
}
