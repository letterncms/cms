import { t } from '@letterncms/sdk'
import { Button, Icon, Spinner, Tooltip } from '@letterncms/ui'
import { useLayoutEffect, useRef } from 'react'
import { panel, toggleReturn, usePanel } from './store'

/** In every screen's bar while the thread is away: a filled button that opens it as you left it. The thread's own close puts it back. */
export function ChatToggle() {
  const { mode, working, awaiting } = usePanel()
  const open = mode !== 'closed'
  const ref = useRef<HTMLButtonElement>(null)
  // Only coming back from the thread eases in, and takes the focus: a screen that loads with it closed just has it.
  useLayoutEffect(() => {
    const button = ref.current
    if (open || !button) return
    const { back, focus } = toggleReturn()
    button.toggleAttribute('data-back', back)
    if (focus) button.focus()
  }, [open])
  if (open) return null
  return (
    <Tooltip content={t('Chat')} shortcut="mod+j" side="bottom">
      <Button ref={ref} data-workspace-toggle variant="ghost" onClick={() => panel.open()} className="cms-chat-toggle bg-hover! text-ink! hover:bg-active!">
        {/* The bubble in the accent: the one touch of it on every screen. */}
        {!working && !awaiting && <Icon name="comment-solid" size={16} className="shrink-0 text-signal" />}
        {awaiting && <span role="status" aria-label={t('Waiting for your go-ahead')} className="size-1.5 rounded-full bg-signal ring-1 ring-border-strong" />}
        {!awaiting && working && <span role="status" aria-label={t('Working…')}><Spinner size={12} /></span>}
        <span className="max-sm:sr-only">{t('Chat')}</span>
      </Button>
    </Tooltip>
  )
}
