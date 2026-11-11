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

// Static files the way the site's .htaccess serves them: /about is public/about/index.html.
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname))
  requests.push(path)
  let file = join(root, path)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!file.startsWith(root) || !existsSync(file)) {
    response.writeHead(404).end('Not found')
    return
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const chrome = [process.env.CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((path) => path && existsSync(path))
if (!chrome) {
  console.error('No Chrome found. Set CHROME to its path.')
  process.exit(1)
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const profile = mkdtempSync(join(tmpdir(), 'cms-site-checks-'))
const port = 9400 + Math.floor(Math.random() * 400)
const browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,800', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 100; i++) {
  if (await fetch(`http://127.0.0.1:${port}/json/version`).then(() => true, () => false)) break
  await sleep(100)
}

/** A tab that speaks the DevTools Protocol. `media` emulates features such as prefers-reduced-motion. */
async function open(path, { media = {}, script = true } = {}) {
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
    } else if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text)
    else if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') errors.push(data.params.args.map((a) => a.value ?? a.description).join(' '))
  }
  const send = (method, params = {}) => new Promise((resolve, reject) => (waiting.set(++id, { resolve, reject }), ws.send(JSON.stringify({ id, method, params }))))
  await send('Runtime.enable')
  await send('Page.enable')
  if (!script) await send('Emulation.setScriptExecutionDisabled', { value: true })
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

    await tab.evaluate('document.getElementById("later").scrollIntoView()')
    await tab.until('document.getElementById("later").dataset.mounted')

    // Leaving the document, however: its own undo, its unmount, its signal.
    await tab.evaluate('document.getElementById("first").remove()')
    equal(await tab.until('document.documentElement.dataset.cleaned'), 'first', 'the function mount returned ran')
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
    await calm.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
    await calm.until('JSON.parse(document.getElementById("first").dataset.mounted).reducedMotion === false')
    equal(await calm.evaluate('document.documentElement.dataset.cleaned'), 'first', 'mounted again when that changes')
    await calm.close()
  },
}

let failed = 0
for (const [name, check] of Object.entries(checks)) {
  if (only.length && !only.includes(name)) continue
  try {
    await check()
    console.log(`ok    ${name}`)
  } catch (error) {
    failed++
    console.log(`FAIL  ${name}\n      ${error.message}`)
  }
}

browser.kill()
server.close()
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
} catch {}
process.exit(failed ? 1 : 0)
