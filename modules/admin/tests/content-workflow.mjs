// Build first: ./dev pnpm build
// node modules/admin/tests/content-workflow.mjs --preview
// node modules/admin/tests/content-workflow.mjs --site=/absolute/site (real rendering, in-memory edits)
// The printed URL runs the real bundles against isolated in-memory APIs, with no site writes.
import { createServer } from 'node:http'
import { readFile, realpath } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const siteArgument = process.argv.find((argument) => argument.startsWith('--site='))?.slice('--site='.length)
const realSite = siteArgument ? await realpath(resolve(siteArgument)) : null
const realPublic = realSite ? await realpath(resolve(realSite, 'public')) : null
// This bridge only exposes fixed reads and rendering. Ability mutations remain in the Map below.
let siteQueue = Promise.resolve()
const siteRequest = (input) => {
  const result = siteQueue.then(() => new Promise((resolveResult, reject) => {
    const child = spawn('php', [resolve(root, 'modules/admin/tests/render-site.php'), `--site=${realSite}`], { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = '', errors = ''
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => { output += chunk }); child.stderr.on('data', (chunk) => { errors += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      try {
        const result = JSON.parse(output)
        if (code || result.error) reject(new Error(result.error || errors || `Site helper exited ${code}`))
        else resolveResult(result)
      } catch (error) { reject(new Error(`Site helper failed: ${errors || error.message}`)) }
    })
    child.stdin.on('error', reject)
    child.stdin.end(JSON.stringify(input))
  }))
  // CLI boot may publish shared asset caches; never overlap helper processes.
  siteQueue = result.catch(() => undefined)
  return result
}
const realSources = realSite ? [
  await siteRequest({ operation: 'read', collection: 'pages', slug: 'home' }),
  await siteRequest({ operation: 'read', collection: 'blog' }),
] : []
if (realSite && realSources.some((source) => !source.entry)) throw new Error('The real-site preview requires pages/home and a blog entry.')
const realEntries = new Set(realSources.map((source) => source.entry.id))
const admin = JSON.parse(await readFile(resolve(root, 'modules/admin/dist/admin.json'), 'utf8'))
const assetBase = '/_cms/assets/cms-admin/'
const modules = ['content']
const plugins = ['blocks', 'seo', 'site']
const all = { create: true, edit: true, publish: true, delete: true }
const viewer = { create: false, edit: false, publish: false, delete: false }
const summary = (handle, title, singular, { structure = 'list', routable = false, can = all } = {}) => ({ handle, title, singular, newLabel: `New ${singular}`, icon: structure === 'tree' ? 'page' : 'article', structure, driver: 'database', can, routable })
const collections = realSite ? realSources.map(({ collection }) => ({ ...summary(collection.handle, collection.title, collection.singular, { structure: collection.structure, routable: !!collection.route }), driver: collection.driver })) : [summary('posts', 'Posts', 'Post'), summary('pages', 'Pages', 'Page', { structure: 'tree', routable: true }), summary('viewer', 'Read-only pages', 'Page', { structure: 'tree', routable: true, can: viewer })]
const fields = [
  { handle: 'excerpt', type: 'textarea', label: 'Summary' },
  { handle: 'notes', type: 'text', label: 'Custom notes', section: 'custom' },
  { handle: 'reviewer', type: 'users', label: 'Reviewer', section: 'sidebar', max: 1 },
  { handle: 'seo', type: 'group', label: 'SEO', section: 'seo', fields: [{ handle: 'title', type: 'text', label: 'Search title' }, { handle: 'description', type: 'textarea', label: 'Search description' }] },
]
const definition = (handle) => {
  if (realSite) return realSources.find((source) => source.collection.handle === handle)?.collection
  const collection = collections.find((collection) => collection.handle === handle)
  const resolvedFields = [...fields, { handle: 'body', type: 'blocks', label: 'Body' }]
  return { ...collection, singular: collection.singular, body: 'body', ...(collection.routable ? { route: '/{slug}' } : {}), sort: 'title', default_view: 'table', fields: resolvedFields, resolvedFields, schema: {} }
}
const people = [...realSources.map((source) => source.entry.author).filter(Boolean), { id: 'ada', name: 'Ada Example', initials: 'AE', avatar: null }, { id: 'grace', name: 'Grace Hopper', initials: 'GH', avatar: null }]
const fixtureComponent = { handle: 'fixture-component', title: 'Fixture component', synced: true, category: 'Fixture', description: '', props: [{ handle: 'title', type: 'text', label: 'Title', default: 'Shared component default title' }], blocks: [{ id: 'shared-component-heading', type: 'heading', props: { text: 'Shared component default title', level: 2 }, bind: { text: { source: 'props.title' } } }] }
const instanceNode = () => ({ id: 'block-instance', type: 'pattern', props: { ref: fixtureComponent.handle, values: { subtitle: 'Preserve the instance subtitle', tone: 'quiet' } } })
const makeEntry = (id, collection, title) => ({ id, collection, locale: 'en', title, slug: id, uri: collection === 'posts' ? null : `/${id}`, status: 'draft', displayStatus: 'draft', data: { excerpt: 'A short summary for testing the real entry form.', notes: 'This section has no plugin owner.', reviewer: ['grace'], seo: { title: 'Search title', description: 'Search description' }, body: [{ id: 'block-heading', type: 'heading', props: { text: 'A clear page title', level: 1 } }, { id: 'block-layout', type: 'box', label: 'Article section', props: { tag: 'section' }, children: [{ id: 'block-text', type: 'paragraph', props: { text: 'Select a block to inspect its content and return to page details.' } }, { id: 'block-nested-tail', type: 'paragraph', props: { text: 'A second paragraph preserves a real nested insertion gap.' } }] }, { id: 'block-tail', type: 'paragraph', props: { text: '' } }, ...(id === 'post-2' ? [{ id: 'block-list', type: 'list', props: { items: ['A list item keeps consistent keyboard selection.'], ordered: false } }] : []), ...(['post-2', 'view-1'].includes(id) ? [instanceNode()] : [])] }, hasDraft: false, version: `v-${id}-1`, parentId: null, position: 0, originId: null, authorId: 'ada', author: people[0], createdAt: '2026-10-24T10:00:00Z', updatedAt: '2026-10-28T11:00:00Z', publishedAt: null })
const initialEntries = () => realSite ? new Map(realSources.map((source) => [source.entry.id, structuredClone(source.entry)])) : new Map([['post-1', makeEntry('post-1', 'posts', 'An editable post')], ['post-2', makeEntry('post-2', 'posts', 'A second post')], ['page-1', makeEntry('page-1', 'pages', 'An editable page')], ['page-2', makeEntry('page-2', 'pages', 'A parent page')], ['view-1', makeEntry('view-1', 'viewer', 'A read-only page')]])
let entries = initialEntries()
const revisions = (entry) => [0, 1].map((index) => ({ id: `${entry.id}-revision-${index}`, action: index ? 'create' : 'save', title: entry.title, user: people[0], createdAt: index ? entry.createdAt : entry.updatedAt, message: null }))
const nav = collections.map((collection) => ({ id: collection.handle, label: collection.title, path: `/content/${collection.handle}`, icon: collection.icon, section: 'content' }))
const brand = JSON.parse(await readFile(resolve(root, 'brand/brand.json'), 'utf8'))
const manifest = {
  cms: { version: 'fixture', lockedDown: false, debug: false },
  site: realSources[0]?.site ?? { name: 'Content workflow verification', url: 'https://fixture.example', locales: ['en'], defaultLocale: 'en', timezone: 'Europe/Brussels' },
  user: { ...people[0], email: 'ada@example.invalid', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', ...modules.map((name) => `cms/${name}`), ...plugins.map((name) => `cms/${name}`)], pending: {} },
  modules: [...modules, ...plugins].map((name) => ({ id: `cms/${name}`, url: `/_cms/assets/cms-${name}/admin.js`, package: `cms/${name}` })),
  styles: [...modules, ...plugins].map((name) => `/_cms/assets/cms-${name}/admin.css`),
  settings: [], collections, globals: [], fieldTypes: [], commands: [], widgets: [], dashboard: [], config: { content: { autosave: 0, perPage: 50 } }, nav,
  sidebar: { sections: [{ id: 'content', label: 'Content', items: nav.map((item) => item.id) }], hidden: [], personal: false },
  settingsNav: [], brand,
}
const boot = { brand, base: '/admin', api: '/api/admin', version: 'fixture', theme: { name: 'cms/admin', version: 'fixture' }, site: manifest.site, locale: 'en', messages: {}, manifest }
const imports = { ...Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path])), '@letterncms/blocks': '/_cms/assets/cms-blocks/admin.js' }
const fixtureNonce = 'fixture-preview-scripts'
const editorToken = 'fixture-editor-document'
const requests = []
let lastResult = null
const failures = new Set()
let delay = 0
let sequence = 1
const catalog = realSources[0]?.catalog ?? { blocks: [{ name: 'heading', title: 'Heading', icon: 'b-text-h', category: 'text', fields: [{ handle: 'text', type: 'text', label: 'Text' }], styles: [] }, { name: 'paragraph', title: 'Paragraph', icon: 'b-text-t', category: 'text', fields: [{ handle: 'text', type: 'textarea', label: 'Text' }], styles: [] }, { name: 'box', title: 'Container', icon: 'square', category: 'layout', children: true, fields: [{ handle: 'tag', type: 'text', label: 'HTML tag' }], styles: [] }, { name: 'pattern', title: 'Component', icon: 'symbol', category: 'layout', fields: [], styles: [] }, { name: 'list', title: 'List', icon: 'list', category: 'text', fields: [], styles: [] }], styles: {}, aliases: {}, states: ['hover'], breakpoints: { tablet: '820px', mobile: '390px' }, sources: [], transforms: [], motion: { triggers: [], properties: {} }, logic: { events: [], mods: [], actions: [], transitions: [], merges: [] } }
const runner = String.raw`
import { navigate, queryClient } from '@letterncms/sdk'
const output = document.querySelector('#results')
const results = []
queryClient.setDefaultOptions({ queries: { retry: false, staleTime: 15000 } })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const assert = (value, message) => { if (!value) throw new Error(message) }
const wait = async (fn, message) => { const until = Date.now() + 10000; while (!fn()) { if (Date.now() > until) throw new Error(message); await sleep(20) } }
const button = (label, host = document) => [...(host ?? document).querySelectorAll('button')].find((button) => button.textContent.trim() === label || button.textContent.trim().endsWith(label) || button.getAttribute('aria-label') === label)
const waitAsync = async (fn, message) => { const until = Date.now() + 10000; while (!(await fn())) { if (Date.now() > until) throw new Error(message); await sleep(25) } }
const save = () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: /Mac|iPhone|iPad/.test(navigator.platform), ctrlKey: !/Mac|iPhone|iPad/.test(navigator.platform), bubbles: true }))
const setInput = (input, value) => { assert(input, 'Missing input'); const prototype = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })) }
const test = async (name, fn) => { await fn(); results.push(name); output.textContent = results.map((name) => 'PASS ' + name).join('\n') }
const state = () => fetch('/__test/state').then((response) => response.json())
const configure = (config) => fetch('/__test/config', { method: 'POST', body: JSON.stringify(config) })
const liveFrame = () => document.querySelector('iframe[title="Live editor"]')
const liveDoc = () => liveFrame()?.contentDocument
const source = (id) => liveDoc()?.querySelector('[data-cms-document="fixture-editor-document"][data-cms-node="' + id + '"]')
const editing = (id) => source(id)?.querySelector('[data-cms-inline][contenteditable="true"]')
const rendered = async () => { await wait(() => liveDoc()?.documentElement?.hasAttribute('data-cms-bridge-ready') && liveDoc()?.querySelector('[data-cms-editor-root="fixture-editor-document"]'), 'Live renderer did not become ready') }
const details = async () => {
  await rendered()
  if (!document.querySelector('#entry-sidebar-details')) {
    const back = button('Page', document.querySelector('[data-block-workspace]')) || button('Post', document.querySelector('[data-block-workspace]'))
    if (back) back.click()
    else button('Entry details').click()
    await wait(() => document.querySelector('#entry-sidebar-details'), 'Details did not open')
  }
  document.querySelector('#entry-sidebar-details').click()
  await wait(() => document.querySelector('#entry-sidebar-details-panel #f-title'), 'Details did not activate')
}
const open = async (path, title) => {
  navigate(path)
  await wait(() => location.pathname === '/admin' + path && document.querySelector('header')?.textContent.includes(title), 'Failed to open ' + path)
  await rendered()
}
const typeText = (target, text) => {
  assert(target, 'Missing rendered inline target')
  const doc = target.ownerDocument
  target.focus(); target.textContent = text
  const range = doc.createRange(); range.selectNodeContents(target); range.collapse(false)
  const selection = doc.getSelection(); selection.removeAllRanges(); selection.addRange(range)
  target.dispatchEvent(new doc.defaultView.InputEvent('input', { bubbles: true, inputType: 'insertText', data: text.at(-1) ?? '' }))
}
const persist = async () => {
  await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Unsaved', 'Edit did not reach the entry session')
  save()
  await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Saved', 'Change did not save')
}
const sourceChildren = (host) => [...host.children].filter((child) => child.dataset.cmsDocument === 'fixture-editor-document' && child.dataset.cmsNode)
const frameTick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
const controls = (id) => document.querySelector('[data-cms-block-controls="' + id + '"]')
const selectRendered = async (id) => {
  liveDoc().activeElement?.blur?.()
  source(id).scrollIntoView({ block: 'center' })
  await frameTick()
  source(id).dispatchEvent(new (liveDoc().defaultView.MouseEvent)('click', { bubbles: true, cancelable: true }))
  if (innerWidth < 1024) {
    await wait(() => document.querySelector('[role="dialog"]'), 'Block inspector sheet did not open')
    button('Close', document.querySelector('[role="dialog"]')).click()
    await wait(() => !document.querySelector('[role="dialog"]'), 'Block inspector sheet did not close')
  }
  await wait(() => controls(id), 'Selected block controls did not appear for ' + id)
}
const parentNodes = async (parentId) => {
  const body = (await state()).entries['page-1'].data.body
  return parentId ? body.find((node) => node.id === parentId).children : body
}
const parentOrder = async (parentId) => (await parentNodes(parentId)).map((node) => node.id)
const pointerEvent = (target, type, x, y, extra = {}) => {
  const owner = target.ownerDocument ?? document
  target.dispatchEvent(new owner.defaultView.PointerEvent(type, { pointerId: 81, pointerType: 'mouse', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true, ...extra }))
}
const outerPoint = (x, y) => {
  const frame = liveFrame(), rect = frame.getBoundingClientRect(), scale = rect.width / frame.clientWidth
  return { x: rect.left + x * scale, y: rect.top + y * scale }
}
const nodeCount = () => liveDoc().querySelectorAll('[data-cms-document="fixture-editor-document"][data-cms-node]').length
const insertMenu = () => document.querySelector('[data-cms-insert-menu]')
const chooseParagraph = async (text, notId) => {
  await wait(() => insertMenu() && button('Paragraph', insertMenu()), 'Quick inserter did not offer a paragraph')
  const originalIds = new Set([...liveDoc().querySelectorAll('[data-cms-document="fixture-editor-document"][data-cms-node]')].map((node) => node.dataset.cmsNode))
  button('Paragraph', insertMenu()).click()
  await wait(() => liveDoc().activeElement?.isContentEditable && !originalIds.has(liveDoc().activeElement.closest('[data-cms-node]')?.dataset.cmsNode) && liveDoc().activeElement.closest('[data-cms-node]')?.dataset.cmsNode !== notId, 'Insertion did not focus the new paragraph')
  typeText(liveDoc().activeElement, text)
  await persist()
}
/** Rest the pointer on a boundary, open its + and insert a paragraph there. */
const gapInsert = async (parentId, index, text) => {
  const doc = liveDoc()
  const host = parentId ? source(parentId) : doc.querySelector('[data-cms-editor-root="fixture-editor-document"]')
  const children = sourceChildren(host)
  const before = children[index - 1], after = children[index]
  ;(after ?? before ?? host).scrollIntoView({ block: 'center' })
  await frameTick()
  const parentBox = host.getBoundingClientRect(), beforeBox = before?.getBoundingClientRect(), afterBox = after?.getBoundingClientRect()
  const x = parentBox.left + parentBox.width / 2
  const y = beforeBox && afterBox ? (beforeBox.bottom + afterBox.top) / 2 : afterBox ? afterBox.top - 2 : beforeBox.bottom + 2
  const target = doc.elementFromPoint(x, y) ?? host
  target.dispatchEvent(new doc.defaultView.PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
  const key = (parentId ?? '') + ':' + index
  await wait(() => document.querySelector('[data-cms-inserter="' + key + '"]'), 'No between-block inserter at ' + key)
  const line = document.querySelector('[data-cms-insertion-line]').getBoundingClientRect(), edge = outerPoint(0, y).y
  assert(Math.abs(line.top - edge) < 40, 'The insertion line is not on its boundary at ' + key)
  document.querySelector('[data-cms-inserter="' + key + '"]').click()
  await chooseParagraph(text)
  const entry = (await state()).entries['page-1']
  const siblings = parentId ? entry.data.body.find((node) => node.id === parentId).children : entry.data.body
  assert(siblings[index]?.props.text === text, 'Boundary insertion landed at another source slot')
}
const insertKey = (code) => liveDoc().body.dispatchEvent(new (liveDoc().defaultView.KeyboardEvent)('keydown', { key: code === 'KeyT' ? '†' : '¥', code, altKey: true, metaKey: /Mac|iPhone|iPad/.test(navigator.platform), ctrlKey: !/Mac|iPhone|iPad/.test(navigator.platform), bubbles: true, cancelable: true }))
try {
  await rendered()
  await test('Pages and posts use the real renderer with one scoped editing document', async () => {
    await details()
    assert(liveFrame() && liveDoc().querySelector('[data-cms-editor-root="fixture-editor-document"]'), 'Post does not use scoped site rendering')
    assert(!document.querySelector('[data-cms-write]'), 'A second static writer is still mounted')
    let tabs = [...document.querySelectorAll('#entry-sidebar-details, #entry-sidebar-history')]
    assert(tabs[0].textContent === 'Post' && tabs[1].textContent === 'History', 'Post metadata tabs are inconsistent')
    assert(document.querySelector('[data-field="notes"] input').value.includes('no plugin owner'), 'Unclaimed custom field disappeared')
    assert(document.querySelector('#f-reviewer'), 'Sidebar field is unreachable')
    let controlIds = [...document.querySelectorAll('input[id],textarea[id],select[id]')].map((control) => control.id)
    assert(new Set(controlIds).size === controlIds.length, 'Nested metadata IDs collide')
    assert(document.querySelector('[data-field="seo"] input').id !== 'f-title', 'Nested title reused the record title ID')
    await open('/content/pages/page-1', 'An editable page'); await details()
    assert(source('block-layout')?.contains(source('block-text')), 'Rendered source hierarchy was flattened')
    assert(liveDoc().defaultView.getComputedStyle(source('block-layout')).borderTopWidth === '0px', 'Artificial container borders changed the site layout')
    assert(parseFloat(liveDoc().defaultView.getComputedStyle(source('block-heading')).fontSize) === 40, 'The editor replaced site typography')
    assert(liveFrame().contentWindow.__fixturePreviewRan !== true, 'Site scripts ran in edit mode')
    tabs = [...document.querySelectorAll('#entry-sidebar-details, #entry-sidebar-history')]
    assert(tabs[0].textContent === 'Page' && tabs[1].textContent === 'History', 'Page metadata tabs differ')
    assert(!document.querySelector('#entry-sidebar-details-panel [data-field="seo"]') && document.querySelector('#entry-sidebar-seo'), 'Plugin field ownership differs')
    controlIds = [...document.querySelectorAll('input[id],textarea[id],select[id]')].map((control) => control.id)
    assert(new Set(controlIds).size === controlIds.length, 'Page metadata IDs collide')
  })
  await test('An unsaved entry renders through the same collection editor endpoint', async () => {
    await open('/content/posts/new', 'Untitled')
    const calls = (await state()).requests.filter((request) => request.ability === '__preview')
    assert(calls.some((request) => request.path === '/__preview' && request.input.collection === 'posts' && request.input.play === false), 'Unsaved entry bypassed live collection rendering')
    assert(liveDoc().querySelector('[data-cms-editor-root]'), 'Unsaved document has no insertion root')
    await open('/content/pages/page-1', 'An editable page'); await details()
  })
  await test('Long rendered titles wrap using site typography without rounded clipping', async () => {
    const title = document.querySelector('#f-title'), original = title.value
    const text = 'A long editorial title that wraps naturally without clipping its text or hiding the caret'
    setInput(title, text)
    await wait(() => liveDoc()?.querySelector('#fixture-entry-title')?.textContent === text, 'Changed title did not reach the site renderer')
    const renderedTitle = liveDoc().querySelector('#fixture-entry-title'), style = liveDoc().defaultView.getComputedStyle(renderedTitle)
    assert(parseFloat(style.lineHeight) >= parseFloat(style.fontSize), 'Site title line height was overwritten')
    assert(style.borderRadius === '0px', 'Rendered title is inside a rounded control mask')
    assert(liveDoc().documentElement.scrollWidth <= liveDoc().documentElement.clientWidth, 'Rendered title overflows its site layout')
    setInput(title, original)
    await wait(() => liveDoc()?.querySelector('#fixture-entry-title')?.textContent === original, 'Title did not restore')
  })
  await test('Rendered nested blocks share the same Content, Design and Interact inspector', async () => {
    source('block-layout').dispatchEvent(new (liveDoc().defaultView.MouseEvent)('click', { bubbles: true, cancelable: true }))
    await wait(() => document.querySelector('fieldset[role="tabpanel"]'), 'Rendered container inspector did not open')
    for (const label of ['Content', 'Design', 'Interact']) {
      const tab = [...document.querySelectorAll('[role="tab"]')].find((tab) => tab.textContent.trim() === label)
      assert(tab, 'Missing inspector tab: ' + label); tab.click()
      await wait(() => tab.getAttribute('aria-selected') === 'true', label + ' did not activate')
    }
    await details()
    source('block-text').dispatchEvent(new (liveDoc().defaultView.MouseEvent)('click', { bubbles: true, cancelable: true }))
    await wait(() => document.querySelector('fieldset[role="tabpanel"]'), 'Rendered paragraph inspector did not open')
    assert(source('block-layout').contains(source('block-text')), 'Inspection changed source hierarchy')
    await details()
  })
  await test('Outline keyboard activation inspects the same rendered source block', async () => {
    button('Show Outline').click()
    await wait(() => document.querySelector('[data-layer="block-text"]'), 'Outline did not open')
    const layer = document.querySelector('[data-layer="block-text"]'); layer.focus()
    layer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await wait(() => document.querySelector('fieldset[role="tabpanel"]'), 'Keyboard selection did not inspect the block')
    if (innerWidth >= 1024) assert(document.activeElement === layer, 'Outline activation moved focus into text')
    button('Hide Outline')?.click()
    await details()
  })
  await test('Clicking blank space selects or clears, and never creates a block', async () => {
    const count = nodeCount(), original = JSON.stringify((await state()).entries['page-1'].data.body)
    const layout = source('block-layout'), box = layout.getBoundingClientRect(), text = source('block-text').getBoundingClientRect()
    for (const [x, y] of [[box.left + 4, box.top + 4], [box.left + box.width / 2, (text.bottom + source('block-nested-tail').getBoundingClientRect().top) / 2], [box.left + box.width / 2, box.bottom + 10]]) {
      const target = liveDoc().elementFromPoint(x, y) ?? liveDoc().body
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) target.dispatchEvent(new (liveDoc().defaultView[type.startsWith('pointer') ? 'PointerEvent' : 'MouseEvent'])(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true }))
      await frameTick()
    }
    assert(nodeCount() === count, 'A click created a block')
    assert(document.querySelector('header [role="status"]')?.textContent !== 'Unsaved', 'A click counted as an edit')
    assert(JSON.stringify((await state()).entries['page-1'].data.body) === original, 'A click changed the content')
    await selectRendered('block-text')
    liveDoc().body.dispatchEvent(new (liveDoc().defaultView.MouseEvent)('click', { clientX: 4, clientY: 4, bubbles: true, cancelable: true }))
    await wait(() => !document.querySelector('[data-cms-selection], [data-cms-block-controls]'), 'Clicking outside every block kept the selection')
    await details()
  })
  await test('The between-block inserter inserts before, between and after root and nested blocks', async () => {
    await gapInsert(null, 0, 'Inserted before all root blocks')
    await gapInsert(null, 2, 'Inserted between root blocks')
    await gapInsert(null, sourceChildren(liveDoc().querySelector('[data-cms-editor-root]')).length, 'Inserted after all root blocks')
    await gapInsert('block-layout', 0, 'Inserted before nested blocks')
    await gapInsert('block-layout', 2, 'Inserted between nested blocks')
    await gapInsert('block-layout', sourceChildren(source('block-layout')).length, 'Inserted after nested blocks')
    await details()
  })
  await test('Insert before and after anchor to the selected block and stay put while the pointer moves', async () => {
    await selectRendered('block-text')
    assert(!document.querySelector('[data-cms-insert-before], [data-cms-insert-after]'), 'Selection still shows detached plus buttons')
    const previous = await parentOrder('block-layout'), previousIndex = previous.indexOf('block-text')
    insertKey('KeyT')
    await wait(() => insertMenu() && document.querySelector('[data-cms-insertion-line]'), 'Insert before did not open the quick inserter')
    const block = source('block-text').getBoundingClientRect(), line = document.querySelector('[data-cms-insertion-line]').getBoundingClientRect()
    assert(Math.abs(line.top - outerPoint(0, block.top).y) <= 4, 'Insert before is not anchored to the block edge')
    const host = source('block-layout').getBoundingClientRect()
    for (const y of [block.top - 8, block.bottom + 8, host.bottom - 4]) {
      pointerEvent(liveDoc().elementFromPoint(host.left + host.width / 2, y) ?? liveDoc().body, 'pointermove', host.left + host.width / 2, y)
      await frameTick()
      assert(Math.abs(document.querySelector('[data-cms-insertion-line]').getBoundingClientRect().top - line.top) < 1, 'The open inserter followed the pointer')
    }
    await chooseParagraph('Inserted with a stable before control', 'block-text')
    let next = await parentOrder('block-layout')
    assert(next.indexOf('block-text') === previousIndex + 1 && next[previousIndex] !== previous[previousIndex], 'Insert before used another source slot')
    await selectRendered('block-text')
    insertKey('KeyY')
    await wait(() => insertMenu(), 'Insert after did not open the quick inserter')
    const after = source('block-text').getBoundingClientRect(), afterLine = document.querySelector('[data-cms-insertion-line]').getBoundingClientRect()
    assert(Math.abs(afterLine.top - outerPoint(0, after.bottom).y) <= 4, 'Insert after is not anchored to the block edge')
    await chooseParagraph('Inserted with a stable after control', 'block-text')
    next = (await state()).entries['page-1'].data.body.find((node) => node.id === 'block-layout').children
    assert(next[next.findIndex((node) => node.id === 'block-text') + 1]?.props.text === 'Inserted with a stable after control', 'Insert after used another source slot')
    await details()
  })
  await test('Inline text focus hides block selection chrome without changing content', async () => {
    liveDoc().activeElement?.blur?.()
    source('block-text').scrollIntoView({ block: 'center' }); await frameTick()
    const hoverRect = source('block-text').getBoundingClientRect()
    pointerEvent(source('block-text'), 'pointermove', hoverRect.left + 2, hoverRect.top + 12)
    await wait(() => document.querySelector('[data-cms-hover="block-text"]'), 'Hovering a block does not outline it')
    assert(!document.querySelector('[data-cms-selection], [data-cms-block-controls], [data-cms-drop-indicator], [data-cms-block-handle]'), 'Hovering text exposes structural chrome')
    await selectRendered('block-text')
    assert(document.querySelector('[data-cms-selection]'), 'Explicit block selection has no selection frame')
    const prior = await parentOrder('block-layout')
    editing('block-text').focus()
    await wait(() => !document.querySelector('[data-cms-block-controls], [data-cms-selection], [data-cms-hover]'), 'Writing text retains block selection chrome')
    await details()
    editing('block-nested-tail').focus()
    await wait(() => document.querySelector('fieldset[role="tabpanel"]'), 'Writing in a block does not make it the active block in the sidebar')
    editing('block-text').focus()
    assert(JSON.stringify(await parentOrder('block-layout')) === JSON.stringify(prior), 'Focusing text mutated source content')
    await selectRendered('block-text')
    assert(document.querySelector('[data-cms-selection]'), 'Explicit selection did not restore the block frame')
    await details()
  })
  await test('Move controls reorder exact source siblings and preserve nested content', async () => {
    const originalNodes = await parentNodes('block-layout'), original = originalNodes.map((node) => node.id), index = original.indexOf('block-text')
    await selectRendered('block-text')
    button('Move down', controls('block-text')).click()
    await persist()
    let next = await parentOrder('block-layout')
    assert(next[index + 1] === 'block-text' && next.length === original.length, 'Move down lost content or moved to another parent')
    await selectRendered('block-text')
    button('Move up', controls('block-text')).click()
    await persist()
    assert(JSON.stringify(await parentNodes('block-layout')) === JSON.stringify(originalNodes), 'Move up did not restore sibling order and original content')
    await details()
  })
  await test('Drag feedback persists through the gesture, Escape cancels, and release moves the exact source', async () => {
    const originalNodes = await parentNodes('block-layout'), original = originalNodes.map((node) => node.id)
    const start = async () => {
      await selectRendered('block-text')
      const handle = button('Drag to move', controls('block-text')), rect = handle.getBoundingClientRect()
      const from = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      pointerEvent(handle, 'pointerdown', from.x, from.y)
      pointerEvent(document, 'pointermove', from.x + 2, from.y + 1)
      await frameTick()
      assert(!document.querySelector('[data-cms-drag-overlay]'), 'A pointer click began dragging before the movement threshold')
      const host = source('block-layout').getBoundingClientRect(), siblings = sourceChildren(source('block-layout')), index = siblings.findIndex((node) => node.dataset.cmsNode === 'block-text')
      const before = siblings[index + 1].getBoundingClientRect(), after = siblings[index + 2]?.getBoundingClientRect()
      const to = outerPoint(host.left + host.width / 2, (before.bottom + (after?.top ?? host.bottom)) / 2)
      pointerEvent(document, 'pointermove', to.x, to.y)
      await wait(() => document.querySelector('[data-cms-drag-overlay]') && document.querySelector('[data-cms-drag-ghost]') && document.querySelector('[data-cms-drop-indicator]'), 'Dragging has no persistent overlay, ghost, and drop indicator')
      await frameTick()
      assert(document.querySelector('[data-cms-drop-indicator]'), 'The drop indicator disappeared between pointer events')
      assert(getComputedStyle(document.querySelector('[data-cms-drag-overlay]')).pointerEvents !== 'none' && document.elementFromPoint(to.x, to.y)?.closest('[data-cms-drag-overlay]'), 'The drag overlay does not receive native pointer events above the iframe')
      return to
    }
    await start()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await wait(() => !document.querySelector('[data-cms-drag-overlay], [data-cms-drag-ghost], [data-cms-drop-indicator]'), 'Escape did not clear drag feedback')
    await wait(() => JSON.stringify(sourceChildren(source('block-layout')).map((node) => node.dataset.cmsNode)) === JSON.stringify(original), 'Canceling drag changed the rendered source order')
    assert(JSON.stringify(await parentNodes('block-layout')) === JSON.stringify(originalNodes), 'Canceling drag changed source content')
    const to = await start()
    pointerEvent(document, 'pointerup', to.x, to.y)
    await wait(() => !document.querySelector('[data-cms-drag-overlay], [data-cms-drag-ghost], [data-cms-drop-indicator]'), 'Dropping did not clear drag feedback')
    await persist()
    const next = await parentOrder('block-layout')
    assert(next[original.indexOf('block-text') + 1] === 'block-text' && next.length === original.length && new Set(next).size === next.length, 'Drag release lost, duplicated, or misplaced source content')
    for (let i = next.indexOf('block-text'); i > original.indexOf('block-text'); i--) {
      await selectRendered('block-text'); button('Move up', controls('block-text')).click(); await persist()
    }
    assert(JSON.stringify(await parentNodes('block-layout')) === JSON.stringify(originalNodes), 'Restoring a dragged block lost its original sibling order or content')
    await details()
  })
  await test('A selected block scrolled out of view leaves no floating toolbar at the viewport edge', async () => {
    await selectRendered('block-heading')
    // Room to scroll whatever the window's height: the fixture page is short.
    liveDoc().body.style.paddingBottom = '300vh'
    liveDoc().defaultView.scrollTo(0, liveDoc().documentElement.scrollHeight)
    await wait(() => source('block-heading').getBoundingClientRect().bottom < 0, 'The selected heading did not scroll out of view')
    await wait(() => !controls('block-heading'), 'An offscreen selected block leaves a floating toolbar')
    source('block-heading').scrollIntoView({ block: 'center' })
    await wait(() => controls('block-heading'), 'Selected block controls did not return when its anchor became visible')
    liveDoc().body.style.paddingBottom = ''
    await details()
  })
  await test('Inline edits preserve the source DOM and slash insertion replaces the exact nested slot', async () => {
    const before = source('block-text'), text = 'An inline edit keeps the server rendered node in place.'
    typeText(editing('block-text'), text)
    await persist()
    await wait(() => source('block-text')?.textContent === text, 'Inline content did not render')
    assert(source('block-text') === before, 'Saving an inline edit replaced the rendered source element')
    const tail = editing('block-tail')
    typeText(tail, '/heading')
    await wait(() => document.querySelector('[data-cms-slash]') && button('Heading', document.querySelector('[data-cms-slash]')), 'Iframe slash menu did not load')
    button('Heading', document.querySelector('[data-cms-slash]')).click()
    await wait(() => !source('block-tail'), 'Slash did not replace its placeholder source node')
    await persist()
    const persisted = (await state()).entries['page-1'].data.body
    assert(persisted.find((node) => node.id === 'block-layout')?.children.some((node) => node.id === 'block-text'), 'Slash insertion lost nested source content')
    assert(persisted.filter((node) => node.type === 'heading').length === 2, 'Slash inserted outside the source model')
    await details()
  })
  await test('Component text edits update only the instance value and survive authoritative rendering', async () => {
    await open('/content/posts/post-2', 'A second post')
    const sheet = document.querySelector('[role="dialog"]')
    if (sheet && button('Close', sheet)) { button('Close', sheet).click(); await wait(() => !document.querySelector('[role="dialog"]'), 'Metadata sheet did not close for inline component editing') }
    const instance = () => liveDoc().querySelector('[data-cms-instance-node="block-instance"][data-cms-instance-prop="title"]')
    await wait(() => instance()?.querySelector('[data-cms-inline][contenteditable="true"]'), 'Rendered component title has no inline editing slot')
    const baseline = await state(), previous = baseline.entries['post-2'].data.body.find((node) => node.id === 'block-instance')
    assert(instance().textContent === 'Shared component default title', 'The resolved component default was not rendered')
    const target = instance().querySelector('[data-cms-inline]')
    target.focus()
    await wait(() => !document.querySelector('[data-cms-selection], [data-cms-block-controls]'), 'Direct component typing retains structural selection chrome')
    assert(!document.querySelector('[data-layer]'), 'Editing component text requires opening the outline')
    assert(target.hasAttribute('data-cms-plain'), 'Component text is not marked as plain text')
    const text = '**A private component title with <literal> & symbols**'
    typeText(target, text)
    const richKey = new (liveDoc().defaultView.KeyboardEvent)('keydown', { key: 'b', metaKey: /Mac|iPhone|iPad/.test(navigator.platform), ctrlKey: !/Mac|iPhone|iPad/.test(navigator.platform), bubbles: true, cancelable: true })
    target.dispatchEvent(richKey)
    assert(richKey.defaultPrevented && !target.querySelector('b,strong,i,em,a,code'), 'Plain component text accepts rich formatting')
    const range = liveDoc().createRange(); range.selectNodeContents(target)
    const selection = liveDoc().getSelection(); selection.removeAllRanges(); selection.addRange(range)
    liveDoc().dispatchEvent(new (liveDoc().defaultView.Event)('selectionchange'))
    await frameTick()
    assert(!button('Bold'), 'Selecting plain component text opens the rich formatting toolbar')
    await persist()
    await wait(() => instance()?.dataset.cmsInstanceValue === text, 'Authoritative rendering lost the edited component value')
    const current = await state(), updated = current.entries['post-2'].data.body.find((node) => node.id === 'block-instance')
    assert(updated.props.values.title === text, 'Component typing did not write the source instance value')
    assert(updated.props.ref === previous.props.ref && updated.props.values.subtitle === previous.props.values.subtitle && updated.props.values.tone === previous.props.values.tone, 'Editing a component value replaced its reference or other instance values')
    assert(JSON.stringify(current.patterns) === JSON.stringify(baseline.patterns), 'Typing an instance changed the shared component definition')
    assert(!current.requests.some((request) => /patterns\/(?:save|update)|components\/(?:save|update)/.test(request.ability)), 'Inline instance typing called a shared definition mutation')
    const listText = editing('block-list')
    listText.focus()
    listText.dispatchEvent(new (liveDoc().defaultView.KeyboardEvent)('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await wait(() => controls('block-list'), 'Escape from a list item failed to expose its structural actions')
    await open('/content/pages/page-1', 'An editable page'); await details()
  })
  await test('Rendered preview runs site scripts while editing stays inert', async () => {
    assert([...document.querySelectorAll('button[aria-label="Preview"]')].length === 1, 'The editor exposes duplicate preview actions')
    button('Preview').click()
    await wait(() => document.querySelector('iframe[title="Site preview"]')?.contentDocument?.querySelector('#fixture-preview'), 'Read-only preview did not load')
    const frame = document.querySelector('iframe[title="Site preview"]')
    assert(!frame.contentDocument.querySelector('[contenteditable], [data-cms-inline], [data-cms-prop]'), 'Preview contains an editing bridge')
    await wait(() => frame.contentWindow.__fixturePreviewRan === true, 'Preview scripts did not run')
    assert((await state()).requests.filter((request) => request.ability === '__preview').at(-1).input.play === true, 'Preview requested editing output')
    button('Close', document.querySelector('[role="dialog"]')).click()
    await wait(() => !document.querySelector('iframe[title="Site preview"]'), 'Preview did not close')
    assert(liveFrame() && source('block-text'), 'Closing preview replaced the editing document')
  })
  await test('Moving a record preserves source content and checks the saved version', async () => {
    await details()
    const before = (await state()).entries['page-1']
    button('Move', document.querySelector('#entry-sidebar-details-panel')).click()
    await wait(() => document.querySelector('#f-parentId'), 'Move dialog did not load')
    document.querySelector('#f-parentId').click()
    await wait(() => [...document.querySelectorAll('[role="option"]')].some((option) => option.textContent.includes('A parent page')), 'Eligible parent missing')
    ;[...document.querySelectorAll('[role="option"]')].find((option) => option.textContent.includes('A parent page')).click()
    await wait(() => !button('Move', document.querySelector('[role="dialog"]')).disabled, 'Move confirmation did not become ready')
    button('Move', document.querySelector('[role="dialog"]')).click()
    await waitAsync(async () => (await state()).entries['page-1'].parentId === 'page-2', 'Move did not persist')
    await wait(() => !document.querySelector('#f-parentId'), 'Move dialog did not close')
    const after = await state()
    assert(JSON.stringify(after.entries['page-1'].data) === JSON.stringify(before.data), 'Move changed source content')
    assert(after.requests.filter((request) => request.ability === 'entries/move').at(-1).input.expectedVersion === before.version, 'Move omitted its saved version')
  })
  await test('Author assignment persists through the shared person picker', async () => {
    await open('/content/posts/post-1', 'An editable post'); await details()
    const authorBefore = document.querySelector('#f-authorId').getBoundingClientRect()
    document.querySelector('#f-authorId').click()
    await wait(() => document.querySelector('.cms-pop button[aria-label="Grace Hopper"]'), 'Scoped people lookup did not load')
    const authorAfter = document.querySelector('#f-authorId').getBoundingClientRect()
    assert(['x', 'y', 'width', 'height'].every((key) => authorBefore[key] === authorAfter[key]), 'Author popover changed the surrounding layout')
    document.querySelector('.cms-pop button[aria-label="Grace Hopper"]').click()
    save()
    await waitAsync(async () => (await state()).entries['post-1'].authorId === 'grace', 'Author change was not persisted')
    await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Saved', 'Author change did not finish saving')
  })
  await test('Failed saves preserve edits, guard navigation, and retry successfully', async () => {
    await configure({ failures: ['entries/update'] })
    setInput(document.querySelector('#f-title'), 'Unsaved title remains'); save()
    await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Couldn’t save', 'Save failure feedback missing')
    assert(document.querySelector('#f-title').value === 'Unsaved title remains', 'Failed save replaced local edits')
    const confirm = window.confirm; window.confirm = () => false
    navigate('/content/posts'); await sleep(100)
    window.confirm = confirm
    assert(location.pathname.endsWith('/posts/post-1'), 'Failed save did not protect navigation')
    await configure({ failures: [] }); button('Retry').click()
    await waitAsync(async () => (await state()).entries['post-1'].title === 'Unsaved title remains', 'Retry did not save retained edits')
    await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Saved', 'Retry did not settle')
  })
  await test('Typing during an in-flight save preserves and serializes the latest edit', async () => {
    await configure({ delay: 200 })
    setInput(document.querySelector('#f-title'), 'Earlier title'); save()
    await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Saving…', 'First save did not start')
    setInput(document.querySelector('#f-title'), 'Latest title'); save()
    await waitAsync(async () => (await state()).entries['post-1'].title === 'Latest title', 'Latest edit was lost behind an earlier save')
    await wait(() => document.querySelector('header [role="status"]')?.textContent === 'Saved', 'Latest save did not settle')
    await configure({ delay: 0 })
  })
  await test('History failures expose recovery and preserve the surrounding editor', async () => {
    await configure({ failures: ['entries/revisions'] })
    queryClient.removeQueries({ queryKey: ['entries/revisions'] })
    document.querySelector('#entry-sidebar-history').click()
    await wait(() => document.querySelector('#entry-sidebar-history-panel [role="alert"]'), 'History error did not render')
    await wait(() => liveDoc()?.querySelector('#fixture-entry-title')?.textContent === 'Latest title', 'History error replaced the rendered document')
    await configure({ failures: [] }); button('Retry', document.querySelector('#entry-sidebar-history-panel')).click()
    await wait(() => document.querySelector('#entry-sidebar-history-panel')?.textContent.includes('Created'), 'History retry did not recover')
  })
  await test('Publication scheduling uses the site timezone and guarded version', async () => {
    await details(); button('More Actions').click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].some(item => item.textContent.trim() === 'Schedule…'), 'Schedule action missing'); [...document.querySelectorAll('[role="menuitem"]')].find(item => item.textContent.trim() === 'Schedule…').click()
    await wait(() => document.querySelector('#f-at'), 'Publication dialog missing')
    assert(document.querySelector('[role="dialog"]').textContent.includes('Europe/Brussels'), 'Site timezone is hidden')
    setInput(document.querySelector('#f-at'), new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16))
    await wait(() => button('Schedule', document.querySelector('[role="dialog"]')), 'Schedule confirmation not ready')
    button('Schedule', document.querySelector('[role="dialog"]')).click()
    await waitAsync(async () => (await state()).entries['post-1'].displayStatus === 'scheduled', 'Scheduling did not persist')
    await wait(() => !document.querySelector('#f-at'), 'Publication dialog did not close')
    const last = (await state()).requests.filter((request) => request.ability === 'entries/update').at(-1)
    assert(last.input.at?.endsWith('Z') && last.input.expectedVersion, 'Scheduling omitted UTC instant or concurrency guard')
  })
  await test('Read-only block workspace remains inspectable without mutation controls or keyboard writes', async () => {
    await open('/content/viewer/view-1', 'A read-only page'); await details()
    assert(document.querySelector('#f-title').disabled, 'Read-only title is editable')
    assert(!button('Publish'), 'Read-only workspace offers publishing')
    assert(!button('Insert block'), 'Read-only workspace offers insertion')
    assert(!liveDoc().querySelector('[contenteditable="true"]'), 'Read-only iframe contains editable source text')
    const componentText = liveDoc().querySelector('[data-cms-instance-node="block-instance"][data-cms-instance-prop="title"] [data-cms-inline]')
    assert(componentText?.getAttribute('aria-readonly') === 'true' && componentText.getAttribute('contenteditable') === 'false', 'Read-only component instance exposes editable text')
    document.querySelector('#entry-sidebar-history').click()
    await wait(() => document.querySelector('#entry-sidebar-history-panel')?.textContent.includes('Created'), 'Read-only history missing')
    assert(!button('Restore', document.querySelector('#entry-sidebar-history-panel')), 'Read-only history offers Restore')
    source('block-text').dispatchEvent(new (liveDoc().defaultView.MouseEvent)('click', { bubbles: true, cancelable: true }))
    await wait(() => document.querySelector('fieldset[role="tabpanel"]'), 'Read-only inspector did not open')
    assert(button('Page', document.querySelector('[data-block-workspace]')), 'No clear return path from the inspector')
    assert(button('Duplicate').disabled && button('Delete').disabled, 'Read-only block mutations enabled')
    assert(document.querySelector('fieldset[disabled]'), 'Read-only inspector fields are enabled')
    const before = (await state()).requests.filter((request) => request.ability === 'entries/update').length
    liveDoc().body.dispatchEvent(new (liveDoc().defaultView.KeyboardEvent)('keydown', { key: 'Backspace', bubbles: true }))
    await sleep(80)
    assert((await state()).requests.filter((request) => request.ability === 'entries/update').length === before, 'Read-only keyboard path wrote content')
    button('Page', document.querySelector('[data-block-workspace]')).click()
    await wait(() => document.querySelector('#entry-sidebar-details'), 'Returning from the inspector did not restore record tabs')
  })
  await test('List failures are distinct from empty collections and recover', async () => {
    navigate('/content/posts'); await wait(() => document.querySelector('[role="table"]'), 'Entry overview missing')
    await configure({ failures: ['entries/list'] })
    await queryClient.invalidateQueries({ queryKey: ['entries/list'] })
    await wait(() => document.querySelector('#cms').textContent.includes('Couldn’t load entries.'), 'List request failure appeared empty')
    assert(!document.querySelector('#cms').textContent.includes('No posts yet'), 'List failure masquerades as an empty collection')
    await configure({ failures: [] }); button('Retry').click()
    await wait(() => !document.querySelector('#cms').textContent.includes('Couldn’t load entries.'), 'List retry failed')
  })
  await test('Bulk failures report individual reasons and retain only failed selections', async () => {
    await wait(() => document.querySelectorAll('[role="table"] [role="row"] a').length === 2, 'Both list rows did not load')
    document.querySelector('[role="table"] [role="row"] [role="checkbox"]').click()
    await wait(() => document.querySelector('[role="toolbar"][aria-label="Selection"]').textContent.includes('2 selected'), 'Selection did not settle')
    button('Publish', document.querySelector('[role="toolbar"][aria-label="Selection"]')).click()
    await wait(() => [...document.querySelectorAll('#cms [role="alert"]')].some(alert => alert.textContent.includes('Fixture row is locked.')), 'Individual bulk failure missing')
    const selectedRows = [...document.querySelectorAll('[role="table"] [role="row"]')].filter(row => row.querySelector('a') && row.querySelector('[role="checkbox"]')?.getAttribute('aria-checked') === 'true')
    assert(selectedRows.length === 1 && selectedRows[0].querySelector('a').getAttribute('href').endsWith('/post-2'), 'Successful rows remained selected or failed rows were lost')
    const calls = (await state()).requests.filter(request => request.ability === 'entries/publish')
    assert(calls.length === 2 && calls.every(call => call.input.expectedVersion), 'Bulk publication omitted row versions')
    button('Clear Selection').click()
  })
  output.textContent += '\nAll ' + results.length + ' workflow checks passed.'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, viewport: innerWidth }) })
} catch (error) {
    output.textContent += '\nFAIL ' + error.message
    await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack, viewport: innerWidth }) })
}
`
// Keep the runner source separate from the fixture API below so debugging never touches site state.
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
const body = async (req) => { let value = ''; for await (const chunk of req) value += chunk; return value }
const page = (items, current = 1, perPage = 50) => ({ items: items.slice((current - 1) * perPage, current * perPage), total: items.length, page: current, pages: Math.max(1, Math.ceil(items.length / perPage)), perPage })
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const sourceAttrs = (node, edit) => edit ? ` data-cms-document="${editorToken}" data-cms-node="${escape(node.id)}" data-cms-type="${escape(node.type)}"` : ''
const propAttrs = (name, edit, index) => edit ? ` data-cms-prop="${name}"${index === undefined ? '' : ` data-cms-index="${index}"`}` : ''
const renderBlocks = (nodes, edit) => nodes.map((node) => {
  const attr = sourceAttrs(node, edit), props = node.props ?? {}
  if (node.type === 'box') return `<section${attr}>${renderBlocks(node.children ?? [], edit)}</section>`
  if (node.type === 'pattern') {
    const value = props.values?.title ?? fixtureComponent.props[0].default
    const instance = edit ? ` data-cms-instance-document="${editorToken}" data-cms-instance-node="${escape(node.id)}" data-cms-instance-prop="title" data-cms-instance-type="text" data-cms-instance-format="plain" data-cms-instance-value="${escape(value)}"` : ''
    return `<section${attr}><h2${instance}>${escape(value)}</h2><p>${escape(props.values?.subtitle ?? '')}</p></section>`
  }
  if (node.type === 'heading') return `<h${props.level ?? 2}${attr}><span${propAttrs('text', edit)}>${props.text ?? ''}</span></h${props.level ?? 2}>`
  if (node.type === 'list') return `<${props.ordered ? 'ol' : 'ul'}${attr}>${(props.items?.length ? props.items : ['']).map((item, index) => `<li${propAttrs('items', edit, index)}>${item}</li>`).join('')}</${props.ordered ? 'ol' : 'ul'}>`
  if (node.type === 'quote') return `<blockquote${attr}><p${propAttrs('text', edit)}>${props.text ?? ''}</p><cite${propAttrs('cite', edit)}>${props.cite ?? ''}</cite></blockquote>`
  if (node.type === 'callout') return `<aside${attr}><p${propAttrs('text', edit)}>${props.text ?? ''}</p></aside>`
  if (node.type === 'code') return `<pre${attr}><code${propAttrs('code', edit)}>${escape(props.code ?? '')}</code></pre>`
  return `<p${attr}><span${propAttrs('text', edit)}>${props.text ?? ''}</span></p>`
}).join('')
const prototypes = () => ['paragraph', 'heading', 'list', 'quote', 'callout', 'code'].map((type) => `<template data-cms-prototype="${type}">${renderBlocks([{ id: '__prototype__', type, props: { level: 2, items: [''] } }], true)}</template>`).join('')
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end() }
    if (url.pathname === '/__test/state') return json(res, 200, { entries: Object.fromEntries(entries), requests, patterns: realSources[0]?.patterns ?? [fixtureComponent] })
    if (url.pathname === '/__test/config') { const config = JSON.parse(await body(req)); if (config.failures) { failures.clear(); config.failures.forEach((ability) => failures.add(ability)) }; if (config.delay !== undefined) delay = config.delay; return json(res, 200, {}) }
    if (url.pathname === '/__test/results' && req.method === 'GET') return json(res, 200, lastResult)
    if (url.pathname === '/__test/results') { const result = JSON.parse(await body(req)); lastResult = result; result.passed.forEach((name) => console.log('PASS', name)); if (result.error) console.error('FAIL', result.error); console.log('Viewport', result.viewport); return json(res, 200, result) }
    if (url.pathname === '/__preview' || url.pathname.startsWith('/__preview/')) {
      const input = JSON.parse(await body(req))
      requests.push({ ability: '__preview', path: url.pathname, input })
      if (realSite) {
        const id = decodeURIComponent(url.pathname.slice('/__preview/'.length))
        const current = entries.get(id)
        const rendered = await siteRequest({ ...current, ...input, data: { ...current?.data, ...input.data }, id: realEntries.has(id) ? id : undefined })
        res.writeHead(rendered.status, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store, private', ...(rendered.document ? { 'X-Cms-Editor-Document': rendered.document } : {}) })
        return res.end(rendered.html)
      }
      const edit = !input.play
      res.writeHead(200, { 'Content-Type': 'text/html', ...(edit ? { 'X-Cms-Editor-Document': editorToken } : {}) })
      return res.end(`<!doctype html><html><head><style>body{font:18px/1.65 system-ui;margin:0;padding:48px;color:#111;background:white}h1{font-size:40px;line-height:1.2}#fixture-entry-title{font-size:42px;line-height:1.2;max-width:680px;margin:0 auto 32px}.story{display:flow-root;max-width:680px;margin:0 auto;padding:24px 0 56px}.story section{padding:24px 0;margin:28px 0}.story p{margin:24px 0;min-height:1lh}.story h1,.story h2{margin:24px 0}.story h2{font-size:30px;line-height:1.3}.story li{min-height:1lh}</style></head><body><h1 id="fixture-entry-title">${escape(input.title ?? '')}</h1><main id="fixture-preview" class="story"${edit ? ` data-cms-editor-root="${editorToken}"` : ''}>${renderBlocks(input.data.body ?? [], edit)}</main>${edit ? prototypes() : ''}<script>window.__fixturePreviewRan = true</script></body></html>`)

    }
    if (url.pathname === '/api/admin/manifest') return json(res, 200, { data: manifest })
    if (url.pathname === '/api/admin/batch') {
      const input = JSON.parse(await body(req))
      const result = input.calls.map(call => {
        requests.push(call)
        if (call.input.id === 'post-2') return { error: { type: 'conflict', message: 'Fixture row is locked.' } }
        const current = entries.get(call.input.id)
        if (call.input.expectedVersion !== current.version) return { error: { type: 'conflict', message: 'Another editor saved this entry.' } }
        const updated = { ...current, status: 'published', displayStatus: 'published', version: `v-${++sequence}` }
        entries.set(updated.id, updated)
        return { data: updated }
      })
      return json(res, 200, { data: result })
    }
    if (url.pathname.startsWith('/api/admin/abilities/')) {
      const ability = url.pathname.slice('/api/admin/abilities/'.length)
      const input = JSON.parse(await body(req)); requests.push({ ability, input })
      if (failures.has(ability)) return json(res, 500, { error: { message: `Fixture request failed: ${ability}`, type: 'failed' } })
      if (delay && ability === 'entries/update') await new Promise((resolve) => setTimeout(resolve, delay))
      let data
      if (ability === 'collections/get') data = definition(input.handle)
      else if (ability === 'entries/get') data = entries.get(input.id)
      else if (ability === 'entries/create') { const id = `new-${++sequence}`; data = { ...makeEntry(id, input.collection, input.title), ...input, id, version: `v-${sequence}`, author: people.find((person) => person.id === input.authorId) ?? null }; entries.set(id, data) }
      else if (ability === 'entries/lookup') data = input.ids.map(id => entries.get(id)).filter(Boolean)
      else if (ability === 'entries/list') data = page([...entries.values()].filter((entry) => entry.collection === input.collection && (!input.search || entry.title.includes(input.search))), input.page ?? 1, input.perPage ?? 50)
      else if (ability === 'entries/tree') data = [...entries.values()].filter((entry) => entry.collection === input.collection)
      else if (ability === 'entries/revisions') data = revisions(entries.get(input.id))
      else if (ability === 'users/lookup') data = page(people.filter((person) => (!input.ids || input.ids.includes(person.id)) && (!input.search || person.name.toLowerCase().includes(input.search.toLowerCase()))), input.page ?? 1, input.perPage ?? 25)
      else if (ability === 'entries/move' || ability === 'entries/update' || ability === 'entries/publish' || ability === 'entries/unpublish' || ability === 'entries/discard-draft' || ability === 'entries/restore') {
        const current = entries.get(input.id ?? input.revisionId?.replace(/-revision-\d+$/, ''))
        if (input.expectedVersion && input.expectedVersion !== current.version) return json(res, 409, { error: { message: 'Another editor saved this entry.', type: 'conflict', details: { version: current.version } } })
        if (current.collection === 'viewer') return json(res, 403, { error: { type: 'forbidden', message: 'Read only fixture' } })
        const publish = input.publish || ability === 'entries/publish'
        const at = input.at ?? new Date().toISOString()
        data = { ...current, ...(ability === 'entries/move' ? { parentId: input.parentId } : {}), ...(input.title !== undefined ? { title: input.title } : {}), ...(input.slug !== undefined ? { slug: input.slug } : {}), ...(input.data ? { data: input.data } : {}), ...(input.authorId !== undefined ? { authorId: input.authorId, author: people.find((person) => person.id === input.authorId) ?? null } : {}), version: `v-${++sequence}`, updatedAt: new Date().toISOString(), ...(publish ? { status: 'published', displayStatus: Date.parse(at) > Date.now() ? 'scheduled' : 'published', publishedAt: at } : {}), ...(ability === 'entries/unpublish' ? { status: 'draft', displayStatus: 'draft', publishedAt: null } : {}) }
        entries.set(data.id, data)
      }
      else if (ability === 'blocks/types') data = catalog
      else if (ability === 'patterns/list') data = realSources[0]?.patterns ?? [fixtureComponent]
      else if (ability === 'design/get') data = realSources[0]?.design ?? { tokens: [], breakpoints: { tablet: '820px', mobile: '390px' }, templates: {}, name: 'Fixture', fonts: [], stylesheet: '' }
      else if (ability === 'seo/analyze') data = { score: 100, checks: [{ id: 'title', status: 'pass', label: 'Title', message: 'Search title is available.' }], meta: { title: entries.get(input.id)?.title, description: 'A fixture description', canonical: '', image: null } }
      else if (ability === 'seo/markdown') data = { markdown: '# Fixture Markdown' }
      else if (ability === 'account/update') { Object.assign(manifest.user.preferences, input.preferences); data = manifest.user }
      else if (ability === 'content/search') data = []
      else throw new Error(`Unexpected fixture ability: ${ability}`)
      return json(res, 200, { data })
    }
    const asset = url.pathname.match(/^\/_cms\/assets\/cms-([^/]+)\/(.+)$/)
    if (asset) {
      const folder = asset[1] === 'admin' ? 'modules/admin' : modules.includes(asset[1]) ? `modules/${asset[1]}` : `../plugins-public/${asset[1]}`
      const directory = resolve(root, folder, 'dist'), path = resolve(directory, asset[2])
      if (!path.startsWith(directory + sep)) return json(res, 403, {})
      const assetContent = await readFile(path)
      res.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)] ?? 'application/octet-stream' }); return res.end(assetContent)
    }
    if (realSite && (url.pathname.startsWith('/_cms/site/') || url.pathname.startsWith('/_cms/blocks/') || url.pathname.startsWith('/media/'))) {
      const path = resolve(realPublic, '.' + decodeURIComponent(url.pathname))
      if (!path.startsWith(realPublic + sep)) return json(res, 403, {})
      let actual
      try { actual = await realpath(path) } catch { return json(res, 404, {}) }
      if (!actual.startsWith(realPublic + sep)) return json(res, 403, {})
      const content = await readFile(actual)
      const mime = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif' }[extname(actual)] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime }); return res.end(content)
    }
    if (!url.pathname.startsWith('/admin')) return json(res, 404, {})
    if (!realSite && !url.searchParams.has('preview')) { entries = initialEntries(); failures.clear(); requests.length = 0; sequence = 1; delay = 0 }
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Content workflow verification</title>${admin.css.map((path) => `<link rel="stylesheet" href="${assetBase + path}">`).join('')}<script type="importmap" nonce="${fixtureNonce}">${JSON.stringify({ imports })}</script><script nonce="${fixtureNonce}">window.__CMS__=${JSON.stringify(boot)};localStorage.setItem('cms.sidebar','collapsed');localStorage.setItem('cms.entry.panel.posts','details');localStorage.setItem('cms.entry.panel.pages','details');localStorage.setItem('cms.entry.panel.viewer','details');localStorage.setItem('cms.theme','light');${url.searchParams.has('dark') ? "localStorage.setItem('cms.theme','dark')" : ''}</script><script type="module" src="${assetBase + admin.entry}"></script></head><body><div id="cms"></div>${realSite || url.searchParams.has('preview') ? '' : `<pre id="results" style="position:fixed;bottom:8px;left:8px;z-index:9999;max-width:600px;max-height:35vh;overflow:auto;background:white;color:black;border:1px solid #aaa;padding:12px;font-size:10px">Starting checks…</pre><script type="module" nonce="${fixtureNonce}">${runner}</script>`}</body></html>`
    res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${fixtureNonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; frame-src 'self'; connect-src 'self'` }); res.end(html)
  } catch (error) { console.error(error); if (res.headersSent) { res.end(); return }; json(res, 500, { error: { message: error.message, type: 'failed' } }) }
})
server.listen(Number(process.argv.find((argument) => argument.startsWith('--port='))?.split('=')[1]) || 0, '127.0.0.1', () => {
  const base = `http://localhost:${server.address().port}`
  if (realSite) {
    console.log(`Real site: ${realSite} (entry edits stay in memory)`)
    for (const { entry } of realSources) console.log(`${entry.title}: ${base}/admin/content/${entry.collection}/${entry.id}?preview=1`)
    return
  }
  console.log(`Checks: ${base}/admin/content/posts/post-1`)
  for (const [collection, id] of [['posts', 'post-1'], ['pages', 'page-1'], ['viewer', 'view-1']]) console.log(`Preview: ${base}/admin/content/${collection}/${id}?preview=1`)
})
