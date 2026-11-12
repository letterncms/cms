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

/** Where settings open: General, or the first page this person may see (their account). */
export function settingsHome(manifest: Manifest): string | undefined {
  const general = manifest.nav.find((n) => n.id === 'settings.site')
  return general?.path ?? manifest.nav.find((n) => n.id === manifest.settingsNav[0]?.items[0])?.path
}

function settingsPlace(manifest: Manifest, path: string): boolean {
  const item = placeAt(manifest.nav, path)
  return !!item && settingsIds(manifest).has(item.id)
}

/**
 * Whether a path is one of the settings sidebar's places (or belongs to one). A screen's Settings tab is
 * a tab of that screen, wherever the screen is: settings have one home, so no location is in both sidebars.
 */
export function inSettings(manifest: Manifest, path: string): boolean {
  return settingsPlace(manifest, path)
}

/**
 * Where the screen on view was opened from: the last place before it that was
 * another screen (another route, not another entry in the same editor), for ways
 * back that return to where someone actually came from. Redirects (a replace)
 * leave no trace, so a way back never leads into one.
 */
const trail = { current: null as { key: string; route: string } | null, from: null as string | null }

/** For the admin: called with every location the admin shows, and the route that draws it. */
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

/**
 * The screen above the one on view (its parent crumb), for the one way back a phone's top bar has:
 * a screen says it, the shell's back button by the sidebar button leads there.
 */
export interface Way { to: string; label: string }
const above = { way: null as Way | null, listeners: new Set<() => void>() }

export function noteParent(way: Way | null) {
  if (above.way?.to === way?.to && above.way?.label === way?.label) return
  above.way = way
  above.listeners.forEach((listener) => listener())
}

export function subscribeParent(listener: () => void): () => void {
  above.listeners.add(listener)
  return () => above.listeners.delete(listener)
}

export function parentWay(): Way | null {
  return above.way
}
