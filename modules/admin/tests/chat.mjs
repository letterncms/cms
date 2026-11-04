// Build admin + assistant, then run this server and open its printed URL.
// Exercises the actual bundled UI against local fixtures; never calls an AI provider.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const admin = JSON.parse(await readFile(resolve(root, 'modules/admin/dist/admin.json'), 'utf8'))
const assetBase = '/_cms/assets/cms-admin/'
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
  packages: { active: ['cms/admin', 'letterncms/assistant', 'fixture'], pending: {} },
  modules: [{ id: 'fixture', url: '/fixture.js' }, { id: 'letterncms/assistant', url: '/_cms/assets/cms-assistant/admin.js' }],
  styles: ['/_cms/assets/cms-assistant/admin.css'], settings: [], collections: [], globals: [], fieldTypes: [], commands: [], widgets: [{ id: 'fixture-widget', label: 'Live plugin widget', icon: 'grid', description: 'Shared with Home', column: 'side', enabled: true, source: 'Fixture' }], dashboard: [], config: {}, nav,
  sidebar: { sections: ['main', 'content', 'design'].map((id) => ({ id, label: id === 'main' ? '' : id[0].toUpperCase() + id.slice(1), items: nav.filter((n) => n.section === id).map((n) => n.id) })), hidden: [], personal: false },
  settingsNav: [{ id: 'system', label: 'System', items: nav.filter((n) => n.section === 'system').map((n) => n.id) }],
}
const boot = { base: '/admin', api: '/api/admin', version: 'test', theme: { name: 'cms/admin', version: 'test' }, site: manifest.site, locale: 'en', messages: {}, manifest }
const imports = Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path]))
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
import { navigate, queryClient, blockNavigation, unregister, reregister, registry } from '@letterncms/sdk'
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
const button = label => [...dock().querySelectorAll('button')].find(el => el.textContent.trim() === label)
const heading = () => dock().querySelector('.cms-assistant-page header h2')?.textContent
const welcome = () => !!dock().querySelector('.cms-assistant-welcome')
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
try {
  navigate('/content/pages')
  await wait(() => dock() && toggle() && screen() === 'Pages', 'admin did not load')
  await test('The chat is a dock beside the page, out of the way until asked for, and never saves an empty chat', async () => {
    assert(!isOpen() && dock().inert, 'dock is not closed at the start')
    assert(toggle().getAttribute('aria-pressed') === 'false', 'top bar toggle does not say the chat is closed')
    assert(!document.querySelector('.cms-side-panel nav[aria-label="Chats"]'), 'chats are listed in the main sidebar')
    const sidebar = document.querySelector('.cms-side-panel'), before = sidebar.getBoundingClientRect()
    toggle().click()
    await wait(() => isOpen() && document.activeElement === composer(), 'toggle did not open the dock with the focus in its composer')
    assert(!isFull() && !dock().inert && location.pathname === '/admin/content/pages', 'opening the dock left the page')
    assert(screen() === 'Pages' && !document.querySelector('.cms-sheet').inert, 'the page beside the dock is not live')
    assert(toggle()?.getAttribute('aria-pressed') === 'true', 'top bar toggle left its place beside a docked chat, or does not say it is open')
    await settle()
    await wait(() => document.querySelector('.cms-sheet').getBoundingClientRect().right <= dock().querySelector('.cms-dock-panel').getBoundingClientRect().left + 1, 'dock covers the page instead of sitting beside it')
    await wait(() => historyRows().length === 30, 'a new chat does not list the first page of chats')
    const length = window.history.length
    control('New Chat').click(); control('New Chat').click(); await sleep(100)
    assert(location.pathname === '/admin/content/pages' && window.history.length === length, 'New Chat navigated')
    assert(sidebar.getBoundingClientRect().x === before.x && sidebar.getBoundingClientRect().width === before.width, 'shell jumped')
    assert((await state()).created === 0, 'empty chat saved')
  })
  await test('The composer stays in place when typing or clearing a short draft', async () => {
    const targets = ['.cms-assistant-welcome', '.cms-assistant-composer', 'textarea[role="combobox"]', '[aria-label="Send"]']
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
    control('New Chat').click()
    await wait(() => document.activeElement === composer(), 'New Chat did not focus the composer')
    assert(composer().value === 'Unfinished landing page idea' && welcome(), 'draft lost')
  })
  await test('Drafts survive CMS navigation and stay isolated from saved chats', async () => {
    navigate('/content/pages'); await wait(() => screen() === 'Pages', 'CMS navigation failed')
    assert(isOpen() && !isFull(), 'the dock did not stay open across screens')
    row('Refine the launch page').click()
    await wait(() => dock().textContent.includes('Reply for chat-1') && heading() === 'Refine the launch page', 'saved chat did not open in the dock')
    assert(location.pathname === '/admin/content/pages' && composer().value === '', 'new draft leaked into the saved chat or the page was left')
    control('New Chat').click(); await wait(() => welcome(), 'new chat did not open')
    assert(composer().value === 'Unfinished landing page idea', 'new draft was lost')
    fill(''); await sleep(30)
  })
  await test('New Chat leaves a saved conversation and keeps its reply draft, which the command does not throw away', async () => {
    const command = registry.commands.get('assistant')
    row('Refine the launch page').click(); await wait(() => dock().textContent.includes('Reply for chat-1'), 'saved chat did not open')
    fill('Reply draft'); await sleep(30)
    command.perform(); await sleep(50)
    assert(heading() === 'Refine the launch page' && composer().value === 'Reply draft', 'the New Chat command discarded a reply draft')
    control('New Chat').click(); await wait(() => welcome() && composer().value === '', 'New Chat did not start fresh')
    await wait(() => row('Refine the launch page')?.textContent.includes('Draft'), 'the list does not mark the reply draft')
    row('Refine the launch page').click(); await wait(() => composer().value === 'Reply draft', 'reply draft was discarded')
    fill(''); await sleep(30)
    command.perform(); await wait(() => welcome() && heading() === 'New Chat', 'the New Chat command kept a finished chat')
  })
  await test('Older chats load in pages as the list scrolls, without losing the active conversation', async () => {
    const list = () => dock().querySelector('nav[aria-label="Chats"]')
    const from = (await state()).requests.length
    assert(historyRows().length === 30, 'more than one page listed before scrolling')
    list().scrollTop = list().scrollHeight; await wait(() => historyRows().length === 60, 'second page did not load')
    list().scrollTop = list().scrollHeight; await wait(() => historyRows().length === 70, 'last page did not load')
    list().scrollTop = list().scrollHeight; await sleep(300)
    const offsets = (await state()).requests.slice(from).filter(r => r.ability === 'assistant/conversations').map(r => r.input.offset)
    assert(offsets.includes(30) && offsets.includes(60) && offsets.every(offset => [30, 60].includes(offset)) && historyRows().length === 70, 'paging asked for the wrong pages: ' + offsets)
    row('Earlier conversation 65').click(); await wait(() => heading() === 'Earlier conversation 65' && dock().textContent.includes('Reply for chat-65'), 'older chat did not open')
    control('All Chats').click(); await wait(() => row('Earlier conversation 65'), 'All Chats did not list the chats')
    assert(historyRows().length === 70 && row('Earlier conversation 65').getAttribute('aria-current') === 'page', 'active chat lost its place in the list')
    control('Back to Chat').click(); await wait(() => dock().textContent.includes('Reply for chat-65'), 'Back to Chat did not return to the thread')
  })
  await test('Late history responses cannot replace the selected conversation', async () => {
    navigate('/chat/slow'); await sleep(50); await open('chat-2'); await sleep(600)
    assert(dock().textContent.includes('Reply for chat-2') && !dock().textContent.includes('Reply for slow'), 'late load replaced selected chat')
    navigate('/chat/slow'); await sleep(50); control('New Chat').click(); await sleep(650)
    assert(location.pathname === '/admin/chat/new' && welcome() && !dock().querySelector('.cms-assistant-scroll svg[class*="spin_"]'), 'new chat stuck loading')
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
  await test('Detached, the chat floats over the page and the top bar toggle closes it', async () => {
    control('Detach').click(); await wait(() => dock().hasAttribute('data-floating') && toggle(), 'Detach did not float the chat')
    assert(toggle().getAttribute('aria-pressed') === 'true', 'toggle does not say the floating chat is open')
    toggle().click(); await wait(() => !isOpen() && toggle()?.getAttribute('aria-pressed') === 'false', 'toggle did not close the floating chat')
    toggle().click(); await wait(() => isOpen(), 'toggle did not reopen the floating chat')
    control('Dock Beside the Page').click(); await wait(() => !dock().hasAttribute('data-floating') && toggle()?.getAttribute('aria-pressed') === 'true', 'chat did not dock again')
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
  await test('Browser back and forward restore the selected chat', async () => {
    await open('chat-1'); await open('chat-2'); history.back(); await wait(() => dock().textContent.includes('Reply for chat-1') && heading() === 'Refine the launch page', 'back failed')
    history.forward(); await wait(() => dock().textContent.includes('Reply for chat-2'), 'forward failed')
  })
  await test('A failed first request clears its loading state in the list of chats', async () => {
    control('New Chat').click(); await wait(() => location.pathname.endsWith('/chat/new') && welcome(), 'new chat failed')
    fill('failed request'); await sleep(30); composer().form.requestSubmit()
    await wait(() => spinning(), 'pending request missing')
    await wait(() => dock().textContent.includes('Request fixture failure'), 'request error missing')
    assert(!spinning(), 'failed request kept spinning')
    control('New Chat').click()
    await wait(() => welcome() && !dock().textContent.includes('Request fixture failure') && !dock().textContent.includes('failed request'), 'New Chat kept the failed thread')
  })
  await test('First send appears immediately, stays loading through streaming, becomes one saved chat and is named', async () => {
    control('New Chat').click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
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
    assert(requests.some(r => r.ability === 'assistant/conversation-title' && r.input.id === 'created-1'), 'naming was not asked for')
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
    assert(requests.filter(r => r.kind === 'chat').at(-1).input.model === 'claude-sonnet-5-5', 'turn did not send the picked model')
    assert(requests.some(r => r.ability === 'account/update' && r.input.preferences['assistant.model'] === 'claude-sonnet-5-5'), 'pick was not remembered')
    await open('chat-3'); await shows('Claude Haiku 5.5', 'a pick leaked into another chat')
    await open('chat-5'); await shows('Claude Sonnet 5.5', 'pick was lost when switching chats')
    control('New Chat').click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    await shows('Claude Sonnet 5.5', 'new chat did not start with the last pick')
    await open('created-1')
  })
  await test('Switching chats during a stream cannot leak late text into the new chat', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => control('Stop'), 'stream did not start')
    await open('chat-2'); await sleep(700)
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
    queryClient.removeQueries({ queryKey: ['assistant/conversations'] })
    const from = (await state()).requests.length
    await open('chat-65')
    // Older than the first page of chats, it is listed at the top all the same, as the one on view.
    await wait(() => heading() === 'Earlier conversation 65' && historyRows().length === 31 && historyRows()[0].getAttribute('aria-current') === 'page' && row('Earlier conversation 65'), 'deep-linked chat did not open by name, listed as the one on view')
    await sleep(200)
    const listed = (await state()).requests.slice(from).filter(r => r.ability === 'assistant/conversations')
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
    assert(JSON.stringify(requests.findLast(r => r.kind === 'chat').input.edit) === JSON.stringify({ index: 0, original: 'Please review this page' }), 'edit target was not sent')
    await open('chat-1')
    navigate('/chat/chat-5'); await wait(() => dock().textContent.includes('Revised answer') && dock().textContent.includes('Revised prompt'), 'edit did not survive reload')
    assert(!dock().textContent.includes('Please review this page'), 'reload brought back the old prompt')
  })
  const deletionDialog = async () => {
    control('Chat Actions').click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].some(el => el.textContent === 'Delete Chat'), 'delete action missing')
    ;[...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent === 'Delete Chat').click()
    await wait(() => document.querySelector('[role="dialog"]'), 'confirmation missing')
  }
  const dialogAction = label => [...document.querySelectorAll('[role="dialog"] button')].find(el => el.textContent === label).click()
  await test('Canceling deletion preserves the saved chat and its draft', async () => {
    await open('chat-1'); fill('Keep this draft'); await sleep(30)
    await deletionDialog(); dialogAction('Cancel'); await sleep(300)
    assert(location.pathname.endsWith('/chat/chat-1') && composer().value === 'Keep this draft', 'cancel discarded the chat or draft')
    assert(!(await state()).requests.some(r => r.ability === 'assistant/conversation-delete'), 'cancel sent a deletion')
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
    assert(heading() === 'New Chat' && welcome(), 'the dock kept showing the deleted chat')
  })
  await test('Generated UI uses json-render with shared metrics, tables, widgets and plugin components', async () => {
    await open('surfaces')
    await wait(() => dock().textContent.includes('A live record from the plugin'), 'shared widget did not render')
    assert(dock().textContent.includes('Published pages') && dock().textContent.includes('Autumn launch'), 'generated data was not rendered')
    assert(dock().textContent.includes('Context from a registered plugin'), 'custom registry component missing')
    assert(dock().querySelector('[role="table"]') && dock().querySelector('svg[viewBox="0 0 100 30"]'), 'shared table or trend missing')
  })
  await test('Generated actions use approval and stay consumed after history reload', async () => {
    button('Publish selected page').click()
    await wait(() => button('Allow'), 'component action did not reach approval')
    assert(dock().textContent.includes('Asked because this chat has read site content.'), 'untrusted approval has no warning')
    assert(button('Publish selected page').disabled, 'used surface stayed interactive')
    const request = (await state()).requests.findLast(r => r.kind === 'chat').input
    assert(JSON.stringify(request.action) === JSON.stringify({ tool: 'surface-tool', node: 'action', name: 'submit' }), 'browser sent generated ability inputs')
    assert(!('message' in request), 'click was sent as a prompt')
    button('Allow').click()
    await wait(() => dock().textContent.includes('Published through the normal approval flow'), 'approval failed')
    await open('chat-3')
    await open('surfaces')
    await wait(() => button('Publish selected page'), 'surface did not reload')
    assert(button('Publish selected page').disabled, 'history replay re-enabled a consumed action')
  })
  await test('Unloading and restoring a plugin updates its generated components', async () => {
    const registrations = unregister('fixture')
    await wait(() => dock().textContent.includes('This component is no longer available.'), 'unloaded component did not get a fallback')
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
  output.textContent += '\\nAll ' + results.length + ' chat checks passed.'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results }) })
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack }) })
}
`
const html = run => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Chat verification</title>${admin.css.map(path => `<link rel="stylesheet" href="${assetBase + path}">`).join('')}<script type="importmap">${JSON.stringify({ imports })}</script><script>window.__CMS__=${JSON.stringify(boot)}</script><script type="module" src="${assetBase + admin.entry}"></script></head><body><div id="cms"></div>${run ? `<pre id="results" style="position:fixed;bottom:8px;right:8px;z-index:9999;max-width:700px;background:white;border:1px solid #aaa;padding:12px;font-size:10px">Starting tests…</pre><script type="module">${runner}</script>` : ''}</body></html>`
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
const body = async req => { let value = ''; for await (const chunk of req) value += chunk; return JSON.parse(value || '{}') }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/api/admin/manifest') return json(res, 200, { data: manifest })
    if (url.pathname === '/__test/state') return json(res, 200, { created, requests })
    if (url.pathname === '/__test/results') { const result = await body(req); result.passed.forEach(name => console.log('PASS', name)); if (result.error) console.error('FAIL', result.error); json(res, 200, {}); return finish(result.error) }
    if (url.pathname === '/fixture.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(fixture) }
    if (url.pathname.startsWith('/api/admin/abilities/')) {
      const ability = url.pathname.slice('/api/admin/abilities/'.length), input = await body(req)
      requests.push({ ability, input })
      if (ability === 'assistant/status') return json(res, 200, { data: { configured: true, model: 'claude-opus-5-5', models } })
      if (ability === 'account/update') return json(res, 200, { data: {} })
      if (ability === 'assistant/conversations') return json(res, 200, { data: chats.slice(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 30)) })
      if (ability === 'assistant/conversation-title') {
        const chat = chats.find(c => c.id === input.id)
        if (chat && chat.title === 'A new conversation') chat.title = 'Launch page ideas'
        return json(res, 200, { data: { title: chat?.title ?? 'Content overview' } })
      }
      if (ability === 'assistant/conversation-delete') {
        await new Promise(r => setTimeout(r, input.id === 'chat-4' ? 450 : 50))
        if (input.id === 'chat-2') return json(res, 422, { error: { message: 'Deletion fixture failure', type: 'invalid_input' } })
        chats = chats.filter(chat => chat.id !== input.id)
        return json(res, 200, { data: { deleted: true } })
      }
      if (ability === 'assistant/conversation') {
        await new Promise(r => setTimeout(r, input.id === 'slow' ? 500 : 25))
        return json(res, 200, { data: { id: input.id, title: chats.find(c => c.id === input.id)?.title ?? 'Slow chat', model: { 'chat-3': 'claude-haiku-5-5', 'chat-6': 'claude-retired' }[input.id] ?? null, awaiting: [], items: editedItems.get(input.id) ?? [{ role: 'user', text: 'Please review this page', messageIndex: 0 }, { role: 'assistant', parts: [{ type: 'text', text: 'Reply for ' + input.id }, ...(input.id === 'surfaces' ? [{ type: 'tool', id: 'surface-tool', name: 'ui_present', label: 'Present interface', status: 'ok', surface, used: usedSurfaces.has(input.id) }] : [])] }] } })
      }
      throw new Error('Unexpected ability ' + ability)
    }
    if (url.pathname === '/api/admin/assistant/chat') {
      const input = await body(req); requests.push({ kind: 'chat', input })
      if (!input.conversation) await new Promise(r => setTimeout(r, 400))
      if (input.message === 'failed request') return json(res, 422, { error: { message: 'Request fixture failure', type: 'invalid_input' } })
      let id = input.conversation
      if (!id) { id = `created-${++created}`; chats.unshift({ id, title: input.message, updatedAt: new Date().toISOString() }) }
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      const event = (name, data) => res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`)
      event('conversation', { id, title: chats.find(c => c.id === id)?.title ?? 'Content overview' })
      if (input.edit) {
        event('user_message', { messageIndex: 0, text: input.message })
        await new Promise(r => setTimeout(r, 200))
        editedItems.set(id, [{ role: 'user', text: input.message, messageIndex: 0 }, { role: 'assistant', parts: [{ type: 'text', text: 'Revised answer' }] }])
        event('text', { delta: 'Revised answer' })
        event('done', { conversation: { id, title: 'Revised chat' } }); return res.end()
      }
      if (input.message) event('user_message', { messageIndex: 2, text: input.message })
      if (input.action) {
        usedSurfaces.add(id)
        event('surface_used', { id: input.action.tool })
        event('tool', { id: 'action-tool', name: 'entries__publish', label: 'Publish page' })
        event('approval', { calls: [{ id: 'action-tool', name: 'entries__publish', label: 'Publish page', input: { id: 'stored-id' }, destructive: false, untrusted: true }] })
        event('done', { conversation: { id, title: 'Content overview' } }); return res.end()
      }
      if (input.approve) {
        event('tool_result', { id: 'action-tool', ok: true, mutated: true, output: 'Published', input: { id: 'stored-id' } })
        event('text', { delta: 'Published through the normal approval flow' })
        event('done', { conversation: { id, title: 'Content overview' } }); return res.end()
      }
      if (input.message === 'show generated interface') {
        for (const [tool, title] of [['surface-preview', 'Preparing generated overview'], ['surface-live', 'Live generated overview']]) {
          event('tool', { id: tool, name: 'ui_present', label: 'Present interface' })
          event('tool_result', { id: tool, ok: true, mutated: false, surface: { ...surface, title }, output: 'Presented' })
          await new Promise(r => setTimeout(r, 80))
        }
        event('done', { conversation: { id, title: 'Content overview' } }); return res.end()
      }
      await new Promise(r => setTimeout(r, input.message === 'slow stream' ? 500 : 200))
      event('text', { delta: input.message === 'slow stream' ? 'LATE STREAM' : 'Streamed answer' })
      event('done', { conversation: chats.find(c => c.id === id) }); return res.end()
    }
    const asset = url.pathname.match(/^\/_cms\/assets\/cms-(admin|assistant)\/(.+)$/)
    if (asset) {
      const dir = resolve(root, asset[1] === 'admin' ? 'modules/admin/dist' : '../plugins-public/assistant/dist'), path = resolve(dir, asset[2])
      if (!path.startsWith(dir + sep)) { res.writeHead(403); return res.end() }
      res.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)] ?? 'application/octet-stream' }); return res.end(await readFile(path))
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html(url.searchParams.has('test')))
  } catch (error) { console.error(error); json(res, 500, { error: { message: error.message } }) }
})
// Exits with the page's verdict, unless --preview keeps it up to look at.
const keepAlive = process.argv.includes('--preview')
const finish = (error) => { if (keepAlive) return; clearTimeout(timeout); setTimeout(() => { server.closeAllConnections(); server.close(); process.exitCode = error ? 1 : 0 }, 100) }
const timeout = keepAlive ? null : setTimeout(() => { console.error('Chat browser test timed out'); server.closeAllConnections(); server.close(); process.exitCode = 1 }, 120_000)
server.listen(0, '127.0.0.1', () => console.log(`Chat checks: http://localhost:${server.address().port}/admin?test=1\nPreview: http://localhost:${server.address().port}/admin/chat/new`))
