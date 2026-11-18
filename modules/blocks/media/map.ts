// Map blocks (MapBlocks::map): an open map drawn from vector tiles, in the style the block names. Its library
// (MapLibre, published beside this file) loads only once a map scrolls near, and the places the block lists as
// text become its pins. On the site a map moves and zooms; in the builder's canvas the editor draws it still, from
// this same file (`canvas`, `mount`).

import type * as MapLibre from 'maplibre-gl'
import { PRESETS, luminance, paint, palette, styleUrl, type Palette } from './map/style'

interface Options {
  style: string
  colors?: Partial<Palette>
  zoom: number
  interactive?: boolean
  language?: string
  words?: Record<string, string>
}

interface Place {
  el: HTMLElement
  lat: number
  lng: number
  name: string
}

type Style = Parameters<typeof paint>[0]

declare const __MAPLIBRE__: string
const LIBRARY = `${new URL('./maplibre/maplibre-gl.mjs', import.meta.url).href}?v=${__MAPLIBRE__}`
const STYLESHEET = `${new URL('./maplibre/maplibre-gl.css', import.meta.url).href}?v=${__MAPLIBRE__}`

let library: Promise<typeof MapLibre> | null = null
const load = () => (library ??= import(/* @vite-ignore */ LIBRARY) as Promise<typeof MapLibre>)

// One download of each style for every map on the page; the painted copies are each map's own.
const styles = new Map<string, Promise<Style>>()
function base(name: string): Promise<Style> {
  let style = styles.get(name)
  if (!style) {
    style = fetch(styleUrl(name as never)).then((r) => {
      if (!r.ok) throw new Error(`Map style ${name}: ${r.status}`)
      return r.json() as Promise<Style>
    })
    style.catch(() => styles.delete(name))
    styles.set(name, style)
  }
  return style.then((s) => structuredClone(s))
}

function stylesheet(doc: Document) {
  if (doc.querySelector('link[data-cms-maplibre]')) return
  const link = doc.createElement('link')
  link.rel = 'stylesheet'
  link.href = STYLESHEET
  link.dataset.cmsMaplibre = ''
  doc.head.append(link)
}

function places(figure: Element): Place[] {
  return [...figure.querySelectorAll<HTMLElement>('[data-cms-map-place]')].flatMap((el) => {
    const lat = Number(el.dataset.lat)
    const lng = Number(el.dataset.lng)
    const name = el.querySelector('.cms-map__name')?.textContent?.trim() ?? ''
    return Number.isFinite(lat) && Number.isFinite(lng) ? [{ el, lat, lng, name }] : []
  })
}

/** A theme variable as a colour where `el` is, with light-dark() settled as the page shows it; '' when there is none. */
function reader(el: HTMLElement, win: Window) {
  return (name: string) => {
    if (!win.getComputedStyle(el).getPropertyValue(name).trim()) return ''
    const probe = el.ownerDocument.createElement('span')
    probe.style.cssText = `display:none;color:var(${name})`
    el.append(probe)
    const color = win.getComputedStyle(probe).color
    probe.remove()
    return hexOf(color, el.ownerDocument)
  }
}

function hexOf(color: string, doc: Document): string {
  const ctx = doc.createElement('canvas').getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = color
  const out = String(ctx.fillStyle)
  if (out.startsWith('#')) return out
  const m = out.match(/[\d.]+/g)
  return m && m.length >= 3 ? '#' + m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, '0')).join('') : ''
}

/** Where a pin's card opens, by the side MapLibre puts it on: clear of a pin standing `at` its offset. */
function around([x, y]: [number, number]): MapLibre.Offset {
  return {
    center: [x, y - 20], top: [x, y], bottom: [x, y - 40], left: [x + 16, y - 20], right: [x - 16, y - 20],
    'top-left': [x + 10, y], 'top-right': [x - 10, y], 'bottom-left': [x + 10, y - 40], 'bottom-right': [x - 10, y - 40],
  }
}

/**
 * How far apart two pins must stand, in pixels: at this distance their boxes (32 by 40) never overlap, whichever
 * way one is from the other. Closer places fan out to it.
 */
const SPACE = 52

const PIN = '<svg viewBox="0 0 32 40" aria-hidden="true" focusable="false"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 39 16 39s15-12 15-23.2C31 7.6 24.3 1 16 1Z"/><circle cx="16" cy="15.5" r="5.5"/></svg>'

/** Draws a map into `view`: resolves with how to take it down, once its first picture is complete. */
async function draw(view: HTMLElement, options: Options, win: Window, canvas: boolean, signal?: AbortSignal): Promise<() => void> {
  const figure = view.closest('[data-cms-map]') ?? view.parentElement!
  const list = places(figure)
  const doc = view.ownerDocument
  const words = options.words ?? {}
  const preset = PRESETS[options.style] ? options.style : 'site'
  const read = reader(view, win)
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches
  const interactive = !canvas && options.interactive !== false

  const build = async () => {
    const style = await base(PRESETS[preset].base)
    const painted = palette(preset, options.colors ?? {}, read)
    return paint(style, painted.palette, options.language ?? '', painted.full)
  }

  const [ml, style] = await Promise.all([load(), build()])
  if (signal?.aborted) return () => {}
  stylesheet(doc)

  const first = list[0] ?? { lat: 0, lng: 0 }
  const map = new ml.Map({
    container: view,
    style: style as unknown as MapLibre.StyleSpecification,
    center: [first.lng, first.lat],
    zoom: list.length ? options.zoom : 1,
    maxZoom: 19,
    interactive,
    cooperativeGestures: interactive,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: { compact: true },
    fadeDuration: canvas || reduced ? 0 : 300,
    // The canvas shows a picture of the map, read from its drawing.
    canvasContextAttributes: canvas ? { preserveDrawingBuffer: true } : undefined,
    locale: {
      'Map.Title': words.map ?? 'Map',
      'Marker.Title': words.marker ?? 'Map marker',
      'NavigationControl.ZoomIn': words.zoomIn ?? 'Zoom in',
      'NavigationControl.ZoomOut': words.zoomOut ?? 'Zoom out',
      'Popup.Close': words.close ?? 'Close',
      'AttributionControl.ToggleAttribution': words.attribution ?? 'Map credits',
      'CooperativeGesturesHandler.WindowsHelpText': words.scroll ?? 'Use Ctrl + scroll to zoom the map',
      'CooperativeGesturesHandler.MacHelpText': words.scrollMac ?? 'Use ⌘ + scroll to zoom the map',
      'CooperativeGesturesHandler.MobileHelpText': words.touch ?? 'Use two fingers to move the map',
    },
  })
  // The controls stand on the site's raised colour: on a dark one their icons turn light.
  const controls = () => {
    const raised = read('--color-raised') || read('--color-background')
    figure.toggleAttribute('data-dark-controls', !!raised && luminance(raised) < 0.2)
  }
  controls()
  // On a small map the credits fold into their button once the map is drawn, as OpenStreetMap allows.
  map.once('load', () => {
    if (view.clientWidth < 480) view.querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show')
  })
  map.touchZoomRotate.disableRotation()
  map.keyboard.disableRotation()
  if (interactive) map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')

  if (list.length > 1) {
    const bounds = new ml.LngLatBounds()
    list.forEach((p) => bounds.extend([p.lng, p.lat]))
    map.fitBounds(bounds, { padding: Math.min(64, view.clientWidth / 8), maxZoom: options.zoom, animate: false })
  }

  const markers: MapLibre.Marker[] = []
  for (const place of list) {
    const pin = doc.createElement(interactive ? 'button' : 'span')
    pin.className = 'cms-map__pin'
    pin.innerHTML = PIN
    if (interactive) {
      pin.setAttribute('type', 'button')
      pin.setAttribute('aria-label', (words.pin ?? 'Show :place').replace(':place', place.name || words.marker || 'Place'))
    } else pin.setAttribute('aria-hidden', 'true')
    const marker = new ml.Marker({ element: pin, anchor: 'bottom' }).setLngLat([place.lng, place.lat])
    if (interactive) {
      const content = doc.createElement('div')
      content.className = 'cms-map__popup'
      for (const child of place.el.children) content.append(child.cloneNode(true))
      marker.setPopup(new ml.Popup({ offset: around([0, 0]), maxWidth: '18rem', focusAfterOpen: true }).setDOMContent(content))
    }
    marker.addTo(map)
    markers.push(marker)
  }

  // Pins closer than one pin's width fan out around where they are, so each stays a target of its own
  // (WCAG 2.5.8); zoomed in far enough, they stand on their places again.
  const spread = () => {
    const at = markers.map((m) => map.project(m.getLngLat()))
    const near = (i: number, j: number) => Math.hypot(at[i].x - at[j].x, at[i].y - at[j].y) < SPACE
    const done = new Set<number>()
    markers.forEach((_, start) => {
      if (done.has(start)) return
      // Every pin within reach of one in the group joins it: a chain of close places fans out as one.
      const group = [start]
      done.add(start)
      for (let k = 0; k < group.length; k++) {
        markers.forEach((__, j) => {
          if (!done.has(j) && near(group[k], j)) {
            done.add(j)
            group.push(j)
          }
        })
      }
      const cx = group.reduce((sum, j) => sum + at[j].x, 0) / group.length
      const cy = group.reduce((sum, j) => sum + at[j].y, 0) / group.length
      const r = group.length > 1 ? SPACE / 2 / Math.sin(Math.PI / group.length) : 0
      group
        .sort((i, j) => Math.atan2(at[i].y - cy, at[i].x - cx) - Math.atan2(at[j].y - cy, at[j].x - cx))
        .forEach((j, k) => {
          const angle = (2 * Math.PI * k) / group.length - Math.PI / 2
          const offset: [number, number] = r ? [Math.round(cx + r * Math.cos(angle) - at[j].x), Math.round(cy + r * Math.sin(angle) - at[j].y)] : [0, 0]
          markers[j].setOffset(offset)
          // Its card opens over the pin where it now stands.
          markers[j].getPopup()?.setOffset(around(offset))
        })
    })
  }
  if (markers.length > 1) {
    spread()
    map.on('zoomend', spread)
    map.on('resize', spread)
  }

  // A scheme or dark mode that changes on the page changes the controls, and a Site Colors map with them.
  const watchers: Array<() => void> = []
  if (!canvas) {
    let last = JSON.stringify(palette(preset, options.colors ?? {}, read))
    const again = async () => {
      controls()
      if (preset !== 'site') return
      const now = JSON.stringify(palette(preset, options.colors ?? {}, read))
      if (now === last) return
      last = now
      map.setStyle((await build()) as unknown as MapLibre.StyleSpecification, { diff: true })
    }
    const scheme = win.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', again)
    const observer = new MutationObserver(again)
    observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-scheme'] })
    watchers.push(() => scheme.removeEventListener('change', again), () => observer.disconnect())
  }

  // Done when the first view is drawn, or after a while when tiles are slow: the canvas pictures it then.
  await new Promise<void>((resolve) => {
    const timer = win.setTimeout(resolve, 8000)
    map.once('idle', () => {
      win.clearTimeout(timer)
      resolve()
    })
  })

  return () => {
    watchers.forEach((stop) => stop())
    map.remove()
  }
}

function fail(figure: HTMLElement, error: unknown) {
  console.error('[cms] map', error)
  figure.dataset.failed = ''
  figure.querySelector<HTMLElement>('[data-cms-map-failed]')?.removeAttribute('hidden')
}

const seen = new WeakSet<Element>()
let observer: IntersectionObserver | null = null

function options(figure: HTMLElement): Options | null {
  try {
    return JSON.parse(figure.dataset.cmsMap ?? '') as Options
  } catch {
    return null
  }
}

export function start() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer!.unobserve(entry.target)
        const figure = entry.target as HTMLElement
        const view = figure.querySelector<HTMLElement>('[data-cms-map-view]')
        const opts = options(figure)
        if (!view || !opts) continue
        draw(view, opts, window, false)
          .then(() => (figure.dataset.ready = ''))
          .catch((error) => fail(figure, error))
      }
    },
    { rootMargin: '400px 0px' },
  )
  for (const figure of document.querySelectorAll<HTMLElement>('[data-cms-map]')) {
    if (seen.has(figure)) continue
    seen.add(figure)
    observer.observe(figure)
  }
}

/** The builder's canvas: the editor mounts the map there itself (canvas.ts), still and without pins to press. */
export const canvas = true

export async function mount(el: HTMLElement, props: Record<string, unknown>, context: { window: Window; signal: AbortSignal }) {
  try {
    return await draw(el, props as unknown as Options, context.window, true, context.signal)
  } catch (error) {
    const figure = el.closest<HTMLElement>('[data-cms-map]')
    if (figure) fail(figure, error)
    return undefined
  }
}
