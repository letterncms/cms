// Client-side navigation, for sites that ask for it (design: transition.navigation = "client").
// A link to another page of the site fetches that page's HTML, the one a browser without this script
// would load, and puts it in place of this one inside a view transition. What that buys:
//   - elements marked data-cms-persist="<name>" that both pages have stay the same element: a WebGL
//     canvas keeps drawing, audio keeps playing;
//   - `cms:before-leave` and `cms:after-enter` on document, for scripts that live across pages;
//   - links are fetched when the pointer rests on them, so the page is there when it is asked for.
// Whatever it can't do safely (another import map, a new version of the site, an error) it leaves
// to the browser: a normal page load.
import { boot, featuresOf } from './features'

interface Leave {
  from: string
  to: string
  /** Hold the swap until this settles, for an animation out. */
  waitUntil: (work: Promise<unknown>) => void
}

const PERSIST = '[data-cms-persist]'
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const pages = new Map<string, { at: number; html: Promise<string | null> }>()
/** Inline scripts that ran, by their text: a page that brings the same one doesn't run it twice. */
const ran = new Set<string>()
let going: AbortController | null = null
let path = location.pathname
let here = location.href
let saving = 0

/** Each history entry remembers where it was scrolled to. */
const save = () => history.replaceState({ ...history.state, cms: true, scroll: [scrollX, scrollY] }, '')

const key = (url: URL) => url.origin + url.pathname + url.search

/** How long a script may hold a swap with waitUntil before the page goes on without it. */
const HOLD = 4000

/**
 * Paths that are never fetched in place of a page load: what the site says (data-cms-navigate-skip on <html>,
 * which plugins add to through the `site.navigate.skip` filter), or the CMS's own when it says nothing.
 */
const skipped = (document.documentElement.dataset.cmsNavigateSkip ?? '/admin /api /install /media /_cms /__preview').split(/\s+/).filter(Boolean)

/**
 * The URL a click on this link would go to, when that is a page this script may fetch instead.
 * Fetching ahead of a click must never do anything: a link with a query string (a sign-out, an
 * "add to cart", a filter the server answers) is left to the browser, as is one its author marked.
 */
function target(link: HTMLAnchorElement | null): URL | null {
  if (!link || !link.href || (link.target && link.target !== '_self') || link.hasAttribute('download') || link.closest('[data-cms-reload]')) return null
  if (/\b(external|nofollow)\b/.test(link.rel)) return null
  const url = new URL(link.href)
  if (url.origin !== location.origin || url.pathname === location.pathname || url.search !== '') return null
  if (skipped.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix.replace(/\/$/, '') + '/'))) return null
  // A file (a PDF, a feed), not a page.
  if (/\.[a-z0-9]{1,5}$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return null
  return url
}

function load(url: URL, signal?: AbortSignal): Promise<string | null> {
  const cached = pages.get(key(url))
  if (cached && Date.now() - cached.at < 30_000) return cached.html
  const html = fetch(url.pathname + url.search, { headers: { Accept: 'text/html' }, credentials: 'same-origin', signal })
    .then((response) => (response.ok && !response.redirected && (response.headers.get('content-type') ?? '').includes('text/html') ? response.text() : null))
    .catch(() => null)
  pages.set(key(url), { at: Date.now(), html })
  if (pages.size > 20) pages.delete(pages.keys().next().value!)
  // An aborted or failed fetch is not the page.
  void html.then((text) => text === null && pages.get(key(url))?.html === html && pages.delete(key(url)))
  return html
}

const importMap = (doc: Document) => doc.querySelector('script[type=importmap]')?.textContent ?? ''
const runtime = (doc: Document) => doc.querySelector<HTMLScriptElement>('script[data-features]')?.getAttribute('src') ?? ''

/** What this document was loaded with. The script elements themselves leave with the first page's body. */
const own = { runtime: runtime(document), map: importMap(document) }

/** Can this document take the next one's place? Not when modules would resolve differently or the site was published anew. */
function fits(next: Document): boolean {
  if (!featuresOf(next).includes('navigate') || runtime(next) !== own.runtime) return false
  return importMap(next) === '' || importMap(next) === own.map
}

const isSheet = (el: Element): el is HTMLLinkElement => el instanceof HTMLLinkElement && el.rel === 'stylesheet'
const loadedOnce = (el: Element) => el instanceof HTMLScriptElement || (el instanceof HTMLLinkElement && /^(modulepreload|preload)$/.test(el.rel))

/** A script from a parsed document doesn't run; one made here does. */
function run(script: HTMLScriptElement) {
  const type = script.type
  if (type === 'importmap') return
  if (type !== '' && type !== 'module' && type !== 'text/javascript') {
    // Data (JSON-LD): belongs to the page, not to what has run.
    document.head.append(document.importNode(script, true))
    return
  }
  const id = script.src ? 'src:' + new URL(script.getAttribute('src')!, location.href).href : script.textContent ?? ''
  if (ran.has(id)) return
  ran.add(id)
  const fresh = document.createElement('script')
  for (const { name, value } of script.attributes) fresh.setAttribute(name, value)
  fresh.textContent = script.textContent
  document.head.append(fresh)
}

/** Fetch the next page's stylesheets before it shows, so it never shows without them. */
function warm(next: Document): Promise<unknown> {
  const have = new Set([...document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map((l) => l.href))
  const wanted = [...next.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map((l) => new URL(l.getAttribute('href') ?? '', location.href).href).filter((href) => !have.has(href))
  return Promise.all(wanted.map((href) => Promise.race([fetch(href).then(() => {}, () => {}), new Promise((resolve) => setTimeout(resolve, 3000))])))
}

/** The next page's stylesheets this page doesn't have, added and loaded before anything of this page is taken away. */
function sheets(next: Document): Promise<unknown> {
  const have = new Set([...document.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map((l) => l.href))
  const waits: Promise<unknown>[] = []
  for (const el of next.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')) {
    if (have.has(new URL(el.getAttribute('href') ?? '', location.href).href)) continue
    const link = document.importNode(el, true)
    waits.push(new Promise((resolve) => ((link.onload = link.onerror = resolve), setTimeout(resolve, 2000))))
    document.head.append(link)
  }
  return Promise.all(waits)
}

/** The rest of the head, in the same breath as the body: this page's own leave, the next page's arrive. */
function head(next: Document) {
  const wanted = new Set([...next.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map((l) => new URL(l.getAttribute('href') ?? '', location.href).href))
  for (const el of [...document.head.children]) {
    if (isSheet(el)) wanted.has(el.href) || el.remove()
    else if (!loadedOnce(el) || (el instanceof HTMLScriptElement && el.type === 'application/ld+json')) el.remove()
  }
  for (const el of [...next.head.children]) {
    if (el instanceof HTMLScriptElement) run(el)
    else if (!isSheet(el) && !loadedOnce(el)) document.head.append(document.importNode(el, true))
  }
}

function body(next: Document) {
  const scripts = [...next.body.querySelectorAll('script')]
  scripts.forEach((script) => script.remove())
  const old = [...document.body.childNodes].filter((node) => !(node instanceof Element && node.hasAttribute('data-cms-announcer')))
  const incoming = next.body
  // Only what differs: an attribute taken away and put back (x-data) would start what reads it all over.
  for (const { name } of [...document.body.attributes]) incoming.hasAttribute(name) || document.body.removeAttribute(name)
  for (const { name, value } of incoming.attributes) document.body.getAttribute(name) === value || document.body.setAttribute(name, value)
  const fresh = [...document.adoptNode(incoming).childNodes]
  document.body.append(...fresh)

  const kept = new Set<Node>()
  // What both pages keep stays the element it is, moved to where the new page has it.
  for (const copy of document.body.querySelectorAll<HTMLElement>(PERSIST)) {
    // Not one of the old page's, and not one inside another kept element that has already taken its copy's place.
    if (!copy.isConnected || old.some((node) => node.contains(copy))) continue
    const live = old.map((node) => (node instanceof Element ? (node.matches(`[data-cms-persist="${CSS.escape(copy.dataset.cmsPersist!)}"]`) ? node : node.querySelector(`[data-cms-persist="${CSS.escape(copy.dataset.cmsPersist!)}"]`)) : null)).find(Boolean)
    if (!live) continue
    kept.add(live)
    const parent = copy.parentNode as (ParentNode & { moveBefore?: (node: Node, before: Node | null) => void }) | null
    // moveBefore keeps what a re-insert resets (an iframe, a CSS animation); a canvas and playing audio survive either.
    if (parent?.moveBefore) {
      parent.moveBefore(live, copy)
      copy.remove()
    } else copy.replaceWith(live)
  }
  old.forEach((node) => node.parentNode === document.body && !kept.has(node) && node.remove())
  scripts.forEach(run)
}

/** Keyboard and screen reader users arrive at the new page's content, and hear its title. */
function arrive(hash: string) {
  const anchor = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  const main = anchor ?? document.querySelector<HTMLElement>('main, #main, [role=main]') ?? document.body
  if (!main.hasAttribute('tabindex')) {
    main.setAttribute('tabindex', '-1')
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true })
  }
  main.focus({ preventScroll: true })
  let announcer = document.querySelector<HTMLElement>('[data-cms-announcer]')
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.setAttribute('data-cms-announcer', '')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap'
    document.body.append(announcer)
  }
  announcer.textContent = ''
  setTimeout(() => (announcer!.textContent = document.title), 60)
  return anchor
}

const place = (top: number, left = 0) => window.scrollTo({ top, left, behavior: 'instant' })

/** Go to `url` without a page load. `scroll`: where to be afterwards (back and forward); the top or the link's anchor otherwise. */
export async function go(to: string | URL, { push = true, scroll = null as [number, number] | null } = {}): Promise<void> {
  const url = new URL(to, location.href)
  const hard = () => {
    if (push) location.assign(url.href)
    else location.reload()
  }
  const from = here
  const waits: Promise<unknown>[] = []
  const detail: Leave = { from, to: url.href, waitUntil: (work) => waits.push(Promise.race([Promise.resolve(work).catch(() => {}), new Promise((resolve) => setTimeout(resolve, HOLD))])) }
  // Asked first: a refusal leaves everything as it is, a navigation already on its way included.
  // Back and forward have already happened; only a link can still be refused.
  if (!document.dispatchEvent(new CustomEvent('cms:before-leave', { cancelable: push, detail })) && push) return

  going?.abort()
  const abort = (going = new AbortController())
  document.documentElement.setAttribute('data-cms-navigating', '')

  try {
    const [html] = await Promise.all([load(url, abort.signal), ...waits])
    if (abort.signal.aborted) return
    const next = html === null ? null : new DOMParser().parseFromString(html, 'text/html')
    if (!next || !fits(next)) return hard()
    await warm(next)
    if (abort.signal.aborted) return

    const features = featuresOf(next)
    const swap = async () => {
      // With or without a transition, the new page's stylesheets are there before its body is.
      await sheets(next)
      clearTimeout(saving)
      if (push) {
        save()
        history.pushState({ cms: true }, '', url.href)
      }
      path = location.pathname
      here = location.href
      document.documentElement.lang = next.documentElement.lang
      document.documentElement.dir = next.documentElement.dir
      document.title = next.title
      head(next)
      body(next)
      if (scroll) place(scroll[1], scroll[0])
      else place(0)
      const anchor = arrive(url.hash)
      if (!scroll && anchor) anchor.scrollIntoView({ behavior: 'instant' })
    }

    const transition = document.startViewTransition && !reduced() ? document.startViewTransition(swap) : null
    await (transition ? transition.updateCallbackDone : swap())
    document.documentElement.removeAttribute('data-cms-navigating')
    await boot(features)
    document.dispatchEvent(new CustomEvent('cms:after-enter', { detail: { from, to: location.href } }))
    await transition?.finished.catch(() => {})
  } catch (error) {
    console.error('[cms] navigate', error)
    location.assign(url.href)
  } finally {
    // Whoever is still the navigation under way tidies up; one that was overtaken leaves that to its successor.
    if (going === abort) {
      going = null
      document.documentElement.removeAttribute('data-cms-navigating')
    }
  }
}

/** Fetch a page ahead of the click. */
export function prefetch(to: string | URL) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (!connection?.saveData) void load(new URL(to, location.href))
}

declare global {
  interface Window {
    cmsNavigate?: { go: typeof go; prefetch: typeof prefetch }
  }
}

let started = false

export function start() {
  if (started) return
  started = true
  window.cmsNavigate = { go, prefetch }
  for (const script of document.querySelectorAll('script')) ran.add(script.src ? 'src:' + script.src : script.textContent ?? '')

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element).closest?.('a') ?? null
    // A link to the page one is on (the logo, the menu's current item): a browser would load it again, and what
    // lives across pages would start over. Going to its top is what the click was for.
    if (link?.href && !link.hasAttribute('download') && (!link.target || link.target === '_self') && !link.closest('[data-cms-reload]')) {
      const same = new URL(link.href)
      if (same.origin === location.origin && same.pathname === location.pathname && same.search === location.search && same.hash === '') {
        event.preventDefault()
        if (location.hash) history.pushState({ cms: true }, '', same.href)
        window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' })
        return
      }
    }
    const url = target(link)
    if (!url) return
    event.preventDefault()
    void go(url)
  })

  // A pointer that rests on a link, a finger that touches one, or focus that lands on one: the page is likely next.
  let timer = 0
  const ahead = (event: Event) => {
    const url = target((event.target as Element).closest?.('a') ?? null)
    clearTimeout(timer)
    if (url) timer = window.setTimeout(() => prefetch(url), event.type === 'pointerover' ? 65 : 0)
  }
  document.addEventListener('pointerover', ahead, { passive: true })
  document.addEventListener('touchstart', ahead, { passive: true })
  document.addEventListener('focusin', ahead)

  // This script puts a page where it was scrolled to; the browser no longer does.
  history.scrollRestoration = 'manual'
  addEventListener('scroll', () => (clearTimeout(saving), (saving = window.setTimeout(save, 120))), { passive: true })
  const remembered = history.state?.scroll as [number, number] | undefined
  if (remembered) place(remembered[1], remembered[0])

  addEventListener('popstate', (event) => {
    const scroll = (event.state?.scroll as [number, number] | undefined) ?? [0, 0]
    // The same page: an anchor, or a filter's query, which belong to the page's own scripts.
    if (location.pathname === path) {
      if (event.state?.scroll) place(scroll[1], scroll[0])
      return
    }
    void go(location.href, { push: false, scroll })
  })
}
