// Video blocks that play by themselves (Elements::video): muted, over and over, while they are on screen. Never for a
// visitor who asks for less motion, nor while the Motion Toggle has paused the page: such a video waits with its
// controls showing, and a YouTube or Vimeo frame loads without autoplay.
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const seen = new WeakSet<Element>()
const showing = new WeakMap<Element, boolean>()
// Videos a visitor started with the controls while autoplay was off: theirs to stop.
const chosen = new WeakSet<Element>()
let observer: IntersectionObserver | null = null
let bound = false

/** The Motion Toggle's choice: on the page as `data-cms-motion`, and kept for pages with a toggle before its script has run. */
function paused(): boolean {
  if (document.documentElement.dataset.cmsMotion === 'paused') return true
  if (!document.querySelector('[data-cms-motion-toggle]')) return false
  try {
    return localStorage.getItem('cms-motion-paused') === '1'
  } catch {
    return false
  }
}

const allowed = () => !reduced.matches && !paused()

function apply(el: Element) {
  if (el instanceof HTMLVideoElement) {
    if (!allowed()) {
      if (!chosen.has(el)) el.pause()
      el.controls = true
      return
    }
    el.controls = false
    el.muted = true
    if (showing.get(el)) el.play().catch(() => (el.controls = true))
    else el.pause()
  } else if (el instanceof HTMLIFrameElement) {
    const want = allowed() ? el.dataset.cmsAutoplay : el.dataset.cmsStill
    if (want && el.getAttribute('src') !== want) el.setAttribute('src', want)
  }
}

const all = () => document.querySelectorAll('[data-cms-autoplay]').forEach(apply)

export function start() {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      showing.set(entry.target, entry.isIntersecting)
      apply(entry.target)
    }
  })
  for (const el of document.querySelectorAll('[data-cms-autoplay]')) {
    if (seen.has(el)) continue
    seen.add(el)
    apply(el)
    if (el instanceof HTMLVideoElement) {
      el.addEventListener('play', () => !allowed() && chosen.add(el))
      observer.observe(el)
    }
  }
  if (bound) return
  bound = true
  reduced.addEventListener('change', all)
  document.addEventListener('cms:motion', all)
}
