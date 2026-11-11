import { useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

const KEY = 'cms.theme'

export function getThemePreference(): ThemePreference {
  try {
    return (localStorage.getItem(KEY) as ThemePreference) || 'system'
  } catch {
    return 'system'
  }
}

export function setThemePreference(pref: ThemePreference) {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    /* private mode */
  }
  applyTheme()
}

const media = window.matchMedia('(prefers-color-scheme: dark)')
media.addEventListener('change', () => applyTheme())

export function applyTheme() {
  const pref = getThemePreference()
  const dark = pref === 'dark' || (pref === 'system' && media.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
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
