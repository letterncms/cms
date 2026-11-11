// Views as the server sends them (Cms\Admin\Views, resolved for an admin), for the browser fixtures.
// fixtures/views.json holds the real ones, written by tests/Feature/ViewFixturesTest.php (which fails
// when it is out of date). The trees below are for places that depend on a fixture's own manifest.
import { readFileSync } from 'node:fs'

const snapshot = JSON.parse(readFileSync(new URL('./fixtures/views.json', import.meta.url), 'utf8'))
// Keep in step with SettingsModule::view, AuditModule::view, ContentModule::view, UsersViews, PackagesViews,
// GlobalsViews, CollectionsViews and AccountViews.

const page = (title, icon, children, extra = {}) => ({ type: 'ui/page', props: { title, icon, ...extra }, children })
const tabs = (...list) => [{ type: 'ui/tabs', props: {}, children: list }]
const tab = (id, label, children, actions) => ({ type: 'ui/tab', props: { id, label, ...(actions ? { actions } : {}) }, children })

export const views = {
  settings: ({ namespace }, manifest) => {
    const current = manifest.settings.find((s) => s.namespace === namespace)
    if (!current) return page('Not Found', 'settings', [{ type: 'ui/empty', props: { icon: 'settings', title: 'Not Found' } }])
    const home = current.home && manifest.nav.find((n) => n.id === current.home)?.path
    if (home) return page(current.label, current.icon, [{ type: 'ui/redirect', props: { to: `${home}${home.includes('?') ? '&' : '?'}tab=settings` } }])
    return page(current.label, current.icon, tabs(tab('settings', 'Settings', [{ type: 'ui/settings', props: { namespace } }])), { actions: [] })
  },
  audit: () => page('Audit Log', 'activity', tabs(tab('log', 'Log', [{ type: 'ui/records', props: {
    id: 'audit', label: 'Audit Log', source: { ability: 'audit/list', input: {} }, paged: { perPage: 50 },
    filters: [
      { param: 'userId', label: 'Person', all: 'Everyone', at: 'filters.people', value: 'id', text: 'name' },
      { param: 'ability', label: 'Action', all: 'All Actions', at: 'filters.actions' },
    ],
    columns: [
      { key: 'label', label: 'Change', muted: 'subject' },
      { key: 'who', label: 'Who', width: '160px' },
      { key: 'via', label: 'Via', width: '96px', format: 'badge', tones: { Agent: 'info', Assistant: 'info' } },
      { key: 'createdAt', label: 'When', width: '112px', align: 'end', format: 'ago' },
    ],
    open: { label: 'Open', dialog: { title: '{row.label}', text: '{row.subject}', size: 'lg', body: [
      { type: 'ui/detail', props: { items: [{ label: 'Who', key: 'row.who' }, { label: 'Via', key: 'row.via' }, { label: 'When', key: 'row.createdAt', format: 'datetime' }] } },
      { type: 'ui/detail', props: { record: '{row.input}', raw: '{row.input}' } },
    ], actions: [{ label: 'Open', icon: 'arrow-right', variant: 'primary', to: '{row.to}', when: '{row.to}' }] } },
    empty: { icon: 'activity', title: 'No changes recorded yet' },
  } }]))),
  content: ({ collection }, manifest, definition) => {
    const summary = manifest.collections.find((c) => c.handle === collection)
    if (!summary) return page('Not Found', undefined, [{ type: 'ui/empty', props: { icon: 'collection', title: 'Not Found' } }])
    return page(summary.title, summary.icon, [{ type: 'ui/records', props: entries(summary, definition?.(collection) ?? {}, manifest) }], {
      count: { source: { ability: 'entries/list', input: { collection, locale: '{query.locale}', status: '{query.status}', search: '{query.search}', perPage: 1, fields: [] } }, at: 'total' },
      actions: summary.can?.create === false ? [] : [{ label: summary.newLabel ?? `New ${summary.singular}`, icon: 'plus', variant: 'primary', to: `/content/${collection}/new?locale={query.locale}`, key: 'c' }],
    })
  },
  users: () => users(),
  'users-person': ({ id }) => users(id),
  plugins: () => page('Plugins', 'plugin', tabs(
    tab('installed', 'Installed', [{ type: 'ui/records', props: {
      id: 'packages.plugins', label: 'Plugins', key: 'name', source: { ability: 'packages/list', input: { type: 'plugin' } },
      columns: [
        { key: 'label', label: 'Name', width: 'minmax(128px,0.4fr)' },
        { key: 'note', label: 'Description', width: 'minmax(160px,1fr)', format: 'muted' },
        { key: 'version', label: 'Version', width: '80px' },
        { key: 'enabled', label: 'On', width: '48px', format: 'switch', action: { label: 'On', ability: 'packages/switch', input: { name: '{row.name}', on: '{value}' }, success: '{result.message}', then: 'manifest' } },
      ],
      open: { label: 'Open', to: '{row.to}' },
      actions: [{ label: 'Settings', icon: 'settings', to: '{row.settingsTo}', when: '{row.settingsTo}' }],
      empty: { icon: 'plugin', title: 'No plugins yet' },
    } }]),
    tab('store', 'Store', [{ type: 'packages/store', props: {} }]),
    tab('updates', 'Updates', [{ type: 'packages/updates', props: {} }]),
  )),
  globals: () => page('Globals', 'globe', [{ type: 'ui/records', props: {
    id: 'globals', label: 'Globals', key: 'handle', source: { ability: 'globals/list', input: {} },
    columns: [{ key: 'title', label: 'Name' }, { key: 'handle', label: 'Handle', width: 'minmax(200px,1fr)', format: 'code' }],
    open: { label: 'Edit', to: '/globals/{row.handle}' },
    actions: [{ label: 'Edit', icon: 'edit', to: '/globals/{row.handle}' }, { label: 'Edit Fields', icon: 'field', to: '/globals/{row.handle}/fields' }],
    empty: { icon: 'globe', title: 'No global sets yet', text: 'Site-wide values, like contact details or footer links.' },
  } }], { actions: [{ label: 'New Global Set', icon: 'plus', variant: 'primary', ability: 'globals/save', form: { title: 'New Global Set', confirm: 'Create', fields: [{ handle: 'title', type: 'text', label: 'Name', required: true }] }, input: { title: '{values.title}', fields: [{ handle: 'text', type: 'text', label: 'Text' }] }, then: 'open', to: '/globals/{result.handle}/fields' }] }),
  collections: () => collections(),
  'collections-new': () => collections({ type: 'collections/new', props: {} }),
  'collections-collection': ({ handle }) => ({ type: 'collections/blueprint', props: { handle } }),
}

function users(open) {
  const people = (kind, title) => ({ type: 'ui/records', props: {
    id: 'users', label: 'Users', source: { ability: 'users/list', input: { kind } }, search: { param: 'search', placeholder: 'Search people…' }, paged: { perPage: 100 },
    columns: [
      { key: 'person', label: 'Name', format: 'person', muted: 'you' },
      { key: 'email', label: 'Email', width: 'minmax(200px,1fr)' },
      { key: 'badges', label: 'Roles', width: 'minmax(160px,0.8fr)', format: 'badges', labels: { editor: 'Editor', suspended: 'Suspended', super: 'Super Admin' }, tones: { suspended: 'danger' } },
      { key: 'twoFactor', label: 'Two-Factor', width: '100px', format: 'yesno' },
      { key: 'lastLoginAt', label: 'Last Sign-In', width: '140px', format: 'ago' },
    ],
    open: { label: 'Edit User', component: 'users/person', props: { user: '{row}' } },
    empty: { icon: 'users', title },
  } })
  return page('Users', 'users', tabs(
    tab('team', 'Team', [people('team', 'No users yet'), ...(open ? [{ type: 'users/person', props: { id: open } }] : [])], [{ label: 'Invite User', icon: 'user-plus', variant: 'primary', component: 'users/person' }]),
    tab('visitors', 'Visitors', [people('visitors', 'No visitors yet')]),
    tab('fields', 'Profile Fields', [{ type: 'users/profile-fields', props: {} }]),
  ))
}

function collections(open) {
  return page('Collections', 'collection', [{ type: 'ui/records', props: {
    id: 'collections', label: 'Collections', key: 'handle', source: { ability: 'collections/editable', input: {} },
    columns: [
      { key: 'title', label: 'Name' },
      { key: 'route', label: 'URL', width: 'minmax(200px,1fr)', format: 'code' },
      { key: 'structure', label: 'Structure', width: '120px', labels: { list: 'List', tree: 'Tree', dated: 'Dated' } },
      { key: 'count', label: 'Entries', width: '90px', align: 'end', format: 'number' },
    ],
    open: { label: 'Open', to: '/collections/{row.handle}' },
    empty: { icon: 'collection', title: 'No collections yet', text: 'Collections define what you can write: pages, posts, products…' },
  } }, ...(open ? [open] : [])], { actions: [{ label: 'New Collection', icon: 'plus', variant: 'primary', component: 'collections/new' }] })
}

const WIDTHS = { text: '180px', textarea: 'minmax(160px,0.8fr)', select: '132px', toggle: '80px', date: '112px', number: '96px', entries: '180px', users: '132px', tags: '180px', media: '64px', url: '180px', email: '180px', slug: '160px', color: '112px' }
const SORTABLE = ['text', 'select', 'toggle', 'date', 'number', 'url', 'email', 'slug', 'color']

/** A collection's entries, as EntriesView::records sends them (for an admin who may do everything the summary says). */
function entries(summary, def, manifest) {
  const handle = summary.handle, can = summary.can ?? {}
  const fields = def.resolvedFields ?? def.fields ?? []
  const locales = manifest.site.locales
  const tree = summary.structure === 'tree', datedList = summary.structure === 'dated'
  const defaultView = def.default_view ?? summary.defaultView ?? 'table'
  const excerpt = fields.find((f) => f.type === 'textarea' || (f.type === 'text' && !['title', 'slug'].includes(f.handle)))
  const media = fields.filter((f) => f.type === 'media')
  const shown = def.default_columns ?? [...(summary.routable ? ['uri'] : []), 'status', 'published', 'updated']
  const cards = def.default_columns ? [] : [media[0], excerpt].filter(Boolean).map((f) => `field:${f.handle}`)
  const columns = [
    ...(summary.routable ? [{ id: 'uri', key: 'uri', label: 'URL', format: 'address', fit: true, sort: 'uri' }] : []),
    { id: 'status', key: 'displayStatus', label: 'Status', format: 'status', width: '104px', sort: 'status' },
    ...fields.filter((f) => WIDTHS[f.type] && !['title', 'slug'].includes(f.handle) && !['title', 'uri'].includes(f.component)).map((f) => ({
      id: `field:${f.handle}`, key: `values.${f.handle}`, label: f.label || f.handle, format: 'field', field: { type: f.type, ...(f.options ? { options: f.options } : {}) }, width: WIDTHS[f.type],
      ...(SORTABLE.includes(f.type) ? { sort: f.handle } : {}), ...(f.type === 'number' ? { align: 'end' } : {}), ...(excerpt?.handle === f.handle ? { excerpt: true } : {}), ...(media[0]?.handle === f.handle ? { image: true } : {}),
    })),
    ...(locales.length > 1 ? [{ id: 'translations', key: 'translations', label: 'Languages', format: 'languages', locales, width: `${24 + locales.length * 26}px` }] : []),
    { id: 'author', key: 'author', label: 'Author', format: 'person', width: '132px', sort: 'author_id', empty: 'Unassigned' },
    { id: 'published', key: 'published', label: 'Published' }, { id: 'updated', key: 'updated', label: 'Updated' },
  ].map(({ id, ...c }) => ({ ...c, hidden: !shown.includes(id), ...(cards.includes(id) ? { card: true } : {}) }))
  const values = columns.filter((c) => c.key.startsWith('values.')).map((c) => c.key.slice(7))
  const plain = { collection: handle, locale: '{query.locale}', fields: values }
  const entry = { id: '{row.id}', expectedVersion: '{row.version}' }
  const open = `/content/${handle}/{row.id}`
  return {
    id: `entries.${handle}`, label: summary.title, key: 'id', address: true,
    source: { ability: 'entries/list', input: { ...plain, status: '{query.status}' } },
    columns: [{ key: 'title', label: 'Title', width: 'minmax(200px,1fr)', sort: 'title', empty: 'Untitled' }, ...columns],
    search: { param: 'search', placeholder: `Search ${summary.title.toLowerCase()}…` },
    filters: [
      { param: 'status', label: 'Status', display: 'segmented', default: 'any', options: [{ value: 'any', label: 'All' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }] },
      ...(locales.length > 1 ? [{ param: 'locale', label: 'Language', display: 'segmented', default: manifest.site.defaultLocale, options: locales.map((code) => ({ value: code, label: code.toUpperCase(), title: code })) }] : []),
    ],
    paged: { perPage: 50 },
    sort: { param: 'sort', ...(tree ? {} : { default: def.sort || (datedList ? '-published_at' : 'title') }) },
    dates: { published: 'published_at', updated: 'updated_at' },
    open: { label: 'Open', to: open },
    actions: [
      { label: 'View on Site', icon: 'external', inline: true, href: '{row.uri}', when: '{row.uri}', unless: '{row.displayStatus} is draft, scheduled' },
      { label: 'Open', icon: 'edit', to: open },
      ...(can.create ? [{ label: 'Duplicate', icon: 'copy', ability: 'entries/duplicate', input: entry, then: 'open', to: `/content/${handle}/{result.id}` }] : []),
      ...(can.publish ? [{ label: 'Publish', icon: 'rocket', ability: 'entries/publish', input: entry, success: 'Published', when: '{row.displayStatus} is draft, changed' }, { label: 'Unpublish', icon: 'eye-off', ability: 'entries/unpublish', input: entry, success: 'Unpublished', unless: '{row.displayStatus} is draft' }] : []),
      { label: 'Copy URL', icon: 'link', copy: '{origin}{row.uri}', success: 'URL copied', when: '{row.uri}' },
      ...(can.delete ? [{ label: 'Delete', icon: 'trash', variant: 'danger', ability: 'entries/delete', input: entry, success: 'Deleted', confirm: { title: 'Delete “{row.title}”?', text: 'This cannot be undone.', confirm: 'Delete', danger: true } }] : []),
    ],
    bulk: [
      ...(can.publish ? [
        { label: 'Publish', each: true, ability: 'entries/publish', input: entry, some: '{row.displayStatus} is draft, changed', success: { one: 'Published {count} entry', other: 'Published {count} entries' } },
        { label: 'Unpublish', each: true, ability: 'entries/unpublish', input: entry, some: '{row.displayStatus} is not draft', success: { one: 'Unpublished {count} entry', other: 'Unpublished {count} entries' } },
      ] : []),
      ...(can.delete ? [{ label: 'Delete', each: true, ability: 'entries/delete', input: entry, confirm: { title: { one: 'Delete {count} entry?', other: 'Delete {count} entries?' }, text: 'This cannot be undone.', confirm: 'Delete', danger: true }, success: { one: 'Deleted {count} entry', other: 'Deleted {count} entries' } }] : []),
    ],
    empty: { icon: summary.icon, title: `No ${summary.title.toLowerCase()} yet` },
    defaultView: ['grid', 'calendar'].includes(defaultView) ? defaultView : 'table',
    ...(datedList || defaultView === 'calendar' ? { calendar: {
      dated: { sort: '{field}', filters: [{ field: '{field}', operator: '>=', value: '{start}' }, { field: '{field}', operator: '<', value: '{end}' }] },
      undated: { sort: '-updated_at', filters: [{ field: '{field}', operator: 'null' }] },
    } } : {}),
    ...(tree ? { tree: { source: { ability: 'entries/tree', input: plain }, version: 'version', ...(can.edit ? { reorder: { label: 'Drag to Reorder', ability: 'entries/reorder', input: { collection: handle, ids: '{ids}', parentId: '{parent}', versions: '{versions}' }, ...(can.publish ? {} : { when: '{row.status} is not published' }) } } : {}) } } : {}),
  }
}

/** The manifest's `views`: where each is mounted. */
export const mounted = [
  ...Object.values(snapshot).filter((v, i, all) => all.findIndex((w) => w.id === v.id) === i && !['settings', 'audit', 'users', 'plugins', 'globals', 'collections'].includes(v.id)).map((v) => ({ id: v.id, path: v.path, package: v.package })),
  { id: 'settings', path: '/settings/:namespace', package: null },
  { id: 'audit', path: '/audit', package: null, private: true },
  { id: 'content', path: '/content/:collection', package: null },
  { id: 'users', path: '/users', package: null, private: true },
  { id: 'users-person', path: '/users/:id', package: null, private: true },
  { id: 'plugins', path: '/plugins', package: null },
  { id: 'globals', path: '/globals', package: null },
  { id: 'collections', path: '/collections', package: null },
  { id: 'collections-new', path: '/collections/new', package: null },
  { id: 'collections-collection', path: '/collections/:handle', package: null },
]

/** Answers `views/get` for a fixture: `{ data }`, as the abilities endpoint does. */
export function viewResponse(input, manifest, definition) {
  const params = input.params ?? {}
  const key = input.id + (Object.keys(params).length ? ':' + new URLSearchParams(params) : '')
  if (snapshot[key]) return { status: 200, body: { data: snapshot[key] } }
  const make = views[input.id]
  const found = mounted.find((v) => v.id === input.id)
  if (!make || !found) return { status: 404, body: { error: { type: 'not_found', message: `No view ${input.id}.` } } }
  return { status: 200, body: { data: { id: input.id, path: found.path, package: null, root: make(input.params ?? {}, manifest, definition) } } }
}
