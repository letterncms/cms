import { getManifest, onManifest, type Manifest } from '@letterncms/sdk'

/**
 * The admin's accent: the colour of going live, of highlights and of the chat's bubble, chosen by name from a
 * set made to be read (Cms\Admin\Accent, which sends it as `accents`). The site chooses it for everyone, a
 * person may choose their own (the `accent` preference), and nothing means amber, which is
 * what the tokens are. The server paints it before the first frame; this keeps it current. `dark`: the
 * accent is the admin's ink (Monochrome), and these are its fill and words on dark.
 */
export interface Accent { name: string; label: string; fill: string; ink: string; dark: { fill: string; ink: string } | null; css: string }

export const DEFAULT_ACCENT = 'amber'

/** The accents there are to choose, the brand's first. */
export function accents(manifest: Manifest = getManifest()): Accent[] {
  return ((manifest as { accents?: Accent[] }).accents ?? [])
}

/** The tokens one sets, as the server painted them (focus and selection in it too): nothing for the brand's own. */
export function accentCss(name: string | null | undefined, manifest?: Manifest): string {
  return (name && accents(manifest).find((a) => a.name === name)?.css) || ''
}

/** Wear this accent now (null: the brand's own), in the style the server painted first. */
export function applyAccent(name: string | null | undefined, manifest?: Manifest) {
  let style = document.getElementById('cms-accent')
  if (!style) {
    style = document.createElement('style')
    style.id = 'cms-accent'
    document.head.append(style)
  }
  const css = accentCss(name, manifest)
  if (style.textContent !== css) style.textContent = css
}

const known = (manifest: Manifest, name: unknown) => (typeof name === 'string' && accents(manifest).some((a) => a.name === name) ? name : null)

/** What this person wears: their own, else the site's, else the brand's (null). */
export const accentOf = (manifest: Manifest) => known(manifest, manifest.user?.preferences?.accent) ?? known(manifest, manifest.site?.accent)

// Saved in Account or in Settings, the manifest comes again: the admin takes it at once.
onManifest((manifest) => applyAccent(accentOf(manifest), manifest))
try {
  const manifest = getManifest()
  applyAccent(accentOf(manifest), manifest)
} catch { /* before sign-in: what the server painted */ }
