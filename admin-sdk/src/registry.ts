import type { ComponentType } from 'react'
import type { EntryPanelProps, FieldProps, SurfaceComponentProps } from './types'
import type { Location } from './router'
import type { ComposerSource } from './composer'

export interface RouteDef {
  path: string
  component: ComponentType<{ params: Record<string, string> }>
  /** Prime required queries before showing this screen. Also called on link intent. */
  load?: (params: Record<string, string>, location: Location) => Promise<unknown>
  /** "default" renders inside the shell; "full" takes the whole window (editors). */
  layout?: 'default' | 'full'
  /** Drawn over the screen it was opened from, which stays open underneath. */
  overlay?: boolean
  /** What this screen shows stays on it: the assistant's chat gets neither its title nor its text. */
  private?: boolean
  title?: string
}

export interface PanelDef<P = any> {
  id: string
  slot: string
  /** Tab label for sidebar panels. */
  label?: string
  icon?: string
  component: ComponentType<P>
  order?: number
  when?: (props: P) => boolean
  /** Entry field handles edited by this applicable panel. Unclaimed fields use the standard form. */
  fieldHandles?: string[]
}

export interface CommandDef {
  id: string
  label: string
  icon?: string
  group?: string
  keywords?: string[]
  shortcut?: string
  /** When true the palette offers this command for any typed text and passes it in (e.g. "Ask the CMS …"). */
  acceptsQuery?: boolean
  perform: (query?: string) => void | Promise<void>
}

/** A line in the entry editor's More menu. */
export interface EntryActionDef {
  id: string
  label: string
  icon?: string
  order?: number
  when?: (props: EntryPanelProps) => boolean
  perform: (props: EntryPanelProps) => void
}

type Listener = () => void

/** The module whose code is running right now (see `registerAs`); what it registers is attributed to it. */
let owner: string | null = null

interface Layer<T> {
  owner: string | null
  value: T
}

/**
 * A keyed store where a later registration of the same key wins, and taking a
 * module's registrations back reveals what it had replaced.
 */
function store<T>() {
  const layers = new Map<string, Layer<T>[]>()
  const listeners = new Set<Listener>()
  let version = 0
  const changed = () => {
    version++
    listeners.forEach((l) => l())
  }
  const top = (key: string) => {
    const stack = layers.get(key)
    return stack?.[stack.length - 1]
  }
  return {
    set(key: string, value: T) {
      const stack = (layers.get(key) ?? []).filter((layer) => layer.owner !== owner)
      stack.push({ owner, value })
      layers.set(key, stack)
      changed()
    },
    delete(key: string) {
      layers.delete(key)
      changed()
    },
    get: (key: string) => top(key)?.value,
    all: () => [...layers.keys()].map((key) => top(key)!.value),
    entries: () => [...layers.keys()].map((key) => [key, top(key)!.value] as [string, T]),
    subscribe(l: Listener) {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    version: () => version,
    /** @internal Remove what a module registered; returns it so it can be put back. */
    withdraw(id: string): [string, T][] {
      const taken: [string, T][] = []
      for (const [key, stack] of layers) {
        const kept = stack.filter((layer) => {
          if (layer.owner !== id) return true
          taken.push([key, layer.value])
          return false
        })
        if (kept.length === stack.length) continue
        if (kept.length) layers.set(key, kept)
        else layers.delete(key)
      }
      if (taken.length) changed()
      return taken
    },
    /** @internal Put back what `withdraw` took. */
    restore(id: string, entries: [string, T][]) {
      for (const [key, value] of entries) layers.set(key, [...(layers.get(key) ?? []).filter((layer) => layer.owner !== id), { owner: id, value }])
      if (entries.length) changed()
    },
  }
}

/**
 * Extension points for plugins. Admin themes read from here; plugins write.
 *
 *   registry.routes.set('/media', { path: '/media', component: MediaLibrary })
 *   registry.fields.set('media', MediaField)
 *   registry.panels.set('seo', { id: 'seo', slot: 'entry.sidebar', component: SeoPanel })
 */
export const registry = {
  routes: store<RouteDef>(),
  fields: store<ComponentType<FieldProps>>(),
  panels: store<PanelDef>(),
  widgets: store<ComponentType<{ id: string }>>(),
  components: store<ComponentType<SurfaceComponentProps<any>>>(),
  commands: store<CommandDef>(),
  entryActions: store<EntryActionDef>(),
  /** Where `@` and `/` look in a message. */
  composer: store<ComposerSource>(),
  icons: store<string>(),
}

type Stores = typeof registry
export type Registrations = { [K in keyof Stores]: ReturnType<Stores[K]['withdraw']> }

/**
 * Run a module's code (its import and setup) with everything it registers
 * attributed to it, so the admin can take it back when its package is turned
 * off. Admin themes load modules through this, one at a time.
 */
export async function registerAs(id: string, load: () => unknown): Promise<void> {
  const previous = owner
  owner = id
  try {
    await load()
  } finally {
    owner = previous
  }
}

/** Take back everything a module registered. Returns it, for `reregister` when the module comes back. */
export function unregister(id: string): Registrations {
  return Object.fromEntries(Object.entries(registry).map(([name, s]) => [name, s.withdraw(id)])) as Registrations
}

/** Put a module's registrations back (an ES module runs once per page, so turning it on again restores what it registered). */
export function reregister(id: string, registrations: Registrations) {
  for (const [name, entries] of Object.entries(registrations)) registry[name as keyof Stores].restore(id, entries as never)
}

/** Panels for a slot, ordered. */
export function panelsFor<P>(slot: string, props: P): PanelDef<P>[] {
  return (registry.panels.all() as PanelDef<P>[])
    .filter((p) => p.slot === slot && (!p.when || p.when(props)))
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
}
