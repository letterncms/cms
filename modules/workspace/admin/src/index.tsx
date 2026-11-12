import './styles.css'
import { events, registry, t } from '@letterncms/sdk'
import { ChatToggle } from './ChatToggle'
import './commands'
import { NewChatRow } from './NewChatRow'
import { WorkspacePanel } from './Panel'
import { panel } from './store'

// The thread at the right edge of every screen; its toggle in each screen's bar; a fresh one first in the sidebar.
registry.panels.set('workspace', { slot: 'shell.dock', component: WorkspacePanel })
registry.panels.set('workspace-toggle', { slot: 'topbar.end', component: ChatToggle })
registry.panels.set('workspace-new-chat', { slot: 'sidebar.start', component: NewChatRow })
// An editor's bar on a phone has no room for the toggle: the chat is first in its More Actions there.
registry.entryActions.set('workspace-chat', { label: t('Chat'), icon: 'comment', order: 0, when: () => window.matchMedia('(max-width: 639px)').matches, perform: () => panel.open() })
// A thread's own URL is the dock at full size, over the page it came from. The dock owns streaming, so the route draws nothing.
registry.routes.set('/chat/:id', { path: '/chat/:id', component: () => null, overlay: true })

// What asks from elsewhere (the Dashboard's Ask): the chat, with those words sent in it.
events.on<string | undefined>('chat.ask', (prompt) => panel.ask(prompt))

// ⌘K and the sidebar's Search (the admin's frame says when): the thread's `/`, which finds and does everything.
events.on<{ from?: Element } | undefined>('search.open', (opened) => panel.palette(opened?.from))

// Either modifier opens it, on every platform; the dock says the key by name for the shortcuts overlay.
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'j') {
    e.preventDefault()
    panel.toggle()
  }
})
