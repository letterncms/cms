import './styles.css'
import { registry, t } from '@letterncms/sdk'
import { ChatToggle } from './ChatToggle'
import './commands'
import { NewChatRow } from './NewChatRow'
import { WorkspacePanel } from './Panel'
import { agent, panel } from './store'

// The thread at the right edge of every screen; its toggle in each screen's bar; a fresh one first in the sidebar.
registry.panels.set('workspace', { id: 'workspace', slot: 'shell.dock', component: WorkspacePanel })
registry.panels.set('workspace-toggle', { id: 'workspace-toggle', slot: 'topbar.end', component: ChatToggle })
registry.panels.set('workspace-new-chat', { id: 'workspace-new-chat', slot: 'sidebar.start', component: NewChatRow })
// A thread's own URL is the dock at full size, over the page it came from. The dock owns streaming, so the route draws nothing.
registry.routes.set('/chat/:id', { path: '/chat/:id', component: () => null, overlay: true })

// New Chat in the command palette: with an agent, what was typed goes with it (read as the palette asks, so it follows the manifest).
registry.commands.set('workspace', {
  id: 'workspace',
  label: t('New Chat'),
  icon: 'compose',
  group: t('Chat'),
  get keywords() { return ['chat', 'thread', 'command', 'run', ...(agent() ? ['ai', 'ask', 'help', 'write', 'build'] : [])] },
  shortcut: 'mod+j',
  get acceptsQuery() { return agent() !== null },
  perform: (query?: string) => panel.ask(query),
})

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'j') {
    e.preventDefault()
    panel.toggle()
  }
})
