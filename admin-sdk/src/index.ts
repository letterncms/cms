import { locale } from './i18n'

export * from './types'
export { boot, request, requestText, eventStream, run, batch, adminUrl, CmsError, onUnauthorized, xsrfToken } from './api'
export type { BatchCall } from './api'
export { navigate, useLocation, useScreenLocation, ScreenLocation, useTab, matchPath, setQuery, Link, blockNavigation, confirmLeaving, prefetch, onLinkIntent } from './router'
export type { LinkProps, Location } from './router'
export { queryClient, useAbility, useAction, invalidate, abilityKey, prefetchAbility } from './query'
export { loadManifest, setManifest, onManifest, getManifest, useManifest, useManifestIfLoaded, useConfig, setPreference, isActive, can, brand } from './manifest'
export { registry, panelsFor, registerAs, unregister, reregister } from './registry'
export type { RouteDef, PanelDef, CommandDef, EntryActionDef, Registered, Registrations } from './registry'
export { events } from './events'
export { screenContext, screenText, useScreen, useScreenContext } from './screen'
export type { ScreenContext } from './screen'
export type { ComposerCommand, ComposerOption, ComposerSource, ContextItem } from './composer'
export { t, plural, locale, languages, setLocale } from './i18n'

/** Human-readable relative time ("3 minutes ago"): whole words, so every unit reads alike ("2 hours", "2 days"). */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return ''
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto', style: 'long' })
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'], [31557600, 'month'], [Infinity, 'year']]
  // A moment ago is "now"; past that, whole units only (23 hours, not a rounded-up "24 hr.", then "yesterday").
  if (Math.abs(seconds) < 45) return rtf.format(0, 'second')
  let previous = 1
  for (const [limit, unit] of steps) {
    if (Math.abs(seconds) < limit) return rtf.format(-Math.trunc(seconds / previous), unit)
    previous = limit
  }
  return ''
}
