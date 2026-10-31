// node --experimental-vm-modules --test cms/modules/content/tests/listPrefs.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'

const source = stripTypeScriptTypes(readFileSync(new URL('../admin/src/listPrefs.ts', import.meta.url), 'utf8'))

async function setup(preferences = {}, defaultView = 'grid') {
  const manifest = { collections: [{ handle: 'posts', defaultView }], user: { preferences } }
  const saves = []
  const pending = new Map()
  let timer = 0
  const context = createContext({ setTimeout: (fn) => { pending.set(++timer, fn); return timer }, clearTimeout: (id) => pending.delete(id) })
  const sdk = new SyntheticModule(['getManifest', 'run'], function () {
    this.setExport('getManifest', () => manifest)
    this.setExport('run', (ability, input) => { saves.push({ ability, input }); return Promise.resolve() })
  }, { context })
  const react = new SyntheticModule(['useEffect', 'useRef', 'useState'], function () {
    this.setExport('useEffect', () => {})
    this.setExport('useRef', (value) => ({ current: value }))
    this.setExport('useState', (initial) => [typeof initial === 'function' ? initial() : initial, () => {}])
  }, { context })
  const module = new SourceTextModule(source, { context })
  const ui = new SourceTextModule(stripTypeScriptTypes(readFileSync(new URL('../../../themes/admin/src/ui/viewPrefs.ts', import.meta.url), 'utf8')), { context })
  await ui.link((name) => name === '@letterncms/sdk' ? sdk : react)
  await module.link((name) => name === '@letterncms/sdk' ? sdk : ui)
  await module.evaluate()
  return { ...module.namespace, manifest, saves, flush: () => { for (const save of pending.values()) save(); pending.clear() } }
}

test('a collection default applies before a personal view has been chosen', async () => {
  const prefs = await setup()
  assert.equal(prefs.readListPrefs('posts').view, 'grid')
  assert.equal(prefs.readListPrefs('unknown').view, 'table')
})

test('personal views override the collection default', async () => {
  const prefs = await setup({ 'entries.posts': { view: 'calendar' } })
  assert.equal(prefs.readListPrefs('posts').view, 'calendar')
})

test('invalid stored views fall back to the collection default', async () => {
  const prefs = await setup({ 'entries.posts': { view: 'removed-view' } }, 'calendar')
  assert.equal(prefs.readListPrefs('posts').view, 'calendar')
})

test('changing sort or columns keeps the view inherited', async () => {
  const prefs = await setup()
  const [, update] = prefs.useListPrefs('posts')
  update({ sort: '-title' })
  update({ columns: ['status'] })
  assert.equal(prefs.manifest.user.preferences['entries.posts'].view, undefined)
  prefs.manifest.collections[0].defaultView = 'calendar'
  assert.equal(prefs.readListPrefs('posts').view, 'calendar')
  prefs.flush()
  assert.equal(prefs.saves.length, 1)
  assert.equal(prefs.saves[0].input.preferences['entries.posts'].view, undefined)
  assert.equal(prefs.saves[0].input.preferences['entries.posts'].sort, '-title')
})

test('choosing a view stores an explicit override for subsequent visits', async () => {
  const prefs = await setup()
  const [, update] = prefs.useListPrefs('posts')
  update({ view: 'table' })
  prefs.manifest.collections[0].defaultView = 'calendar'
  assert.equal(prefs.readListPrefs('posts').view, 'table')
  prefs.flush()
  assert.equal(prefs.saves[0].input.preferences['entries.posts'].view, 'table')
})

test('resetting display preferences resumes inheritance without pinning the view', async () => {
  const prefs = await setup({ 'entries.posts': { view: 'table', sort: '-title', columns: ['status'] } })
  const [, update] = prefs.useListPrefs('posts')
  update({ view: null, sort: null, columns: null })
  assert.equal(prefs.readListPrefs('posts').view, 'grid')
  assert.equal(prefs.readListPrefs('posts').columns, null)
  assert.equal(prefs.readListPrefs('posts').sort, null)
  prefs.manifest.collections[0].defaultView = 'calendar'
  assert.equal(prefs.readListPrefs('posts').view, 'calendar')
  prefs.flush()
  assert.equal(prefs.saves[0].input.preferences['entries.posts'].view, null)
})

test('an explicitly empty column selection survives other preference changes', async () => {
  const prefs = await setup()
  const [, update] = prefs.useListPrefs('posts')
  update({ columns: [] })
  update({ sort: 'title' })
  assert.equal(prefs.readListPrefs('posts').columns.length, 0)
  prefs.flush()
  assert.equal(prefs.saves[0].input.preferences['entries.posts'].columns.length, 0)
})

test('calendar date choices use the shared preferences and survive navigation', async () => {
  const prefs = await setup({ 'entries.posts': { view: 'calendar', calendarDate: 'updated' } })
  assert.equal(prefs.readListPrefs('posts').calendarDate, 'updated')
  const [, update] = prefs.useListPrefs('posts')
  update({ sort: 'title' })
  assert.equal(prefs.readListPrefs('posts').calendarDate, 'updated')
  update({ view: null, sort: null, columns: null, calendarDate: 'published' })
  assert.equal(prefs.readListPrefs('posts').calendarDate, 'published')
})

test('invalid calendar dates fall back to the shared publication date', async () => {
  const prefs = await setup({ 'entries.posts': { calendarDate: 'removed-field' } })
  assert.equal(prefs.readListPrefs('posts').calendarDate, 'published')
})
