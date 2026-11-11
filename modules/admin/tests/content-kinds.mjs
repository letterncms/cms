// Build first: ./dev pnpm build
// node modules/admin/tests/content-kinds.mjs --preview
// A collection whose entries come in kinds (blueprints), over fixture abilities: no account, database or site writes.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { body, json, page, root, serve } from './harness.mjs'
import { mounted, viewResponse } from './views.mjs'

const brand = JSON.parse(await readFile(resolve(root, 'brand/brand.json'), 'utf8'))
const all = { create: true, edit: true, publish: true, delete: true }
export const summary = { handle: 'news', title: 'News', singular: 'Article', newLabel: 'New Article', icon: 'article', structure: 'list', driver: 'database', can: all, routable: true }
const video = [
  { handle: 'source', type: 'url', label: 'Video Address', required: true },
  { handle: 'length', type: 'number', label: 'Length' },
  { handle: 'summary', type: 'textarea', label: 'Summary' },
  { handle: 'credit', type: 'text', label: 'Credit', section: 'sidebar' },
  { handle: 'body', type: 'markdown', label: 'Body' },
]
const own = [
  { handle: 'kind', type: 'select', label: 'Kind', options: { text: 'Text', video: 'Video' } },
  { handle: 'body', type: 'markdown', label: 'Body' },
]
export const collection = { ...summary, body: 'body', route: '/news/{slug}', sort: 'title', default_view: 'table', default_columns: null, fields: own, resolvedFields: own, schema: {}, count: 1, deletable: true, settings: [],
  blueprints: { video: { title: 'Video', fields: video } }, resolvedBlueprints: [{ handle: 'video', title: 'Video', resolvedFields: video }] }
export const entry = {
  id: '01hentry000000000000000000', collection: 'news', blueprint: 'video', locale: 'en', title: 'The Film', slug: 'the-film', uri: '/news/the-film', status: 'published', displayStatus: 'published', hasDraft: false,
  data: { source: 'https://example.com/film.mp4', length: 184, summary: 'A short film.', credit: 'Studio', body: 'The whole text.' },
  originId: null, parentId: null, position: 0, authorId: 'test', author: { id: 'test', name: 'Test User', initials: 'TU', avatar: null }, version: 'a'.repeat(64),
  publishedAt: '2026-11-01T09:00:00+00:00', expiresAt: null, createdAt: '2026-10-30T09:00:00+00:00', updatedAt: '2026-11-10T09:00:00+00:00', translations: {},
}
/** Its German translation: the length, the credit and the body are the original's (`localizable: false`). */
export const translation = { ...entry, id: '01htranslation000000000000', locale: 'de', title: 'Der Film', slug: 'der-film', uri: '/de/news/der-film', originId: entry.id,
  translations: { en: entry.id, de: '01htranslation000000000000' }, sharedFields: ['length', 'credit', 'body'] }
export const manifest = {
  views: mounted, cms: { version: 'test', debug: false },
  site: { name: 'Fixture', url: '', locales: ['en', 'de'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Test User', email: 'test@example.invalid', initials: 'TU', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', 'letterncms/content', 'letterncms/collections'], pending: {} },
  modules: ['content', 'collections'].map((name) => ({ id: `cms/${name}`, url: `/_cms/assets/cms-${name}/admin.js`, package: `cms/${name}` })),
  styles: ['/_cms/assets/cms-content/admin.css', '/_cms/assets/cms-collections/admin.css'], settings: [], collections: [summary], globals: [], fieldTypes: [], commands: [], widgets: [], dashboard: [],
  config: { content: { autosave: 0, perPage: 50 } },
  nav: [{ id: 'news', label: 'News', path: '/content/news', icon: 'article', section: 'main' }],
  sidebar: { sections: [{ id: 'main', label: '', items: ['news'] }], hidden: [], personal: false }, settingsNav: [], brand,
}
export const boot = { brand, base: '/admin', api: '/api/admin', version: 'test', site: manifest.site, locale: 'en', messages: {}, manifest }

/** The fixture's abilities; `more(ability, input)` answers first when it returns something. */
export const abilities = (more = () => undefined) => async (req, res, url) => {
  if (url.pathname.startsWith('/api/admin/abilities/')) {
    const ability = url.pathname.slice('/api/admin/abilities/'.length)
    const input = await body(req)
    const own = more(ability, input)
    if (own !== undefined) return json(res, 200, { data: own })
    if (ability === 'views/get') { const view = viewResponse(input, manifest, () => collection); return json(res, view.status, view.body) }
    if (ability === 'collections/get') return json(res, 200, { data: collection })
    if (ability === 'entries/get') return json(res, 200, { data: input.id === translation.id ? translation : entry })
    if (ability === 'entries/list') return json(res, 200, { data: { items: [{ ...entry, values: {} }], total: 1, page: 1, perPage: 50, pages: 1 } })
    if (ability === 'admin/arrangement') return json(res, 200, { data: { items: [{ id: 'news', label: 'News', icon: 'article' }], layout: { sections: [{ id: 'main', label: 'Main', items: ['news'] }], hidden: [] }, fixed: false, customized: false } })
    if (ability === 'people/list') return json(res, 200, { data: [manifest.user] })
    return json(res, 200, { data: [] })
  }
  if (url.pathname === '/api/admin/auth/session') return json(res, 200, { authenticated: true })
  return false
}

/** What every check of these fixtures starts with: waiting, finding by words, and reporting. */
export const prelude = `
import { navigate } from '@letterncms/sdk'
const results = []
const output = document.querySelector('#results')
const pause = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
const until = async (check, message) => { const end = Date.now() + 5000; for (;;) { const found = check(); if (found) return found; if (Date.now() > end) throw new Error(message); await pause() } }
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const check = (name) => { results.push(name); output.textContent = results.map((s) => 'PASS ' + s).join('\\n') }
const words = (selector, text) => [...document.querySelectorAll(selector)].find((el) => el.textContent.trim() === text)
const labels = () => [...document.querySelectorAll('label, [data-cms-fields] .text-muted')].map((el) => el.textContent.trim())
const report = (error) => fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, ...(error ? { error: error.stack } : {}) }) })
`

const runner = `${prelude}
try {
  // An entry made with a blueprint is edited by that blueprint's fields, not the collection's.
  await until(() => words('*', 'Video Address'), 'The blueprint\\'s fields are not on view')
  assert(!words('*', 'Kind'), 'The collection\\'s own fields are on view for an entry of another blueprint')
  assert(document.querySelector('input[value="https://example.com/film.mp4"]'), 'The blueprint\\'s values are not in its fields')
  check('An entry shows the fields of its blueprint')

  // New, from anywhere (a link straight to /new, as the command palette and the home screen's widget go): the kind is asked first.
  navigate('/content/news/new')
  const dialog = await until(() => document.querySelector('[role="dialog"]'), 'New did not ask which kind')
  assert([...dialog.querySelectorAll('[role="listitem"]')].map((row) => row.textContent.trim()).join('|') === 'Article|Video', 'The kinds are not the collection\\'s own and its blueprints')
  // The row's own target: the innermost thing that says the kind.
  ;[...dialog.querySelectorAll('[role="listitem"] *')].filter((el) => el.textContent.trim() === 'Video' && typeof el.click === 'function')[0].click()
  await until(() => new URLSearchParams(location.search).get('blueprint') === 'video' && words('*', 'Video Address'), 'Choosing a kind did not open the editor on its fields')
  assert(!document.querySelector('[role="dialog"]'), 'The question stayed open')
  check('New asks which kind and opens the editor on its fields')

  navigate('/content/news/new?blueprint=')
  await until(() => words('*', 'Kind') && !words('*', 'Video Address'), 'The collection\\'s own kind did not open on its own fields')
  check('The collection\\'s own fields are a kind too')

  // On a translation, what holds one value for every language is closed wherever it is drawn: a property, a row of the details, the body.
  navigate('/content/news/${translation.id}?locale=de')
  const control = (handle) => document.querySelector('[data-field="' + handle + '"] input, [data-field="' + handle + '"] textarea')
  await until(() => control('length') && control('credit') && control('body') && control('summary'), 'The translation\\'s fields are not on view')
  for (const handle of ['length', 'credit', 'body']) assert(control(handle).disabled, 'A shared field can be typed into on a translation: ' + handle)
  assert(!control('summary').disabled && !control('source').disabled, 'A field of the translation\\'s own is closed')
  const marks = [...document.querySelectorAll('.sr-only')].filter((el) => el.textContent === 'Set in English')
  assert(marks.length === 3, 'Each shared field says where its value is set: ' + marks.length)
  check('Shared fields are closed on a translation, in properties, details and body')

  // The original has them open.
  navigate('/content/news/${entry.id}')
  await until(() => control('length') && !control('length').disabled && !document.querySelector('.sr-only[data-none]') && ![...document.querySelectorAll('.sr-only')].some((el) => el.textContent === 'Set in English'), 'The original\\'s fields are closed')
  check('The original edits them')
  await report()
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await report(error)
}
`
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const api = abilities()
  serve('Content kinds', async (req, res, url) => {
    if (await api(req, res, url) !== false) return
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page({ title: 'Content kinds', boot, runner }))
  }, { links: (base) => [`${base}/admin/content/news/${entry.id}`] })
}
