import { useEffect, useRef, useSyncExternalStore } from 'react'

export interface ScreenSelection {
  /** Tells one selected thing from the next. */
  id: string
  label: string
  icon?: string
  /** Facts about it, read only when they are needed. */
  data?: () => unknown
}

/**
 * What the screen on view is about, for whatever works alongside it (the
 * assistant's chat). Screens say what they know and nothing needs them to: a
 * screen that says nothing is still known by its title and its text.
 */
export interface ScreenContext {
  /** What to call it. */
  title?: string
  icon?: string
  /** The sort of thing it shows, such as `entry`. */
  kind?: string
  /** Facts about it, read only when they are needed. They take the place of the screen's text. */
  data?: () => unknown
  /** The part of it in focus. */
  selection?: ScreenSelection | null
  /** Bring what is on view up to date, for someone about to read or change it: an editor saves. */
  flush?: () => Promise<unknown>
  /** Nothing on it leaves this screen (see `RouteDef.private`). */
  private?: boolean
}

const layers = new Map<object, ScreenContext>()
/** What the shell knows of any screen; what the screen says for itself goes over it. */
const defaults = new Map<object, ScreenContext>()
const listeners = new Set<() => void>()
let merged: ScreenContext = {}

function changed() {
  merged = {}
  for (const layer of [...defaults.values(), ...layers.values()]) {
    for (const [key, value] of Object.entries(layer)) if (value !== undefined) (merged as Record<string, unknown>)[key] = value
  }
  listeners.forEach((listener) => listener())
}

export const screenContext = {
  get: () => merged,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}

/** Say what the screen is about, for as long as this component is mounted. Later mounts add to earlier ones; `fallback` gives way to them all. */
export function useScreenContext(context: ScreenContext, { fallback = false }: { fallback?: boolean } = {}) {
  const store = fallback ? defaults : layers
  const key = useRef({}).current
  const latest = useRef(context)
  latest.current = context
  const { title, icon, kind, selection, private: secret } = context
  const hasData = !!context.data
  const hasFlush = !!context.flush
  useEffect(() => {
    store.set(key, {
      title, icon, kind, private: secret,
      data: hasData ? () => latest.current.data?.() : undefined,
      flush: hasFlush ? async () => latest.current.flush?.() : undefined,
      selection: selection === undefined ? undefined : selection && { ...selection, data: () => latest.current.selection?.data?.() },
    })
    changed()
    return () => {
      store.delete(key)
      changed()
    }
  }, [store, key, title, icon, kind, secret, hasData, hasFlush, selection === undefined, selection?.id, selection?.label, selection?.icon])
}

/** The screen's text, as far as it goes. Field values are not part of it. */
export function screenText(limit: number): string {
  const text = document.querySelector<HTMLElement>('[data-cms-screen]')?.innerText ?? ''
  return text.replace(/\n{3,}/g, '\n\n').trim().slice(0, limit)
}

export function useScreen(): ScreenContext {
  return useSyncExternalStore(screenContext.subscribe, screenContext.get)
}
