import { useSyncExternalStore } from 'react'
import { boot, request, run } from './api'
import type { BrandInfo, Manifest } from './types'

let manifest: Manifest | null = null
const listeners = new Set<() => void>()

function publish(next: Manifest) {
  manifest = next
  listeners.forEach((l) => l())
}

/**
 * Fetch the manifest again. Call it after changing anything it describes (packages,
 * collections, the sidebar…): the admin follows along — new modules load, the
 * modules of packages turned off leave, the sidebar redraws — without a reload.
 */
export async function loadManifest(): Promise<Manifest> {
  const res = await request<{ data: Manifest }>('GET', 'manifest')
  publish(res.data)
  return res.data
}

/** Use a manifest the server already sent along (the admin page embeds it at boot). */
export function setManifest(next: Manifest) {
  publish(next)
}

/** Be told whenever the manifest changes (the admin follows it to load and unload modules). */
export function onManifest(listener: (manifest: Manifest) => void): () => void {
  const l = () => manifest && listener(manifest)
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** The product's display name, links and images: never write the name in a string. In a translated string use `{brand}`. */
export function brand(): BrandInfo {
  return manifest?.brand ?? boot.brand
}

export function getManifest(): Manifest {
  if (!manifest) throw new Error('Manifest not loaded yet.')
  return manifest
}

/** The manifest, or null before sign-in (forms like sign-in render without it). */
export function useManifestIfLoaded(): Manifest | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => manifest,
  )
}

export function useManifest(): Manifest {
  const m = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => manifest,
  )
  if (!m) throw new Error('Manifest not loaded yet.')
  return m
}

/**
 * A module's values that every admin user may read (e.g. letterncms/content's page size),
 * as the module put them in the manifest under `config.<namespace>`.
 */
export function useConfig<T extends Record<string, unknown> = Record<string, any>>(namespace: string): Partial<T> {
  return (useManifest().config?.[namespace] ?? {}) as Partial<T>
}

const waiting = new Map<string, { timer: ReturnType<typeof setTimeout>; done: () => void }>()

/**
 * Change one of the signed-in person's preferences (a list's columns, the sidebar they
 * arranged; `null` gives it up). This session's copy in the manifest changes at once and
 * their account follows; with `delay`, a moment later, so a burst of changes saves once.
 */
export function setPreference(key: string, value: unknown, delay = 0): Promise<void> {
  if (manifest) manifest.user.preferences = { ...manifest.user.preferences, [key]: value }
  const previous = waiting.get(key)
  if (previous) {
    clearTimeout(previous.timer)
    previous.done()
  }
  waiting.delete(key)
  const save = () => run('account/update', { preferences: { [key]: value } }).then(() => {})
  if (delay <= 0) return save()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiting.delete(key)
      save().then(resolve, reject)
    }, delay)
    // A later change takes this one's place: it is saved with that.
    waiting.set(key, { timer, done: resolve })
  })
}

/** True when a package (module, plugin or theme) is active on this site. */
export function isActive(pkg: string): boolean {
  return manifest?.packages.active.includes(pkg) ?? false
}

/** Wildcard-aware permission check against the signed-in user's grants. */
export function can(permission: string, any = false): boolean {
  if (!manifest) return false
  const { user } = manifest
  if (user.super) return true
  return user.grants.some((grant) => grant === '*' || glob(grant, permission) || (any && glob(permission, grant)))
}

function glob(pattern: string, value: string): boolean {
  if (pattern === value) return true
  const regex = new RegExp('^' + pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$')
  return regex.test(value)
}
