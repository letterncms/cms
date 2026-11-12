import './styles.css'
import { registry, run, t } from '@letterncms/sdk'
import { toast } from '@letterncms/ui'
import { lazy } from 'react'

registry.widgets.set('email-status', lazy(() => import('./WidgetEmail')))

/** Sends a test email to the person signed in, with the settings as saved. */
async function sendTest(): Promise<void> {
  const me = await run<{ email: string }>('account/get')
  try {
    await run('email/test', { to: me.email })
    toast.success(t('Test email sent to {email}', { email: me.email }))
  } catch (e) {
    toast.error(e)
  }
}

/** Under / in the chat (and ⌘K): send a test email to yourself. */
registry.commands.set('email-test', {
  label: t('Send Test Email'),
  icon: 'mail',
  keywords: ['smtp', 'email', 'mail', 'test'],
  perform: sendTest,
})
