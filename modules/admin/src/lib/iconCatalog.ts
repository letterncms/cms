import { useEffect, useSyncExternalStore } from 'react'

export interface IconCatalog {
  /** Every Phosphor icon by name, as SVG body (256 × 256). */
  icons: Record<string, string>
  /** Other words each icon is found by, space-separated: `envelope-simple` is also mail, email, send… */
  tags: Record<string, string>
  /** The admin's own icon names and the Phosphor icon each one draws. */
  semantic: Record<string, string>
}

let catalog: IconCatalog | null = null
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

/** The full icon set is large, so it loads the first time something needs an icon the admin doesn't ship up front. */
export function loadIconCatalog(): Promise<void> {
  return (loading ??= import('./icon-catalog.json').then((module) => {
    catalog = module.default as IconCatalog
    listeners.forEach((listener) => listener())
  }))
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useIconCatalog(): IconCatalog | null {
  useEffect(() => { void loadIconCatalog() }, [])
  return useSyncExternalStore(subscribe, () => catalog)
}

/** Stored names are the admin's own (`page`) or a Phosphor name (`handshake`); `ph-<name>` reaches a Phosphor icon the admin's own name shadows. */
export function catalogBody(name: string, set: IconCatalog): string | undefined {
  return name.startsWith('ph-') && set.icons[name.slice(3)] ? set.icons[name.slice(3)] : set.icons[name]
}

/** The stored name that draws this Phosphor icon: its own, unless an admin name already means something else. */
export function storedName(phosphor: string, set: IconCatalog): string {
  const shadow = set.semantic[phosphor] !== undefined && set.semantic[phosphor] !== phosphor
  if (!shadow) return phosphor
  return Object.keys(set.semantic).find((name) => set.semantic[name] === phosphor) ?? `ph-${phosphor}`
}

/** The Phosphor icon a stored name draws. */
export function phosphorName(stored: string, set: IconCatalog): string | undefined {
  const direct = set.semantic[stored]
  if (direct) return direct
  if (stored.startsWith('ph-') && set.icons[stored.slice(3)]) return stored.slice(3)
  return set.icons[stored] ? stored : undefined
}
