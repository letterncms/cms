import { getManifest, onManifest, t, type Manifest } from '@letterncms/sdk'

/**
 * The admin's accent: the colour of going live, of highlights and of the chat's button. One colour is all
 * anyone picks; the words on it and its washes follow from it (the tokens mix the washes, `accentInk` picks
 * the words), as the server does before the first paint (Cms\Admin\Accent). The site sets it for everyone,
 * a person may choose their own (the `accent` preference), and nothing means the brand's yellow.
 */
export const DEFAULT_ACCENT = '#ffe100'

/** The swatches offered before any colour at all: the brand's first. */
export const ACCENTS = (): { value: string; label: string }[] => [
  { value: DEFAULT_ACCENT, label: t('Yellow') },
  { value: '#ff7a1a', label: t('Orange') },
  { value: '#f0479a', label: t('Pink') },
  { value: '#7c5cff', label: t('Violet') },
  { value: '#2f6bff', label: t('Blue') },
  { value: '#16b364', label: t('Green') },
]

const DARK_INK = '#1c1b18'
const LIGHT_INK = '#ffffff'

/** A colour as the admin keeps it, `#rrggbb` in lowercase, or null for anything else. */
export function normalizeAccent(value: unknown): string | null {
  if (typeof value !== 'string') return null
  let hex = value.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(hex)) hex = '#' + [...hex.slice(1)].map((c) => c + c).join('')
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The words on the accent: the darker or the lighter ink, whichever stands out more. */
export function accentInk(hex: string): string {
  const l = luminance(hex)
  return 1.05 / (l + 0.05) > (l + 0.05) / (luminance(DARK_INK) + 0.05) ? LIGHT_INK : DARK_INK
}

/** The tokens it changes, in every theme and every piece set in the other one: nothing for the brand's own. */
export function accentCss(value: string | null | undefined): string {
  const hex = normalizeAccent(value)
  return hex === null || hex === DEFAULT_ACCENT ? '' : `:root,[data-theme]{--cms-signal:${hex};--cms-signal-ink:${accentInk(hex)}}`
}

/** Accent the admin with this colour now (null: the brand's own), in the style the server painted first. */
export function applyAccent(value: string | null | undefined) {
  let style = document.getElementById('cms-accent')
  if (!style) {
    style = document.createElement('style')
    style.id = 'cms-accent'
    document.head.append(style)
  }
  const css = accentCss(value)
  if (style.textContent !== css) style.textContent = css
}

/** What this person sees: their own, else the site's, else the brand's. */
export const accentOf = (manifest: Manifest) => normalizeAccent(manifest.user?.preferences?.accent) ?? normalizeAccent(manifest.site?.accent)

// Saved in Account or in Settings, the manifest comes again: the admin takes it at once.
onManifest((manifest) => applyAccent(accentOf(manifest)))
try {
  applyAccent(accentOf(getManifest()))
} catch { /* before sign-in: what the server painted */ }
