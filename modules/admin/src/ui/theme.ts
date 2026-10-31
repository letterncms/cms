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
