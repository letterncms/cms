// What the site does in a browser, checked in headless Chrome against pages the CMS built:
//   CMS_BROWSER_FIXTURES=/tmp/fixtures vendor/bin/phpunit modules/site/tests/BrowserFixturesTest.php
//   node modules/site/tests/browser.mjs --fixtures /tmp/fixtures [check …]      (CHROME=path for another browser)
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, normalize } from 'node:path'

const args = process.argv.slice(2)
const root = args[args.indexOf('--fixtures') + 1]
const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--fixtures')
if (!args.includes('--fixtures') || !root || !existsSync(root)) {
  console.error('Pass --fixtures <folder>: the public/ folder BrowserFixturesTest wrote.')
  process.exit(1)
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const requests = []
/** What a page asked for and the site doesn't have. No page may ask for any. */
const missing = []
/** Everything a page logged as an error, to say with a failure. */
const logged = []
/** What a page's Content-Security-Policy refused. No check may leave any but the one that asks for it. */
const refused = []

// Static files the way the site's .htaccess serves them: /about is public/about/index.html.
// Two builds of the same site: `plain`, and `client`, which navigates without page loads.
async function serve(site) {
  const folder = join(root, site)
  // The policy the CMS wrote into the site's .htaccess, sent with every page as Apache would. The builder's canvas is not a public page.
  const policy = existsSync(join(folder, '.htaccess')) ? readFileSync(join(folder, '.htaccess'), 'utf8').match(/Header set Content-Security-Policy "([^"\n]+)"/)?.[1] : undefined
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname))
    requests.push(path)
    let file = join(folder, path)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!file.startsWith(folder) || !existsSync(file)) {
      missing.push(path)
      response.writeHead(404).end('Not found')
      return
    }
    const html = extname(file) === '.html'
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', ...(html && policy && !path.startsWith('/canvas') ? { 'Content-Security-Policy': policy } : {}) }).end(readFileSync(file))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { server, policy, origin: `http://127.0.0.1:${server.address().port}` }
}
const sites = { plain: await serve('plain'), client: await serve('client'), starter: await serve('starter') }

const chrome = [process.env.CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((path) => path && existsSync(path))
if (!chrome) {
  console.error('No Chrome found. Set CHROME to its path.')
  process.exit(1)
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const profile = mkdtempSync(join(tmpdir(), 'cms-site-checks-'))
const port = 9400 + Math.floor(Math.random() * 400)
const browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,800', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
// The browser goes with the checks, however they end: a crash or Ctrl-C must not leave it running.
const stopBrowser = () => {
  if (browser.exitCode === null && browser.signalCode === null) browser.kill()
}
process.once('exit', stopBrowser)
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => { stopBrowser(); process.exit(130) })
process.once('uncaughtException', (error) => { stopBrowser(); console.error(error); process.exit(1) })
process.once('unhandledRejection', (error) => { stopBrowser(); console.error(error); process.exit(1) })
for (let i = 0; i < 100; i++) {
  if (await fetch(`http://127.0.0.1:${port}/json/version`).then(() => true, () => false)) break
  await sleep(100)
}

/** A tab that speaks the DevTools Protocol. `media` emulates features such as prefers-reduced-motion. */
async function open(path, { media = {}, script = true, site = 'plain', before = '', slow = 1 } = {}) {
  const origin = sites[site].origin
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => ((ws.onopen = resolve), (ws.onerror = reject)))
  let id = 0
  const waiting = new Map()
  const errors = []
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data)
    if (data.id && waiting.has(data.id)) {
      const { resolve, reject } = waiting.get(data.id)
      waiting.delete(data.id)
      data.error ? reject(new Error(data.error.message)) : resolve(data.result)
    } else if (data.method === 'Runtime.exceptionThrown') logged.push(data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text), errors.push(data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text)
    else if (data.method === 'Log.entryAdded' && /Content Security Policy/i.test(data.params.entry.text)) refused.push(data.params.entry.text)
    else if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') logged.push(data.params.args.map((a) => a.value ?? a.description).join(' ')), errors.push(data.params.args.map((a) => a.value ?? a.description).join(' '))
  }
  const send = (method, params = {}) => new Promise((resolve, reject) => (waiting.set(++id, { resolve, reject }), ws.send(JSON.stringify({ id, method, params }))))
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.enable')
  if (!script) await send('Emulation.setScriptExecutionDisabled', { value: true })
  if (before) await send('Page.addScriptToEvaluateOnNewDocument', { source: before })
  if (slow > 1) await send('Emulation.setCPUThrottlingRate', { rate: slow })
  const features = Object.entries(media).map(([name, value]) => ({ name, value }))
  if (features.length) await send('Emulation.setEmulatedMedia', { features })
  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
    return result.value
  }
  /** Until `expression` is truthy in the page, or fail saying what was waited for. */
  const until = async (expression, ms = 5000) => {
    for (const end = Date.now() + ms; Date.now() < end; await sleep(50)) {
      const value = await evaluate(expression).catch(() => null)
      if (value) return value
    }
    throw new Error(`Timed out waiting for: ${expression}`)
  }
  const goto = async (to) => {
    await send('Page.navigate', { url: origin + to })
    await until('document.readyState === "complete"')
  }
  await goto(path)
  return { send, evaluate, until, goto, errors, close: () => (ws.close(), fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {})) }
}

function equal(actual, expected, what) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

const checks = {
  /**
   * The site's Content-Security-Policy is on for every check here. This one: a starter page, and a page with a
   * behaviour, a vendored library and client navigation, run under it and nothing is refused; a script that
   * got into a page some other way does not run.
   */
  async policy() {
    for (const site of ['plain', 'client', 'starter']) {
      if (!/script-src 'self' 'wasm-unsafe-eval' 'sha256-/.test(sites[site].policy ?? '')) throw new Error(`${site} has no policy with a hash in its .htaccess: ${sites[site].policy}`)
    }
    const home = await open('/', { site: 'starter' })
    await home.until('location.pathname === "/" && document.readyState === "complete"')
    equal(await home.evaluate('fetch("/").then((r) => r.headers.get("content-security-policy") === null ? "none" : "sent")'), 'sent', 'the starter page comes with the policy')
    await home.until('document.querySelector("[data-cms-behavior]") && !document.querySelector("[data-cms-behavior]:not([data-cms-mounted])")').catch(() => null)
    equal(await home.evaluate('document.querySelectorAll("script[type=importmap], script:not([src]):not([type])").length > 0'), true, 'the starter page has inline scripts the policy must name')
    await sleep(500)
    await home.close()
    equal([...refused], [], 'refused on the starter page')

    const page = await open('/one', { site: 'client' })
    await page.until('document.getElementById("stage")?.dataset.mounted')
    await page.evaluate('document.getElementById("to-two-plain").click()')
    await page.until('location.pathname === "/two"')
    await sleep(500)
    equal([...refused], [], 'refused on a page with a behaviour, a vendored library and client navigation')

    // What the policy is for: markup that is not the site's own runs nothing.
    equal(await page.evaluate('(() => { const s = document.createElement("script"); s.textContent = "window.__stolen = 1"; document.body.append(s); const i = document.createElement("img"); i.src = "https://elsewhere.example/x.png"; document.body.append(i); return typeof window.__stolen })()'), 'undefined', 'an inline script nobody named does not run')
    await page.until('true')
    await sleep(300)
    if (!refused.some((text) => /inline script/i.test(text))) throw new Error(`the inline script was not refused: ${refused.join(' | ')}`)
    refused.length = 0
    await page.close()
  },
  /** A block's script and stylesheet load; the script imports another script by path and a vendored library by name. */
  async code() {
    const tab = await open('/code')
    equal(await tab.until('document.documentElement.dataset.hero'), 'eased', 'the script ran with what it imported')
    equal(await tab.evaluate('document.documentElement.dataset.vendor'), 'tiny', 'a library is imported by its name')
    equal(requests.some((path) => path === '/_cms/site/vendor/tiny@1.0.0/index.js'), true, 'from the site itself')
    equal(await tab.evaluate('getComputedStyle(document.querySelector(".hero")).outlineColor'), 'rgb(1, 2, 3)', 'the stylesheet applies')
    equal(requests.filter((path) => /\/scripts\/lib\/ease(-[0-9a-f]{10})?\.js$/.test(path)).every((path) => /-[0-9a-f]{10}\.js$/.test(path)), true, 'the import asked for the published file')
    equal(tab.errors, [], 'no errors')
    await tab.close()
  },

  /** A behaviour mounts with its props and the design, when its element is there, and unmounts when it leaves. */
  async behavior() {
    const tab = await open('/behavior')
    const first = JSON.parse(await tab.until('document.getElementById("first").dataset.mounted'))
    equal(first.props, { name: 'first', title: 'Behavior' }, 'props, with the data they name')
    equal(first.reducedMotion, false, 'reduced motion')
    equal(first.primary !== '', true, 'a design token is read where the element is')
    equal(await tab.evaluate('document.getElementById("later").dataset.mounted ?? null'), null, 'one that waits to be seen has not loaded')
    // Two behaviours on one block: both mount, and both leave with it.
    equal(await tab.until('document.getElementById("both").dataset.mounted && document.getElementById("both").dataset.tag'), 'tagged', 'a second behaviour on the same block mounts too')
    equal(JSON.parse(await tab.evaluate('document.getElementById("both").dataset.mounted')).props.name, 'one-of-two', 'beside the first')
    await tab.evaluate('document.getElementById("both").remove()')
    equal(await tab.until('document.documentElement.dataset.untagged && document.documentElement.dataset.cleaned'), 'one-of-two', 'and each is undone when the block leaves')
    const settled = JSON.parse(await tab.until('document.getElementById("settled").dataset.mounted'))
    equal([settled.ready, settled.fonts], ['complete', 'loaded'], 'one that waits for the page mounts after its load event and its fonts')

    await tab.evaluate('document.getElementById("later").scrollIntoView()')
    await tab.until('document.getElementById("later").dataset.mounted')

    // Leaving the document, however: its own undo, its unmount, its signal.
    await tab.evaluate('document.getElementById("first").remove()')
    equal(await tab.until('document.documentElement.dataset.cleaned === "first" && "first"'), 'first', 'the function mount returned ran')
    equal(await tab.evaluate('[document.documentElement.dataset.unmounted, document.documentElement.dataset.aborted]'), ['yes', 'first'], 'unmount and the signal')

    // Arriving later, as after a page transition.
    const url = await tab.evaluate('document.getElementById("later").dataset.cmsBehavior')
    await tab.evaluate(`document.body.insertAdjacentHTML('beforeend', '<div id="added" data-cms-behavior="${url}" data-cms-props=\\'{"name":"added"}\\'></div>')`)
    equal(JSON.parse(await tab.until('document.getElementById("added").dataset.mounted')).props, { name: 'added' }, 'an element added later mounts')

    // Moved, not removed: it stays what it is.
    const before = await tab.evaluate('window.__mounts')
    await tab.evaluate('document.body.prepend(document.getElementById("added"))')
    await sleep(200)
    equal(await tab.evaluate('window.__mounts'), before, 'a moved element is not mounted again')
    equal(tab.errors, [], 'no errors')
    await tab.close()

    const calm = await open('/behavior', { media: { 'prefers-reduced-motion': 'reduce' } })
    equal(JSON.parse(await calm.until('document.getElementById("first").dataset.mounted')).reducedMotion, true, 'told that the visitor wants less motion')
    const mounts = await calm.evaluate('window.__mounts')
    await calm.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
    await calm.until('JSON.parse(document.getElementById("first").dataset.mounted).reducedMotion === false')
    equal(await calm.evaluate('window.__mounts') > mounts, true, 'mounted again when that changes')
    await calm.close()
  },

  /** Client-side navigation: the page changes without a page load, what both pages keep stays, and the browser's own manners hold. */
  async navigate() {
    const tab = await open('/one', { site: 'client' })
    await tab.until('window.cmsNavigate && document.getElementById("stage").dataset.mounted && document.getElementById("leaving").dataset.mounted')
    equal(await tab.evaluate('getComputedStyle(document.querySelector(".only-one")).outlineColor'), 'rgb(4, 5, 6)', 'page one has its stylesheet')
    await tab.evaluate(`
      window.__same = true
      window.__stage = document.getElementById('stage')
      window.__events = []
      document.addEventListener('cms:before-leave', (e) => {
        window.__events.push(['leave', new URL(e.detail.from).pathname, new URL(e.detail.to).pathname, document.querySelector('h1')?.textContent])
        e.detail.waitUntil(new Promise((resolve) => setTimeout(() => (window.__events.push(['waited']), resolve()), 150)))
      })
      document.addEventListener('cms:after-enter', (e) => window.__events.push(['enter', new URL(e.detail.to).pathname, document.querySelector('h1')?.textContent]))
    `)

    // A pointer resting on a link fetches the page before the click.
    requests.length = 0
    await tab.evaluate('document.getElementById("to-two").dispatchEvent(new PointerEvent("pointerover", { bubbles: true }))')
    for (let i = 0; i < 40 && !requests.includes('/two'); i++) await sleep(50)
    equal(requests.includes('/two'), true, 'the link was fetched ahead')

    await tab.evaluate('window.scrollTo(0, 900)')
    await sleep(300)
    await tab.evaluate('document.getElementById("to-two").click()')
    await tab.until('document.querySelector("h1").textContent === "Page two" && window.__events.length === 3')
    equal(requests.filter((path) => path === '/two').length, 1, 'and not fetched again')
    equal(await tab.evaluate('[window.__same, location.pathname + location.hash, document.title]'), [true, '/two#deep', 'Two · Test site'], 'the same document, at the new address')
    equal(await tab.evaluate('window.__events'), [['leave', '/one', '/two', 'Page one'], ['waited'], ['enter', '/two', 'Page two']], 'events, and the swap waited')
    equal(await tab.evaluate('[document.getElementById("stage") === window.__stage, window.__stage.isConnected, JSON.parse(window.__stage.dataset.mounted).props.name]'), [true, true, 'stage'], 'the persisted element is the same element')
    equal(await tab.evaluate('[document.documentElement.dataset.cleaned, document.getElementById("leaving")]'), ['leaving', null], 'what only the old page had was unmounted')
    equal(await tab.evaluate('window.__mounts'), 2, 'the stage was not mounted again')
    equal(await tab.evaluate('document.querySelectorAll("link[rel=stylesheet][href*=\'/styles/one-\']").length'), 0, 'the old page’s stylesheet left with it')
    equal(await tab.evaluate('Math.abs(document.getElementById("deep").getBoundingClientRect().top) < 5'), true, 'scrolled to the link’s anchor')
    equal(await tab.evaluate('document.activeElement.id'), 'deep', 'focus moved into the new page')
    equal(await tab.until('document.querySelector("[data-cms-announcer]").textContent'), 'Two · Test site', 'the new title is announced')
    equal(await tab.evaluate('document.querySelectorAll("[data-cms-persist]").length'), 1, 'one stage, not two')
    equal(await tab.evaluate('document.documentElement.hasAttribute("data-cms-navigating")'), false, 'no longer marked as navigating')

    // Alpine on a page that arrived this way (page one has none, so it starts here), and again after Back and Forward.
    const alpine = async (when) => {
      await tab.until('window.Alpine && document.getElementById("opener").getAttribute("aria-expanded") === "false"')
      equal(await tab.evaluate('getComputedStyle(document.getElementById("opened")).display'), 'none', `closed to begin with (${when})`)
      await tab.evaluate('document.getElementById("opener").click()')
      await tab.until('document.getElementById("opener").getAttribute("aria-expanded") === "true" && getComputedStyle(document.getElementById("opened")).display !== "none"')
    }
    await alpine('first arrival')
    equal(await tab.evaluate('document.getElementById(document.getElementById("opener").getAttribute("aria-controls"))?.id'), 'opened', 'the button names the block it opens by that block’s id on the page')

    // A link that could do something is never fetched ahead, and never in place of a page load.
    requests.length = 0
    await tab.evaluate('document.getElementById("with-query").dispatchEvent(new PointerEvent("pointerover", { bubbles: true }))')
    await sleep(400)
    equal(requests.filter((path) => path === '/one').length, 0, 'a link with a query string is not fetched ahead')

    // Back: the page and where it was scrolled to.
    await tab.evaluate('history.back()')
    await tab.until('document.querySelector("h1").textContent === "Page one"')
    await sleep(100)
    equal(await tab.evaluate('[window.__same, location.pathname, Math.round(scrollY), document.getElementById("stage") === window.__stage]'), [true, '/one', 900, true], 'back restores the page and its scroll')
    equal(await tab.until('document.getElementById("leaving")?.dataset.mounted && getComputedStyle(document.querySelector(".only-one")).outlineColor'), 'rgb(4, 5, 6)', 'its behaviour and stylesheet are back')
    await tab.evaluate('history.forward()')
    await tab.until('document.querySelector("h1").textContent === "Page two"')
    await alpine('after Back and Forward')

    // A link to the page one is on goes to its top and loads nothing: the stage is not started again.
    await tab.evaluate('window.scrollTo({ top: 700, behavior: "instant" })')
    requests.length = 0
    await tab.evaluate('document.getElementById("to-two-plain").click()')
    await tab.until('scrollY === 0')
    equal(await tab.evaluate('[window.__same, location.pathname, document.getElementById("stage") === window.__stage, window.__mounts]'), [true, '/two', true, await tab.evaluate('window.__mounts')], 'the same page, at its top')
    equal(requests.filter((path) => path === '/two').length, 0, 'and nothing was fetched')

    // A script can refuse to leave, and can go somewhere itself.
    await tab.evaluate('document.addEventListener("cms:before-leave", (e) => e.preventDefault(), { once: true }); document.getElementById("to-one").click()')
    await sleep(300)
    equal(await tab.evaluate('[location.pathname, document.documentElement.hasAttribute("data-cms-navigating")]'), ['/two', false], 'a refused navigation stays')

    // A second click while the first is held: the first gives way, and nothing is left marked.
    await tab.evaluate('document.addEventListener("cms:before-leave", (e) => e.detail.waitUntil(new Promise((r) => setTimeout(r, 400))), { once: true }); window.cmsNavigate.go("/one"); window.cmsNavigate.go("/code")')
    await tab.until('location.pathname === "/code" && !document.documentElement.hasAttribute("data-cms-navigating")')
    await tab.evaluate('window.cmsNavigate.go("/two")')
    await tab.until('location.pathname === "/two" && document.querySelector("h1")?.textContent === "Page two"')
    await tab.evaluate('window.cmsNavigate.go("/behavior")')
    await tab.until('location.pathname === "/behavior" && document.getElementById("first")?.dataset.mounted')
    equal(await tab.evaluate('window.__same'), true, 'still the same document')
    equal(tab.errors, [], 'no errors')
    await tab.close()

    // A link to this very page with a query string does something on the server: the browser sends it.
    const cart = await open('/two', { site: 'client' })
    await cart.until('window.cmsNavigate')
    requests.length = 0
    await cart.evaluate('window.__same = true; document.getElementById("same-query").click()')
    await cart.until('location.search === "?add=5" && document.readyState === "complete" && window.__same === undefined')
    equal(requests.filter((path) => path === '/two').length, 1, 'a same-page link with a query string loads the page')
    await cart.close()

    // Less motion: the same navigation, without the transition.
    const calm = await open('/one', { site: 'client', media: { 'prefers-reduced-motion': 'reduce' } })
    await calm.until('window.cmsNavigate')
    await calm.evaluate('window.__same = true; document.getElementById("to-two").click()')
    await calm.until('document.querySelector("h1").textContent === "Page two"')
    equal(await calm.evaluate('window.__same'), true, 'navigates with reduced motion')
    await calm.close()

    // No script: links are links.
    const off = await open('/one', { site: 'client', script: false })
    equal(await off.evaluate('document.getElementById("to-two").getAttribute("href")'), '/two#deep', 'a plain link')
    await off.goto('/two')
    equal(await off.evaluate('document.querySelector("h1").textContent'), 'Page two', 'the page is whole without JavaScript')
    await off.close()
  },

  /** A page load animation on the largest text doesn't keep the page from counting as painted. */
  // A term's archive, built: the posts filed under the term, ten to a page, and the way between its pages.
  async archive() {
    const state = '[location.pathname, document.querySelector("main h1")?.textContent, document.querySelectorAll("main .cms-repeat a").length, [...document.querySelectorAll("main .cms-section__inner > a")].map((a) => a.textContent + " " + a.getAttribute("href"))]'
    for (const site of ['plain', 'client']) {
      const page = await open('/posts/topics/tides', { site })
      equal(await page.evaluate(state), ['/posts/topics/tides', 'Tides', 10, ['Next /posts/topics/tides/page/2']], `${site}: the first page of the archive`)
      equal(await page.evaluate('[...document.querySelectorAll("main .cms-repeat a")].some((a) => a.textContent === "Unfiled")'), false, `${site}: only what is filed under the term`)
      await page.evaluate('[...document.querySelectorAll("main .cms-section__inner > a")].find((a) => a.textContent === "Next").click()')
      await page.until('location.pathname === "/posts/topics/tides/page/2" && document.querySelectorAll("main .cms-repeat a").length === 2')
      equal(await page.evaluate(state), ['/posts/topics/tides/page/2', 'Tides', 2, ['Previous /posts/topics/tides']], `${site}: the second page`)
      await page.evaluate('document.querySelector("main .cms-repeat a").click()')
      await page.until('location.pathname.startsWith("/posts/tide-")')
      // Chrome says so itself when it skips a page transition between two loads (the new page arrived before
      // its stylesheet could opt in): the page is there all the same, and nothing of the site's went wrong.
      equal(page.errors.filter((error) => !/ViewTransition opt-in disabled/.test(error)), [], `${site}: nothing logged`)
      await page.close()
    }
  },

  async lcp() {
    // A slow phone: where a delayed paint shows.
    const tab = await open('/lcp', { slow: 6 })
    // When the heading starts to show: the animation's own start plus its delay, on the page's clock.
    const shows = await tab.until(`(() => { const a = document.querySelector('h1')?.getAnimations()[0]; return a && a.startTime !== null && a.startTime + a.effect.getTiming().delay })()`)
    await sleep(3500)
    const seen = await tab.evaluate(`new Promise((resolve) => {
      let lcp = null
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) lcp = { at: entry.startTime, tag: entry.element?.tagName } }).observe({ type: 'largest-contentful-paint', buffered: true })
      setTimeout(() => resolve(lcp), 300)
    })`)
    equal(seen?.tag, 'H1', 'the heading is what the page is measured by')
    equal(seen.at < shows, true, `it counts as painted before its animation shows it (largest paint ${Math.round(seen.at)} ms, the animation shows it from ${Math.round(shows)} ms)`)
    equal(await tab.evaluate('getComputedStyle(document.querySelector("h1")).opacity'), '1', 'and the animation still ran to the end')
    await tab.close()
  },

  /** The builder's canvas runs no scripts: a block a behaviour draws names it instead of being a blank. */
  async canvas() {
    const tab = await open('/canvas')
    const drawn = await tab.evaluate('(() => { const el = document.getElementById("drawn"); return { text: getComputedStyle(el, "::before").content, height: el.getBoundingClientRect().height, mounted: el.dataset.mounted ?? null } })()')
    equal(drawn.text.includes('probe'), true, `an empty block says which behaviour draws it (${drawn.text})`)
    equal(drawn.height >= 96, true, 'at a size that can be seen and selected')
    equal(drawn.mounted, null, 'and nothing ran')
    equal(await tab.evaluate('getComputedStyle(document.getElementById("filled"), "::before").content'), 'none', 'a block with content of its own shows that')
    await tab.close()
  },

  /** A block's `dark` styles apply when the visitor's system is dark, and when the page is told to be. */
  async dark() {
    const background = (id) => `getComputedStyle(document.getElementById('${id}')).backgroundColor`
    const light = await open('/dark')
    equal(await light.evaluate(background('plain')), 'rgb(250, 250, 250)', 'light to begin with')
    // The design's own styles reach a tag inside a tag ("h2 em"), and only there.
    equal(await light.evaluate('[getComputedStyle(document.querySelector("#water em")).color, getComputedStyle(document.querySelector("#water em")).fontStyle]'), ['rgb(7, 8, 9)', 'normal'], 'emphasis inside a heading has the design’s style for it')
    equal(await light.evaluate('getComputedStyle(document.querySelector("#prose-em em")).color === "rgb(7, 8, 9)"'), false, 'emphasis elsewhere does not')
    await light.evaluate('document.documentElement.dataset.theme = "dark"')
    equal(await light.evaluate(background('plain')), 'rgb(1, 2, 3)', 'dark when the page is switched')
    await light.close()

    const system = await open('/dark', { media: { 'prefers-color-scheme': 'dark' } })
    equal(await system.evaluate(background('plain')), 'rgb(1, 2, 3)', 'dark when the system is, with no switch')
    equal(await system.evaluate('getComputedStyle(document.getElementById("hovered")).color'), 'rgb(200, 200, 200)', 'next to a hover style too')
    await system.send('Emulation.setDeviceMetricsOverride', { width: 500, height: 800, deviceScaleFactor: 1, mobile: false })
    equal(await system.evaluate(background('narrow')), 'rgb(4, 5, 6)', 'and together with a screen size')
    await system.evaluate('document.documentElement.dataset.theme = "light"')
    equal(await system.evaluate(background('plain')), 'rgb(250, 250, 250)', 'light when the visitor chose light on a dark system')
    await system.close()
  },

  /** The Motion Toggle tells scripts too: an attribute, an event, and reducedMotion in behaviours. */
  async toggle() {
    const tab = await open('/toggle')
    await tab.until('!document.getElementById("toggle").hidden && document.getElementById("heard").dataset.mounted')
    equal(JSON.parse(await tab.evaluate('document.getElementById("heard").dataset.mounted')).reducedMotion, false, 'motion runs to begin with')
    await tab.evaluate('window.__heard = []; document.addEventListener("cms:motion", (e) => window.__heard.push(e.detail.paused)); document.getElementById("toggle").click()')
    await tab.until('JSON.parse(document.getElementById("heard").dataset.mounted).reducedMotion === true')
    equal(await tab.evaluate('[document.documentElement.dataset.cmsMotion, window.__heard]'), ['paused', [true]], 'the page says so, once')

    // The choice is kept: the next page load starts paused, for the behaviour as well.
    await tab.goto('/toggle')
    await tab.until('document.getElementById("heard").dataset.mounted && document.documentElement.dataset.cmsMotion === "paused"')
    equal(JSON.parse(await tab.evaluate('document.getElementById("heard").dataset.mounted')).reducedMotion, true, 'a paused page mounts its behaviours calm')
    await tab.evaluate('window.__heard = []; document.addEventListener("cms:motion", (e) => window.__heard.push(e.detail.paused)); document.getElementById("toggle").click()')
    await tab.until('JSON.parse(document.getElementById("heard").dataset.mounted).reducedMotion === false')
    equal(await tab.evaluate('[document.documentElement.dataset.cmsMotion ?? null, window.__heard]'), [null, [false]], 'and playing again says so too')
    equal(tab.errors, [], 'no errors')
    await tab.close()

    // Without page loads: however many pages came before, one press mounts each behaviour again once.
    const site = await open('/one', { site: 'client' })
    await site.until('window.cmsNavigate && document.getElementById("stage").dataset.mounted')
    await site.evaluate('localStorage.removeItem("cms-motion-paused")')
    for (const to of ['/two', '/one', '/toggle']) {
      await site.evaluate(`window.cmsNavigate.go("${to}")`)
      await site.until(`location.pathname === "${to}" && !document.documentElement.hasAttribute("data-cms-navigating")`)
    }
    await site.until('!document.getElementById("toggle").hidden && document.getElementById("heard").dataset.mounted')
    const before = await site.evaluate('window.__mounts')
    await site.evaluate('document.getElementById("toggle").click()')
    await site.until('JSON.parse(document.getElementById("heard").dataset.mounted).reducedMotion === true && JSON.parse(document.getElementById("stage").dataset.mounted).reducedMotion === true')
    await sleep(300)
    equal(await site.evaluate('window.__mounts') - before, 2, 'after three navigations, one press mounts the two behaviours on the page once each')

    // On to a page without a toggle: it moves, as it would after a page load.
    await site.evaluate('window.cmsNavigate.go("/two")')
    await site.until('location.pathname === "/two" && JSON.parse(document.getElementById("stage").dataset.mounted).reducedMotion === false')
    equal(await site.evaluate('document.documentElement.dataset.cmsMotion ?? null'), null, 'a page without a toggle is not left paused')
    // And back: the choice was kept, so the page with the toggle is paused again.
    await site.evaluate('window.cmsNavigate.go("/toggle")')
    await site.until('location.pathname === "/toggle" && document.documentElement.dataset.cmsMotion === "paused" && JSON.parse(document.getElementById("stage").dataset.mounted).reducedMotion === true')
    await site.evaluate('localStorage.removeItem("cms-motion-paused")')
    equal(site.errors, [], 'no errors')
    await site.close()
  },

  /** Scroll animations: CSS where the browser can, the runtime where it can't or when they trail; pinning; lines. */
  async motion() {
    const near = (actual, expected, by, what) => {
      if (!(Math.abs(actual - expected) <= by)) throw new Error(`${what}: expected about ${expected}, got ${actual}`)
    }
    const opacity = (id) => `Number(getComputedStyle(document.getElementById('${id}')).opacity)`
    // The element's top halfway up the screen: halfway from "top bottom" to "top top".
    const halfway = (id) => `(() => { let top = 0; for (let at = document.getElementById('${id}'); at; at = at.offsetParent) top += at.offsetTop; window.scrollTo({ top: top - innerHeight / 2, behavior: 'instant' }) })()`

    const tab = await open('/motion')
    equal(await tab.evaluate('CSS.supports("animation-timeline: view()")'), true, 'this Chrome has scroll-driven animations')
    await tab.evaluate(halfway('linked'))
    await sleep(150) // a scroll timeline is read at the next frame
    near(await tab.evaluate(opacity('linked')), 0.5, 0.02, 'CSS follows the scroll')
    equal(await tab.evaluate('document.getElementById("linked").getAnimations().every((a) => a instanceof CSSAnimation)'), true, 'and the runtime leaves it to CSS')

    // Trailing: not there at once, there soon after.
    await tab.evaluate('window.scrollTo({ top: 0, behavior: "instant" })')
    await tab.until(`${opacity('trailing')} < 0.01`)
    await tab.evaluate(halfway('trailing'))
    const early = await tab.evaluate(opacity('trailing'))
    equal(early < 0.47, true, `a trailing animation lags behind the scroll (was at ${early})`)
    await tab.until(`Math.abs(${opacity('trailing')} - 0.5) < 0.01`)

    // Pinned: holds at the top of the screen for the distance, while its steps play, and says how far along it is.
    await tab.evaluate('window.__progress = []; document.getElementById("pinned").addEventListener("cms:progress", (e) => window.__progress.push(e.detail.progress))')
    await tab.evaluate('window.scrollTo({ top: document.querySelector("[data-cms-pin]").getBoundingClientRect().top + scrollY + innerHeight, behavior: "instant" })')
    await sleep(150)
    near(await tab.evaluate('document.getElementById("pinned").getBoundingClientRect().top'), 0, 1, 'the pinned element stays at the top')
    near(Number(await tab.evaluate('getComputedStyle(document.getElementById("pinned")).opacity')), 0.5, 0.03, 'halfway through its steps, halfway through the distance')
    near(await tab.evaluate('document.querySelector("[data-cms-pin]").offsetHeight / innerHeight'), 3, 0.01, 'the wrapper is the element plus the distance')
    near(Number(await tab.evaluate('document.getElementById("pinned").style.getPropertyValue("--cms-progress")')), 0.5, 0.02, 'its progress is on the element for styles')
    near(await tab.evaluate('window.__progress.at(-1)'), 0.5, 0.02, 'and in an event for scripts')
    equal(await tab.evaluate('document.getElementById("pinned").getAnimations().every((a) => a instanceof CSSAnimation)'), true, 'while CSS still moves it')

    // Lines: the words of a line take one turn.
    await tab.evaluate('document.getElementById("lines").scrollIntoView({ behavior: "instant", block: "center" })')
    const words = await tab.until(`(() => {
      const words = [...document.querySelectorAll('#lines .cms-w__i')].map((w) => ({ top: Math.round(w.parentElement.getBoundingClientRect().top), delay: w.getAnimations()[0]?.effect.getTiming().delay }))
      return words.every((w) => w.delay !== undefined) && words
    })()`)
    const tops = [...new Set(words.map((w) => w.top))]
    equal(tops.length > 2, true, 'the heading wraps')
    equal(words.every((w) => w.delay === tops.indexOf(w.top) * 100), true, 'each line starts a stagger after the one above, its words together')

    // Lines CSS animates (load): numbered by the runtime, the words of a line share its turn; numbered again at another width.
    const laid = () => tab.until(`(() => {
      const block = document.getElementById('load-lines')
      if (!block.dataset.cmsLines) return false
      const words = [...block.querySelectorAll('.cms-w__i')].map((w) => ({ top: Math.round(w.parentElement.getBoundingClientRect().top), i: w.style.getPropertyValue('--i'), state: getComputedStyle(w).animationPlayState, delay: getComputedStyle(w).animationDelay }))
      return { count: Number(block.dataset.cmsLines), words }
    })()`)
    let load = await laid()
    let loadTops = [...new Set(load.words.map((w) => w.top))]
    equal(loadTops.length > 2 && load.count === loadTops.length, true, `the load heading wraps and says how many lines it has (${load.count}, ${loadTops.length})`)
    equal(load.words.every((w) => Number(w.i) === loadTops.indexOf(w.top)), true, 'each word has its line\'s turn: ' + JSON.stringify(load.words))
    equal(load.words.every((w) => w.state === 'running'), true, 'numbered, the words play')
    equal(load.words.every((w) => w.delay === `${Math.min(Number(w.i) * 100, 300) / 1000}s`), true, 'a line starts a stagger after the one above: ' + load.words.map((w) => w.delay).join())
    await tab.evaluate('document.getElementById("load-lines").style.width = "160px"')
    await tab.until(`Number(document.getElementById('load-lines').dataset.cmsLines) > ${load.count}`)
    load = await laid()
    loadTops = [...new Set(load.words.map((w) => w.top))]
    equal(load.count === loadTops.length && load.words.every((w) => Number(w.i) === loadTops.indexOf(w.top)), true, 'narrower, the lines are numbered again')

    // Without the count (the lines chunk breaks here: no ResizeObserver), the words wait a moment and then play anyway.
    const late = await open('/motion', { before: 'window.ResizeObserver = undefined' })
    await sleep(2200)
    equal(await late.evaluate(`[...document.querySelectorAll('#load-lines .cms-w__i')].every((w) => getComputedStyle(w).animationPlayState === 'running')`), true, 'text is never left waiting for a count that does not come')
    equal(await late.evaluate(`document.getElementById('load-lines').dataset.cmsLines`), '0', 'let go uncounted')
    await late.close()
    equal(tab.errors, [], 'no errors')
    await tab.close()

    // A browser without scroll-driven animations: the runtime moves the same keyframes by the same range.
    const old = await open('/motion', { before: 'const supports = CSS.supports.bind(CSS); CSS.supports = (...a) => !String(a[0]).includes("animation-timeline") && supports(...a)' })
    const script = (id) => `(() => { const a = document.getElementById('${id}').getAnimations().find((a) => !(a instanceof CSSAnimation)); return a ? a.currentTime / a.effect.getComputedTiming().endTime : null })()`
    await old.until(`${script('linked')} !== null`)
    await old.evaluate(halfway('linked'))
    await old.until(`Math.abs(${script('linked')} - 0.5) < 0.02`)
    await old.evaluate('window.scrollTo({ top: document.querySelector("[data-cms-pin]").getBoundingClientRect().top + scrollY + innerHeight * 0.5, behavior: "instant" })')
    await old.until(`Math.abs(${script('pinned')} - 0.25) < 0.02`)
    await old.close()

    // Less motion: nothing moves, nothing is pinned.
    const calm = await open('/motion', { media: { 'prefers-reduced-motion': 'reduce' } })
    await sleep(300)
    equal(await calm.evaluate('[document.getAnimations().length, getComputedStyle(document.getElementById("pinned")).position, getComputedStyle(document.querySelector("[data-cms-pin]")).display, document.getElementById("pinned").style.getPropertyValue("--cms-progress")]'), [0, 'static', 'contents', ''], 'reduced motion: the wrapper is no box, and there is no progress to follow')
    await calm.close()
  },
}

let failed = 0
for (const [name, check] of Object.entries(checks)) {
  if (only.length && !only.includes(name)) continue
  logged.length = 0
  missing.length = 0
  refused.length = 0
  try {
    await check()
    if (refused.length) throw new Error(`the page's security policy refused: ${[...new Set(refused)].join('\n      ')}`)
    if (missing.length) throw new Error(`asked for what is not there: ${[...new Set(missing)].join(', ')}`)
    console.log(`ok    ${name}`)
  } catch (error) {
    failed++
    console.log(`FAIL  ${name}\n      ${error.message}${logged.length ? '\n      logged: ' + logged.join('\n      ') : ''}`)
  }
}

browser.kill()
Object.values(sites).forEach((site) => site.server.close())
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
} catch {}
process.exit(failed ? 1 : 0)
