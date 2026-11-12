import { locale } from '@letterncms/sdk'

/** "Deutsch" for "de": a language's name in that language, as someone who speaks it looks for it. */
export function nativeName(code: string): string {
  return languageName(code, code)
}

/** "German" for "de", in the admin's own language (not the browser's). */
export function localName(code: string): string {
  return languageName(code, locale())
}

/** A language's name in a language, its first letter capital as in a label ("Français", not "français"); a code no browser knows stays its code. */
function languageName(code: string, inLocale: string): string {
  try {
    const name = new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) ?? code
    return name.charAt(0).toLocaleUpperCase(inLocale) + name.slice(1)
  } catch {
    return code.toUpperCase()
  }
}
