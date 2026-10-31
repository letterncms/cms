import { boot } from './api'

/**
 * The admin speaks the user's language. Labels are written in English and are their
 * own key; core and every package ship `lang/<code>.json` dictionaries, merged by the
 * server and handed over at boot. A missing translation shows the English text.
 * Write English labels, headings and actions in title case ("Design System");
 * descriptions, instructions and messages use sentence case. Translations follow
 * the capitalization conventions of their language.
 *
 *   t('Publish')                             → "Publiceren"
 *   t('Delete “{title}”?', { title })        → placeholders in braces
 *   plural(count, '{count} entry', '{count} entries')
 *   {brand} in any string                    → the product's name, without passing it
 */
// Read from boot on first use: api.ts translates its own errors, so the two modules import each other.
let messages: Record<string, string> | null = null
let current: string | null = null
const dictionary = () => (messages ??= (boot.messages as Record<string, string> | undefined) ?? {})

export function t(text: string, params?: Record<string, string | number | null | undefined>): string {
  const translated = dictionary()[text] || text
  if (!translated.includes('{')) return translated
  const values: Record<string, string | number | null | undefined> = { brand: boot.brand?.name, ...params }
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => (values[key] === undefined || values[key] === null ? match : String(values[key])))
}

/** The singular or plural form for a count, translated, with `{count}` filled in. */
export function plural(count: number, one: string, other: string, params?: Record<string, string | number | null | undefined>): string {
  const form = new Intl.PluralRules(locale()).select(count) === 'one' ? one : other
  return t(form, { count: count.toLocaleString(locale()), ...params })
}

/** The admin's language (a code like `nl`). Dates and numbers follow it. */
export function locale(): string {
  return (current ??= boot.locale ?? 'en')
}

/** The languages the admin speaks: code → name in that language. */
export function languages(): Record<string, string> {
  return boot.languages ?? { en: 'English' }
}

/** Switch the dictionary (after the user picks another language). */
export function setLocale(code: string, dictionary: Record<string, string>) {
  current = code
  messages = dictionary
  document.documentElement.lang = code
}
