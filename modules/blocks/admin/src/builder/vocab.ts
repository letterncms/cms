import { t } from '@letterncms/sdk'
import type { Resolved } from '../core/context'

/* What a name of the design vocabulary looks like on this site, for the inspector's
   previews. The inspector doesn't load the site's stylesheet, so colors are built from
   the resolved theme's hex values with the same mixes the stylesheet uses. */

const px = (n: number) => `${Math.round(n)}`

/** A color name ("foreground-muted", "primary/40", "lime-300") as CSS, in the light scheme. */
export function colorCss(name: string, r: Resolved | undefined): string {
  if (!r) return 'transparent'
  const [base, alpha] = name.split('/')
  const s = r.schemes.light
  const mix = (p: number, a = s.foreground, b = s.background) => `color-mix(in oklab, ${a} ${p}%, ${b})`
  const roles: Record<string, string> = {
    background: s.background,
    foreground: s.foreground,
    'background-muted': mix(4),
    'background-emphasis': mix(9),
    surface: mix(2.5),
    'foreground-muted': mix(s.mix.muted),
    'foreground-subtle': mix(s.mix.subtle),
    border: mix(13),
    'border-strong': mix(s.mix.strong),
    focus: r.palettes.primary?.fill ?? s.foreground,
    scrim: 'rgb(0 0 0 / 0.55)',
    shadow: r.palettes.neutral?.shades['950'] ?? '#000',
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    current: 'currentColor',
  }
  let css = roles[base]
  if (!css) {
    const shade = base.match(/^([a-z][a-z0-9]*)-(\d{2,3})$/)
    const on = base.match(/^on-([a-z][a-z0-9]*)$/)
    const role = base.match(/^([a-z][a-z0-9]*)-(soft|text)$/)
    if (shade && r.palettes[shade[1]]) css = r.palettes[shade[1]].shades[shade[2]]
    else if (on && r.palettes[on[1]]) css = r.palettes[on[1]].on
    else if (role && r.palettes[role[1]]) css = role[2] === 'soft' ? mix(14, r.palettes[role[1]].fill) : s.text[role[1]] ?? r.palettes[role[1]].fill
    else if (r.palettes[base]) css = r.palettes[base].fill
    else css = 'transparent'
  }
  return alpha ? `color-mix(in oklab, ${css} ${alpha}%, transparent)` : css
}

/** A short hint of what a name is here: "24–30px", "1.45", "280ms", "Inter". */
export function hint(kind: string, name: string, r: Resolved | undefined): string {
  if (!r) return ''
  const negative = name.startsWith('-')
  const n = negative ? name.slice(1) : name
  const range = (f?: { min: number; max: number }) => (f ? (Math.round(f.min) === Math.round(f.max) ? `${px(f.min)}px` : `${px(f.min)}–${px(f.max)}px`) : '')
  if (/^vw-\d+$/.test(n)) return `${n.slice(3)}% ${t('of the width')}`
  if (/^vh-\d+$/.test(n)) return `${n.slice(3)}% ${t('of the height')}`
  if (/^\d+\/\d+$/.test(n) && ['size', 'inset', 'translate'].includes(kind)) return `${Math.round((Number(n.split('/')[0]) / Number(n.split('/')[1])) * 1000) / 10}%`
  switch (kind) {
    case 'space':
    case 'inset':
    case 'translate':
    case 'size': {
      const step = r.spaceRoles[n] ?? n
      if (r.space[step]) return range(r.space[step]) + (r.spaceRoles[n] ? ` · ${step}` : '')
      if (r.containers[n]) return r.containers[n].replace('rem', ` rem`)
      return ''
    }
    case 'fontSize':
      return range(r.sizes[n])
    case 'textStyle': {
      const s = r.textStyles[n]
      return s ? `${s.size} · ${s.weight}` : ''
    }
    case 'family':
      return (r.families[(r.fontRoles as Record<string, string>)[n] ?? n] ?? '').split(',')[0].replace(/"/g, '')
    case 'radius':
      return r.radii[n] ?? ''
    case 'duration':
      return r.durations[n] !== undefined ? `${r.durations[n]}ms` : ''
    case 'weight':
      return r.weights[n] !== undefined ? String(r.weights[n]) : ''
    default:
      return ''
  }
}

/** Names of a size-like property in groups the popover shows under headings. */
export function groups(kind: string, names: string[], keywords: string[]): { label: string; names: string[] }[] {
  const WORDS = ['auto', 'none', 'full', 'screen', 'min', 'max', 'fit']
  const WIDTHS = ['narrow', 'text', 'content', 'wide']
  const keyword = names.filter((n) => keywords.includes(n) || (['size', 'inset', 'translate'].includes(kind) && WORDS.includes(n)))
  const rest = names.filter((n) => !keyword.includes(n))
  const by = (test: (n: string) => boolean) => rest.filter(test)
  const viewport = by((n) => /^v[wh]-\d+$/.test(n))
  const fraction = by((n) => /^\d+\/\d+$/.test(n))
  const widths = by((n) => WIDTHS.includes(n))
  const named = by((n) => !/^v[wh]-\d+$/.test(n) && !/^\d+\/\d+$/.test(n) && !WIDTHS.includes(n))
  const out = [
    { label: t('Keywords'), names: keyword },
    { label: t('Widths'), names: kind === 'size' ? widths : [] },
    { label: kind === 'size' || kind === 'space' || kind === 'inset' ? t('Space steps') : t('Steps'), names: kind === 'size' ? named : [...named, ...widths] },
    { label: t('Fractions'), names: fraction },
    { label: t('Screen'), names: viewport },
  ]
  return out.filter((g) => g.names.length)
}
