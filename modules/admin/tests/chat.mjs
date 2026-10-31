// Build admin + assistant, then run this server and open its printed URL.
// Exercises the actual bundled UI against local fixtures; never calls an AI provider.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'

const root = fileURLToPath(new URL('../../../..', import.meta.url))
const admin = JSON.parse(await readFile(resolve(root, 'cms/themes/admin/dist/admin.json'), 'utf8'))
const assetBase = '/_cms/assets/cms-admin/'
const nav = [
  ['dashboard', 'Dashboard', '/', 'grid', 'main'], ['analytics', 'Analytics', '/analytics', 'chart', 'main'],
  ['pages', 'Pages', '/content/pages', 'file', 'content'], ['posts', 'Posts', '/content/posts', 'article', 'content'], ['media', 'Media', '/media', 'media', 'content'],
  ['components', 'Components', '/content/components', 'blocks', 'design'], ['templates', 'Templates', '/content/templates', 'layout', 'design'],
  ['settings', 'Settings', '/settings', 'settings', 'system'],
].map(([id, label, path, icon, section]) => ({ id, label, path, icon, section }))
const manifest = {
  components: [{ id: 'fixture/context', label: 'Context component', description: 'A fixture', props: { type: 'object' }, children: false }],
  cms: { version: 'test', lockedDown: false, debug: false },
  brand: { name: 'Acme', domain: '', product_url: '', docs_url: '', support_email: '', mark: '', wordmark: '' }, site: { name: 'Acme', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Alex Morgan', email: 'alex@example.invalid', initials: 'AM', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', 'letterncms/assistant', 'fixture'], pending: {} },
  modules: [{ id: 'fixture', url: '/fixture.js' }, { id: 'letterncms/assistant', url: '/_cms/assets/cms-assistant/admin.js' }],
  styles: ['/_cms/assets/cms-assistant/admin.css'], settings: [], collections: [], globals: [], fieldTypes: [], commands: [], widgets: [{ id: 'fixture-widget', label: 'Live plugin widget', icon: 'grid', description: 'Shared with Home', column: 'side', enabled: true, source: 'Fixture' }], dashboard: [], config: {}, nav,
  sidebar: ['main', 'content', 'design', 'system'].map((id) => ({ id, label: id === 'main' ? '' : id[0].toUpperCase() + id.slice(1), items: nav.filter((n) => n.section === id).map((n) => n.id) })),
}
const boot = { base: '/admin', api: '/api/admin', version: 'test', theme: { name: 'cms/admin', version: 'test' }, site: manifest.site, locale: 'en', messages: {}, manifest }
const imports = Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path]))
const titles = ['Refine the launch page', 'Draft the autumn newsletter', 'Review page descriptions', 'Update the design system', 'Plan next month’s content']
let chats = Array.from({ length: 26 }, (_, i) => ({ id: `chat-${i + 1}`, title: titles[i] ?? `Earlier conversation ${i + 1}`, updatedAt: new Date(Date.now() - i * 3600000).toISOString() }))
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
const fixture = `import { createElement as h } from 'react'; import { registry } from '@letterncms/sdk'; import { Widget, WidgetRow } from '@letterncms/ui'; registry.components.set('fixture/context', ({props}) => h('p', null, props.title)); registry.widgets.set('fixture-widget', () => h(Widget, null, h(WidgetRow, { title: 'A live record from the plugin', description: 'The same widget renders on Home and in chat', icon: 'file' }))); ${JSON.stringify(nav)}.forEach(n => registry.routes.set(n.path, { path: n.path, component: () => h('main', {style:{padding:32}}, h('h1', null, n.label)) }));`
const editedItems = new Map()
const runner = `
import { navigate, queryClient, blockNavigation, unregister, reregister } from '@letterncms/sdk'
const results = [], output = document.querySelector('#results')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const assert = (value, message) => { if (!value) throw new Error(message) }
const wait = async (fn, message) => { const end = Date.now() + 7000; while (!fn()) { if (Date.now() > end) throw new Error(message); await sleep(15) } }
const test = async (name, fn) => { await fn(); results.push(name); output.textContent = results.map(x => 'PASS ' + x).join('\\n') }
const newChat = () => document.querySelector('aside button[aria-controls="cms-assistant"]')
const page = () => document.querySelector('#cms-assistant')
const composer = () => page().querySelector('textarea')
const historyRows = () => [...document.querySelectorAll('#cms-chat-history a')]
const button = label => [...document.querySelectorAll('button')].find(el => el.textContent.trim() === label)
const fill = value => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(composer(), value); composer().dispatchEvent(new Event('input', { bubbles: true })) }
const open = async id => { navigate('/chat/' + id); await wait(() => !page().hidden && page().textContent.includes('Reply for ' + id), 'chat failed to load: ' + id) }
try {
  await wait(() => newChat() && historyRows().length === 5, 'sidebar did not load')
  await test('History belongs to navigation and initially shows five chats', async () => {
    assert(document.querySelector('aside #cms-chat-history'), 'history is outside sidebar')
    assert(!page().querySelector('[aria-label="Recent Chats"]'), 'duplicate history action')
    assert(!page().querySelector('[aria-label="New Chat"]'), 'duplicate new chat action')
  })
  await test('New Chat is a stable destination without a sliding dialog or duplicate empty records', async () => {
    const sidebar = document.querySelector('aside'), before = sidebar.getBoundingClientRect()
    newChat().click(); await wait(() => !page().hidden && composer(), 'chat did not open')
    const length = window.history.length
    newChat().click(); newChat().click(); await sleep(100)
    assert(location.pathname === '/admin/chat/new' && window.history.length === length, 'repeated clicks navigated again')
    assert(sidebar.getBoundingClientRect().x === before.x && sidebar.getBoundingClientRect().width === before.width, 'shell jumped')
    assert(!page().closest('[role="dialog"]') && getComputedStyle(page()).transform === 'none', 'chat still uses a dialog transform')
    assert((await (await fetch('/__test/state')).json()).created === 0, 'empty chat saved')
  })
  await test('The composer stays in place when typing or clearing a short draft after opening from navigation', async () => {
    const targets = ['.cms-assistant-welcome', '.cms-assistant-composer', 'textarea', '[aria-label="Send"]']
    const bounds = () => targets.map(selector => {
      const { x, y, width, height } = page().querySelector(selector).getBoundingClientRect()
      return [x, y, width, height]
    })
    const before = bounds()
    for (const value of ['e', 'A short draft', '']) {
      fill(value); await sleep(50)
      assert(JSON.stringify(bounds()) === JSON.stringify(before), 'typing shifted the welcome or composer')
    }
  })
  await test('Long drafts grow, survive hidden navigation, and shrink back to the original composer size', async () => {
    const height = composer().getBoundingClientRect().height
    const longDraft = Array(30).fill('A line in a long draft').join('\\n')
    fill(longDraft); await sleep(50)
    const grown = composer().getBoundingClientRect().height
    assert(grown > height && composer().scrollHeight > composer().clientHeight, 'long draft did not grow into a scrollable composer')
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not replace chat')
    newChat().click(); await wait(() => !page().hidden, 'chat did not reopen'); await sleep(50)
    assert(composer().value === longDraft && composer().getBoundingClientRect().height === grown, 'hidden navigation changed the long draft height')
    fill(''); await sleep(50)
    assert(composer().getBoundingClientRect().height === height, 'clearing the draft did not restore the initial height')
  })
  await test('New Chat preserves an unfinished draft and focuses its composer', async () => {
    fill('Unfinished landing page idea'); await sleep(30); newChat().click(); await sleep(50)
    assert(composer().value === 'Unfinished landing page idea' && document.activeElement === composer(), 'draft or focus lost')
  })
  await test('Drafts survive CMS navigation and stay isolated from saved chats', async () => {
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not replace chat')
    await open('chat-1'); assert(composer().value === '', 'new draft leaked into saved chat')
    newChat().click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat did not open')
    assert(composer().value === 'Unfinished landing page idea', 'new draft was lost')
    fill(''); await sleep(30)
  })
  await test('New Chat leaves a completed conversation, but keeps a reply draft', async () => {
    await open('chat-1'); fill('Reply draft'); await sleep(30); newChat().click(); await sleep(30)
    assert(location.pathname.endsWith('/chat/chat-1') && composer().value === 'Reply draft', 'reply draft was discarded')
    fill(''); await sleep(30); newChat().click(); await wait(() => location.pathname.endsWith('/chat/new') && !page().textContent.includes('Reply for'), 'completed chat was not reset')
  })
  await test('Older history loads in pages without losing the active conversation', async () => {
    button('Show more').click(); await wait(() => historyRows().length === 15, 'first disclosure failed')
    button('Show more').click(); await wait(() => historyRows().length === 20, 'second disclosure failed')
    button('Show more').click(); await wait(() => historyRows().length === 26, 'pagination failed')
    await open('chat-26'); button('Show less').click(); await sleep(40)
    assert(historyRows().length === 6 && historyRows().some(el => el.getAttribute('aria-current') === 'page'), 'active chat disappeared after folding history')
  })
  await test('Late history responses cannot replace the selected conversation', async () => {
    navigate('/chat/slow'); await sleep(50); await open('chat-2'); await sleep(600)
    assert(page().textContent.includes('Reply for chat-2') && !page().textContent.includes('Reply for slow'), 'late load replaced selected chat')
    navigate('/chat/slow'); await sleep(50); newChat().click(); await sleep(650)
    assert(page().textContent.includes('What should we work on?') && !page().querySelector('.animate-spin'), 'new chat stuck loading')
  })
  await test('Sidebar navigation respects unsaved CMS changes', async () => {
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS navigation failed')
    const unblock = blockNavigation(() => 'Unsaved fixture'), original = window.confirm
    window.confirm = () => false
    try { newChat().click(); assert(location.pathname === '/admin/content/pages' && page().hidden, 'new chat bypassed editor guard') }
    finally { window.confirm = original; unblock() }
  })
  await test('Keyboard action opens chat and preserves drafts on repeat', async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, bubbles: true }))
    await wait(() => !page().hidden, 'shortcut failed'); fill('Keyboard draft'); await sleep(30)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, bubbles: true })); await sleep(30)
    assert(!page().hidden && composer().value === 'Keyboard draft', 'shortcut toggled or cleared draft'); fill(''); await sleep(30)
  })
  await test('Browser back and forward restore the selected chat', async () => {
    await open('chat-1'); await open('chat-2'); history.back(); await wait(() => page().textContent.includes('Reply for chat-1'), 'back failed')
    history.forward(); await wait(() => page().textContent.includes('Reply for chat-2'), 'forward failed')
  })
  await test('A failed first request clears the sidebar loading state', async () => {
    newChat().click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    fill('failed request'); await sleep(30); composer().form.requestSubmit()
    await wait(() => document.querySelector('#cms-chat-history button [role="status"]'), 'pending request missing')
    await wait(() => page().textContent.includes('Request fixture failure'), 'request error missing')
    assert(!document.querySelector('#cms-chat-history [role="status"]'), 'failed request kept spinning')
  })
  await test('First send appears immediately, stays loading through streaming, and becomes one saved chat', async () => {
    newChat().click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    fill('A new conversation'); await sleep(30); composer().form.requestSubmit()
    await wait(() => document.querySelector('#cms-chat-history button [role="status"]'), 'pending request missing before response')
    assert(location.pathname.endsWith('/chat/new'), 'pending row waited for conversation ID')
    assert(document.querySelector('#cms-chat-history').textContent.includes('A new conversation'), 'pending row has no request title')
    assert(!document.querySelector('#cms-chat-history button [role="status"]').parentElement.textContent.includes('Draft'), 'submitted request still marked as draft')
    await wait(() => location.pathname.endsWith('/chat/created-1') && historyRows().some(el => el.textContent === 'A new conversation'), 'new conversation missing from navigation')
    assert(historyRows().find(el => el.textContent === 'A new conversation').querySelector('[role="status"]'), 'loading stopped before stream finished')
    assert([...document.querySelectorAll('#cms-chat-history a, #cms-chat-history button')].filter(el => el.textContent === 'A new conversation').length === 1, 'duplicate pending and saved rows')
    await wait(() => page().textContent.includes('Streamed answer'), 'stream did not finish')
    await wait(() => !document.querySelector('#cms-chat-history [role="status"]'), 'completed request kept spinning')
    const state = await (await fetch('/__test/state')).json()
    assert(state.created === 1, 'duplicate conversation created')
    assert(state.requests.find(r => r.kind === 'chat').input.context.path === '/content/pages', 'CMS context lost')
  })
  await test('Each chat shows its own model, and a pick is sent, kept and remembered for new chats', async () => {
    const picker = () => page().querySelector('[aria-label^="Model: "]')
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
    await wait(() => page().textContent.includes('Streamed answer'), 'stream did not finish')
    const state = await (await fetch('/__test/state')).json()
    assert(state.requests.filter(r => r.kind === 'chat').at(-1).input.model === 'claude-sonnet-5-5', 'turn did not send the picked model')
    assert(state.requests.some(r => r.ability === 'account/update' && r.input.preferences['assistant.model'] === 'claude-sonnet-5-5'), 'pick was not remembered')
    await open('chat-3'); await shows('Claude Haiku 5.5', 'a pick leaked into another chat')
    await open('chat-5'); await shows('Claude Sonnet 5.5', 'pick was lost when switching chats')
    newChat().click(); await wait(() => location.pathname.endsWith('/chat/new'), 'new chat failed')
    await shows('Claude Sonnet 5.5', 'new chat did not start with the last pick')
    await open('created-1')
  })
  await test('Switching chats during a stream cannot leak late text into the new chat', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => page().querySelector('[aria-label="Stop"]'), 'stream did not start')
    await open('chat-2'); await sleep(700)
    assert(!page().textContent.includes('LATE STREAM') && page().textContent.includes('Reply for chat-2'), 'old stream leaked')
    assert(!document.querySelector('#cms-chat-history [role="status"]'), 'aborted stream kept spinning')
  })
  await test('Stopping a reply clears its sidebar spinner immediately', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => document.querySelector('#cms-chat-history a [role="status"]'), 'reply spinner missing')
    page().querySelector('[aria-label="Stop"]').click(); await sleep(30)
    assert(!document.querySelector('#cms-chat-history [role="status"]'), 'stopped reply kept spinning')
  })
  await test('A reply keeps streaming while a CMS screen is open', async () => {
    fill('slow stream'); await sleep(30); composer().form.requestSubmit()
    await wait(() => page().querySelector('[aria-label="Stop"]'), 'stream did not start')
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not open')
    assert(document.querySelector('#cms-chat-history a [role="status"]'), 'background request lost its spinner')
    await sleep(650)
    navigate('/chat/chat-2'); await wait(() => !page().hidden, 'chat did not reopen')
    assert(page().textContent.includes('LATE STREAM'), 'stream was lost while browsing the CMS')
  })
  await test('An older deep-linked chat stays visible without loading every history page', async () => {
    queryClient.removeQueries({ queryKey: ['assistant/conversations'] })
    await open('chat-26')
    await wait(() => historyRows().some(el => el.getAttribute('aria-current') === 'page' && el.textContent.includes('Earlier conversation 26')), 'deep-linked chat missing from sidebar')
  })
  await test('Message copy preserves the full text and confirms success', async () => {
    await open('chat-5')
    window.__copied = []
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => window.__copied.push(text) } })
    const copies = page().querySelectorAll('[aria-label="Copy message"]')
    assert(copies.length === 2, 'copy is missing on a user or assistant message')
    copies[0].click(); await sleep(40)
    assert(window.__copied[0] === 'Please review this page' && page().querySelector('[aria-label="Copied"]'), 'copy did not preserve user text or confirm success')
    copies[1].click(); await sleep(40)
    assert(window.__copied[1] === 'Reply for chat-5', 'assistant copy included unrelated content')
  })
  await test('Editing supports cancellation and preserves the separate composer draft', async () => {
    fill('Keep composer draft'); await sleep(30)
    page().querySelector('[aria-label="Edit message"]').click(); await sleep(40)
    const editor = page().querySelector('textarea[aria-label="Edit message"]')
    assert(editor.value === 'Please review this page' && document.activeElement === editor, 'edit did not load and focus the original')
    assert(button('Save & Send').disabled, 'unchanged edit can be submitted')
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(40)
    assert(!page().querySelector('textarea[aria-label="Edit message"]') && composer().value === 'Keep composer draft', 'cancel changed the message or reply draft')
    assert(document.activeElement === page().querySelector('[aria-label="Edit message"]'), 'cancel did not restore focus')
  })
  await test('A failed edit keeps its draft and the original conversation available', async () => {
    page().querySelector('[aria-label="Edit message"]').click(); await sleep(30)
    const editor = page().querySelector('textarea[aria-label="Edit message"]')
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'failed request')
    editor.dispatchEvent(new Event('input', { bubbles: true })); await sleep(30)
    button('Save & Send').click()
    await wait(() => page().querySelector('[role="alert"]')?.textContent.includes('Request fixture failure'), 'edit error missing')
    assert(editor.value === 'failed request' && page().textContent.includes('Reply for chat-5'), 'failed edit lost the draft or previous reply')
    button('Cancel').click(); await sleep(30)
    assert(page().textContent.includes('Please review this page'), 'failed edit replaced the original prompt')
    page().querySelector('[aria-label="Dismiss"]').click()
  })
  await test('Saving an edit replaces the old prompt and response and survives reload', async () => {
    page().querySelector('[aria-label="Edit message"]').click(); await sleep(30)
    const editor = page().querySelector('textarea[aria-label="Edit message"]')
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, 'Revised prompt')
    editor.dispatchEvent(new Event('input', { bubbles: true })); await sleep(30)
    button('Save & Send').click()
    await wait(() => page().textContent.includes('Revised answer') && !page().querySelector('[aria-label="Stop"]'), 'edited answer did not complete')
    assert(!page().textContent.includes('Reply for chat-5') && !page().textContent.includes('Please review this page'), 'old branch remained')
    assert(composer().value === 'Keep composer draft', 'edit overwrote the composer draft')
    const state = await (await fetch('/__test/state')).json()
    assert(JSON.stringify(state.requests.findLast(r => r.kind === 'chat').input.edit) === JSON.stringify({ index: 0, original: 'Please review this page' }), 'edit target was not sent')
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not open')
    navigate('/chat/chat-5'); await wait(() => page().textContent.includes('Revised answer'), 'edit did not survive reload')
  })
  const deletionDialog = async () => {
    page().querySelector('[aria-label="Chat Actions"]').click()
    await wait(() => [...document.querySelectorAll('[role="menuitem"]')].some(el => el.textContent === 'Delete Chat'), 'delete action missing')
    ;[...document.querySelectorAll('[role="menuitem"]')].find(el => el.textContent === 'Delete Chat').click()
    await wait(() => document.querySelector('[role="dialog"]'), 'confirmation missing')
  }
  const dialogAction = label => [...document.querySelectorAll('[role="dialog"] button')].find(el => el.textContent === label).click()
  await test('Canceling deletion preserves the saved chat and its draft', async () => {
    await open('chat-1'); fill('Keep this draft'); await sleep(30)
    await deletionDialog(); dialogAction('Cancel'); await sleep(300)
    assert(location.pathname.endsWith('/chat/chat-1') && composer().value === 'Keep this draft', 'cancel discarded the chat or draft')
    const state = await (await fetch('/__test/state')).json()
    assert(!state.requests.some(r => r.ability === 'assistant/conversation-delete'), 'cancel sent a deletion')
  })
  await test('A failed deletion reports its error and preserves the conversation', async () => {
    await open('chat-2'); fill('Preserve on failure'); await sleep(30)
    await deletionDialog(); dialogAction('Delete Chat')
    await wait(() => document.body.textContent.includes('Deletion fixture failure'), 'failure was not reported'); await sleep(300)
    assert(location.pathname.endsWith('/chat/chat-2') && composer().value === 'Preserve on failure', 'failure discarded the conversation')
  })
  await test('Confirmed deletion clears its history and draft and returns to New Chat', async () => {
    await open('chat-1'); await deletionDialog(); dialogAction('Delete Chat')
    await wait(() => location.pathname.endsWith('/chat/new') && !historyRows().some(el => el.getAttribute('href').endsWith('/chat/chat-1')), 'deleted chat remained selected or in history')
    await sleep(300)
    assert(!page().querySelector('[aria-label="Chat Actions"]') && composer().value === '', 'empty chat retained a delete menu or deleted draft')
  })
  await test('A delayed deletion does not navigate away from another CMS page', async () => {
    await open('chat-4'); await deletionDialog(); dialogAction('Delete Chat')
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not open')
    await sleep(600)
    assert(location.pathname === '/admin/content/pages' && page().hidden, 'deletion pulled the user back into chat')
  })
  await test('Generated UI uses json-render with shared metrics, tables, widgets and plugin components', async () => {
    await open('surfaces')
    await wait(() => page().textContent.includes('A live record from the plugin'), 'shared widget did not render')
    assert(page().textContent.includes('Published pages') && page().textContent.includes('Autumn launch'), 'generated data was not rendered')
    assert(page().textContent.includes('Context from a registered plugin'), 'custom registry component missing')
    assert(page().querySelector('[role="table"]') && page().querySelector('svg[viewBox="0 0 100 30"]'), 'shared table or trend missing')
  })
  await test('Generated actions use approval and stay consumed after history reload', async () => {
    button('Publish selected page').click()
    await wait(() => button('Allow'), 'component action did not reach approval')
    assert(page().textContent.includes('Acme has read site content in this chat'), 'untrusted approval has no warning')
    assert(button('Publish selected page').disabled, 'used surface stayed interactive')
    const state = await (await fetch('/__test/state')).json()
    const request = state.requests.findLast(r => r.kind === 'chat').input
    assert(JSON.stringify(request.action) === JSON.stringify({ tool: 'surface-tool', node: 'action', name: 'submit' }), 'browser sent generated ability inputs')
    assert(!('message' in request), 'click was sent as a prompt')
    button('Allow').click()
    await wait(() => page().textContent.includes('Published through the normal approval flow'), 'approval failed')
    navigate('/content/pages'); await wait(() => page().hidden, 'CMS did not open')
    await open('surfaces')
    await wait(() => button('Publish selected page'), 'surface did not reload')
    assert(button('Publish selected page').disabled, 'history replay re-enabled a consumed action')
  })
  await test('Unloading and restoring a plugin updates its generated components', async () => {
    const registrations = unregister('fixture')
    await wait(() => page().textContent.includes('This component is no longer available.'), 'unloaded component did not get a fallback')
    assert(!page().textContent.includes('A live record from the plugin'), 'unloaded widget remained visible')
    reregister('fixture', registrations)
    await wait(() => page().textContent.includes('A live record from the plugin'), 'widget did not return after reactivation')
  })
  await test('Live surface events replace earlier presentations without duplicating a generated interface', async () => {
    fill('show generated interface'); page().querySelector('[aria-label="Send"]').click()
    await wait(() => page().textContent.includes('Live generated overview'), 'live surface did not render')
    await wait(() => !page().querySelector('[aria-label="Stop"]'), 'surface stream did not finish')
    assert(!page().textContent.includes('Preparing generated overview'), 'replaced surface remained visible')
    assert([...page().querySelectorAll('h2')].filter(el => el.textContent === 'Live generated overview').length === 1, 'surface update duplicated the interface')
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
    if (url.pathname === '/__test/results') { const result = await body(req); result.passed.forEach(name => console.log('PASS', name)); if (result.error) console.error('FAIL', result.error); return json(res, 200, {}) }
    if (url.pathname === '/fixture.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(fixture) }
    if (url.pathname.startsWith('/api/admin/abilities/')) {
      const ability = url.pathname.slice('/api/admin/abilities/'.length), input = await body(req)
      requests.push({ ability, input })
      if (ability === 'assistant/status') return json(res, 200, { data: { configured: true, model: 'claude-opus-5-5', models } })
      if (ability === 'account/update') return json(res, 200, { data: {} })
      if (ability === 'assistant/conversations') return json(res, 200, { data: chats.slice(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 20)) })
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
      const dir = resolve(root, asset[1] === 'admin' ? 'cms/themes/admin/dist' : 'cms/plugins/assistant/dist'), path = resolve(dir, asset[2])
      if (!path.startsWith(dir + sep)) { res.writeHead(403); return res.end() }
      res.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)] ?? 'application/octet-stream' }); return res.end(await readFile(path))
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html(url.searchParams.has('test')))
  } catch (error) { console.error(error); json(res, 500, { error: { message: error.message } }) }
})
server.listen(0, '127.0.0.1', () => console.log(`Chat checks: http://localhost:${server.address().port}/admin?test=1\nPreview: http://localhost:${server.address().port}/admin/chat/new`))
