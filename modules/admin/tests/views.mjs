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
  content: ({ collection }, manifest) => {
    const summary = manifest.collections.find((c) => c.handle === collection)
    if (!summary) return page('Not Found', undefined, [{ type: 'ui/empty', props: { icon: 'collection', title: 'Not Found' } }])
    return page(summary.title, summary.icon, [{ type: 'content/entries', props: { collection } }], {
      count: { source: { ability: 'entries/list', input: { collection, locale: '{query.locale}', perPage: 1, fields: [] } }, at: 'total' },
      actions: summary.can?.create === false ? [] : [{ label: summary.newLabel ?? `New ${summary.singular}`, icon: 'plus', variant: 'primary', to: `/content/${collection}/new?locale={query.locale}` }],
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
export function viewResponse(input, manifest) {
  const params = input.params ?? {}
  const key = input.id + (Object.keys(params).length ? ':' + new URLSearchParams(params) : '')
  if (snapshot[key]) return { status: 200, body: { data: snapshot[key] } }
  const make = views[input.id]
  const found = mounted.find((v) => v.id === input.id)
  if (!make || !found) return { status: 404, body: { error: { type: 'not_found', message: `No view ${input.id}.` } } }
  return { status: 200, body: { data: { id: input.id, path: found.path, package: null, root: make(input.params ?? {}, manifest) } } }
}
