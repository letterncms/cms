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
const modules = ['content', 'collections', 'globals', 'users', 'packages', 'audit']
const plugins = ['blocks', 'media', 'forms', 'navigation', 'seo', 'i18n']
const collection = { handle: 'posts', title: 'Posts', singular: 'Post', newLabel: 'New Post', icon: 'article', structure: 'list', driver: 'database', editor: 'document', can: { create: true, edit: true, publish: true, delete: true }, routable: false }
const blueprintFields = [{ handle: 'category', label: 'Category', type: 'select', options: { news: 'News' } }, { handle: 'body', label: 'Body', type: 'markdown' }]
let collectionDef = { ...collection, default_view: 'table', default_columns: null, fields: blueprintFields, resolvedFields: blueprintFields, settings: [
  { handle: 'title', type: 'text', label: 'Name' },
  { handle: 'structure', type: 'select', label: 'Structure', options: { list: 'List', tree: 'Tree', dated: 'Dated' } },
  { handle: 'default_view', type: 'select', label: 'Default View', display: 'segmented', required: true, options: { table: 'Table', grid: 'Grid', calendar: 'Calendar' } },
  { handle: 'default_columns', type: 'json', component: 'collection-display-fields', label: 'Default Display Fields' },
] }
const entry = (id, title) => ({ id, collection: 'posts', locale: 'en', title, slug: id, uri: null, status: 'draft', displayStatus: 'draft', data: {}, values: { category: 'news' }, hasDraft: false, parentId: null, position: 0, originId: null, authorId: null, author: null, createdAt: null, updatedAt: '2026-10-25T12:00:00Z', publishedAt: null })
const forms = [{ publishedAt: null, updatedAt: null, handle: 'contact', title: 'Contact', fields: 3, enabled: true, new: 2, total: 8 }, { publishedAt: '2026-10-02T12:00:00+02:00', updatedAt: '2026-10-03T12:00:00+02:00', handle: 'quote', title: 'Quote Request', fields: 7, enabled: false, new: 0, total: 20 }]
const media = Array.from({ length: 61 }, (_, i) => ({ id: `file-${i}`, name: i === 0 ? 'A very long image name to check truncation and action controls' : `Project image ${String(i).padStart(2, '0')}`, filename: `project-${i}.jpg`, kind: 'image', mime: 'image/jpeg', url: '/fixture.svg', thumb: '/fixture.svg', alt: i % 2 ? 'Project image' : '', size: (i + 1) * 1200, folder: i % 2 ? 'Projects' : '', width: 1200, height: 800, focal: { x: 50, y: 50 }, caption: '', publishedAt: '2026-10-27T12:00:00Z', updatedAt: '2026-10-27T13:00:00Z', createdAt: new Date(Date.UTC(2026, 9, 27, 0, i)).toISOString() }))
const treeCollection = { ...collection, handle: 'pages', title: 'Pages', structure: 'tree', routable: true }
const nav = [['posts', 'Posts', '/content/posts', 'article'], ['pages', 'Pages', '/content/pages', 'page'], ['media', 'Media', '/media', 'media'], ['forms', 'Forms', '/forms', 'form'], ['globals', 'Globals', '/globals', 'globe'], ['navigation', 'Navigation', '/navigation', 'list-tree'], ['users', 'Users', '/users', 'users'], ['modules', 'Modules', '/modules', 'plugin'], ['languages', 'Languages', '/languages', 'translate'], ['redirects', 'Redirects', '/redirects', 'arrow-up-right'], ['audit', 'Audit Log', '/audit', 'activity'], ['collections', 'Collections', '/collections', 'collection']].map(([id, label, path, icon]) => ({ id, label, path, icon, section: 'main' }))
const manifest = {
  cms: { version: 'test', debug: false },
  site: { name: 'Overview regression test', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Test User', email: 'test@example.invalid', initials: 'TU', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', ...modules.map((n) => `cms/${n}`), ...plugins.map((n) => `cms/${n}`)], pending: {} },
  modules: [...modules, ...plugins].map((n) => ({ id: `cms/${n}`, url: `/_cms/assets/cms-${n}/admin.js`, package: `cms/${n}` })),
  styles: [...modules, ...plugins].map((n) => `/_cms/assets/cms-${n}/admin.css`),
  settings: [], collections: [collection, treeCollection], globals: [{ handle: 'footer', title: 'Footer', icon: 'globe' }, { handle: 'contact_details_with_a_very_long_handle_that_must_not_shift_columns', title: 'Contact details', icon: 'mail' }], fieldTypes: [], commands: [], widgets: [], dashboard: [], config: {}, nav, sidebar: [{ id: 'main', label: 'Main', items: nav.map((n) => n.id) }],
}
const boot = { base: '/admin', api: '/api/admin', version: 'test', theme: { name: 'cms/admin', version: 'test' }, site: manifest.site, locale: 'en', messages: {}, manifest }
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
const view = (name) => main().querySelector('[role="radio"][title="' + name + '"]')
const switchView = async (name) => { const target = view(name); assert(target, 'missing ' + name + ' switch'); target.click(); await wait(() => target.getAttribute('aria-checked') === 'true', 'view did not switch'); await sleep(50) }
const open = async (path, expected) => { navigate(path); await wait(() => location.pathname === '/admin' + path && text().includes(expected) && !document.querySelector('[role="progressbar"]'), 'failed to open ' + path); await sleep(50) }
const test = async (name, fn) => { if (layoutOnly && !name.startsWith('Every overview table')) return; await fn(); results.push(name); output.textContent = results.map((s) => 'PASS ' + s).join('\\n') }
try {
  await wait(() => text().includes('Quote Request'), 'forms did not load')
  await test('Every overview shares all views and display controls, with optional dates outside content', async () => {
    const routes = [['/forms', 'Quote Request'], ['/globals', 'Contact details'], ['/media', 'Project image'], ['/navigation', 'Main menu'], ['/users', 'Ada Example'], ['/languages', 'English'], ['/audit', 'Publish Entry'], ['/collections', 'Posts'], ['/modules', 'Media'], ['/redirects', '301'], ['/forms/contact?tab=submissions', 'Received'], ['/content/posts', 'Beta post'], ['/content/pages', 'Parent page']]
    for (const [path, expected] of routes) {
      navigate(path)
      await wait(() => text().includes(expected) && !document.querySelector('[role="progressbar"]'), 'failed to open ' + path)
      await switchView('Table')
      assert(view('Table') && view('Grid') && view('Calendar'), path + ': inconsistent view choices')
      const labels = [...main().querySelectorAll('[role="columnheader"]')].map((cell) => cell.textContent)
      const content = path.startsWith('/content/')
      for (const label of ['Published', 'Updated']) assert(labels.filter((text) => text === label).length === (content ? 1 : 0), path + ': incorrect default for ' + label)
      button('Display').click(); await wait(() => document.querySelector('.cms-pop'), 'display missing')
      for (const label of ['Published', 'Updated']) {
        const control = [...document.querySelectorAll('.cms-pop [role="checkbox"]')].find((control) => control.closest('label')?.textContent === label)
        assert(control && control.getAttribute('aria-checked') === String(content), path + ': missing or inconsistent date option ' + label)
      }
      assert([...document.querySelectorAll('.cms-pop button')].some((button) => button.textContent === 'Reset Display'), path + ': inconsistent reset')
      button('Display').click()
      await switchView('Calendar')
      await wait(() => main().querySelector('[data-calendar][aria-busy="false"]'), path + ': missing shared calendar')
      assert(button('Previous Month') && button('Next Month'), path + ': missing month navigation')
      assert(!main().querySelector('nav[aria-label="Pagination"]'), path + ': calendar still paginates table rows')
      button('Display').click(); await wait(() => document.querySelector('#f-calendarDate'), path + ': missing shared calendar date setting')
      button('Display').click()
      await switchView('Table')
      if (path === '/media') await switchView('Grid')
    }
    await open('/forms', 'Quote Request')
  })
  await test('Shared date columns sort chronologically, keep nulls last and render in cards', async () => {
    const { recordDateColumns, withRecordDateColumns, standardEntryColumns } = await import('@letterncms/ui')
    const columns = recordDateColumns((item) => item)
    assert(columns.every((column) => column.descFirst), 'dates do not default to newest first')
    assert(withRecordDateColumns([...columns, ...columns], (item) => item).length === 2, 'duplicate date columns')
    assert(standardEntryColumns(false).includes('published'), 'entry defaults omit Published')
    button('Display').click(); await wait(() => document.querySelector('.cms-pop [role="checkbox"]'), 'display missing')
    for (const label of ['Published', 'Updated']) {
      [...document.querySelectorAll('.cms-pop [role="checkbox"]')].find((control) => control.closest('label')?.textContent === label).click()
      await sleep(30)
    }
    button('Display').click(); await sleep(30)
    const headers = () => [...main().querySelectorAll('[role="columnheader"] button')]
    const published = headers().find((button) => button.textContent === 'Published')
    published.click(); await sleep(50)
    let rows = [...main().querySelectorAll('[data-entry]')]
    assert(rows[0].textContent.includes('Quote Request'), 'newest publication did not sort first')
    assert(rows[1].textContent.includes('Contact'), 'unknown publication did not sort last')
    headers().find((button) => button.textContent === 'Published').click(); await sleep(50)
    rows = [...main().querySelectorAll('[data-entry]')]
    assert(rows[1].textContent.includes('Contact'), 'unknown publication did not stay last ascending')
    headers().find((button) => button.textContent === 'Published').click(); await sleep(50)
    await switchView('Grid')
    for (const card of main().querySelectorAll('article')) {
      const labels = [...card.querySelectorAll('dt')].map((label) => label.textContent)
      assert(labels.includes('Published') && labels.includes('Updated'), 'card omitted standard dates')
    }
    await switchView('Table')
  })
  await test('Overviews use sortable headers and the same display controls', async () => {
    assert(main().querySelector('[role="table"]'), 'missing shared table')
    assert(button('Display') && view('Table') && view('Grid'), 'missing view controls')
    const total = [...main().querySelectorAll('[role="columnheader"] button')].find((b) => b.textContent === 'Submissions')
    total.click(); await sleep(30)
    assert(main().querySelector('[aria-sort="ascending"]'), 'missing sort accessibility state')
    total.click(); await sleep(30)
    assert(main().querySelector('[role="rowgroup"] [role="row"]').textContent.includes('Quote request'), 'numeric sorting failed')
    total.click(); await sleep(30)
    assert(!main().querySelector('[aria-sort="descending"]'), 'sort did not reset')
  })
  await test('Search no-match state recovers without losing the view', async () => {
    const input = main().querySelector('input')
    const set = (value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }
    set('does-not-exist'); await wait(() => text().includes('No matches'), 'no-match state missing')
    button('Clear Search').click(); await wait(() => text().includes('Quote Request'), 'clear search failed')
  })
  await test('Display changes persist across table and card views', async () => {
    button('Display').click(); await wait(() => document.querySelector('.cms-pop [role="checkbox"]'), 'display panel missing')
    const fields = [...document.querySelectorAll('.cms-pop [role="checkbox"]')].find((control) => control.closest('label')?.textContent === 'Fields')
    assert(fields, 'column checkbox missing'); fields.click(); await sleep(30)
    button('Display').click(); await sleep(30)
    assert(![...main().querySelectorAll('[role="columnheader"]')].some((header) => header.textContent === 'Fields'), 'column did not hide')
    await switchView('Grid'); assert(![...main().querySelectorAll('dt')].some((term) => term.textContent === 'Fields'), 'card metadata ignored visibility')
    await switchView('Table')
  })
  await test('Card view and preferences survive navigation', async () => {
    await switchView('Grid')
    assert(main().querySelectorAll('article').length === 2, 'cards missing')
    await open('/globals', 'Contact details')
    await switchView('Grid')
    assert(main().querySelectorAll('article').length === 2, 'globals do not use shared cards')
    await open('/forms', 'Quote Request')
    assert(main().querySelectorAll('article').length === 2, 'saved view lost')
    await switchView('Table')
  })
  await test('Media uses shared cards, table, selection and real pagination', async () => {
    await open('/media', 'Project image')
    assert(main().querySelectorAll('article').length === 60, 'media card view did not render')
    await switchView('Table')
    assert(main().querySelectorAll('[role="rowgroup"] [role="row"]').length === 60, 'media table missing')
    const check = main().querySelector('[role="rowgroup"] [role="checkbox"]')
    check.click(); await wait(() => text().includes('1 selected'), 'media selection failed')
    await switchView('Grid')
    assert(main().querySelector('article [role="checkbox"]').getAttribute('aria-checked') === 'true', 'view switch lost selection')
    button('Clear Selection').click(); await sleep(30)
    button('Next Page').click(); await wait(() => text().includes('61–61 of 61'), 'next page did not fetch')
    assert(main().querySelectorAll('article').length === 1, 'last page is wrong')
  })
  await test('Media sorting reaches the API instead of sorting one page', async () => {
    await switchView('Table')
    const name = [...main().querySelectorAll('[role="columnheader"] button')].find((b) => b.textContent === 'Name')
    name.click(); await sleep(200)
    const calls = await (await fetch('/__test/requests')).json()
    assert(calls.some((r) => r.ability === 'media/list' && r.input.sort === 'name' && r.input.page === 1), 'sort did not reach server or reset page')
  })
  await test('Shared calendars include later pages, preserve view preferences and support date choices', async () => {
    await open('/media', 'Project image')
    await switchView('Calendar')
    await wait(() => main().querySelector('[data-calendar][aria-busy="false"]'), 'calendar did not finish loading all pages')
    const more = buttons().find((button) => /Show [0-9]+ more/.test(button.textContent))
    assert(more, 'calendar day does not expand'); more.click(); await sleep(50)
    assert(text().includes('Project image 60'), 'calendar omitted records after the first page')
    assert(main().querySelectorAll('[data-calendar] [data-entry]').length === 61, 'calendar did not combine all matching pages')
    button('Display').click(); await wait(() => document.querySelector('#f-calendarDate'), 'calendar date selector missing')
    document.querySelector('#f-calendarDate').click(); await wait(() => document.querySelector('[role="option"]'), 'calendar date options missing')
    ;[...document.querySelectorAll('[role="option"]')].find((option) => option.textContent === 'Updated').click(); await sleep(50)
    button('Display').click()
    await open('/forms', 'Quote Request')
    await open('/media', 'Project image')
    assert(view('Calendar').getAttribute('aria-checked') === 'true' && main().querySelector('[data-calendar]'), 'calendar preference was lost')
    button('Display').click(); await wait(() => document.querySelector('#f-calendarDate'), 'calendar date selector missing')
    assert(document.querySelector('#f-calendarDate').textContent.includes('Updated'), 'chosen calendar date was lost')
    ;[...document.querySelectorAll('.cms-pop button')].find((button) => button.textContent === 'Reset Display').click(); await sleep(50)
    button('Display').click()
    assert(view('Grid').getAttribute('aria-checked') === 'true', 'reset did not restore source default view')
  })
  await test('Content collection entries share both views and selection', async () => {
    await open('/content/posts', 'Beta post')
    assert(main().querySelector('[role="table"]'), 'entry table missing')
    main().querySelector('[role="rowgroup"] [role="checkbox"]').click(); await sleep(30)
    await switchView('Grid')
    assert(main().querySelectorAll('article').length === 2, 'entry cards missing')
    assert(main().querySelector('article [role="checkbox"]').getAttribute('aria-checked') === 'true', 'entry selection lost when switching')
    button('Clear Selection').click(); await sleep(30)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true })); await sleep(30)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true })); await wait(() => text().includes('1 selected'), 'keyboard selection failed')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(30)
  })
  await test('Navigation, users, languages, audit and configuration use shared views', async () => {
    for (const [path, expected] of [['/navigation', 'Main menu'], ['/users', 'Ada Example'], ['/languages', 'English'], ['/audit', 'Publish Entry'], ['/collections', 'Posts'], ['/modules', 'Media']]) {
      await open(path, expected)
      assert(view('Table') && view('Grid') && button('Display'), path + ' lacks shared controls')
      await switchView('Grid'); assert(main().querySelector('article'), path + ' lacks shared cards')
    }
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
  await test('Collection settings save shared display fields and omit the permanent editor type', async () => {
    await open('/collections/posts', 'Fields')
    button('Settings').click(); await wait(() => main().querySelector('[aria-label="Default Display Fields"]'), 'display settings missing')
    assert(!text().includes('Default View') && !text().includes('Default Display Fields') && !text().includes('Title is always shown.'), 'redundant display labels remain')
    assert(!button('Reset to Automatic Fields'), 'automatic reset is shown before changes')
    assert(!text().includes('Editor Type'), 'permanent editor type is still shown')
    assert(!text().includes('Bodybody'), 'unsupported markdown field was offered')
    const group = main().querySelector('[role="group"][aria-label="Default Display Fields"]')
    for (const box of group.querySelectorAll('[role="checkbox"][aria-checked="true"]')) { box.click(); await sleep(30) }
    const category = [...group.querySelectorAll('[role="checkbox"]')].find((box) => box.closest('label').textContent.includes('Category'))
    assert(category, 'custom field with handle missing'); category.click(); await sleep(30)
    assert(button('Reset to Automatic Fields'), 'automatic reset is missing after changes')
    button('Reset to Automatic Fields').click(); await sleep(30)
    assert(!button('Reset to Automatic Fields'), 'automatic reset remains after resetting')
    for (const box of group.querySelectorAll('[role="checkbox"][aria-checked="true"]')) { box.click(); await sleep(30) }
    category.click(); await sleep(30)
    const grid = [...main().querySelectorAll('[role="radio"]')].find((radio) => radio.textContent === 'Grid')
    grid.click(); await sleep(30)
    const save = [...document.querySelectorAll('header button')].find((b) => b.textContent === 'Save')
    save.click(); await wait(() => save.disabled, 'blueprint save did not finish')
    const calls = await (await fetch('/__test/requests')).json()
    const saved = calls.filter((r) => r.ability === 'collections/save').at(-1).input.definition
    assert(saved.default_view === 'grid' && JSON.stringify(saved.default_columns) === '["field:category"]', 'display settings did not reach the API')
  })
  await test('Collection defaults populate cards, requested values and personal reset', async () => {
    await open('/content/posts', 'Beta post')
    button('Display').click(); await wait(() => document.querySelector('.cms-pop'), 'display panel missing')
    const reset = [...document.querySelectorAll('.cms-pop button')].find((b) => b.textContent === 'Reset Display')
    reset.click(); await sleep(100)
    button('Display').click(); await sleep(30)
    assert(main().querySelector('article dt')?.textContent === 'Category', 'card ignored the default custom field')
    assert(!main().querySelector('article .tabular-nums'), 'hidden dates still appear on cards')
    const calls = await (await fetch('/__test/requests')).json()
    assert(calls.some((r) => r.ability === 'entries/list' && r.input.fields?.includes('category')), 'default custom field was not requested')
    button('Display').click(); await sleep(30)
    const category = [...document.querySelectorAll('.cms-pop [role="checkbox"]')].find((box) => box.closest('label')?.textContent === 'Category')
    category.click(); await sleep(30); button('Display').click(); await sleep(30)
    assert(!main().querySelector('article dt'), 'personal field override ignored')
    await open('/collections', 'Posts'); await open('/content/posts', 'Beta post')
    assert(!main().querySelector('article dt'), 'personal field override lost on navigation')
    button('Display').click(); await sleep(30)
    ;[...document.querySelectorAll('.cms-pop button')].find((b) => b.textContent === 'Reset Display').click(); await sleep(50)
    button('Display').click(); await sleep(30)
    assert(main().querySelector('article dt')?.textContent === 'Category', 'reset did not restore shared fields')
    await switchView('Table')
    assert([...main().querySelectorAll('[role="columnheader"]')].some((h) => h.textContent === 'Category'), 'table ignored shared fields')
    assert(![...main().querySelectorAll('[role="columnheader"]')].some((h) => h.textContent === 'Updated'), 'table ignored hidden system column')
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
    const grid = dialog.querySelector('[role="radio"][title="Grid"]'); grid.click(); await sleep(50)
    assert(dialog.querySelector('article'), 'picker lacks shared cards')
    dialog.querySelector('article [role="checkbox"]').click(); await wait(() => !document.querySelector('[role="dialog"]'), 'single selection did not commit')
    await wait(() => main().querySelector('img'), 'selected file missing from the field')
  })
  await test('Redirects stay editable through the shared table', async () => {
    await open('/redirects', '301')
    assert(main().querySelector('input[value="/old"]'), 'redirect editor missing')
    assert([...document.querySelectorAll('button')].find((b) => b.textContent === 'Save').disabled, 'unchanged redirects marked dirty')
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
    const routes = [['/forms', 'Quote Request'], ['/globals', 'Contact details'], ['/media', 'Project image'], ['/navigation', 'Main menu'], ['/users', 'Ada Example'], ['/languages', 'English'], ['/audit', 'Publish Entry'], ['/collections', 'Posts'], ['/modules', 'Media'], ['/redirects', '301'], ['/forms/contact?tab=submissions', 'Received'], ['/content/posts', 'Beta post'], ['/content/pages', 'Parent page']]
    for (const [path, expected] of routes) {
      navigate(path); await wait(() => text().includes(expected) && !document.querySelector('[role="progressbar"]'), 'table audit failed to open ' + path); await sleep(50)
      await switchView('Table')
      if (expectedWidth) assert(innerWidth === expectedWidth, 'layout audit viewport changed: ' + innerWidth)
      const table = main().querySelector('[role="table"]')
      const headers = [...table.querySelectorAll('[role="columnheader"]')]
      const headerBounds = headers.map((cell) => cell.getBoundingClientRect())
      assert(table.scrollWidth <= table.clientWidth + 1, path + ': tracks overflow the table')
      assert(document.documentElement.scrollWidth <= innerWidth + 1, path + ': overview overflows the viewport')
      for (const row of table.querySelectorAll('[role="row"][data-entry]')) {
        const cells = [...row.children].filter((cell) => cell.getAttribute('role') === 'cell')
        assert(cells.length === headers.length, path + ': cell/header counts differ')
        cells.forEach((cell, i) => {
          const bounds = cell.getBoundingClientRect()
          assert(Math.abs(bounds.left - headerBounds[i].left) < 1 && Math.abs(bounds.width - headerBounds[i].width) < 1, path + ': column ' + i + ' shifts between rows')
          if (headers[i].dataset.align === 'end') {
            const headerRight = valueRight(headers[i]), cellRight = valueRight(cell)
            if (headerRight !== undefined && cellRight !== undefined) assert(Math.abs(headerRight - cellRight) < 1, path + ': value in column ' + headers[i].textContent + ' does not align with its heading (' + cellRight + ' vs ' + headerRight + ')')
          }
        })
      }
      for (const cell of table.querySelectorAll('[data-table-actions]')) {
        const bounds = cell.getBoundingClientRect()
        for (const control of cell.querySelectorAll('button')) { const box = control.getBoundingClientRect(); assert(box.width >= 24 && box.left >= bounds.left - 1 && box.right <= bounds.right + 1, path + ': action button is clipped') }
      }
      const actions = headers.find((header) => header.textContent === 'Actions')
      if (actions) assert(actions.querySelector('.sr-only'), path + ': visible Actions heading')
    }
  })
  await test('Media hides alt text by default and uses the standard empty state', async () => {
    await open('/media', 'Project image'); await switchView('Table')
    assert(![...main().querySelectorAll('[role="columnheader"]')].some((header) => header.textContent === 'Alt text'), 'alt text shown by default')
    button('Display').click(); await wait(() => document.querySelector('.cms-pop [role="checkbox"]'), 'display panel missing')
    const alt = [...document.querySelectorAll('.cms-pop [role="checkbox"]')].find((control) => control.closest('label')?.textContent === 'Alt text')
    assert(alt && alt.getAttribute('aria-checked') === 'false', 'alt text unavailable as an optional column')
    button('Display').click()
    await fetch('/__test/media-empty', { method: 'POST' })
    await open('/forms', 'Quote Request')
    queryClient.removeQueries({ queryKey: abilityKey('media/list') })
    await open('/media', 'No files yet')
    assert(!text().includes('Drop') && !main().querySelector('[class*="border-dashed"]'), 'media still has a drop zone')
    assert([...document.querySelectorAll('button')].some((b) => b.textContent === 'Upload'), 'empty library lost Upload')
    await fetch('/__test/media-populated', { method: 'POST' })
  })
  await test('Errors expose recovery instead of an empty overview', async () => {
    await open('/forms', 'Quote Request')
    const key = abilityKey('forms/list', {})
    queryClient.setQueryData(key, undefined)
    await fetch('/__test/fail', { method: 'POST' })
    await queryClient.resetQueries({ queryKey: key })
    await wait(() => text().includes('Could not load data'), 'error state missing')
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
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
const body = async (req) => { let value = ''; for await (const chunk of req) value += chunk; return value }
const page = (items, total = items.length, current = 1, perPage = 50) => ({ items, total, page: current, pages: Math.max(1, Math.ceil(total / perPage)), perPage })
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/__test/requests') return json(res, 200, requests)
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
      else if (ability === 'collections/list') data = [{ ...collection, count: 2 }]
      else if (ability === 'collections/get') data = input.handle === 'pages' ? { ...treeCollection, fields: [], resolvedFields: [], schema: {} } : { ...collectionDef, schema: {} }
      else if (ability === 'collections/save') { collectionDef = { ...collectionDef, ...input.definition }; collection.defaultView = collectionDef.default_view; data = collectionDef }
      else if (ability === 'entries/tree') data = [{ ...entry('parent', 'Parent page'), uri: '/parent', displayStatus: 'published', children: [{ ...entry('child', 'Child page with a substantially longer title'), uri: '/parent/child', displayStatus: 'published', children: [] }] }]
      else if (ability === 'blocks/types') data = { blocks: [], sources: [], transforms: [] }
      else if (ability === 'forms/get') data = { handle: input.handle, title: 'Contact', fields: [], settings: {} }
      else if (ability === 'forms/submissions') data = page([{ id: 'submission-1', data: { name: 'Ada Example', email: 'ada@example.invalid', message: 'A short message' }, files: [], meta: {}, status: 'new', createdAt: '2026-10-27T12:00:00Z' }, { id: 'submission-2', data: { name: 'A very long sender name that must not change the column alignment', email: 'very.long.email.address@example.invalid', message: 'A longer submission message that must stay in its own column.' }, files: [], meta: {}, status: 'read', createdAt: '2026-10-26T12:00:00Z' }])
      else if (ability === 'entries/list') {
        let records = [entry('alpha', 'Alpha post'), { ...entry('beta', 'Beta post'), publishedAt: '2026-10-25T12:00:00Z' }]
        for (const filter of input.filters ?? []) {
          const key = filter.field === 'published_at' ? 'publishedAt' : 'updatedAt'
          records = records.filter((row) => filter.operator === 'null' ? row[key] == null : row[key] != null && (filter.operator === '>=' ? new Date(row[key]) >= new Date(filter.value) : new Date(row[key]) < new Date(filter.value)))
        }
        data = page(records)
      }
      else if (ability === 'media/list') {
        const sorted = (emptyMedia ? [] : [...media]).sort((a, b) => { const field = (input.sort ?? '-created_at').replace(/^-/, ''); const key = field === 'created_at' ? 'createdAt' : field; const x = a[key], y = b[key]; const order = typeof x === 'number' ? x - y : String(x).localeCompare(String(y)); return input.sort?.startsWith('-') ? -order : order })
        const items = sorted.filter((m) => !input.search || m.name.includes(input.search)); const current = input.page ?? 1
        data = { ...page(items.slice((current - 1) * 60, current * 60), items.length, current, 60), folders: ['Projects'] }
      } else if (ability === 'media/lookup') data = { items: media.filter((item) => input.ids.includes(item.id)) }
      else if (ability === 'navigation/list') data = [{ handle: 'main', title: 'Main menu', count: 4, maxDepth: 2 }]
      else if (ability === 'users/list') data = page([{ id: 'ada', name: 'Ada Example', email: 'ada@example.invalid', initials: 'AE', roles: ['editor'], super: false, twoFactor: true, lastLoginAt: null }, { id: 'grace', name: 'Grace with a longer display name', email: 'a.very.long.email.address@example.invalid', initials: 'GE', roles: ['editor', 'content_manager'], super: true, twoFactor: false, lastLoginAt: null }])
      else if (ability === 'roles/list') data = { roles: { editor: { label: 'Editor', permissions: [] } }, permissions: {} }
      else if (ability === 'users/fields') data = { resolvedFields: [] }
      else if (ability === 'languages/list') data = { prefixDefault: false, canTranslate: false, languages: [{ code: 'en', name: 'English', default: true, prefix: '', direction: 'ltr', entries: 2 }] }
      else if (ability === 'audit/list') data = page([{ id: 'audit-1', ability: 'entries/publish', label: 'Publish Entry', subject: 'Alpha post', to: '/content/posts/alpha', transport: 'rest', user: { id: 'ada', name: 'Ada Example' }, createdAt: '2026-10-27T12:00:00Z', input: {} }])
      else if (ability === 'redirects/list') data = [{ from: '/old', to: '/new', status: 301 }]
      else if (ability === 'packages/list') data = { items: [{ name: 'letterncms/media', type: 'plugin', themeKind: null, version: '0.1.0', installedVersion: '0.1.0', label: 'Media', description: 'Upload and manage files.', icon: 'media', builtIn: true, core: false, required: false, enabled: true, active: true, problem: null, dependents: [], provides: [], settings: [] }], errors: [] }
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
const timeout = keepAlive ? null : setTimeout(() => { console.error('Overview browser test timed out'); server.closeAllConnections(); server.close(); process.exitCode = 1 }, 120_000)
server.listen(0, '127.0.0.1', () => console.log(`Open http://localhost:${server.address().port}/admin/forms to run overview checks.`))
