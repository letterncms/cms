import type { Manifest, NavItem } from '@letterncms/sdk'

/** The item a path belongs to: the one with the longest matching path (`/` only for itself). Paths with a query (a screen's Settings tab) stand for no path of their own. */
export function itemAt(nav: NavItem[], path: string): NavItem | undefined {
  let found: NavItem | undefined
  for (const item of nav) {
    if (item.path.includes('?')) continue
    const match = item.path === '/' ? path === '/' : path === item.path || path.startsWith(`${item.path}/`)
    if (match && (!found || item.path.length > found.path.length)) found = item
  }
  return found
}

/** The sidebar item that stands for a path: its own, or, for a page that belongs to a screen, that screen's. */
export function placeAt(nav: NavItem[], path: string): NavItem | undefined {
  const item = itemAt(nav, path)
  return item?.home ? nav.find((n) => n.id === item.home) ?? item : item
}

/** The settings namespace a screen keeps as its Settings tab (see `ScreenTabs`), when its plugin has one. */
export function homedSettings(manifest: Manifest, id: string | undefined): string | undefined {
  return id ? manifest.settings.find((s) => s.home === id && manifest.nav.some((n) => n.id === `settings.${s.namespace}`))?.namespace : undefined
}

export function settingsIds(manifest: Manifest): Set<string> {
  return new Set(manifest.settingsNav.flatMap((s) => s.items))
}

/**
 * A plugin's settings kept as its screen's Settings tab (`/analytics?tab=settings`) are a row of the
 * settings sidebar too: the row for that location, if it is one.
 */
export function settingsTabAt(manifest: Manifest, path: string, search: string): NavItem | undefined {
  if (new URLSearchParams(search).get('tab') !== 'settings') return undefined
  const ids = settingsIds(manifest)
  return manifest.nav.find((n) => !!n.home && ids.has(n.id) && n.path.split('?')[0] === path)
}

/**
 * Which sidebar the location on view belongs to. A screen's Settings tab is in both: opened from the
 * settings sidebar it is a settings page, its row active there; opened on the screen, the screen's tab,
 * and the sidebar stays as it was. So it keeps the side it was reached from (for this tab, across a reload).
 */
const SIDE = 'cms.side'
const here = { path: '', search: '', side: readSide() }

function readSide(): 'app' | 'settings' {
  try {
    return sessionStorage.getItem(SIDE) === 'settings' ? 'settings' : 'app'
  } catch {
    return 'app'
  }
}

/** For admin themes: called with the location on view, before anything asks `inSettings` about it. */
export function noteSide(manifest: Manifest, path: string, search: string) {
  here.path = path
  here.search = search
  if (settingsTabAt(manifest, path, search)) return
  // /settings/<namespace> leads to the tab it is kept as: it is reached from settings.
  const side = settingsPlace(manifest, path) || path === '/settings' || path.startsWith('/settings/') ? 'settings' : 'app'
  if (side === here.side) return
  here.side = side
  try {
    sessionStorage.setItem(SIDE, side)
  } catch { /* private window: not kept */ }
}

function settingsPlace(manifest: Manifest, path: string): boolean {
  const item = placeAt(manifest.nav, path)
  return !!item && settingsIds(manifest).has(item.id)
}

/** Whether a path is one of the settings sidebar's places (or belongs to one), or the screen tab on view that was opened as one. */
export function inSettings(manifest: Manifest, path: string): boolean {
  if (settingsPlace(manifest, path)) return true
  return here.side === 'settings' && path === here.path && !!settingsTabAt(manifest, here.path, here.search)
}

/** The settings sidebar's row for the location on view. */
export function settingsRowAt(manifest: Manifest, path: string, search: string): NavItem | undefined {
  return (inSettings(manifest, path) ? settingsTabAt(manifest, path, search) : undefined) ?? placeAt(manifest.nav, path)
}

/**
 * Where the screen on view was opened from: the last place before it that was
 * another screen (another route, not another entry in the same editor), for ways
 * back that return to where someone actually came from. Redirects (a replace)
 * leave no trace, so a way back never leads into one.
 */
const trail = { current: null as { key: string; route: string } | null, from: null as string | null }

/** For admin themes: called with every location the admin shows, and the route that draws it. */
export function noteLocation(key: string, route: string, action: 'push' | 'replace' | 'pop') {
  const current = trail.current
  // Another query, or another entry on the same screen, is still this screen; a redirect takes the place of what it redirects.
  if (current && current.route !== route && action !== 'replace') trail.from = current.key
  trail.current = { key, route }
}

/** The path (and query) the screen on view was opened from in this visit, if any. */
export function cameFrom(): string | null {
  return trail.from
}

/** A way back: to where the screen was opened from, when that was another place in this visit; otherwise to `fallback` (its list, say). */
export function wayBack(manifest: Manifest, fallback: { to: string; label: string }): { to: string; label: string } {
  const from = cameFrom()
  const item = from ? placeAt(manifest.nav, from.split('?')[0]) : undefined
  return from && item ? { to: from, label: item.label } : fallback
}
