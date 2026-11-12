// Build the admin, the workspace and the assistant, then run this server and open its printed URL.
// Exercises the actual bundled UI against local fixtures; never calls an AI provider.
import { body, json, page, serve } from './harness.mjs'
const nav = [
  ['dashboard', 'Dashboard', '/', 'grid', 'main'], ['analytics', 'Analytics', '/analytics', 'chart', 'main'],
  ['pages', 'Pages', '/content/pages', 'file', 'content'], ['posts', 'Posts', '/content/posts', 'article', 'content'], ['media', 'Media', '/media', 'media', 'content'],
  ['components', 'Components', '/content/components', 'blocks', 'design'], ['templates', 'Templates', '/content/templates', 'layout', 'design'],
  ['settings', 'Settings', '/settings', 'settings', 'system'],
].map(([id, label, path, icon, section]) => ({ id, label, path, icon, section }))
const manifest = {
  components: [{ id: 'fixture/context', label: 'Context component', description: 'A fixture', props: { type: 'object' }, children: false }],
  cms: { version: 'test', debug: false },
  brand: { name: 'Acme', domain: '', product_url: '', docs_url: '', support_email: '', mark: '', wordmark: '' }, site: { name: 'Acme', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Alex Morgan', email: 'alex@example.invalid', initials: 'AM', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', 'letterncms/workspace', 'letterncms/assistant', 'fixture'], pending: {} },
  modules: [{ id: 'fixture', url: '/fixture.js' }, { id: 'letterncms/content', url: '/_cms/assets/cms-content/admin.js' }, { id: 'letterncms/workspace', url: '/_cms/assets/cms-workspace/admin.js' }, { id: 'letterncms/assistant', url: '/_cms/assets/cms-assistant/admin.js' }],
  styles: ['/_cms/assets/cms-workspace/admin.css', '/_cms/assets/cms-assistant/admin.css'], settings: [], collections: [], globals: [], fieldTypes: [], commands: [], widgets: [{ id: 'fixture-widget', label: 'Live plugin widget', icon: 'grid', description: 'Shared with Home', column: 'side', enabled: true, source: 'Fixture' }], dashboard: [], config: { workspace: { agent: { name: 'assistant', label: 'Claude' } } }, nav,
  sidebar: { sections: ['main', 'content', 'design'].map((id) => ({ id, label: id === 'main' ? '' : id[0].toUpperCase() + id.slice(1), items: nav.filter((n) => n.section === id).map((n) => n.id) })), hidden: [], personal: false },
  settingsNav: [{ id: 'system', label: 'System', items: nav.filter((n) => n.section === 'system').map((n) => n.id) }],
}
const boot = { base: '/admin', api: '/api/admin', version: 'test', site: manifest.site, locale: 'en', messages: {}, manifest }
const titles = ['Refine the launch page', 'Draft the autumn newsletter', 'Review page descriptions', 'Update the design system', 'Plan next month’s content']
let chats = Array.from({ length: 70 }, (_, i) => ({ id: `chat-${i + 1}`, title: titles[i] ?? `Earlier conversation ${i + 1}`, updatedAt: new Date(Date.now() - i * 3600000).toISOString() }))
let requests = [], created = 0
const surface = {
  version: 1, id: 'content-overview', title: 'Content at a glance', spec: { root: 'root', elements: {
    root: { type: 'ui/stack', props: {}, children: ['metrics', 'table', 'custom', 'widget', 'action'] },
    metrics: { type: 'ui/grid', props: { columns: 2 }, children: ['published', 'drafts'] },
    published: { type: 'ui/stat', props: { label: 'Published pages', value: 42, delta: 0.12, trend: [10, 18, 12, 24, 42] } },
    drafts: { type: 'ui/stat', props: { label: 'Draft pages', value: 7 } },
    table: { type: 'ui/table', props: { columns: ['Page', 'Status'], rows: [['Autumn launch', 'Draft'], ['About us', 'Published']] } },
    custom: { type: 'fixture/context', props: { title: 'Context from a registered plugin' } },
    widget: { type: 'widget/fixture-widget', props: {} },
    action: { type: 'ui/action', props: { label: 'Publish selected page' }, on: { submit: { action: 'entries/publish', params: { id: 'stored-id' } } } },
  } },
}
const models = [['claude-fable-5-1', 'Claude Fable 5.1'], ['claude-opus-5-5', 'Claude Opus 5.5'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5'], ['claude-haiku-5-5', 'Claude Haiku 5.5']].map(([id, name]) => ({ id, name, description: name + ' fixture' }))
const usedSurfaces = new Set()
const fixture = `import { createElement as h } from 'react'; import { registry } from '@letterncms/sdk'; import { Topbar, Widget, WidgetRow } from '@letterncms/ui'; registry.components.set('fixture/context', ({props}) => h('p', null, props.title)); registry.widgets.set('fixture-widget', () => h(Widget, null, h(WidgetRow, { title: 'A live record from the plugin', description: 'The same widget renders on Home and in chat', icon: 'file' }))); ${JSON.stringify(nav)}.forEach(n => registry.routes.set(n.path, { path: n.path, component: () => h('div', null, h(Topbar, { crumbs: [{ label: n.label, icon: n.icon }] }), h('main', {style:{padding:32}}, h('h1', null, n.label))) }));`
const editedItems = new Map()
const runner = `
import { events, navigate, queryClient, blockNavigation, unregister, reregister, registry, loadManifest } from '@letterncms/sdk'
const results = [], output = document.querySelector('#results')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const assert = (value, message) => { if (!value) throw new Error(message) }
const wait = async (fn, message) => { const end = Date.now() + 7000; while (!fn()) { if (Date.now() > end) throw new Error(message); await sleep(15) } }
const test = async (name, fn) => { await fn(); results.push(name); output.textContent = results.map(x => 'PASS ' + x).join('\\n') }
// The chat is one dock at the right edge of every screen; a chat's own URL is the same dock at full size.
const dock = () => document.querySelector('aside.cms-dock')
const isOpen = () => !!dock()?.hasAttribute('data-open')
const isFull = () => !!dock()?.hasAttribute('data-full')
const composer = () => dock().querySelector('textarea[role="combobox"]')
const control = label => dock().querySelector('button[aria-label="' + label + '"]')
// A fresh thread: the + in the thread's header, which a new empty thread leaves out, or the sidebar's New Chat.
const newChat = () => (control('New Chat') ?? document.querySelector('.cms-side-panel button[aria-label="New Chat"]')).click()
const button = label => [...dock().querySelectorAll('button')].find(el => el.textContent.trim() === label)
const heading = () => dock().querySelector('.cms-thread-page header h2')?.textContent
const welcome = () => !!dock().querySelector('.cms-thread-welcome')
const historyRows = () => [...dock().querySelectorAll('nav[aria-label="Chats"] .cms-sidebar-row-main')]
const row = title => historyRows().find(el => el.getAttribute('aria-label') === title)
const spinning = () => dock().querySelector('nav[aria-label="Chats"] [role="status"]')
const toggle = () => [...document.querySelectorAll('.cms-topbar button')].find(el => el.textContent.trim() === 'Chat')
const screen = () => document.querySelector('[data-cms-screen] h1')?.textContent
const state = async () => (await fetch('/__test/state')).json()
const fill = value => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(composer(), value); composer().dispatchEvent(new Event('input', { bubbles: true })) }
const open = async id => { navigate('/chat/' + id); await wait(() => isFull() && dock().textContent.includes('Reply for ' + id), 'chat failed to load: ' + id) }
// Opening, closing and resizing the dock are transitions; geometry is compared once they end.
const settle = () => Promise.all(document.getAnimations().filter(a => a instanceof CSSTransition).map(a => a.finished.catch(() => {})))
const shortcut = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, bubbles: true }))
// ⌘K on a Mac, Ctrl+K elsewhere: the admin's frame takes mod+k and the chat opens its /.
const mac = /Mac|iPhone|iPad/.test(navigator.platform)
const search = (target = document.activeElement ?? document.body) => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: mac, ctrlKey: !mac, bubbles: true }))
const lines = () => [...dock().querySelectorAll('[role="option"]')]
const chosenLine = () => dock().querySelector('[role="option"][aria-selected="true"]')
const menu = () => dock().querySelector('[role="listbox"]')
const settled = () => menu() && !menu().textContent.includes('Looking…') && lines().length > 0
const press = (key, init = {}) => composer().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
try {
  navigate('/content/pages')
  await wait(() => dock() && toggle() && screen() === 'Pages', 'admin did not load')
  await test('The chat is a dock beside the page, out of the way until asked for, and never saves an empty chat', async () => {
    assert(!isOpen() && dock().inert, 'dock is not closed at the start')
    assert(toggle() && !toggle().hasAttribute('aria-pressed'), 'top bar has no Chat button while the chat is closed')
    assert(!document.querySelector('.cms-side-panel nav[aria-label="Chats"]'), 'chats are listed in the main sidebar')
    const sidebar = document.querySelector('.cms-side-panel'), before = sidebar.getBoundingClientRect()
    toggle().click()
    await wait(() => isOpen() && document.activeElement === composer(), 'toggle did not open the dock with the focus in its composer')
    assert(!isFull() && !dock().inert && location.pathname === '/admin/content/pages', 'opening the dock left the page')
    assert(screen() === 'Pages' && !document.querySelector('.cms-sheet').inert, 'the page beside the dock is not live')
    assert(!toggle(), 'the Chat button stayed in the top bar beside a docked chat')
    await settle()
    await wait(() => document.querySelector('.cms-sheet').getBoundingClientRect().right <= dock().querySelector('.cms-dock-panel').getBoundingClientRect().left + 1, 'dock covers the page instead of sitting beside it')
    await wait(() => historyRows().length === 30, 'a new chat does not list the first page of chats')
    const length = window.history.length
    newChat(); newChat(); await sleep(100)
    assert(location.pathname === '/admin/content/pages' && window.history.length === length, 'New Chat navigated')
    assert(sidebar.getBoundingClientRect().x === before.x && sidebar.getBoundingClientRect().width === before.width, 'shell jumped')
    assert((await state()).created === 0, 'empty chat saved')
  })
  await test('The composer stays in place when typing or clearing a short draft', async () => {
    const targets = ['.cms-thread-welcome', '.cms-thread-composer', 'textarea[role="combobox"]', '[aria-label="Send"]']
    const bounds = () => targets.map(selector => {
      const { x, y, width, height } = dock().querySelector(selector).getBoundingClientRect()
      return [x, y, width, height]
    })
    const before = bounds()
    for (const value of ['e', 'A short draft', '']) {
      fill(value); await sleep(50)
      assert(JSON.stringify(bounds()) === JSON.stringify(before), 'typing shifted the welcome or composer: ' + JSON.stringify(before) + ' -> ' + JSON.stringify(bounds()))
    }
  })
  await test('Long drafts grow, survive closing the dock and moving to another screen, and shrink back', async () => {
    const height = composer().getBoundingClientRect().height
    const longDraft = Array(30).fill('A line in a long draft').join('\\n')
    fill(longDraft); await sleep(50)
    const grown = composer().getBoundingClientRect().height
    assert(grown > height && composer().scrollHeight > composer().clientHeight, 'long draft did not grow into a scrollable composer')
    control('Close').click(); await wait(() => !isOpen() && dock().inert, 'Close did not put the dock away')
    navigate('/content/posts'); await wait(() => screen() === 'Posts' && toggle(), 'CMS navigation failed')
    toggle().click(); await wait(() => isOpen(), 'chat did not reopen'); await settle()
    assert(composer().value === longDraft && composer().getBoundingClientRect().height === grown, 'closing and navigating changed the long draft or its height')
    fill(''); await sleep(50)
    assert(composer().getBoundingClientRect().height === height, 'clearing the draft did not restore the initial height')
  })
  await test('New Chat preserves an unfinished draft and focuses its composer', async () => {
    fill('Unfinished landing page idea'); await sleep(30); document.activeElement.blur()
    newChat()
    await wait(() => document.activeElement === composer(), 'New Chat did not focus the composer')
    assert(composer().value === 'Unfinished landing page idea' && welcome(), 'draft lost')
  })
  await test('Drafts survive CMS navigation and stay isolated from saved chats', async () => {
    navigate('/content/pages'); await wait(() => screen() === 'Pages', 'CMS navigation failed')
    assert(isOpen() && !isFull(), 'the dock did not stay open across screens')
    row('Refine the launch page').click()
    await wait(() => dock().textContent.includes('Reply for chat-1') && heading() === 'Refine the launch page', 'saved chat did not open in the dock')
    assert(location.pathname === '/admin/content/pages' && composer().value === '', 'new draft leaked into the saved chat or the page was left')
    newChat(); await wait(() => welcome(), 'new chat did not open')
    assert(composer().value === 'Unfinished landing page idea', 'new draft was lost')
    fill(''); await sleep(30)
  })
  await test('Asking from elsewhere leaves a saved conversation and keeps its reply draft, which it does not throw away', async () => {
    const ask = () => events.emit('chat.ask')
    row('Refine the launch page').click(); await wait(() => dock().textContent.includes('Reply for chat-1'), 'saved chat did not open')
    fill('Reply draft'); await sleep(30)
    ask(); await sleep(50)
    assert(heading() === 'Refine the launch page' && composer().value === 'Reply draft', 'asking from elsewhere discarded a reply draft')
    newChat(); await wait(() => welcome() && composer().value === '', 'New Chat did not start fresh')
    await wait(() => row('Refine the launch page')?.textContent.includes('Draft'), 'the list does not mark the reply draft')
    row('Refine the launch page').click(); await wait(() => composer().value === 'Reply draft', 'reply draft was discarded')
    fill(''); await sleep(30)
    ask(); await wait(() => welcome() && heading() === 'Chat', 'asking from elsewhere kept a finished chat')
  })
  await test('Older chats load in pages as the list scrolls, without losing the active conversation', async () => {
    const list = () => dock().querySelector('nav[aria-label="Chats"]')
    const from = (await state()).requests.length
    assert(historyRows().length === 30, 'more than one page listed before scrolling')
    // Scrolled to the end, and back a little, until the page arrives: the list asks when its end comes into view, and
    // a scroll while it still lays out the page before, on a busy machine, brings nothing new into view.
    let turn = 0
    const scrolled = (count) => async () => {
      for (const end = Date.now() + 20000; historyRows().length !== count; await sleep(150)) {
        if (Date.now() > end) return false
        list().scrollTop = turn++ % 2 ? list().scrollHeight - list().clientHeight - 400 : list().scrollHeight
      }
      return true
    }
    assert(await scrolled(60)(), 'second page did not load')
    assert(await scrolled(70)(), 'last page did not load')
    list().scrollTop = list().scrollHeight; await sleep(300)
    const offsets = (await state()).requests.slice(from).filter(r => r.ability === 'threads/list').map(r => r.input.offset)
    assert(offsets.includes(30) && offsets.includes(60) && offsets.every(offset => [30, 60].includes(offset)) && historyRows().length === 70, 'paging asked for the wrong pages: ' + offsets)
    row('Earlier conversation 65').click(); await wait(() => heading() === 'Earlier conversation 65' && dock().textContent.includes('Reply for chat-65'), 'older chat did not open')
    control('All Chats').click(); await wait(() => row('Earlier conversation 65'), 'All Chats did not list the chats')
    assert(historyRows().length === 70 && row('Earlier conversation 65').getAttribute('aria-current') === 'page', 'active chat lost its place in the list')
    control('Back to Chat').click(); await wait(() => dock().textContent.includes('Reply for chat-65'), 'Back to Chat did not return to the thread')
  })
  await test('Late history responses cannot replace the selected conversation', async () => {
    navigate('/chat/slow'); await sleep(50); await open('chat-2'); await sleep(600)
    assert(dock().textContent.includes('Reply for chat-2') && !dock().textContent.includes('Reply for slow'), 'late load replaced selected chat')
    navigate('/chat/slow'); await sleep(50); newChat(); await sleep(650)
    assert(location.pathname === '/admin/chat/new' && welcome() && !dock().querySelector('.cms-thread-scroll svg[class*="spin_"]'), 'new chat stuck loading')
  })
  await test('Full size and back never leave the page, so unsaved changes stay without asking', async () => {
    navigate('/content/pages'); await wait(() => !isFull() && isOpen() && screen() === 'Pages', 'leaving the chat URL did not dock the chat')
    const unblock = blockNavigation(() => 'Unsaved fixture'), original = window.confirm
    let asked = 0
    window.confirm = () => { asked++; return false }
    try {
      control('Full Size').click(); await wait(() => isFull() && location.pathname === '/admin/chat/new', 'Full Size did not open the chat URL')
      assert(screen() === 'Pages' && document.querySelector('.cms-sheet').inert, 'the page underneath was replaced or stays interactive')
      control('Back to the Page').click(); await wait(() => !isFull() && isOpen() && location.pathname === '/admin/content/pages', 'Back to the Page did not return to the page')
      assert(asked === 0 && !document.querySelector('[role="dialog"], [role="alertdialog"]') && screen() === 'Pages', 'the chat asked about leaving a page it never left')
    } finally { window.confirm = original; unblock() }
  })
  await test('Detached, the chat floats over the page, and closing it brings the Chat button back with the focus on it', async () => {
    control('Detach').click(); await wait(() => dock().hasAttribute('data-floating'), 'Detach did not float the chat')
    assert(!toggle(), 'the Chat button stayed in the top bar beside a floating chat')
    control('Close').click(); await wait(() => !isOpen() && toggle() && document.activeElement === toggle(), 'closing the floating chat did not bring the Chat button back with the focus on it')
    toggle().click(); await wait(() => isOpen() && !toggle(), 'the Chat button did not reopen the floating chat')
    control('Dock Beside the Page').click(); await wait(() => !dock().hasAttribute('data-floating') && !toggle(), 'chat did not dock again')
  })
  await test('The shortcut opens the chat, keeps it from the page, and puts it away from inside', async () => {
    control('Close').click(); await wait(() => !isOpen(), 'Close failed')
    document.activeElement.blur(); shortcut()
    await wait(() => isOpen() && document.activeElement === composer(), 'shortcut did not open the chat into its composer')
    fill('Keyboard draft'); await sleep(30)
    document.activeElement.blur(); shortcut(); await sleep(60)
    assert(isOpen() && composer().value === 'Keyboard draft', 'shortcut from the page toggled the chat or cleared its draft')
    await wait(() => document.activeElement === composer(), 'shortcut from the page did not bring the focus back')
    shortcut(); await wait(() => !isOpen(), 'shortcut inside the chat did not put it away')
    shortcut(); await wait(() => isOpen() && composer().value === 'Keyboard draft', 'shortcut did not reopen the chat with its draft')
    await wait(() => document.activeElement === composer(), 'reopened chat has no focus')
    composer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(() => !isOpen(), 'Escape did not put the chat away')
    shortcut(); await wait(() => isOpen(), 'shortcut did not reopen the chat'); fill(''); await sleep(30)
  })
  await test('⌘K opens the chat with / and its menu, and Esc puts both away again', async () => {
    control('Close').click(); await wait(() => !isOpen(), 'Close failed')
    document.activeElement.blur(); search()
    await wait(() => isOpen() && document.activeElement === composer() && composer().value === '/', '⌘K did not open the chat with / in its composer')
    await wait(settled, 'the / menu did not open')
    const said = menu().textContent
    for (const label of ['Go To', 'Posts', 'Commands', 'Customize Sidebar…', 'Keyboard Shortcuts']) assert(said.includes(label), 'the menu has no ' + label)
    assert(!said.includes('Pages') || lines().every(el => el.textContent !== 'Pages'), 'the screen on view is offered as a place to go')
    assert(chosenLine() === lines()[0], 'the first line is not chosen')
    assert(composer().selectionStart === 1 && composer().selectionEnd === 1, 'the caret is not after the /')
    press('Escape')
    await wait(() => !isOpen() && composer().value === '', 'Esc did not put the menu and the chat away')
  })
  await test('What was written stays: the / goes on its own line, and picking a place goes there and gives the draft back', async () => {
    toggle().click(); await wait(() => isOpen(), 'chat did not open')
    fill('Keep this thought  '); await sleep(30)
    control('Close').click(); await wait(() => !isOpen(), 'Close failed')
    document.activeElement.blur(); search()
    await wait(() => composer().value === 'Keep this thought\\n/' && settled(), '⌘K did not add a / line after the draft')
    fill('Keep this thought\\n/pos'); await wait(() => chosenLine()?.textContent === 'Posts', 'the closest place is not first')
    press('Enter')
    await wait(() => screen() === 'Posts' && !isOpen(), 'picking a place did not go there and put the chat away')
    assert(document.activeElement !== toggle(), 'the Chat button took the focus from the place opened')
    toggle().click(); await wait(() => isOpen() && composer().value === 'Keep this thought', 'the draft did not come back as it was')
  })
  await test('⌘K again from inside, a click away, or the sidebar’s Search', async () => {
    search(composer()); await wait(() => composer().value === 'Keep this thought\\n/' && settled(), '⌘K in an open chat did not open the menu')
    search(composer()); await wait(() => composer().value === 'Keep this thought' && !menu(), '⌘K again did not put the menu away')
    assert(isOpen(), 'the chat, open before, was put away with the menu')
    fill(''); await sleep(30)
    control('Close').click(); await wait(() => !isOpen(), 'Close failed')
    const button = document.querySelector('.cms-side-panel button[aria-label="Search"]')
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); button.click()
    await wait(() => isOpen() && composer().value === '/' && settled(), 'Search did not open the menu in the chat')
    document.querySelector('[data-cms-screen] h1').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await wait(() => !isOpen() && composer().value === '', 'a click on the page did not let go of the menu')
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); button.click()
    await wait(() => isOpen() && settled(), 'Search did not open the menu again')
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); button.click(); await sleep(80)
    assert(!isOpen() && composer().value === '', 'Search again did not put the menu away')
  })
  await test('The frame’s commands run from the menu, and only the theme not in use is offered', async () => {
    const before = document.documentElement.dataset.theme, other = before === 'dark' ? 'Light' : 'Dark'
    search(); await wait(() => settled(), 'menu did not open')
    fill('/mode'); await wait(() => lines().some(el => el.textContent.includes('Switch to ' + other + ' Mode')), 'the other theme is not offered')
    assert(!lines().some(el => el.textContent.includes('Switch to ' + (other === 'Dark' ? 'Light' : 'Dark') + ' Mode')), 'the theme in use is offered')
    fill('/keyboard'); await wait(() => chosenLine()?.textContent.startsWith('Keyboard Shortcuts'), 'Keyboard Shortcuts not first')
    assert(chosenLine().querySelector('kbd'), 'a command with a key does not show it')
    press('Enter')
    await wait(() => document.querySelector('[role="dialog"]')?.textContent.includes('Keyboard Shortcuts') && !isOpen(), 'the command did not run, or left the chat out')
    const shown = [...document.querySelectorAll('[role="dialog"] li')].map(li => li.firstChild.textContent)
    assert(shown.filter(label => label === 'Keyboard Shortcuts').length === 1 && shown.includes('Search and Commands'), 'the overlay lists a key twice or misses ⌘K: ' + shown.join(', '))
    search(); await sleep(80)
    assert(!isOpen() && document.querySelector('[role="dialog"]'), '⌘K opened the chat under a dialog')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(() => !document.querySelector('[role="dialog"]'), 'the overlay did not close')
    navigate('/content/pages'); await wait(() => screen() === 'Pages', 'CMS navigation failed')
  })
  await test('Browser back and forward restore the selected chat', async () => {
    await open('chat-1'); await open('chat-2'); history.back(); await wait(() => dock().textContent.includes('Reply for chat-1') && heading() === 'Refine the launch page', 'back failed')
    history.forward(); await wait(() => dock().textContent.includes('Reply for chat-2'), 'forward failed')
  })
  await test('A failed first request clears its loading state in the list of chats', async () => {
    newChat(); await wait(() => location.pathname.endsWith('/chat/new') && welcome(), 'new chat failed')
    fill('failed request'); await sleep(30); composer().form.requestSubmit()
    await wait(() => spinning(), 'pending request missing')
    await wait(() => dock().textContent.includes('Request fixture failure'), 'request error missing')
    assert(!spinning(), 'failed request kept spinning')
    newChat()
    await wait(() => welcome() && !dock().textContent.includes('Request fixture failure') && !dock().textContent.includes('failed request'), 'New Chat kept the failed thread')
  })
  await test('First send appears immediately, stays loading through streaming, becomes one saved chat and is named', async () => {
    newChat(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    fill('A new conversation'); await sleep(30); composer().form.requestSubmit()
    await wait(() => spinning(), 'pending request missing before response')
    const pending = spinning().closest('.cms-sidebar-row')
    assert(location.pathname.endsWith('/chat/new'), 'pending row waited for conversation ID')
    assert(pending.textContent.includes('A new conversation'), 'pending row has no request title')
    assert(!pending.textContent.includes('Draft'), 'submitted request still marked as draft')
    await wait(() => location.pathname.endsWith('/chat/created-1') && row('A new conversation'), 'new conversation missing from the list')
    assert(row('A new conversation').querySelector('[role="status"]'), 'loading stopped before stream finished')
    assert([...dock().querySelectorAll('nav[aria-label="Chats"] .cms-sidebar-row-main')].filter(el => el.textContent === 'A new conversation').length === 1, 'duplicate pending and saved rows')
    await wait(() => dock().textContent.includes('Streamed answer'), 'stream did not finish')
    await wait(() => !spinning(), 'completed request kept spinning')
    await wait(() => heading() === 'Launch page ideas' && row('Launch page ideas') && !row('A new conversation'), 'chat was not named after its first reply')
    const { created, requests } = await state()
    assert(created === 1, 'duplicate conversation created')
    assert(requests.find(r => r.kind === 'chat' && r.input.message === 'A new conversation').input.context.path === '/content/pages', 'CMS context lost')
    assert(requests.some(r => r.ability === 'threads/rename' && r.input.id === 'created-1'), 'naming was not asked for')
  })
  await test('Each chat shows its own model, and a pick is sent, kept and remembered for new chats', async () => {
    const picker = () => dock().querySelector('[aria-label^="Model: "]')
    const shows = async (name, message) => wait(() => picker()?.getAttribute('aria-label') === 'Model: ' + name, message)
    await open('chat-3'); await shows('Claude Haiku 5.5', 'saved model not shown')
    await open('chat-6'); await shows('Claude Opus 5.5', 'chat saved with a retired model did not fall back to the default')
    await open('chat-5'); await shows('Claude Opus 5.5', 'chat without a pick did not show the default')
    picker().click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].length === 4, 'model menu missing')
    assert([...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent.includes('Claude Opus 5.5')).querySelector('svg'), 'current model not checked')
    ;[...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent.startsWith('Claude Sonnet 5.5')).click()
    await shows('Claude Sonnet 5.5', 'pick not shown')
    fill('Use the faster model'); await sleep(30); composer().form.requestSubmit()
    await wait(() => dock().textContent.includes('Streamed answer'), 'stream did not finish')
    const { requests } = await state()
    assert(requests.filter(r => r.kind === 'chat').at(-1).input.agent?.model === 'claude-sonnet-5-5', 'turn did not send the picked model')
    assert(requests.some(r => r.ability === 'account/update' && r.input.preferences['assistant.model'] === 'claude-sonnet-5-5'), 'pick was not remembered')
    await open('chat-3'); await shows('Claude Haiku 5.5', 'a pick leaked into another chat')
    await open('chat-5'); await shows('Claude Sonnet 5.5', 'pick was lost when switching chats')
    newChat(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    await shows('Claude Sonnet 5.5', 'new chat did not start with the last pick')
    await open('created-1')
  })
  await test('Switching chats during a stream cannot leak late text into the new chat', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => control('Stop'), 'stream did not start')
    await open('chat-2'); await sleep(1700)
    assert(!dock().textContent.includes('LATE STREAM') && dock().textContent.includes('Reply for chat-2'), 'old stream leaked')
    assert(!spinning(), 'aborted stream kept spinning')
  })
  await test('Stopping a reply clears its spinner in the list immediately', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => row('Draft the autumn newsletter')?.querySelector('[role="status"]'), 'reply spinner missing')
    control('Stop').click(); await sleep(30)
    assert(!spinning(), 'stopped reply kept spinning')
    assert(dock().textContent.includes('Stopped.') && control('Send'), 'stop did not end the turn')
  })
  await test('A reply keeps streaming with the chat put away, and the top bar shows it working', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => control('Stop'), 'stream did not start')
    navigate('/content/pages'); await wait(() => !isFull() && isOpen() && screen() === 'Pages', 'CMS did not open')
    control('Close').click(); await wait(() => !isOpen() && toggle(), 'Close failed')
    assert(toggle().querySelector('[role="status"][aria-label="Working…"]'), 'closed chat does not show its reply working')
    await wait(() => !toggle().querySelector('[role="status"]'), 'finished reply kept the top bar spinning')
    toggle().click(); await wait(() => isOpen(), 'chat did not reopen')
    assert(dock().textContent.includes('LATE STREAM') && heading() === 'Draft the autumn newsletter', 'stream was lost while the chat was put away')
  })
  await test('An older deep-linked chat opens by name without loading every history page', async () => {
    queryClient.removeQueries({ queryKey: ['threads/list'] })
    const from = (await state()).requests.length
    await open('chat-65')
    // Older than the first page of chats, it is listed at the top all the same, as the one on view.
    await wait(() => heading() === 'Earlier conversation 65' && historyRows().length === 31 && historyRows()[0].getAttribute('aria-current') === 'page' && row('Earlier conversation 65'), 'deep-linked chat did not open by name, listed as the one on view')
    await sleep(200)
    const listed = (await state()).requests.slice(from).filter(r => r.ability === 'threads/list')
    assert(listed.length > 0 && listed.every(r => (r.input.offset ?? 0) === 0), 'opening an older chat loaded more history')
  })
  await test('Message copy preserves the full text and confirms success', async () => {
    await open('chat-5')
    window.__copied = []
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => window.__copied.push(text) } })
    const copies = dock().querySelectorAll('[aria-label="Copy message"]')
    assert(copies.length === 2, 'copy is missing on a user or assistant message')
    copies[0].click(); await sleep(40)
    assert(window.__copied[0] === 'Please review this page' && dock().querySelector('[aria-label="Copied"]'), 'copy did not preserve user text or confirm success')
    copies[1].click(); await sleep(40)
    assert(window.__copied[1] === 'Reply for chat-5', 'assistant copy included unrelated content')
  })
  await test('Editing supports cancellation and preserves the separate composer draft', async () => {
    fill('Keep composer draft'); await sleep(30)
    control('Edit message').click(); await sleep(40)
    const editor = dock().querySelector('textarea[aria-label="Edit message"]')
    assert(editor.value === 'Please review this page' && document.activeElement === editor, 'edit did not load and focus the original')
    assert(button('Save & Send').disabled, 'unchanged edit can be submitted')
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(40)
    assert(!dock().querySelector('textarea[aria-label="Edit message"]') && composer().value === 'Keep composer draft', 'cancel changed the message or reply draft')
    assert(isOpen() && isFull(), 'Escape in the editor also put the chat away')
    assert(document.activeElement === control('Edit message'), 'cancel did not restore focus')
  })
  await test('A failed edit keeps its draft and the original conversation available', async () => {
    control('Edit message').click(); await sleep(30)
    const editor = dock().querySelector('textarea[aria-label="Edit message"]')
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'failed request')
    editor.dispatchEvent(new Event('input', { bubbles: true })); await sleep(30)
    button('Save & Send').click()
    await wait(() => dock().querySelector('[role="alert"]')?.textContent.includes('Request fixture failure'), 'edit error missing')
    assert(editor.value === 'failed request' && dock().textContent.includes('Reply for chat-5'), 'failed edit lost the draft or previous reply')
    button('Cancel').click(); await sleep(30)
    assert(dock().textContent.includes('Please review this page'), 'failed edit replaced the original prompt')
    control('Dismiss').click()
  })
  await test('Saving an edit replaces the old prompt and response and survives reload', async () => {
    control('Edit message').click(); await sleep(30)
    const editor = dock().querySelector('textarea[aria-label="Edit message"]')
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'Revised prompt')
    editor.dispatchEvent(new Event('input', { bubbles: true })); await sleep(30)
    button('Save & Send').click()
    await wait(() => dock().textContent.includes('Revised answer') && !control('Stop'), 'edited answer did not complete')
    assert(!dock().textContent.includes('Reply for chat-5') && !dock().textContent.includes('Please review this page'), 'old branch remained')
    assert(composer().value === 'Keep composer draft', 'edit overwrote the composer draft')
    const { requests } = await state()
    assert(JSON.stringify(requests.findLast(r => r.kind === 'chat').input.edit) === JSON.stringify({ turn: 'u-0', original: 'Please review this page' }), 'edit target was not sent')
    await open('chat-1')
    navigate('/chat/chat-5'); await wait(() => dock().textContent.includes('Revised answer') && dock().textContent.includes('Revised prompt'), 'edit did not survive reload')
    assert(!dock().textContent.includes('Please review this page'), 'reload brought back the old prompt')
  })
  const deletionDialog = async () => {
    control('Chat Actions').click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].some(el => el.textContent === 'Delete Chat'), 'delete action missing')
    ;[...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent === 'Delete Chat').click()
    await wait(() => document.querySelector('[role="alertdialog"]'), 'confirmation missing')
  }
  const dialogAction = label => [...document.querySelectorAll('[role="alertdialog"] button')].find(el => el.textContent === label).click()
  await test('Canceling deletion preserves the saved chat and its draft', async () => {
    await open('chat-1'); fill('Keep this draft'); await sleep(30)
    await deletionDialog(); dialogAction('Cancel'); await sleep(300)
    assert(location.pathname.endsWith('/chat/chat-1') && composer().value === 'Keep this draft', 'cancel discarded the chat or draft')
    assert(!(await state()).requests.some(r => r.ability === 'threads/delete'), 'cancel sent a deletion')
  })
  await test('A failed deletion reports its error and preserves the conversation', async () => {
    await open('chat-2'); fill('Preserve on failure'); await sleep(30)
    await deletionDialog(); dialogAction('Delete Chat')
    await wait(() => document.body.textContent.includes('Deletion fixture failure'), 'failure was not reported'); await sleep(300)
    assert(location.pathname.endsWith('/chat/chat-2') && composer().value === 'Preserve on failure' && row('Draft the autumn newsletter'), 'failure discarded the conversation')
  })
  await test('Confirmed deletion clears its history and draft and returns to New Chat', async () => {
    await open('chat-1'); await deletionDialog(); dialogAction('Delete Chat')
    await wait(() => location.pathname.endsWith('/chat/new') && historyRows().length && !row('Refine the launch page'), 'deleted chat remained selected or in history')
    await wait(() => document.body.textContent.includes('Chat deleted'), 'deletion was not confirmed')
    await sleep(300)
    assert(!control('Chat Actions') && composer().value === '' && welcome(), 'empty chat retained a delete menu or deleted draft')
  })
  await test('A delayed deletion does not pull the chat back from another screen', async () => {
    await open('chat-4'); await deletionDialog(); dialogAction('Delete Chat')
    navigate('/content/pages'); await wait(() => !isFull() && screen() === 'Pages', 'CMS did not open')
    await sleep(600)
    assert(location.pathname === '/admin/content/pages' && !isFull(), 'deletion pulled the user back into the full-size chat')
    assert(heading() === 'Chat' && welcome(), 'the dock kept showing the deleted chat')
  })
  await test('Generated UI uses the shared view renderer with metrics, tables, widgets and plugin components', async () => {
    await open('surfaces')
    await wait(() => dock().textContent.includes('A live record from the plugin'), 'shared widget did not render')
    assert(dock().textContent.includes('Published pages') && dock().textContent.includes('Autumn launch'), 'generated data was not rendered')
    assert(dock().textContent.includes('Context from a registered plugin'), 'custom registry component missing')
    assert(dock().querySelector('[role="table"]') && dock().querySelector('svg[viewBox="0 0 100 30"]'), 'shared table or trend missing')
  })
  await test('Generated actions use approval and stay consumed after history reload', async () => {
    button('Publish selected page').click()
    await wait(() => button('Publish page'), 'component action did not reach approval')
    assert(dock().textContent.includes('After reading site content'), 'untrusted approval has no warning')
    assert(document.activeElement === button('Decline'), 'the approval does not start on its safe answer')
    assert(button('Publish selected page').disabled, 'used surface stayed interactive')
    const request = (await state()).requests.findLast(r => r.kind === 'chat').input
    assert(JSON.stringify(request.action) === JSON.stringify({ tool: 'surface-tool', node: 'action', name: 'submit' }), 'browser sent generated ability inputs')
    assert(!('message' in request), 'click was sent as a prompt')
    button('Publish page').click()
    await wait(() => dock().textContent.includes('Published through the normal approval flow'), 'approval failed')
    await open('chat-3')
    await open('surfaces')
    await wait(() => button('Publish selected page'), 'surface did not reload')
    assert(button('Publish selected page').disabled, 'history replay re-enabled a consumed action')
  })
  await test('Unloading and restoring a plugin updates its generated components', async () => {
    const registrations = unregister('fixture')
    await wait(() => dock().textContent.includes('This component is no longer available'), 'unloaded component did not get a fallback')
    assert(!dock().textContent.includes('A live record from the plugin'), 'unloaded widget remained visible')
    reregister('fixture', registrations)
    await wait(() => dock().textContent.includes('A live record from the plugin'), 'widget did not return after reactivation')
  })
  await test('Live surface events replace earlier presentations without duplicating a generated interface', async () => {
    fill('show generated interface'); control('Send').click()
    await wait(() => dock().textContent.includes('Live generated overview'), 'live surface did not render')
    await wait(() => !control('Stop'), 'surface stream did not finish')
    assert(!dock().textContent.includes('Preparing generated overview'), 'replaced surface remained visible')
    assert([...dock().querySelectorAll('h2')].filter(el => el.textContent === 'Live generated overview').length === 1, 'surface update duplicated the interface')
  })
  await test('A command picked with / runs at once, or asks for what it needs right in the composer', async () => {
    newChat(); await wait(() => welcome(), 'new chat failed')
    fill('/build site'); await sleep(30)
    await wait(() => dock().querySelector('[role="option"]')?.textContent.includes('Build Site'), 'the ability is not offered')
    composer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await wait(() => dock().textContent.includes('Built the site'), 'a command without input did not run at once')
    const ran = (await state()).requests.findLast(r => r.kind === 'chat').input
    assert(JSON.stringify(ran.command) === JSON.stringify({ ability: 'site/build', input: {}, label: 'Build Site' }) && !('message' in ran), 'the command was sent as words')
    fill('/create entry'); await sleep(30)
    await wait(() => dock().querySelector('[role="option"]')?.textContent.includes('Create Entry'), 'the ability is not offered')
    composer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await wait(() => dock().querySelector('form[aria-label="Create Entry"] input'), 'its form did not open in the composer')
    const inputs = [...dock().querySelectorAll('form[aria-label="Create Entry"] input')]
    assert(inputs.length === 2, 'the form does not ask for what is required')
    for (const [input, value] of [[inputs[0], 'pages'], [inputs[1], 'Refused title']]) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }
    await sleep(30); button('Run').click()
    await wait(() => dock().textContent.includes('Title fixture refusal'), 'a refusal is not said on its field')
    assert(dock().querySelector('form[aria-label="Create Entry"]'), 'the form closed on a refusal')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inputs[1], 'Summer Menu'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }))
    await sleep(30); button('Run').click()
    await wait(() => dock().textContent.includes('Created “Summer Menu”') && !dock().querySelector('form[aria-label="Create Entry"]'), 'the command did not answer with its view')
    assert(button('Publish'), 'the answer has no next step')
    button('Publish').click()
    await wait(() => dock().textContent.includes('Published “Summer Menu”'), 'an answer’s button did not run as a turn of the thread')
  })
  await test('A bare / stays short, an ability that needs a raw id is not offered, and an answer’s form asks in the composer', async () => {
    fill('/'); await sleep(30)
    await wait(() => dock().querySelector('[role="listbox"]') && !dock().textContent.includes('Looking…'), 'the list did not open')
    assert(!dock().querySelector('[role="listbox"]').textContent.includes('Build Site'), 'a bare / lists every ability')
    fill('/get form'); await sleep(300)
    assert(!dock().querySelector('[role="listbox"]')?.textContent.includes('Get Form By Id'), 'an ability that needs a raw id is offered')
    fill(''); await sleep(30)
    button('Add to Menu').click()
    await wait(() => dock().querySelector('form[aria-label="Add to Menu"]'), 'the answer’s form did not open in the composer')
    assert(!document.querySelector('[role="dialog"]'), 'the answer’s form opened as a dialog')
    dock().querySelector('form[aria-label="Add to Menu"] button[type="submit"]').click()
    await wait(() => dock().textContent.includes('Added to footer'), 'the form did not run its ability with what it asked')
    const sent = (await state()).requests.findLast(r => r.kind === 'chat').input.command
    assert(JSON.stringify(sent.input) === JSON.stringify({ menu: 'footer', entry: 'e1' }) && sent.detail === 'Footer', 'the form’s answers or their words did not go with it: ' + JSON.stringify(sent))
    assert(dock().textContent.includes('Add to Menu') && dock().textContent.includes('Footer'), 'the turn does not say what was chosen in words')
  })
  await test('A button for something gone says so once, in the thread', async () => {
    const toasts = () => [...document.querySelectorAll('[data-sonner-toast], [role="status"]')].filter(el => el.textContent.includes('no longer exists')).length
    button('Publish Again').click()
    await wait(() => dock().querySelector('[role="alert"]')?.textContent.includes('This entry no longer exists.'), 'a stale button does not say what is gone')
    await sleep(200)
    assert(toasts() === 0, 'the error was said twice, in a toast too')
    control('Dismiss').click()
  })
  await test('A chat is renamed in place, from its menu', async () => {
    await open('chat-1')
    control('Chat Actions').click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].some(el => el.textContent === 'Rename Chat'), 'Rename Chat missing')
    ;[...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent === 'Rename Chat').click()
    await wait(() => dock().querySelector('header input'), 'the name did not become a field')
    const field = dock().querySelector('header input')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, 'Launch plan'); field.dispatchEvent(new Event('input', { bubbles: true }))
    field.form.requestSubmit()
    await wait(() => heading() === 'Launch plan', 'the new name does not show')
    assert((await state()).requests.some(r => r.ability === 'threads/rename' && r.input.title === 'Launch plan' && r.input.id === 'chat-1'), 'the rename was not saved')
  })
  await test('An agent that opens a place moves the admin there as it answers, never on a reload, and its links stay in the admin', async () => {
    navigate('/content/pages'); await wait(() => screen() === 'Pages', 'CMS navigation failed')
    if (!isOpen()) toggle().click()
    await wait(() => isOpen() && !isFull(), 'the thread is not docked')
    newChat(); await wait(() => welcome(), 'new chat failed')
    window.__alive = 'same page'
    fill('open the posts'); await sleep(30); composer().form.requestSubmit()
    await wait(() => screen() === 'Posts' && location.pathname === '/admin/content/posts', 'an opened place did not open')
    assert(isOpen() && !isFull(), 'the thread did not stay beside the page')
    await wait(() => dock().textContent.includes('Opened') && [...dock().querySelectorAll('a')].some(a => a.textContent === 'Posts'), 'the tool row does not say what it opened')
    // A link to a place of the admin, written either way, opens in the admin without a reload.
    const link = [...dock().querySelectorAll('a')].find(a => a.textContent === 'the pages')
    assert(link && link.getAttribute('href') === '/admin/content/pages' && !link.target, 'an admin path in Markdown is no link in the admin')
    link.click(); await wait(() => screen() === 'Pages', 'the Markdown link did not open the place')
    const code = [...dock().querySelectorAll('a code')].find(c => c.textContent === '/admin/content/posts')
    assert(code, 'an admin path written as code is no link')
    code.closest('a').click(); await wait(() => screen() === 'Posts', 'the code link did not open the place')
    assert(window.__alive === 'same page', 'the admin reloaded')
    // Reopening the thread replays it, and goes nowhere.
    navigate('/content/pages'); await wait(() => screen() === 'Pages', 'CMS navigation failed')
    navigate('/chat/opened'); await wait(() => isFull() && heading() === 'Opened before' && dock().textContent.includes('Opened'), 'the thread did not load'); await sleep(500)
    assert(location.pathname === '/admin/chat/opened' && screen() === 'Pages', 'replaying a thread moved the admin')
    navigate('/content/pages'); await wait(() => !isFull(), 'the thread did not dock again')
  })
  await test('Without an agent the thread searches and runs commands, and nothing mentions AI', async () => {
    await fetch('/__test/agent', { method: 'POST', body: 'off' }); await loadManifest()
    newChat(); await wait(() => welcome(), 'new chat failed')
    await wait(() => composer().placeholder === 'Search, or / for a command', 'the composer still offers to ask')
    assert(!dock().querySelector('[aria-label="Add Context"]') && !dock().querySelector('[aria-label^="Model: "]'), 'context or a model picker without an agent')
    assert(!/Claude|\bAI\b|assistant/i.test(dock().textContent), 'the thread mentions AI')
    assert(dock().querySelector('[data-mode="local"]')?.textContent === 'Local search', 'the composer does not say it is local')
    fill('Pricing'); await sleep(30); composer().form.requestSubmit()
    await wait(() => dock().textContent.includes('Found Pricing'), 'the search did not answer')
    const sent = (await state()).requests.findLast(r => r.kind === 'chat').input
    assert(sent.search === 'Pricing' && !('message' in sent) && !('context' in sent), 'plain words were not a search')
    await fetch('/__test/agent', { method: 'POST', body: 'on' }); await loadManifest()
    newChat(); await wait(() => dock().querySelector('[data-mode="ai"]')?.textContent === 'Assistant', 'the composer does not say the AI answers')
  })
  await test('Words that match nothing are asked, entries are found, and Enter typed early waits for the lines', async () => {
    newChat(); await wait(() => welcome(), 'new chat failed')
    search(composer()); await wait(() => settled(), 'menu did not open')
    fill('/hello there'); await wait(() => chosenLine()?.textContent.startsWith('Ask Claude'), 'asking is not the first line for words that match nothing')
    assert(lines().some(el => el.textContent === 'Search for “hello there”'), 'search is not offered')
    fill('/launch'); await wait(() => lines().some(el => el.textContent.startsWith('Autumn launch')), 'content is not found')
    assert(menu().textContent.indexOf('Ask Claude') > menu().textContent.indexOf('Autumn launch'), 'asking comes before what was found')
    fill('/build si'); press('Enter')
    await wait(() => dock().textContent.includes('Built the site'), 'Enter before the lines were in did not pick the first')
    assert(isOpen() && composer().value === '', 'a command answered in the thread put the chat away or left its /')
    assert(!(await state()).requests.some(r => r.kind === 'chat' && r.input.message?.startsWith('/')), 'what followed / was sent as words')
    search(composer()); await wait(() => settled(), 'menu did not open')
    fill('/what should I write next'); await wait(() => chosenLine()?.textContent.startsWith('Ask Claude'), 'ask not first')
    press('Enter')
    await wait(() => [...dock().querySelectorAll('.cms-thread-bubble')].some(el => el.textContent === 'what should I write next'), 'asking did not send the words in the thread')
    assert(isOpen(), 'asking put the chat away')
    await wait(() => !dock().querySelector('[aria-label="Stop"]'), 'the answer did not finish')
    newChat(); await wait(() => welcome(), 'new chat failed')
  })
  output.textContent += '\\nAll ' + results.length + ' chat checks passed.'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results }) })
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack }) })
}
`
serve('Chat', async (req, res, url) => {
  if (url.pathname === '/api/admin/manifest') return json(res, 200, { data: manifest })
  if (url.pathname === '/__test/state') return json(res, 200, { created, requests })
  if (url.pathname === '/__test/agent') { manifest.config = { workspace: { agent: (await new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => r(b)) })) === 'on' ? { name: 'assistant', label: 'Claude' } : null } }; return json(res, 200, {}) }
  if (url.pathname === '/fixture.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(fixture) }
  if (url.pathname.startsWith('/api/admin/abilities/')) {
    const ability = url.pathname.slice('/api/admin/abilities/'.length), input = await body(req)
    requests.push({ ability, input })
    if (ability === 'assistant/status') return json(res, 200, { data: { configured: true, model: 'claude-opus-5-5', models } })
    if (ability === 'account/update') return json(res, 200, { data: {} })
    if (ability === 'assistant/skills') return json(res, 200, { data: [] })
    if (ability === 'entries/get' || ability === 'collections/get') return json(res, 404, { error: { message: 'Not in this fixture', type: 'not_found' } })
    if (ability === 'content/search') return json(res, 200, { data: /launch/i.test(input.query) ? [{ id: 'e-launch', collection: 'pages', locale: 'en', title: 'Autumn launch', slug: 'autumn-launch', uri: '/autumn-launch', status: 'draft', displayStatus: 'draft', parentId: null, position: 0, authorId: null, author: null, version: '1' }] : [] })
    if (ability === 'threads/list') return json(res, 200, { data: chats.slice(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 30)) })
    if (ability === 'threads/rename' && input.title) {
      const chat = chats.find(c => c.id === input.id)
      if (chat) chat.title = input.title
      return json(res, 200, { data: { id: input.id, title: input.title } })
    }
    if (ability === 'threads/rename') {
      const chat = chats.find(c => c.id === input.id)
      if (chat && chat.title === 'A new conversation') chat.title = 'Launch page ideas'
      return json(res, 200, { data: { title: chat?.title ?? 'Content overview' } })
    }
    if (ability === 'threads/delete') {
      await new Promise(r => setTimeout(r, input.id === 'chat-4' ? 450 : 50))
      if (input.id === 'chat-2') return json(res, 422, { error: { message: 'Deletion fixture failure', type: 'invalid_input' } })
      chats = chats.filter(chat => chat.id !== input.id)
      return json(res, 200, { data: { deleted: true } })
    }
    if (ability === 'threads/get') {
      await new Promise(r => setTimeout(r, input.id === 'slow' ? 500 : 25))
      if (input.id === 'opened') return json(res, 200, { data: { id: 'opened', title: 'Opened before', agent: { model: null }, awaiting: [], turns: [{ id: 'u-o', role: 'user', kind: 'message', text: 'open the posts' }, { id: 'a-o', role: 'answer', agent: 'assistant', parts: [{ type: 'tool', id: 'open-0', name: 'admin__open', label: 'Open in Admin', ability: 'admin/open', status: 'ok', output: JSON.stringify({ to: '/content/posts', label: 'Posts' }) }] }] } })
      return json(res, 200, { data: { id: input.id, title: chats.find(c => c.id === input.id)?.title ?? 'Slow chat', agent: { model: { 'chat-3': 'claude-haiku-5-5', 'chat-6': 'claude-retired' }[input.id] ?? null }, awaiting: [], turns: editedItems.get(input.id) ?? [{ id: 'u-0', role: 'user', kind: 'message', text: 'Please review this page' }, { id: 'a-0', role: 'answer', agent: 'assistant', parts: [{ type: 'text', text: 'Reply for ' + input.id }, ...(input.id === 'surfaces' ? [{ type: 'tool', id: 'surface-tool', name: 'ui_present', label: 'Present interface', status: 'ok', surface, used: usedSurfaces.has(input.id) }] : [])] }] } })
    }
    if (ability === 'workspace/commands') return json(res, 200, { data: [{ name: 'entries/create', label: 'Create Entry', group: 'Content', icon: 'file', input: { type: 'object', properties: { collection: { type: 'string' }, title: { type: 'string' } }, required: ['collection', 'title'] }, destructive: false, readOnly: false }, { name: 'site/build', label: 'Build Site', group: 'Site', icon: 'globe', input: { type: 'object', properties: {} }, destructive: false, readOnly: false }, { name: 'forms/get', label: 'Get Form By Id', group: 'Forms', icon: 'file', input: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }, destructive: false, readOnly: true }] })
    throw new Error('Unexpected ability ' + ability)
  }
  if (url.pathname === '/api/admin/workspace/turn') {
    const input = await body(req); requests.push({ kind: 'chat', input })
    if (!input.thread) await new Promise(r => setTimeout(r, 400))
    if (input.message === 'failed request') return json(res, 422, { error: { message: 'Request fixture failure', type: 'invalid_input' } })
    if (input.command?.ability === 'entries/publish' && input.command.input.id === 'gone') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      res.write(`event: error\ndata: ${JSON.stringify({ type: 'not_found', message: 'This entry no longer exists.' })}\n\n`); return res.end()
    }
    if (input.command?.input?.title === 'Refused title') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      res.write(`event: error\ndata: ${JSON.stringify({ type: 'invalid_input', message: 'Title fixture refusal', details: { title: 'Title fixture refusal' } })}\n\n`); return res.end()
    }
    let id = input.thread
    if (!id) { id = `created-${++created}`; chats.unshift({ id, title: input.message ?? input.search ?? input.command?.label, updatedAt: new Date().toISOString() }) }
    if (input.command || input.search) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      const send = (name, data) => res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`)
      const title = input.command?.input?.title
      const said = input.search ? 'Found ' + input.search : input.command.ability === 'site/build' ? 'Built the site' : input.command.ability === 'entries/publish' ? 'Published “Summer Menu”' : input.command.ability === 'navigation/add-item' ? 'Added to ' + input.command.input.menu : 'Created “' + title + '”'
      const actions = input.command?.ability === 'entries/create' ? [{ type: 'ui/actions', props: { items: [{ label: 'Open', to: '/content/pages/e1' }, { label: 'Publish', ability: 'entries/publish', input: { id: 'e1' } }, { label: 'Add to Menu', ability: 'navigation/add-item', input: { menu: '{values.menu}', entry: 'e1' }, form: { title: 'Add to Menu', fields: [{ handle: 'menu', type: 'select', label: 'Menu', required: true, display: 'dropdown', options: { main: 'Main', footer: 'Footer' } }], values: { menu: 'footer' } } }, { label: 'Publish Again', ability: 'entries/publish', input: { id: 'gone' } }] } }] : []
      send('thread', { id, title: chats.find(c => c.id === id)?.title })
      send('turn', { turn: { id: 'u-' + Date.now(), role: 'user', kind: input.search ? 'search' : 'command', text: input.search ?? input.command.label, ...(input.command ? { command: input.command } : {}) } })
      send('turn', { turn: { id: 'a-' + Date.now(), role: 'answer', parts: [{ type: 'view', view: { type: 'ui/stack', props: {}, children: [{ type: 'ui/notice', props: { tone: 'success', title: said } }, ...actions] } }] } })
      send('done', { thread: { id, title: chats.find(c => c.id === id)?.title }, awaiting: [], agent: null }); return res.end()
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream' })
    const event = (name, data) => res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`)
    event('thread', { id, title: chats.find(c => c.id === id)?.title ?? 'Content overview' })
    if (input.edit) {
      event('turn', { turn: { id: 'u-1', role: 'user', kind: 'message', text: input.message, replaces: input.edit.turn } })
      event('turn', { turn: { id: 'a-1', role: 'answer', agent: 'assistant', parts: [] } })
      await new Promise(r => setTimeout(r, 200))
      editedItems.set(id, [{ id: 'u-1', role: 'user', kind: 'message', text: input.message }, { id: 'a-1', role: 'answer', agent: 'assistant', parts: [{ type: 'text', text: 'Revised answer' }] }])
      event('text', { delta: 'Revised answer' })
      event('done', { thread: { id, title: 'Revised chat' } }); return res.end()
    }
    if (input.message || input.action) event('turn', { turn: { id: 'u-' + Date.now(), role: 'user', kind: input.action ? 'action' : 'message', text: input.message ?? 'Selected an action' } })
    if (input.message || input.action) event('turn', { turn: { id: 'a-' + Date.now(), role: 'answer', agent: 'assistant', parts: [] } })
    if (input.action) {
      usedSurfaces.add(id)
      event('surface_used', { id: input.action.tool })
      event('tool', { id: 'action-tool', name: 'entries__publish', label: 'Publish page' })
      event('approval', { calls: [{ id: 'action-tool', name: 'entries__publish', label: 'Publish page', input: { id: 'stored-id' }, destructive: false, untrusted: true }] })
      event('done', { thread: { id, title: 'Content overview' } }); return res.end()
    }
    if (input.approve) {
      event('tool_result', { id: 'action-tool', ok: true, mutated: true, output: 'Published', input: { id: 'stored-id' } })
      event('text', { delta: 'Published through the normal approval flow' })
      event('done', { thread: { id, title: 'Content overview' } }); return res.end()
    }
    if (input.message === 'open the posts') {
      event('tool', { id: 'open-1', name: 'admin__open', label: 'Open in Admin', ability: 'admin/open' })
      event('tool_result', { id: 'open-1', ability: 'admin/open', ok: true, mutated: false, input: { to: '/content/posts' }, output: JSON.stringify({ to: '/content/posts', label: 'Posts' }) })
      event('text', { delta: 'Here are [the pages](/content/pages), and the posts are at `/admin/content/posts`.' })
      event('done', { thread: { id, title: 'Open the posts' } }); return res.end()
    }
    if (input.message === 'show generated interface') {
      for (const [tool, title] of [['surface-preview', 'Preparing generated overview'], ['surface-live', 'Live generated overview']]) {
        event('tool', { id: tool, name: 'ui_present', label: 'Present interface' })
        event('tool_result', { id: tool, ok: true, mutated: false, surface: { ...surface, title }, output: 'Presented' })
        await new Promise(r => setTimeout(r, 80))
      }
      event('done', { thread: { id, title: 'Content overview' } }); return res.end()
    }
    // Long enough that a check sees a reply still streaming, also on a busy machine: the first send, and a slow
    // stream through navigating away and closing the chat.
    await new Promise(r => setTimeout(r, input.message === 'slow stream' || input.message === 'A new conversation' ? 1500 : 200))
    event('text', { delta: input.message === 'slow stream' ? 'LATE STREAM' : 'Streamed answer' })
    event('done', { thread: chats.find(c => c.id === id), agent: { model: null } }); return res.end()
  }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page({ title: 'Chat verification', boot, runner: url.searchParams.has('test') && runner }))
}, { links: (base) => [`${base}/admin?test=1`, `${base}/admin/chat/new`] })
