// Scroll animations without scroll-driven CSS, and those that trail the scroll (scrub) in any browser.
// PHP compiles the same steps to CSS (Motion::scrolled) and to this description:
//   <div data-cms-scroll='[{"id":"m1","start":"top bottom","end":"bottom top","pin":1,"scrub":0.6,"steps":[…]}]'>
// The steps are paused Web Animations; scrolling only sets how far along they are.
import { create, type Animation } from './motion'

interface Scrolled extends Animation {
  end?: string
  pin?: 1
  scrub?: number
  p?: 1 // tell the element how far along it is: --cms-progress and a cms:progress event
}

interface Track {
  el: HTMLElement
  animation: Scrolled
  watched: HTMLElement
  running: globalThis.Animation[]
  at: number // where the animations are, 0 to 1
  to: number // where the scroll says they should be
  drive: boolean // this script moves the animations; otherwise the stylesheet does and it only reports
  told: number // the progress last reported
}

const tracks: Track[] = []
const css = CSS.supports('animation-timeline: view()')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
let frame = 0
let before = 0

/**
 * Where an element's box is on the screen, as it is laid out: without the transforms an animation
 * (this one, often) puts on it, which is also how CSS measures a view timeline.
 */
function box(el: HTMLElement): { top: number; height: number } {
  let top = -scrollY
  for (let at: HTMLElement | null = el; at; at = at.offsetParent as HTMLElement | null) top += at.offsetTop
  return { top, height: el.offsetHeight }
}

/** How far `position` ("top 80%": the element's top at 80% down the screen) is from holding, in pixels of scrolling. */
function distance(rect: { top: number; height: number }, position: string): number {
  const [edge, view] = position.split(' ')
  const line = view === 'top' ? 0 : view === 'center' ? 50 : view === 'bottom' ? 100 : parseFloat(view)
  return rect.top + (edge === 'center' ? rect.height / 2 : edge === 'bottom' ? rect.height : 0) - (line / 100) * innerHeight
}

function progress(track: Track): number {
  const rect = box(track.watched)
  if (track.animation.pin) {
    // The wrapper is the element plus the distance it is pinned for.
    const span = rect.height - track.el.offsetHeight
    return span > 0 ? -rect.top / span : 0
  }
  const start = distance(rect, track.animation.start ?? 'top bottom')
  const end = distance(rect, track.animation.end ?? 'bottom top')
  return start === end ? 0 : start / (start - end)
}

const allowed = (track: Track) => !reduced.matches && (!track.animation.media || matchMedia(track.animation.media).matches)

function apply(track: Track) {
  if (track.drive) {
    if (!track.running.length) track.running = create(track.el, track.animation)
    for (const a of track.running) a.currentTime = track.at * Number(a.effect!.getComputedTiming().endTime)
  }
  if (track.animation.p) tell(track, track.at)
}

/**
 * How far along, on the element: --cms-progress for styles (and counter() tricks), and an event for scripts:
 *   el.addEventListener('cms:progress', (e) => (el.textContent = Math.round(e.detail.progress * 120)))
 * With less motion asked for there is no progress to follow: the property goes and one last event says null.
 */
function tell(track: Track, progress: number | null) {
  const value = progress === null ? -1 : Math.round(progress * 10000) / 10000
  if (value === track.told) return
  track.told = value
  if (progress === null) track.el.style.removeProperty('--cms-progress')
  else track.el.style.setProperty('--cms-progress', String(value))
  track.el.dispatchEvent(new CustomEvent('cms:progress', { bubbles: true, detail: { progress: progress === null ? null : value, id: track.animation.id } }))
}

function tick(now: number) {
  frame = 0
  const dt = Math.min(0.1, (now - before) / 1000 || 0.016)
  before = now
  let moving = false
  for (let i = tracks.length - 1; i >= 0; i--) {
    const track = tracks[i]
    if (!track.el.isConnected) {
      tracks.splice(i, 1)
      continue
    }
    if (!allowed(track)) {
      // As designed: no animation holds the element anywhere.
      track.running.splice(0).forEach((a) => a.cancel())
      if (track.animation.p && track.told !== -1) tell(track, null)
      continue
    }
    track.to = Math.max(0, Math.min(1, progress(track)))
    const lag = track.animation.scrub ?? 0
    // Closes most of the gap within `lag` seconds.
    track.at = lag > 0 ? track.at + (track.to - track.at) * (1 - Math.exp((-4 * dt) / lag)) : track.to
    if (Math.abs(track.to - track.at) < 0.0005) track.at = track.to
    else moving = true
    apply(track)
  }
  if (moving) request()
}

function request() {
  frame ||= requestAnimationFrame(tick)
}

function setup(el: HTMLElement) {
  let animations: Scrolled[] = []
  try {
    animations = JSON.parse(el.dataset.cmsScroll ?? '[]')
  } catch {
    return
  }
  for (const animation of animations) {
    // The browser already runs this one from the stylesheet: nothing to do here unless it wants its progress told.
    const drive = !css || !!animation.scrub
    if (!drive && !animation.p) continue
    const watched = animation.pin ? el.closest<HTMLElement>('[data-cms-pin]') : animation.node ? document.querySelector<HTMLElement>(`[data-cms="${CSS.escape(animation.node)}"]`) : el
    if (watched) tracks.push({ el, animation, watched, running: [], at: 0, to: 0, drive, told: -1 })
  }
}

const done = new WeakSet<Element>()
let listening = false

export function start() {
  document.querySelectorAll<HTMLElement>('[data-cms-scroll]').forEach((el) => done.has(el) || (done.add(el), setup(el)))
  // Where each starts is where the page is now, not a run-up from zero.
  for (const track of tracks) if (!track.running.length && track.told === -1 && allowed(track)) track.at = Math.max(0, Math.min(1, progress(track)))
  request()
  if (listening) return
  listening = true
  addEventListener('scroll', request, { passive: true })
  addEventListener('resize', request, { passive: true })
  reduced.addEventListener('change', request)
}
