// Build first, then run `node modules/admin/tests/navigation.mjs` and open
// the printed URL. Tests use the real built shell, SDK and modules with delayed
// fixture abilities. No account, database, browser dependency or site writes.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const admin = JSON.parse(await readFile(resolve(root, 'modules/admin/dist/admin.json'), 'utf8'))
const assetBase = '/_cms/assets/cms-admin/'
const grants = { create: true, edit: true, publish: true, delete: true }
const collection = { handle: 'posts', title: 'Posts', singular: 'Post', newLabel: 'New Post', icon: 'article', structure: 'list', driver: 'files', editor: 'document', can: grants, routable: false }
const entry = { id: 'entry-1', collection: 'posts', locale: 'en', title: 'Original title', slug: 'original', uri: null, status: 'draft', displayStatus: 'draft', data: {}, hasDraft: false, parentId: null, position: 0, originId: null, authorId: null, createdAt: null, updatedAt: null, publishedAt: null }
const namespaces = ['site', 'mail', 'admin', 'broken']
const brand = JSON.parse(await readFile(resolve(root, 'brand/brand.json'), 'utf8'))
const settingsNav = namespaces.map((namespace) => ({ id: `settings-${namespace}`, label: namespace.toUpperCase(), path: `/settings/${namespace}`, icon: 'settings', section: 'system' }))
const manifest = {
  cms: { version: 'test', debug: false },
  site: { name: 'Navigation regression test', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Test User', email: 'test@example.invalid', initials: 'TU', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', 'letterncms/settings', 'letterncms/content', 'letterncms/collections'], pending: {} },
  modules: ['settings', 'content', 'collections'].map((name) => ({ id: `cms/${name}`, url: `/_cms/assets/cms-${name}/admin.js`, package: `cms/${name}` })),
  styles: [], settings: namespaces.map((namespace) => ({ namespace, label: namespace.toUpperCase(), icon: 'settings' })),
  collections: [collection], globals: [], fieldTypes: [], commands: [], widgets: [], dashboard: [],
  config: { content: { autosave: 0, perPage: 50 } },
  nav: [{ id: 'posts', label: 'Posts', path: '/content/posts', icon: 'article', section: 'main' }, ...settingsNav],
  sidebar: { sections: [{ id: 'main', label: '', items: ['posts'] }], hidden: [], personal: false },
  settingsNav: [{ id: 'system', label: 'System', items: settingsNav.map((item) => item.id) }],
  brand,
}
const boot = { brand, base: '/admin', api: '/api/admin', version: 'test', theme: { name: 'cms/admin', version: 'test' }, site: manifest.site, locale: 'en', messages: {}, manifest }
const imports = Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path]))
const requests = []
let broken = true
const runner = `
import { navigate, prefetch, queryClient, abilityKey, setQuery, blockNavigation, registry } from '@letterncms/sdk'
const output = document.querySelector('#results')
const results = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const assert = (value, message) => { if (!value) throw new Error(message) }
const wait = async (check, message) => {
  const end = Date.now() + 8000
  while (!check()) { if (Date.now() > end) throw new Error(message); await sleep(10) }
}
const test = async (name, fn) => { await fn(); results.push(name); output.textContent = results.map((s) => 'PASS ' + s).join('\\n') }
// A screen's name is the last crumb of its top bar.
const titleEl = () => document.querySelector('.cms-topbar [aria-current="page"]')
const heading = () => titleEl()?.textContent
const progress = () => document.querySelector('[role="progressbar"]')
try {
  await wait(() => heading() === 'SITE', 'initial settings did not load')
  await test('Cold settings navigation preserves content until data is ready', async () => {
    const current = titleEl()
    const blanks = []
    const observer = new MutationObserver(() => { if (!heading()) blanks.push(true) })
    observer.observe(document.querySelector('#cms'), { childList: true, subtree: true })
    navigate('/settings/mail')
    await wait(progress, 'missing navigation progress')
    await sleep(100)
    assert(heading() === 'SITE' && current.isConnected, 'previous content disappeared while fetching')
    await wait(() => heading() === 'MAIL' && !progress(), 'mail settings never became ready')
    observer.disconnect()
    assert(blanks.length === 0, 'navigation flashed empty content')
  })
  await test('Cached settings open without a second ability request', async () => {
    const before = await (await fetch('/__test/requests')).json()
    navigate('/settings/site')
    await wait(() => heading() === 'SITE' && !progress(), 'cached settings failed')
    const after = await (await fetch('/__test/requests')).json()
    assert(after.length === before.length, 'cache was bypassed')
  })
  await test('Rapid navigation keeps the latest destination when an older response finishes last', async () => {
    queryClient.removeQueries({ queryKey: abilityKey('settings/get', { namespace: 'mail' }) })
    navigate('/settings/mail')
    await wait(progress, 'slow navigation did not begin')
    await sleep(80)
    navigate('/settings/admin')
    await wait(() => heading() === 'ADMIN' && !progress(), 'newer navigation failed')
    await sleep(850)
    assert(heading() === 'ADMIN' && location.pathname === '/admin/settings/admin', 'late response overwrote newer navigation')
  })
  await test('Query changes apply immediately and survive the next pending navigation', async () => {
    setQuery({ tab: 'example' })
    await sleep(40)
    const current = titleEl()
    assert(!progress() && current.textContent === 'ADMIN', 'query change restarted the screen')
    const original = registry.routes.get('/settings/:namespace')
    let release
    registry.routes.set('/settings/:namespace', { ...original, load: () => new Promise((r) => { release = r }) })
    navigate('/settings/site')
    await wait(() => !!release && progress(), 'navigation did not wait for preparation')
    assert(current.isConnected && heading() === 'ADMIN', 'query change lost the displayed screen')
    release()
    await wait(() => heading() === 'SITE' && !progress(), 'prepared navigation failed')
    registry.routes.set('/settings/:namespace', original)
  })
  await test('Hover intent prefetches data and retains destination query parameters', async () => {
    let received
    const original = registry.routes.get('/settings/:namespace')
    registry.routes.set('/settings/:namespace', { ...original, load: (params, target) => { received = target.query; return original.load(params, target) } })
    prefetch('/settings/admin?tab=advanced')
    await wait(() => !!received, 'prefetch did not run')
    assert(received.tab === 'advanced', 'intent discarded query parameters')
    registry.routes.set('/settings/:namespace', original)
  })
  await test('Unsaved changes ask in the admin’s own dialog before anything loads, for a link and for Back', async () => {
    const unblock = blockNavigation(() => 'Unsaved test changes')
    const before = location.href
    const dialog = () => [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].find((d) => d.textContent.includes('Unsaved test changes'))
    const answer = (label) => [...dialog().querySelectorAll('button')].find((b) => b.textContent === label).click()
    const native = window.confirm
    window.confirm = () => { throw new Error('asked with the browser’s dialog') }
    try {
      navigate('/settings/mail')
      assert(location.href === before && !progress(), 'blocked navigation changed location or started loading')
      await wait(dialog, 'leaving did not ask')
      answer('Cancel')
      await wait(() => !dialog(), 'the dialog stayed after Cancel')
      await sleep(50)
      assert(location.href === before && heading() === 'SITE', 'Cancel left anyway')
      history.back()
      await wait(dialog, 'Back did not ask')
      await sleep(100)
      assert(location.href === before && heading() === 'SITE', 'Back left before the answer')
      answer('Cancel')
      await wait(() => !dialog(), 'the dialog stayed after Cancel')
      await sleep(100)
      assert(location.href === before && heading() === 'SITE', 'Back left after Cancel')
      history.back()
      await wait(dialog, 'Back did not ask again')
      answer('Discard')
      await wait(() => heading() === 'ADMIN' && !progress(), 'Discard did not go back')
    } finally {
      window.confirm = native
      unblock()
    }
    history.forward()
    await wait(() => heading() === 'SITE' && !progress(), 'forward did not return')
  })
  await test('Back and forward finish on the requested screen', async () => {
    navigate('/settings/admin')
    await wait(() => heading() === 'ADMIN' && !progress(), 'admin settings failed')
    history.back()
    await wait(() => heading() === 'SITE' && !progress(), 'back did not restore site settings')
    history.forward()
    await wait(() => heading() === 'ADMIN' && !progress(), 'forward did not restore admin settings')
  })
  await test('Failed settings requests expose a retry instead of an endless spinner', async () => {
    navigate('/settings/broken')
    await wait(() => document.querySelector('main')?.textContent.includes('Fixture failure') && !progress(), 'failed query did not show its error')
    await fetch('/__test/recover', { method: 'POST' })
    const retry = [...document.querySelectorAll('main button')].find((b) => b.textContent === 'Try Again')
    assert(retry, 'retry button missing')
    retry.click()
    await wait(() => heading() === 'BROKEN', 'retry did not recover settings')
  })
  await test('Content list arrives with its rows ready', async () => {
    navigate('/content/posts')
    await wait(() => document.querySelector('main')?.textContent.includes('Original title') && !progress(), 'content list failed')
  })
  await test('Cached blueprint data renders its form on the first commit', async () => {
    const spinners = []
    const observer = new MutationObserver(() => { if (location.pathname === '/admin/collections/posts' && document.querySelector('.h-full .animate-spin')) spinners.push(true) })
    observer.observe(document.querySelector('#cms'), { childList: true, subtree: true })
    navigate('/collections/posts')
    await wait(() => heading() === 'Posts' && !progress(), 'blueprint did not render')
    observer.disconnect()
    assert(spinners.length === 0, 'cached blueprint flashed a spinner')
  })
  await test('Refreshing cached entry data does not remount the working editor', async () => {
    navigate('/content/posts/entry-1')
    // The title is the editor's first field, in the document or (with a canvas) its panel.
    const titleField = () => document.querySelector('textarea[aria-label="Title"], #f-title, [data-field="title"] input')
    await wait(() => titleField(), 'entry editor failed')
    const title = titleField()
    queryClient.setQueryData(abilityKey('entries/get', { id: 'entry-1' }), (old) => ({ ...old, title: 'Background refresh' }))
    await sleep(50)
    assert(title.isConnected && title.value === 'Original title', 'cache refresh remounted the editor')
  })
  output.textContent += '\\nAll ' + results.length + ' navigation checks passed.'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results }) })
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack }) })
}
`
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Navigation regression test</title>${admin.css.map((path) => `<link rel="stylesheet" href="${assetBase + path}">`).join('')}<script type="importmap">${JSON.stringify({ imports })}</script><script>window.__CMS__=${JSON.stringify(boot)}</script><script type="module" src="${assetBase + admin.entry}"></script></head><body><div id="cms"></div><pre id="results" style="position:fixed;bottom:8px;right:8px;z-index:9999;max-width:620px;background:white;border:1px solid #aaa;padding:12px;font-size:11px">Starting tests…</pre><script type="module">${runner}</script></body></html>`
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
const body = async (req) => { let value = ''; for await (const chunk of req) value += chunk; return value }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/__test/requests') return json(res, 200, requests)
    if (url.pathname === '/__test/recover') { broken = false; return json(res, 200, {}) }
    if (url.pathname === '/__test/results') {
      const result = JSON.parse(await body(req))
      for (const name of result.passed) console.log('PASS', name)
      if (result.error) console.error('FAIL', result.error)
      json(res, 200, {})
      if (keepAlive) return
      clearTimeout(timeout)
      setTimeout(() => { server.closeAllConnections(); server.close(); process.exitCode = result.error ? 1 : 0 }, 100)
      return
    }
    if (url.pathname.startsWith('/api/admin/abilities/')) {
      const ability = url.pathname.slice('/api/admin/abilities/'.length)
      const input = JSON.parse(await body(req))
      requests.push({ ability, input })
      await new Promise((r) => setTimeout(r, input.namespace === 'mail' ? 700 : 30))
      if (ability === 'settings/get') {
        if (input.namespace === 'broken' && broken) return json(res, 422, { error: { message: 'Fixture failure', type: 'invalid_input' } })
        return json(res, 200, { data: { namespace: input.namespace, label: input.namespace.toUpperCase(), fields: [{ handle: 'name', type: 'text', label: 'Name' }], values: { name: 'Example' } } })
      }
      if (ability === 'admin/arrangement') return json(res, 200, { data: { items: [{ id: 'settings', label: 'Settings', icon: 'settings' }], layout: { sections: [{ id: 'main', label: 'Main', items: ['settings'] }], hidden: [] }, fixed: false, customized: false } })
      if (ability === 'collections/get') return json(res, 200, { data: { ...collection, fields: [], resolvedFields: [], schema: {} } })
      if (ability === 'entries/list') return json(res, 200, { data: { items: [entry], total: 1, page: 1, pages: 1 } })
      if (ability === 'entries/get') return json(res, 200, { data: entry })
      if (ability === 'entries/revisions') return json(res, 200, { data: [] })
      throw new Error('Unexpected ability: ' + ability)
    }
    const asset = url.pathname.match(/^\/_cms\/assets\/cms-(admin|settings|content|collections)\/(.+)$/)
    if (asset) {
      const dir = resolve(root, asset[1] === 'admin' ? 'modules/admin/dist' : `modules/${asset[1]}/dist`)
      const path = resolve(dir, asset[2])
      if (!path.startsWith(dir + sep)) { res.writeHead(403); res.end(); return }
      const mime = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime }); res.end(await readFile(path)); return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html)
  } catch (error) { console.error(error); json(res, 500, { error: { message: error.message } }) }
})
// --preview keeps the server up after the checks, to look at.
const keepAlive = process.argv.includes('--preview')
const timeout = keepAlive ? null : setTimeout(() => { console.error('Navigation browser test timed out'); server.closeAllConnections(); server.close(); process.exitCode = 1 }, 120_000)
server.listen(0, '127.0.0.1', () => console.log(`Open http://localhost:${server.address().port}/admin/settings/site to run navigation checks.`))
