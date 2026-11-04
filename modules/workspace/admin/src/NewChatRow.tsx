import { t } from '@letterncms/sdk'
import { SidebarRow } from '@letterncms/ui'
import { panel } from './store'

/** The first row of the sidebar: a fresh thread at the right edge, where it always is. */
export function NewChatRow({ onNavigate }: { onNavigate?: () => void }) {
  return <SidebarRow label={t('New Chat')} icon="compose" onClick={() => { onNavigate?.(); panel.newChat() }} />
}
