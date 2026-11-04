// Build first, then run `node modules/admin/tests/overviews.mjs` and open the
// printed URL. Uses real admin/module bundles with isolated fixture APIs; no site writes.
// Run with --preview and add ?preview=1 to inspect fixture screens without running checks.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const admin = JSON.parse(await readFile(resolve(root, 'modules/admin/dist/admin.json'), 'utf8'))
const assetBase = '/_cms/assets/cms-admin/'
const modules = ['content', 'collections', 'globals', 'users', 'packages', 'audit', 'settings']
const plugins = ['blocks', 'media', 'forms', 'navigation', 'seo', 'i18n']
const collection = { handle: 'posts', title: 'Posts', singular: 'Post', newLabel: 'New Post', icon: 'article', structure: 'list', driver: 'database', editor: 'document', defaultView: 'table', can: { create: true, edit: true, publish: true, delete: true }, routable: false }
// A media field gives the posts pictures, so they can be shown as cards.
const blueprintFields = [{ handle: 'category', label: 'Category', type: 'select', options: { news: 'News' } }, { handle: 'cover', label: 'Cover', type: 'media', max: 1 }, { handle: 'body', label: 'Body', type: 'markdown' }]
let collectionDef = { ...collection, default_view: 'table', default_columns: null, fields: blueprintFields, resolvedFields: blueprintFields, settings: [
  { handle: 'title', type: 'text', label: 'Name' },
  { handle: 'structure', type: 'select', label: 'Structure', options: { list: 'List', tree: 'Tree', dated: 'Dated' } },
  { handle: 'default_view', type: 'select', label: 'Default View', display: 'segmented', required: true, options: { table: 'Table', grid: 'Grid', calendar: 'Calendar' } },
  { handle: 'default_columns', type: 'json', component: 'collection-display-fields', label: 'Default Display Fields' },
] }
const entry = (id, title) => ({ id, collection: 'posts', locale: 'en', title, slug: id, uri: null, status: 'draft', displayStatus: 'draft', version: 1, data: {}, values: { category: 'news', cover: '/fixture.svg' }, hasDraft: false, parentId: null, position: 0, originId: null, authorId: null, author: null, createdAt: null, updatedAt: '2026-10-25T12:00:00Z', publishedAt: null })
const forms = [{ publishedAt: null, updatedAt: null, handle: 'contact', title: 'Contact', fields: 3, enabled: true, new: 2, total: 8 }, { publishedAt: '2026-10-02T12:00:00+02:00', updatedAt: '2026-10-03T12:00:00+02:00', handle: 'quote', title: 'Quote Request', fields: 7, enabled: false, new: 0, total: 20 }]
const media = Array.from({ length: 61 }, (_, i) => ({ id: `file-${i}`, name: i === 0 ? 'A very long image name to check truncation and action controls' : `Project image ${String(i).padStart(2, '0')}`, filename: `project-${i}.jpg`, kind: 'image', mime: 'image/jpeg', url: '/fixture.svg', thumb: '/fixture.svg', alt: i % 2 ? 'Project image' : '', size: (i + 1) * 1200, folder: i % 2 ? 'Projects' : '', width: 1200, height: 800, focal: { x: 50, y: 50 }, caption: '', publishedAt: null, updatedAt: '2026-10-27T13:00:00Z', createdAt: new Date(Date.UTC(2026, 9, 27, 0, i)).toISOString() }))
const plugin = (name, label) => ({ name: `letterncms/${name}`, type: 'plugin', themeKind: null, version: '0.1.0', installedVersion: '0.1.0', label, description: `The ${label} plugin.`, icon: 'plugin', firstParty: true, builtIn: true, core: false, required: false, enabled: true, active: true, problem: null, dependents: [], provides: [], settings: [] })
// More than a screenful at a glance: the plugin list gets search and a display menu.
const packages = [['media', 'Media'], ['forms', 'Forms'], ['seo', 'SEO'], ['navigation', 'Navigation'], ['i18n', 'Languages'], ['blocks', 'Blocks'], ['sync', 'Sync'], ['search', 'Search'], ['redirects', 'Redirects'], ['commerce', 'Commerce']].map(([name, label]) => plugin(name, label))
const treeCollection = { ...collection, handle: 'pages', title: 'Pages', structure: 'tree', routable: true }
// Records that happen on a day: the one kind of overview that offers a calendar.
const eventsCollection = { ...collection, handle: 'events', title: 'Events', singular: 'Event', newLabel: 'New Event', icon: 'calendar', structure: 'dated' }
const nav = [['posts', 'Posts', '/content/posts', 'article'], ['pages', 'Pages', '/content/pages', 'page'], ['events', 'Events', '/content/events', 'calendar'], ['media', 'Media', '/media', 'media'], ['forms', 'Forms', '/forms', 'form'], ['globals', 'Globals', '/globals', 'globe'], ['navigation', 'Navigation', '/navigation', 'list-tree'], ['users', 'Users', '/users', 'users'], ['plugins', 'Plugins', '/plugins', 'plugin'], ['languages', 'Languages', '/languages', 'translate'], ['audit', 'Audit Log', '/audit', 'activity'], ['collections', 'Collections', '/collections', 'collection']].map(([id, label, path, icon]) => ({ id, label, path, icon, section: 'main' }))
const brand = JSON.parse(await readFile(resolve(root, 'brand/brand.json'), 'utf8'))
const manifest = {
  cms: { version: 'test', debug: false },
  site: { name: 'Overview regression test', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Test User', email: 'test@example.invalid', initials: 'TU', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', ...modules.map((n) => `cms/${n}`), ...plugins.map((n) => `cms/${n}`)], pending: {} },
  modules: [...modules, ...plugins].map((n) => ({ id: `cms/${n}`, url: `/_cms/assets/cms-${n}/admin.js`, package: `cms/${n}` })),
  styles: [...modules, ...plugins].map((n) => `/_cms/assets/cms-${n}/admin.css`),
  settings: [{ namespace: 'seo', label: 'SEO', icon: 'seo', description: '', package: 'cms/seo' }], collections: [collection, treeCollection, eventsCollection], globals: [{ handle: 'footer', title: 'Footer', icon: 'globe' }, { handle: 'contact_details_with_a_very_long_handle_that_must_not_shift_columns', title: 'Contact details', icon: 'mail' }], fieldTypes: [], commands: [], widgets: [], dashboard: [], config: {}, nav,
  sidebar: { sections: [{ id: 'main', label: '', items: nav.map((n) => n.id) }], hidden: [], personal: false },
  settingsNav: [], brand,
}
const boot = { brand, base: '/admin', api: '/api/admin', version: 'test', theme: { name: 'cms/admin', version: 'test' }, site: manifest.site, locale: 'en', messages: {}, manifest }
const imports = { ...Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path])), '@letterncms/blocks': '/_cms/assets/cms-blocks/admin.js' }
const requests = []
const runner = `
import { navigate, queryClient, abilityKey, registry } from '@letterncms/sdk'
import { createElement, useState } from 'react'
import { Fields, Page } from '@letterncms/ui'
const output = document.querySelector('#results')
const results = []
const testOptions = new URLSearchParams(location.search)
const layoutOnly = testOptions.has('layout')
const expectedWidth = Number(testOptions.get('viewport') || 0)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const assert = (ok, message) => { if (!ok) throw new Error(message) }
const wait = async (fn, message) => { const end = Date.now() + 8000; while (!fn()) { if (Date.now() > end) throw new Error(message); await sleep(20) } }
const main = () => document.querySelector('main')
const text = () => main()?.textContent ?? ''
const buttons = () => [...main().querySelectorAll('button')]
const button = (name) => buttons().find((b) => b.textContent.trim() === name || b.getAttribute('aria-label') === name)
const anyButton = (name) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === name || b.getAttribute('aria-label') === name)
const viewNames = ['Table', 'Grid', 'Calendar']
const view = (name) => main().querySelector('[role="radio"][title="' + name + '"]')
const views = () => viewNames.filter((name) => view(name))
const switchView = async (name) => { const target = view(name); assert(target, 'missing ' + name + ' switch'); target.click(); await wait(() => target.getAttribute('aria-checked') === 'true', 'view did not switch'); await sleep(50) }
const open = async (path, expected) => { navigate(path); await wait(() => location.pathname === '/admin' + path.split('?')[0] && text().includes(expected) && !document.querySelector('[role="progressbar"]'), 'failed to open ' + path); await sleep(50) }
const headers = () => [...main().querySelectorAll('[role="columnheader"]')]
const headerLabels = () => headers().map((cell) => cell.textContent.trim())
const header = (label) => headers().find((cell) => cell.textContent.trim() === label)
const sortBy = async (label) => { const target = header(label)?.querySelector('button'); assert(target, 'missing sortable header ' + label); target.click(); await sleep(60) }
const rows = () => [...main().querySelectorAll('[role="rowgroup"] [role="row"][data-entry]')]
const cards = () => [...main().querySelectorAll('article')]
const cardTerms = () => [...main().querySelectorAll('article dt')].map((term) => term.textContent)
// A list's search says what it searches ("Search plugins…"): any of them, unless one is named.
const searchBox = (placeholder) => main().querySelector(placeholder ? 'input[placeholder="' + placeholder + '"]' : 'input[placeholder^="Search "][placeholder$="…"]')
const type = (input, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }
const noMatches = () => main().querySelector('[role="status"]')
const selectionBar = () => document.querySelector('[role="toolbar"][aria-label="Selection"]')
const selectedCount = () => { const bar = selectionBar(); return bar && !bar.inert ? Number(bar.textContent.match(/([0-9]+) selected/)?.[1] ?? 0) : 0 }
const key = (name) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))
const calls = async () => (await fetch('/__test/requests')).json()
// The Display menu: open it, read or flip its checkboxes, press its buttons, close it.
const pop = () => document.querySelector('.cms-pop')
const openDisplay = async () => { const trigger = button('Display'); assert(trigger, 'Display menu missing'); if (!pop()) trigger.click(); await wait(() => pop(), 'Display menu did not open') }
const closeDisplay = async () => { if (pop()) button('Display').click(); await wait(() => !pop(), 'Display menu did not close'); await sleep(30) }
const options = () => Object.fromEntries([...pop().querySelectorAll('[role="checkbox"]')].map((box) => [box.closest('label')?.textContent, box.getAttribute('aria-checked') === 'true']))
const toggle = async (label) => { const box = [...pop().querySelectorAll('[role="checkbox"]')].find((control) => control.closest('label')?.textContent === label); assert(box, 'Display lacks ' + label); box.click(); await sleep(50) }
const resetDisplay = async () => { await openDisplay(); const reset = [...pop().querySelectorAll('button')].find((b) => b.textContent === 'Reset Display'); assert(reset, 'Reset Display missing'); reset.click(); await sleep(80); if (pop()) await closeDisplay() }
const test = async (name, fn) => { if (layoutOnly && !name.startsWith('Every overview table')) return; await fetch('/__test/progress', { method: 'POST', body: name }); await fn(); results.push(name); output.textContent = results.map((s) => 'PASS ' + s).join('\\n') }
try {
  await wait(() => text().includes('Quote Request'), 'forms did not load')
  await test('Short lists stay plain tables: no search, views, display menu or empty date columns', async () => {
    // Users and submissions search on the server, so their own search field stays.
    const routes = [['/forms', 'Quote Request'], ['/globals', 'Contact details'], ['/navigation', 'Main menu'], ['/users', 'Ada Example', true], ['/languages', 'English'], ['/audit', 'Publish Entry'], ['/collections', 'Posts'], ['/settings/seo?tab=redirects', '301'], ['/forms/contact?tab=submissions', 'Received', true]]
    for (const [path, expected, ownSearch] of routes) {
      await open(path, expected)
      assert(main().querySelector('[role="table"]'), path + ': missing shared table')
      assert(!views().length, path + ': offers views without pictures or dates to fill them')
      assert(!button('Display'), path + ': shows a display menu with nothing to add')
      assert(ownSearch || !searchBox(), path + ': searches a list read at a glance')
      for (const label of ['Published', 'Updated']) assert(!headerLabels().includes(label), path + ': shows ' + label + ' by default')
    }
    // Globals were cards once; today they are rows like every other short list.
    await open('/globals', 'Contact details')
    assert(rows().length === 2 && !cards().length, 'globals are not a plain table')
  })
  await test('Long lists get search and display; Grid only with pictures, Calendar only with days', async () => {
    await open('/plugins', 'Commerce')
    assert(searchBox() && button('Display'), 'long plugin list lacks search or display')
    assert(!views().length, 'plugins without pictures offer other views')
    await open('/media', 'Project image')
    assert(searchBox('Search files…') && button('Display'), 'media lacks search or display')
    assert(views().join() === 'Table,Grid', 'media views: ' + views().join())
    assert(view('Grid').getAttribute('aria-checked') === 'true' && cards().length === 60, 'media does not start as a grid of its first page')
    await open('/content/posts', 'Beta post')
    assert(views().join() === 'Table,Grid', 'posts views: ' + views().join())
    assert(headerLabels().includes('Published') && headerLabels().includes('Updated'), 'entries omit their dates')
    await open('/content/events', 'Launch event')
    assert(views().join() === 'Table,Calendar', 'dated collection views: ' + views().join())
    await switchView('Calendar')
    await wait(() => main().querySelector('[data-calendar][aria-busy="false"]'), 'missing shared calendar')
    assert(button('Previous Month') && button('Next Month'), 'missing month navigation')
    assert(main().querySelector('[data-calendar]').textContent.includes('Launch event'), 'calendar omitted this month’s entry')
    assert(!main().querySelector('nav[aria-label="Pagination"]'), 'calendar still paginates table rows')
    await resetDisplay()
    assert(view('Table').getAttribute('aria-checked') === 'true', 'reset did not return to the table')
  })
  await test('Shared headers sort with aria-sort, cycle back to the default order and only then offer a reset', async () => {
    await open('/forms', 'Quote Request')
    const sortable = headers().filter((cell) => cell.querySelector('button')).map((cell) => cell.textContent.trim())
    assert(['Name', 'Status', 'Fields', 'Submissions', 'Unread'].every((label) => sortable.includes(label)), 'columns are not sortable: ' + sortable)
    assert(headers().every((cell) => !cell.querySelector('button') || cell.getAttribute('aria-sort') === 'none'), 'unsorted headers lack aria-sort')
    await sortBy('Submissions')
    assert(header('Submissions').getAttribute('aria-sort') === 'ascending', 'missing ascending sort state')
    assert(rows()[0].textContent.includes('Contact'), 'ascending numeric sort failed')
    assert(button('Display'), 'a sorted short list does not offer its reset')
    await sortBy('Submissions')
    assert(header('Submissions').getAttribute('aria-sort') === 'descending', 'missing descending sort state')
    assert(rows()[0].textContent.includes('Quote Request'), 'descending numeric sort failed')
    await sortBy('Submissions')
    assert(!main().querySelector('[aria-sort="ascending"], [aria-sort="descending"]'), 'sort did not reset')
    assert(rows()[0].textContent.includes('Contact') && !button('Display'), 'default order or plain list not restored')
  })
  await test('Date columns sort newest first, keep missing dates last and reset with the display', async () => {
    const { recordDateColumns, withRecordDateColumns, standardEntryColumns } = await import('@letterncms/ui')
    const columns = recordDateColumns((item) => item)
    assert(columns.every((column) => column.descFirst && column.hiddenByDefault), 'dates are not optional and newest first')
    assert(withRecordDateColumns([...columns, ...columns], (item) => item).length === 2, 'duplicate date columns')
    assert(standardEntryColumns(false).includes('published'), 'entry defaults omit Published')
    await sortBy('Name')
    await openDisplay()
    const offered = options()
    assert(offered.Published === false && offered.Updated === false, 'dates the forms have are not optional columns')
    await toggle('Published')
    await closeDisplay()
    await sortBy('Published')
    assert(header('Published').getAttribute('aria-sort') === 'descending', 'dates do not sort newest first')
    assert(rows()[0].textContent.includes('Quote Request') && rows()[1].textContent.includes('Contact'), 'unknown publication did not sort last')
    await sortBy('Published')
    assert(rows()[1].textContent.includes('Contact'), 'unknown publication did not stay last ascending')
    await resetDisplay()
    assert(!headerLabels().includes('Published') && !main().querySelector('[aria-sort="ascending"], [aria-sort="descending"]'), 'reset kept the date column or sort')
    assert(!button('Display'), 'reset short list still shows its display menu')
  })
  await test('Search no-match state uses the shared No matches and Clear Filters recovers', async () => {
    await open('/plugins', 'Commerce')
    type(searchBox(), 'does-not-exist')
    await wait(() => noMatches()?.textContent.includes('No matches'), 'no-match state missing')
    assert(!main().querySelector('[role="table"]'), 'empty headers shown above no matches')
    button('Clear Filters').click()
    await wait(() => rows().length === 10, 'clear filters did not restore the list')
    assert(searchBox().value === '', 'search not cleared')
    type(searchBox(), 'comm'); await wait(() => rows().length === 1, 'search did not filter')
    type(searchBox(), ''); await wait(() => rows().length === 10, 'search did not clear')
  })
  await test('Column choices persist across navigation and Reset Display restores them', async () => {
    await openDisplay()
    assert(options().Version === true && options().On === true && !('Published' in options()), 'plugin columns: ' + JSON.stringify(options()))
    await toggle('Version')
    await closeDisplay()
    assert(!headerLabels().includes('Version'), 'column did not hide')
    await open('/forms', 'Quote Request')
    await open('/plugins', 'Commerce')
    assert(!headerLabels().includes('Version'), 'column choice lost on navigation')
    await resetDisplay()
    assert(headerLabels().includes('Version'), 'reset did not restore the column')
  })
  await test('Media uses shared cards, table, selection, real pagination and server sorting', async () => {
    await open('/media', 'Project image')
    assert(main().querySelector('nav[aria-label="Pagination"]')?.textContent.includes('1–60 of 61'), 'media pagination missing')
    await openDisplay()
    const offered = options()
    assert(offered['Alt Text'] === false && offered.Updated === false && !('Published' in offered), 'media date or alt options wrong: ' + JSON.stringify(offered))
    await toggle('Folder')
    await closeDisplay()
    assert(cards().length === 60 && !cardTerms().includes('Folder') && cardTerms().includes('Size'), 'card metadata ignored visibility')
    await switchView('Table')
    assert(rows().length === 60, 'media table missing')
    assert(!headerLabels().includes('Folder') && !headerLabels().includes('Alt Text'), 'table ignored hidden columns')
    rows()[0].querySelector('[role="checkbox"]').click(); await wait(() => selectedCount() === 1, 'media selection failed')
    await switchView('Grid')
    assert(cards()[0].querySelector('[role="checkbox"]').getAttribute('aria-checked') === 'true', 'view switch lost selection')
    anyButton('Clear Selection').click(); await wait(() => selectedCount() === 0, 'selection did not clear')
    button('Next Page').click(); await wait(() => text().includes('61–61 of 61') && cards().length === 1, 'next page did not fetch')
    await switchView('Table')
    await sortBy('Name')
    await wait(() => text().includes('1–60 of 61') && header('Name').getAttribute('aria-sort') === 'ascending', 'sorting did not return to the first page')
    assert((await calls()).some((r) => r.ability === 'media/list' && r.input.sort === 'name' && r.input.page === 1), 'sort did not reach server or reset page')
    assert(rows()[0].textContent.includes('A very long image name'), 'server order not shown')
  })
  await test('Media search finds nothing with the shared No matches and recovers', async () => {
    type(searchBox('Search files…'), 'does-not-exist')
    await wait(() => noMatches()?.textContent.includes('No matches'), 'media no-match state missing')
    button('Clear Filters').click()
    await wait(() => rows().length === 60, 'media clear filters failed')
    assert(searchBox('Search files…').value === '', 'media search not cleared')
  })
  await test('Media view, columns and sort survive navigation and reset to the grid', async () => {
    await open('/forms', 'Quote Request')
    await open('/media', 'Project image')
    assert(view('Table').getAttribute('aria-checked') === 'true' && rows().length === 60, 'table preference was lost')
    assert(!headerLabels().includes('Folder') && header('Name').getAttribute('aria-sort') === 'ascending', 'column or sort preference was lost')
    await resetDisplay()
    assert(view('Grid').getAttribute('aria-checked') === 'true' && cardTerms().includes('Folder'), 'reset did not restore the default grid and columns')
    await wait(() => cards()[0]?.textContent.includes('Project image 60'), 'reset kept the server sort instead of newest first')
  })
  await test('Content entries share selection, cards and j/x keyboard selection with a visible cursor', async () => {
    await open('/content/posts', 'Beta post')
    assert(main().querySelector('[role="table"]'), 'entry table missing')
    const row = (id) => main().querySelector('[role="row"][data-entry="' + id + '"]')
    assert(getComputedStyle(row('alpha')).boxShadow === 'none', 'cursor shown before moving')
    key('j'); await wait(() => getComputedStyle(row('alpha')).boxShadow !== 'none', 'keyboard cursor not visible')
    key('j'); await wait(() => getComputedStyle(row('beta')).boxShadow !== 'none' && getComputedStyle(row('alpha')).boxShadow === 'none', 'cursor did not move')
    key('x'); await wait(() => selectedCount() === 1, 'keyboard selection failed')
    assert(row('beta').querySelector('[role="checkbox"]').getAttribute('aria-checked') === 'true', 'keyboard selection not shown on the row')
    key('Escape'); await wait(() => selectedCount() === 0, 'Escape did not clear the selection')
    await switchView('Grid')
    assert(cards().length === 2 && cards().every((card) => card.querySelector('img')), 'entry cards or pictures missing')
    cards()[0].querySelector('[role="checkbox"]').click(); await wait(() => selectedCount() === 1, 'card selection failed')
    assert(cards()[0].querySelector('[role="checkbox"]').getAttribute('aria-checked') === 'true', 'card selection not shown')
    anyButton('Clear Selection').click(); await wait(() => selectedCount() === 0, 'selection did not clear')
    key('k'); await wait(() => cards()[0].className.includes('border-border-strong'), 'keyboard cursor not visible on cards')
    key('Escape'); await sleep(30)
    await switchView('Table')
  })
  await test('Collection tabs persist in links, remounts and browser history', async () => {
    await open('/collections/posts', 'Fields')
    const activeTab = () => main().querySelector('[role="tab"][aria-selected="true"]')?.textContent
    button('Settings').click()
    await wait(() => activeTab() === 'Settings', 'settings tab did not open')
    assert(new URLSearchParams(location.search).get('tab') === 'settings', 'settings tab missing from URL')
    const settingsLink = location.pathname.slice('/admin'.length) + location.search
    await open('/collections', 'Posts')
    navigate(settingsLink)
    await wait(() => activeTab() === 'Settings' && !document.querySelector('[role="progressbar"]'), 'saved link did not restore settings')
    await open('/collections', 'Posts')
    history.back()
    await wait(() => activeTab() === 'Settings' && !document.querySelector('[role="progressbar"]'), 'back did not restore settings')
    navigate('/collections/posts?tab=settings&keep=1')
    await wait(() => activeTab() === 'Settings', 'direct settings link did not open')
    button('Fields').click()
    await wait(() => activeTab() === 'Fields', 'fields tab did not open')
    const query = new URLSearchParams(location.search)
    assert(!query.has('tab') && query.get('keep') === '1', 'default tab did not preserve unrelated query parameters')
    navigate('/collections/posts?tab=missing')
    await wait(() => activeTab() === 'Fields', 'invalid tab did not fall back to fields')
  })
  await test('Collection settings save the default view and display fields', async () => {
    await open('/collections/posts', 'Fields')
    button('Settings').click(); await wait(() => main().querySelector('[role="group"][aria-label="Default Display Fields"]'), 'display settings missing')
    assert(text().includes('Default Display') && !text().includes('Default View') && !text().includes('Default Display Fields'), 'redundant display labels remain')
    assert(!button('Reset to Automatic Fields'), 'automatic reset is shown before changes')
    assert(!text().includes('Bodybody'), 'unsupported markdown field was offered')
    const group = main().querySelector('[role="group"][aria-label="Default Display Fields"]')
    const checked = () => [...group.querySelectorAll('[role="checkbox"][aria-checked="true"]')].map((box) => box.closest('label').textContent)
    assert(checked().join() === 'Status,Published,Updated', 'automatic fields: ' + checked())
    for (const box of group.querySelectorAll('[role="checkbox"][aria-checked="true"]')) { box.click(); await sleep(30) }
    const category = () => [...group.querySelectorAll('[role="checkbox"]')].find((box) => box.closest('label').textContent.includes('Category'))
    assert(category(), 'custom field with handle missing'); category().click(); await sleep(30)
    assert(button('Reset to Automatic Fields'), 'automatic reset is missing after changes')
    button('Reset to Automatic Fields').click(); await sleep(30)
    assert(!button('Reset to Automatic Fields') && checked().join() === 'Status,Published,Updated', 'automatic reset did not restore the fields')
    for (const box of group.querySelectorAll('[role="checkbox"][aria-checked="true"]')) { box.click(); await sleep(30) }
    category().click(); await sleep(30)
    const grid = [...main().querySelectorAll('[role="radio"]')].find((radio) => radio.getAttribute('title') === 'Grid' || radio.textContent === 'Grid')
    grid.click(); await sleep(30)
    // Saving is the save bar's, as on every form.
    await wait(() => document.querySelector('.cms-savebar[data-state="open"] .cms-savebar-save'), 'changes did not bring up the save bar')
    document.querySelector('.cms-savebar-save').click()
    await wait(() => !document.querySelector('.cms-savebar[data-state="open"]'), 'blueprint save did not finish')
    const saved = (await calls()).filter((r) => r.ability === 'collections/save').at(-1).input.definition
    assert(saved.default_view === 'grid' && JSON.stringify(saved.default_columns) === '["field:category"]', 'display settings did not reach the API')
  })
  await test('Collection defaults populate cards, requested values and personal reset', async () => {
    await open('/content/posts', 'Beta post')
    // The earlier Table choice is personal; resetting falls back to the collection's new defaults.
    await resetDisplay()
    await wait(() => view('Grid').getAttribute('aria-checked') === 'true' && cards().length === 2, 'collection default view ignored')
    assert(cardTerms().join() === 'Category,Category', 'card ignored the default custom field: ' + cardTerms())
    assert(!main().querySelector('article time') && !main().querySelector('article img'), 'hidden dates or pictures still appear on cards')
    assert((await calls()).some((r) => r.ability === 'entries/list' && r.input.collection === 'posts' && r.input.fields?.includes('category')), 'default custom field was not requested')
    await openDisplay(); await toggle('Category'); await closeDisplay()
    assert(!cardTerms().length, 'personal field override ignored')
    await open('/collections', 'Posts'); await open('/content/posts', 'Beta post')
    assert(!cardTerms().length, 'personal field override lost on navigation')
    await resetDisplay()
    await wait(() => cardTerms()[0] === 'Category', 'reset did not restore shared fields')
    await switchView('Table')
    assert(headerLabels().includes('Category'), 'table ignored shared fields')
    assert(!headerLabels().includes('Updated'), 'table ignored hidden system column')
  })
  await test('Media picker reuses views and commits the selected file', async () => {
    function Picker() {
      const [value, setValue] = useState([])
      return createElement(Page, { crumbs: [{ label: 'Picker fixture' }] }, createElement(Fields, { fields: [{ handle: 'image', type: 'media', label: 'Image', max: 1 }], values: { image: value }, onChange: (_, value) => setValue(value) }))
    }
    registry.routes.set('/picker', { path: '/picker', component: Picker })
    navigate('/picker'); await wait(() => text().includes('Choose Image'), 'picker fixture did not open')
    button('Choose Image').click(); await wait(() => document.querySelector('[role="dialog"] article, [role="dialog"] [role="table"]'), 'media picker did not render shared views')
    const dialog = document.querySelector('[role="dialog"]')
    assert(dialog.querySelector('input[placeholder="Search files…"]'), 'picker lacks search')
    const table = dialog.querySelector('[role="radio"][title="Table"]'); assert(table, 'picker lacks the view switch'); table.click(); await sleep(50)
    assert(dialog.querySelector('[role="table"]'), 'picker lacks the shared table')
    dialog.querySelector('[role="radio"][title="Grid"]').click(); await sleep(50)
    assert(dialog.querySelectorAll('article').length === 60, 'picker lacks shared cards')
    dialog.querySelector('article [role="checkbox"]').click(); await wait(() => !document.querySelector('[role="dialog"]'), 'single selection did not commit')
    await wait(() => main().querySelector('img'), 'selected file missing from the field')
    assert((await calls()).some((r) => r.ability === 'media/lookup' && r.input.ids?.length === 1), 'field did not look up the chosen file')
  })
  await test('Redirects stay editable in the shared table', async () => {
    await open('/settings/seo?tab=redirects', '301')
    const from = main().querySelector('input[value="/old"]')
    assert(from && main().querySelector('input[value="/new"]'), 'redirect editor missing')
    assert(!document.querySelector('[role="region"][aria-label="Unsaved changes"]'), 'unchanged redirects marked dirty')
    type(from, '/older')
    await wait(() => document.querySelector('[role="region"][aria-label="Unsaved changes"][data-state="open"]'), 'edit did not mark redirects dirty')
    anyButton('Discard').click()
    await wait(() => !document.querySelector('[role="region"][aria-label="Unsaved changes"][data-state="open"]') && main().querySelector('input[value="/old"]'), 'discard did not restore the redirect')
  })
  // Measure the visible text/value, not just its full-width cell wrapper.
  const valueRight = (cell) => {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
    let node, last
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim() || node.parentElement.closest('.sr-only, [aria-hidden="true"]')) continue
      const range = document.createRange(); range.selectNodeContents(node)
      const bounds = range.getBoundingClientRect()
      if (!bounds.width || !bounds.height) continue
      last = bounds.right
      for (let parent = node.parentElement; parent && parent !== cell; parent = parent.parentElement) {
        const style = getComputedStyle(parent)
        if (style.display === 'inline-flex' && parseFloat(style.paddingRight) > 0) { last = parent.getBoundingClientRect().right; break }
      }
    }
    return last
  }
  await test('Every overview table keeps headers, rows and action buttons aligned', async () => {
    const routes = [['/forms', 'Quote Request'], ['/globals', 'Contact details'], ['/media', 'Project image'], ['/navigation', 'Main menu'], ['/users', 'Ada Example'], ['/languages', 'English'], ['/audit', 'Publish Entry'], ['/collections', 'Posts'], ['/plugins', 'Commerce'], ['/settings/seo?tab=redirects', '301'], ['/forms/contact?tab=submissions', 'Received'], ['/content/posts', 'Beta post'], ['/content/pages', 'Parent page'], ['/content/events', 'Launch event']]
    for (const [path, expected] of routes) {
      navigate(path); await wait(() => text().includes(expected) && !document.querySelector('[role="progressbar"]'), 'table audit failed to open ' + path); await sleep(50)
      if (view('Table')) await switchView('Table')
      if (expectedWidth) assert(innerWidth === expectedWidth, 'layout audit viewport changed: ' + innerWidth)
      const table = main().querySelector('[role="table"]')
      assert(table, path + ': missing table')
      const cells = [...table.querySelectorAll('[role="columnheader"]')]
      const headerBounds = cells.map((cell) => cell.getBoundingClientRect())
      assert(table.scrollWidth <= table.clientWidth + 1, path + ': tracks overflow the table')
      assert(document.documentElement.scrollWidth <= innerWidth + 1, path + ': overview overflows the viewport')
      for (const row of table.querySelectorAll('[role="row"][data-entry]')) {
        const rowCells = row.querySelectorAll('[role="cell"]')
        const own = [...rowCells].filter((cell) => cell.closest('[role="row"]') === row)
        assert(own.length === cells.length, path + ': cell/header counts differ')
        own.forEach((cell, i) => {
          const bounds = cell.getBoundingClientRect()
          assert(Math.abs(bounds.left - headerBounds[i].left) < 1 && Math.abs(bounds.width - headerBounds[i].width) < 1, path + ': column ' + i + ' shifts between rows')
          if (cells[i].dataset.align === 'end') {
            const headerRight = valueRight(cells[i]), cellRight = valueRight(cell)
            if (headerRight !== undefined && cellRight !== undefined) assert(Math.abs(headerRight - cellRight) < 1, path + ': value in column ' + cells[i].textContent + ' does not align with its heading (' + cellRight + ' vs ' + headerRight + ')')
          }
        })
      }
      for (const cell of table.querySelectorAll('[data-table-actions]')) {
        const bounds = cell.getBoundingClientRect()
        for (const control of cell.querySelectorAll('button')) { const box = control.getBoundingClientRect(); assert(box.width >= 24 && box.left >= bounds.left - 1 && box.right <= bounds.right + 1, path + ': action button is clipped') }
      }
      const actions = cells.find((cell) => cell.textContent === 'Actions')
      if (actions) assert(actions.querySelector('.sr-only'), path + ': visible Actions heading')
    }
  })
  await test('Media uses the standard empty state with Upload', async () => {
    await fetch('/__test/media-empty', { method: 'POST' })
    await open('/forms', 'Quote Request')
    queryClient.removeQueries({ queryKey: abilityKey('media/list') })
    await open('/media', 'No files yet')
    assert(!text().includes('Drop') && !main().querySelector('[class*="border-dashed"]'), 'media still has a drop zone')
    assert(!noMatches() && !main().querySelector('[role="table"]') && !cards().length, 'empty library shows filters or headers instead of its empty state')
    assert(anyButton('Upload'), 'empty library lost Upload')
    await fetch('/__test/media-populated', { method: 'POST' })
  })
  await test('Errors expose recovery instead of an empty overview', async () => {
    await open('/forms', 'Quote Request')
    const key = abilityKey('forms/list', {})
    queryClient.setQueryData(key, undefined)
    await fetch('/__test/fail', { method: 'POST' })
    await queryClient.resetQueries({ queryKey: key })
    await wait(() => text().includes('Could not load data'), 'error state missing')
    assert(!main().querySelector('[role="table"]'), 'error shown under empty headers')
    await fetch('/__test/recover', { method: 'POST' })
    button('Retry').click(); await wait(() => text().includes('Quote Request'), 'retry failed')
  })
  output.textContent += '\\nAll ' + results.length + ' overview checks passed.'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, viewport: innerWidth }) })
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack }) })
}
`
const keepAlive = process.argv.includes('--preview')
let fail = false
let emptyMedia = false
let current = 'loading the admin'
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
const body = async (req) => { let value = ''; for await (const chunk of req) value += chunk; return value }
const page = (items, total = items.length, current = 1, perPage = 50) => ({ items, total, page: current, pages: Math.max(1, Math.ceil(total / perPage)), perPage })
const camel = { created_at: 'createdAt', updated_at: 'updatedAt', published_at: 'publishedAt' }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/__test/requests') return json(res, 200, requests)
    if (url.pathname === '/__test/progress') { current = await body(req); return json(res, 200, {}) }
    if (url.pathname === '/__test/media-empty') { emptyMedia = true; return json(res, 200, {}) }
    if (url.pathname === '/__test/media-populated') { emptyMedia = false; return json(res, 200, {}) }
    if (url.pathname === '/__test/fail') { fail = true; return json(res, 200, {}) }
    if (url.pathname === '/__test/recover') { fail = false; return json(res, 200, {}) }
    if (url.pathname === '/__test/results') {
      const result = JSON.parse(await body(req))
      result.passed.forEach((name) => console.log('PASS', name))
      if (result.error) console.error('FAIL', result.error)
      if (result.viewport) console.log('PASS viewport', result.viewport)
      json(res, 200, {})
      if (!keepAlive) {
        clearTimeout(timeout)
        setTimeout(() => { server.closeAllConnections(); server.close(); process.exitCode = result.error ? 1 : 0 }, 100)
      }
      return
    }
    if (url.pathname === '/fixture.svg') { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); return res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#e8e8e5"/><text x="600" y="400" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#6b6b67">Image fixture</text></svg>') }
    if (url.pathname === '/api/admin/manifest') return json(res, 200, { data: manifest })
    if (url.pathname.startsWith('/api/admin/abilities/')) {
      const ability = url.pathname.slice('/api/admin/abilities/'.length), input = JSON.parse(await body(req))
      requests.push({ ability, input })
      if (ability === 'account/update') { Object.assign(manifest.user.preferences, input.preferences); return json(res, 200, { data: manifest.user }) }
      if (ability === 'forms/list' && fail) return json(res, 422, { error: { message: 'Fixture failure', type: 'invalid_input' } })
      let data
      if (ability === 'forms/list') data = forms
      else if (ability === 'collections/list') data = [{ ...collection, route: null, system: false, count: 2 }]
      else if (ability === 'collections/get') data = input.handle === 'pages' ? { ...treeCollection, fields: [], resolvedFields: [], schema: {} } : input.handle === 'events' ? { ...eventsCollection, sort: '-published_at', fields: [], resolvedFields: [], schema: {} } : { ...collectionDef, schema: {} }
      else if (ability === 'collections/save') { collectionDef = { ...collectionDef, ...input.definition }; collection.defaultView = collectionDef.default_view; data = collectionDef }
      else if (ability === 'entries/tree') data = [{ ...entry('parent', 'Parent page'), uri: '/parent', displayStatus: 'published', children: [{ ...entry('child', 'Child page with a substantially longer title'), uri: '/parent/child', displayStatus: 'published', children: [] }] }]
      else if (ability === 'pages/builtin') data = []
      else if (ability === 'blocks/types') data = { blocks: [], sources: [], transforms: [] }
      else if (ability === 'forms/get') data = { handle: input.handle, title: 'Contact', fields: [], settings: {} }
      else if (ability === 'forms/submissions') data = page([{ id: 'submission-1', data: { name: 'Ada Example', email: 'ada@example.invalid', message: 'A short message' }, files: [], meta: {}, status: 'new', createdAt: '2026-10-27T12:00:00Z' }, { id: 'submission-2', data: { name: 'A very long sender name that must not change the column alignment', email: 'very.long.email.address@example.invalid', message: 'A longer submission message that must stay in its own column.' }, files: [], meta: {}, status: 'read', createdAt: '2026-10-26T12:00:00Z' }])
      else if (ability === 'entries/list') {
        let records = input.collection === 'events'
          ? [{ ...entry('launch', 'Launch event'), collection: 'events', status: 'published', displayStatus: 'published', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
          : [entry('alpha', 'Alpha post'), { ...entry('beta', 'Beta post'), publishedAt: '2026-10-25T12:00:00Z' }]
        for (const filter of input.filters ?? []) {
          const key = camel[filter.field]
          records = records.filter((row) => filter.operator === 'null' ? row[key] == null : row[key] != null && (filter.operator === '>=' ? new Date(row[key]) >= new Date(filter.value) : new Date(row[key]) < new Date(filter.value)))
        }
        data = page(records)
      }
      else if (ability === 'media/list') {
        const field = (input.sort ?? '-created_at').replace(/^-/, ''), key = camel[field] ?? field
        const sorted = (emptyMedia ? [] : [...media]).sort((a, b) => { const x = a[key], y = b[key]; const order = typeof x === 'number' ? x - y : String(x).localeCompare(String(y)); return (input.sort ?? '-created_at').startsWith('-') ? -order : order })
        const items = sorted.filter((m) => (!input.search || m.name.includes(input.search)) && (!input.kind || input.kind === 'all' || m.kind === input.kind) && (!input.folder || m.folder === input.folder)); const current = input.page ?? 1, perPage = input.perPage ?? 60
        data = { ...page(items.slice((current - 1) * perPage, current * perPage), items.length, current, perPage), folders: emptyMedia ? [] : ['Projects'] }
      } else if (ability === 'media/lookup') data = { items: media.filter((item) => input.ids.includes(item.id)) }
      else if (ability === 'navigation/list') data = [{ handle: 'main', title: 'Main menu', count: 4, maxDepth: 2 }]
      else if (ability === 'users/list') data = page([{ id: 'ada', name: 'Ada Example', email: 'ada@example.invalid', initials: 'AE', roles: ['editor'], super: false, twoFactor: true, lastLoginAt: null }, { id: 'grace', name: 'Grace with a longer display name', email: 'a.very.long.email.address@example.invalid', initials: 'GE', roles: ['editor', 'content_manager'], super: true, twoFactor: false, lastLoginAt: null }])
      else if (ability === 'roles/list') data = { roles: { editor: { label: 'Editor', permissions: [] } }, permissions: {} }
      else if (ability === 'users/fields') data = { fields: [], resolvedFields: [] }
      else if (ability === 'languages/list') data = { prefixDefault: false, canTranslate: false, languages: [{ code: 'en', name: 'English', default: true, prefix: '', direction: 'ltr', entries: 2 }] }
      else if (ability === 'audit/list') data = { ...page([{ id: 'audit-1', ability: 'entries/publish', label: 'Publish Entry', subject: 'Alpha post', to: '/content/posts/alpha', transport: 'rest', user: { id: 'ada', name: 'Ada Example' }, createdAt: '2026-10-27T12:00:00Z', input: {} }]), filters: { people: [{ id: 'ada', name: 'Ada Example' }], actions: [{ value: 'entries/publish', label: 'Publish Entry' }] } }
      else if (ability === 'redirects/list') data = [{ from: '/old', to: '/new', status: 301 }]
      else if (ability === 'settings/get') data = { label: 'SEO', description: '', icon: 'seo', fields: [], values: {} }
      else if (ability === 'packages/list') data = { items: [...packages, { ...plugin('admin', 'Admin'), core: true }], errors: [] }
      else throw new Error('Unexpected ability: ' + ability)
      return json(res, 200, { data })
    }
    const asset = url.pathname.match(/^\/_cms\/assets\/cms-([^/]+)\/(.+)$/)
    if (asset) {
      const folder = asset[1] === 'admin' ? 'modules/admin' : modules.includes(asset[1]) ? `modules/${asset[1]}` : `../plugins-public/${asset[1]}`
      const dir = resolve(root, folder, 'dist'), path = resolve(dir, asset[2])
      if (!path.startsWith(dir + sep)) return json(res, 403, {})
      res.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)] ?? 'application/octet-stream' }); return res.end(await readFile(path))
    }
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Overview regression test</title>${admin.css.map((path) => `<link rel="stylesheet" href="${assetBase + path}">`).join('')}<script type="importmap">${JSON.stringify({ imports })}</script><script>window.__CMS__=${JSON.stringify(boot)}</script><script type="module" src="${assetBase + admin.entry}"></script></head><body><div id="cms"></div>${url.searchParams.has('preview') ? '' : `<pre id="results" style="position:fixed;bottom:8px;right:8px;z-index:9999;max-width:620px;background:white;border:1px solid #aaa;padding:12px;font-size:11px">Starting tests…</pre><script type="module">${runner}</script>`}</body></html>`
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html)
  } catch (error) { console.error(error); json(res, 500, { error: { message: error.message } }) }
})
const timeout = keepAlive ? null : setTimeout(() => { console.error('Overview browser test timed out during: ' + current); server.closeAllConnections(); server.close(); process.exitCode = 1 }, 120_000)
server.listen(0, '127.0.0.1', () => console.log(`Open http://localhost:${server.address().port}/admin/forms to run overview checks.`))
