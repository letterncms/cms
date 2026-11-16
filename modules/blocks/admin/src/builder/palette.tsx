import { cn } from '@letterncms/ui'
import type { Stylesheet } from '../../../tailwind/stylesheet'

/* A colour scheme of the site as the admin shows it everywhere: a tile in its own colours. The Add Style list and
   the design's Colors draw the same one. */

/** A colour scheme of the site: a class that colours a section, its background and its text. */
export interface Scheme {
  /** scheme-tide */
  name: string
  /** tide */
  key: string
  background: string
  text: string
}

export const SCHEME = 'scheme-'

/** The site's schemes, as its stylesheet writes them: a class of `--scheme` and `--scheme-text` that applies the kernel's `scheme`. */
export function schemesOf(sheet: Stylesheet): Scheme[] {
  return sheet.utilities().filter((rule) => rule.name.startsWith(SCHEME) && rule.classes.includes('scheme')).map((rule) => {
    const properties = new Map(sheet.utilityProperties(rule.name).map((p) => [p.name, p.value]))
    return { name: rule.name, key: rule.name.slice(SCHEME.length), background: properties.get('--scheme') ?? 'transparent', text: properties.get('--scheme-text') ?? 'currentColor' }
  })
}

/** A colour one sees through: transparent, or with an alpha below 1. */
const seeThrough = (color: string) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(color.trim())

/**
 * A scheme as a tile in its colours, on a checkerboard when one sees through it: the colours are what they draw as
 * (the theme's variables worked out), "Aa" in its text on its background. A `mark` stands before a name in a list;
 * a `card` is a scheme's own, the same tile larger.
 */
export function SchemeTile({ background, text, size }: { background: string; text: string; size: 'mark' | 'card' }) {
  const clear = seeThrough(background)
  return (
    <span aria-hidden className={cn('relative grid shrink-0 place-items-center overflow-hidden', size === 'mark' ? 'h-4 w-5 rounded-xs text-2xs' : 'h-20 w-full rounded-md text-2xl', clear && 'cms-checkerboard')}>
      <span className="absolute inset-0" style={{ background }} />
      <span className="relative font-semibold leading-none" style={{ color: text, textShadow: clear ? '0 0 3px rgb(0 0 0 / 0.6)' : undefined }}>Aa</span>
      <span className="cms-swatch-edge" />
    </span>
  )
}
