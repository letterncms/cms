import type { Manifest, NavItem, Room } from '@letterncms/sdk'

/**
 * The item a path belongs to: the one with the longest matching path (`/` only for itself). Paths with a query
 * (a screen's Settings tab) stand for no path of their own, and a room's door for none but its first screen's.
 */
export function itemAt(nav: NavItem[], path: string): NavItem | undefined {
  let found: NavItem | undefined
  for (const item of nav) {
    if (item.room || item.path.includes('?')) continue
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

/** The room a path is in: the one it opens on, or the one that lists its place (or the screen it belongs to). */
export function roomAt(manifest: Manifest, path: string): Room | undefined {
  const item = placeAt(manifest.nav, path)
  return manifest.rooms.find((room) => room.path === path || (!!item && room.sections.some((s) => s.items.includes(item.id))))
}

/** Where a room opens: a screen of its own, else its first screen this person may see (settings: General, else their account). */
export function roomHome(manifest: Manifest, id: string): string | undefined {
  return manifest.rooms.find((room) => room.id === id)?.path
}

/** The room of settings, opened beside who is signed in. */
export const SETTINGS = 'settings'

/**
 * The screen above the one on view (its `back`, else its parent crumb): a screen's top bar says it,
 * and the admin's one way back, by the sidebar button, leads there.
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
