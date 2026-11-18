// The Map block's styles: OpenFreeMap's styles as they are, or one of them painted in a palette. A palette names
// what a map shows (land, water, parks, roads, labels) and every layer of the style is painted by what it shows,
// so one palette fits any OpenMapTiles style. `site` makes its palette from the theme where the map stands.

export const TILES = 'https://tiles.openfreemap.org'

/** What the map's colours paint: what a site may set, and what follows from them. */
export interface Palette {
  land: string
  water: string
  park: string
  road: string
  label: string
}

type Base = 'positron' | 'dark' | 'liberty' | 'bright' | 'fiord'

interface Preset {
  base: Base
  /** A whole palette: the style painted in it. */
  palette?: Palette
  /** Colours over the style's own look, where it needs them. */
  colors?: Partial<Palette>
}

export const PRESETS: Record<string, Preset> = {
  site: { base: 'positron' },
  light: { base: 'positron' },
  dark: { base: 'dark' },
  streets: { base: 'liberty' },
  bright: { base: 'bright' },
  night: { base: 'fiord', colors: { label: '#cdd8f0' } },
  gray: { base: 'positron', palette: { land: '#f1f1f0', water: '#d3d6d9', park: '#e6e8e4', road: '#ffffff', label: '#5f6366' } },
  pastel: { base: 'positron', palette: { land: '#f3f5fa', water: '#b8d6f0', park: '#cfe8d2', road: '#ffffff', label: '#56607a' } },
  blueprint: { base: 'positron', palette: { land: '#163d6e', water: '#0d2b52', park: '#1a4a7d', road: '#5f8fcb', label: '#e3edff' } },
}

export const styleUrl = (base: Base) => `${TILES}/styles/${base}`

/** `a` with `t` of `b` in it, in sRGB: 0 is `a`, 1 is `b`. */
export function mix(a: string, b: string, t: number): string {
  const ch = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
  const [x, y] = [ch(a), ch(b)]
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

export const luminance = (c: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/**
 * The site's palette, from its theme where the map stands: its surface for land, its primary colour for water and
 * parks, and for roads and names whichever of its text and background stands out from that land. A map in a
 * coloured band, whose text is light, still has names and roads to read.
 */
export function sitePalette(read: (name: string) => string): Palette {
  const background = read('--color-background') || '#ffffff'
  const foreground = read('--color-foreground') || '#111111'
  const surface = read('--color-surface') || mix(background, foreground, 0.04)
  const primary = read('--color-primary') || '#3b6ea8'
  const light = luminance(surface) > 0.35
  // The ink: what stands out most from the land.
  const ink = Math.abs(luminance(foreground) - luminance(surface)) >= Math.abs(luminance(background) - luminance(surface)) ? foreground : background
  // Names need a strong ink: the site's own when it is one, or near-black (near-white) with a touch of it.
  const sure = contrast(ink, surface) >= 7 ? ink : mix(light ? '#1a1a1a' : '#f2f2f2', ink, 0.2)
  const land = mix(surface, sure, light ? 0.06 : 0.04)
  // Water and parks in the primary colour, or blue and green where that would not set them apart from the land.
  const tint = (amount: number, fallback: string) => {
    const own = mix(land, primary, amount)
    return contrast(own, land) >= 1.12 ? own : mix(land, fallback, amount)
  }
  return {
    land,
    water: tint(light ? 0.3 : 0.36, '#3d8bc4'),
    park: tint(light ? 0.14 : 0.18, '#4f9a5a'),
    road: light ? mix(surface, '#ffffff', 0.85) : mix(land, sure, 0.2),
    label: mix(sure, land, 0.3),
  }
}

type Layer = { id: string; type: string; 'source-layer'?: string; paint?: Record<string, unknown>; layout?: Record<string, unknown> }
type Style = { layers: Layer[]; [key: string]: unknown }

const MAJOR = /motorway|trunk|primary|major/
const PARKS = /park|wood|grass|forest|meadow|wetland|scrub|pitch|cemetery|garden|golf|recreation/

/** What one layer of an OpenMapTiles style shows, as one of the palette's colours or one that follows from them. */
function kind(layer: Layer): string | null {
  const id = layer.id.toLowerCase()
  const source = layer['source-layer'] ?? ''
  if (layer.type === 'background') return 'land'
  if (layer.type === 'symbol') return 'label'
  if (layer.type === 'raster' || layer.type === 'hillshade') return 'relief'
  if (source === 'water' || source === 'waterway') return 'water'
  if (source === 'park' || ((source === 'landcover' || source === 'landuse') && PARKS.test(id))) return 'park'
  if (source === 'landcover' || source === 'landuse') return 'landuse'
  if (source === 'building') return 'building'
  if (source === 'boundary') return 'boundary'
  if (source === 'aeroway') return 'minor'
  if (source === 'transportation') {
    if (id.includes('casing')) return 'casing'
    if (/rail|transit/.test(id)) return 'rail'
    if (/path|pedestrian|track|service|minor|pier/.test(id)) return 'minor'
    return MAJOR.test(id) ? 'major' : 'road'
  }
  return null
}

/** The colours every kind of layer gets from a palette. */
function shades(p: Palette): Record<string, string> {
  return {
    land: p.land,
    landuse: mix(p.land, p.label, 0.04),
    water: p.water,
    park: p.park,
    building: mix(p.land, p.label, 0.1),
    road: p.road,
    major: mix(p.road, p.label, 0.06),
    minor: mix(p.road, p.land, 0.35),
    casing: mix(p.land, p.label, 0.18),
    rail: mix(p.land, p.label, 0.3),
    boundary: mix(p.land, p.label, 0.4),
    label: p.label,
    halo: p.land,
  }
}

/** Which of a site's own colours paints a kind of layer, when they go over a preset that keeps its own look. */
const OWN: Record<string, keyof Palette> = { land: 'land', water: 'water', park: 'park', road: 'road', major: 'road', minor: 'road', label: 'label' }

/**
 * The style painted: in a whole palette (`full`, every layer by what it shows), or with only the colours given over
 * the style's own look. Labels say names in `language` where the map has them.
 */
export function paint(style: Style, palette: Partial<Palette> | null, language: string, full: boolean): Style {
  const all = palette && full ? shades(palette as Palette) : null
  const color = (k: string): string | null => {
    if (all) return all[k] ?? null
    if (!palette) return null
    if (k === 'halo') return palette.land ?? null
    return OWN[k] ? (palette[OWN[k]] ?? null) : null
  }
  const name = ['coalesce', ['get', `name:${language}`], ['get', 'name:latin'], ['get', 'name']]

  const layers = style.layers.map((layer) => {
    const out: Layer = { ...layer, paint: { ...(layer.paint ?? {}) }, layout: { ...(layer.layout ?? {}) } }
    const paint = out.paint!
    const layout = out.layout!
    const field = JSON.stringify(layer.layout?.['text-field'] ?? '')
    if (layer.type === 'symbol' && language && field.includes('name') && !field.includes('ref')) layout['text-field'] = name
    const k = kind(layer)
    if (!k) return out
    if (k === 'relief') {
      if (all) layout.visibility = 'none'
      return out
    }
    if (layer.type === 'symbol') {
      const text = color('label')
      const water = /water/.test(layer['source-layer'] ?? '')
      if (layer.layout?.['text-field'] && text) paint['text-color'] = water && all ? mix(all.water, all.label, 0.7) : text
      const halo = color('halo')
      if (layer.layout?.['text-field'] && halo) paint['text-halo-color'] = halo
      // Pictures of shops and stations, and road numbers on shields, in another style's colours: a painted map
      // shows the names alone.
      if (all && layer['source-layer'] === 'poi') layout['icon-image'] = ''
      if (all && layer.layout?.['icon-image'] && field.includes('ref')) layout.visibility = 'none'
      return out
    }
    const c = color(k)
    if (!c) return out
    if (layer.type === 'background') paint['background-color'] = c
    else if (layer.type === 'fill' && !paint['fill-pattern']) {
      paint['fill-color'] = c
      delete paint['fill-outline-color']
    } else if (layer.type === 'fill-extrusion') paint['fill-extrusion-color'] = c
    else if (layer.type === 'line') paint['line-color'] = c
    return out
  })

  return { ...style, layers }
}

/** The palette a map is painted in, and whether it replaces the style's own look (full) or only adds colours to it. */
export function palette(preset: string, colors: Partial<Palette>, read: (name: string) => string): { palette: Partial<Palette> | null; full: boolean } {
  const p = PRESETS[preset] ?? PRESETS.site
  const own = p.palette ?? (preset === 'site' || !PRESETS[preset] ? sitePalette(read) : null)
  if (own) return { palette: { ...own, ...colors }, full: true }
  const over = { ...p.colors, ...colors }
  return Object.keys(over).length ? { palette: over, full: false } : { palette: null, full: false }
}
