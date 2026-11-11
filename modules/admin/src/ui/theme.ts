import { getManifest, onManifest, setPreference, type Manifest } from '@letterncms/sdk'
import { useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Light, dark or the system's: kept on the person's account (the `theme` preference), so it follows
 * them to another browser, and in this browser too, so the page is right before the account has
 * answered and on the screens before sign-in.
 */
const KEY = 'cms.theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')
media.addEventListener('change', () => applyTheme())

export function applyTheme() {
  const pref = getThemePreference()
  const dark = pref === 'dark' || (pref === 'system' && media.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}
const isPreference = (value: unknown): value is ThemePreference => value === 'light' || value === 'dark' || value === 'system'

export function getThemePreference(): ThemePreference {
  try {
    const kept = localStorage.getItem(KEY)
    return isPreference(kept) ? kept : 'system'
  } catch {
    return 'system'
  }
}

function keep(pref: ThemePreference) {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    /* private mode */
  }
  applyTheme()
  chosen.forEach((listener) => listener())
}

const chosen = new Set<() => void>()

/** The preference itself (not the theme it comes to), wherever it was last chosen: the menu, the palette, another browser. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore((listener) => { chosen.add(listener); return () => { chosen.delete(listener) } }, getThemePreference)
}

let account: Manifest | null = null

export function setThemePreference(pref: ThemePreference) {
  keep(pref)
  // Signed in: their account remembers it. A failed save costs nothing here: this browser has it.
  if (account) void setPreference('theme', pref).catch(() => {})
}

// What the account says wins over what this browser last had: it is the newer choice wherever it was made.
const follow = (manifest: Manifest) => {
  account = manifest
  const theirs = manifest.user?.preferences?.theme
  if (isPreference(theirs) && theirs !== getThemePreference()) keep(theirs)
}

const watch = (changed: () => void) => {
  const observer = new MutationObserver(changed)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

/** The theme on view. For a piece that is set in the other one (`data-theme` on it turns every token around), like the save bar. */
export function useTheme(): 'light' | 'dark' {
  return useSyncExternalStore(watch, () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
}

// Last, when everything above is there. The page that comes with a manifest already has it
// (and the server set the account's theme before the first paint: see AdminShell).
onManifest(follow)
let embedded: Manifest | null = null
try {
  embedded = getManifest()
} catch { /* before sign-in: this browser's own */ }
if (embedded) follow(embedded)
