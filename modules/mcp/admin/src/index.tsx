import './styles.css'
import { invalidate, registry, run, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Button, SettingRow, SettingsPanel, Textarea, confirm, copyText, selectFieldTextOnClick, toast } from '@letterncms/ui'
import { lazy } from 'react'

interface Connected { agents: { name: string; connectedAt: string | null; lastUsedAt: string | null }[] }

/**
 * The Agents section of Account: the AI agents signed in as you over MCP, and the two things a new one
 * needs to connect. Labelled like every field of the page; the values wrap, so a phone shows all of them.
 */
function Agents() {
  const connected = useAbility<Connected>('mcp/agents', { limit: 1 })
  const endpoint = `${window.location.origin}/mcp`
  const command = `claude mcp add --transport http cms ${endpoint}`
  const disconnect = async (name: string) => {
    if (!(await confirm({ title: t('Disconnect {name}?', { name }), description: t('It stops working until you connect it again.'), confirm: t('Disconnect'), danger: true }))) return
    try {
      await run('mcp-agents/delete', { name })
      invalidate('mcp/', 'tokens/')
    } catch (e) {
      toast.error(e)
    }
  }
  const row = (label: string, value: string) => (
    <SettingRow label={label}>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <Textarea readOnly rows={1} aria-label={label} value={value} onClick={selectFieldTextOnClick} className="font-mono text-sm" />
        <Button size="md" icon="copy" onClick={() => void copyText(value, { copied: t('Copied') })}>{t('Copy')}</Button>
      </div>
    </SettingRow>
  )
  return (
    <div id="mcp" className="scroll-mt-16">
      <SettingsPanel>
        {connected.data?.agents.map((agent) => (
          <SettingRow key={agent.name} layout="end" label={<>{agent.name}<div className="mt-1 text-xs font-normal text-muted">{agent.lastUsedAt ? t('Active {time}', { time: timeAgo(agent.lastUsedAt) }) : t('Not used yet')}</div></>}>
            <Button variant="destructive" onClick={() => void disconnect(agent.name)}>{t('Disconnect')}</Button>
          </SettingRow>
        ))}
        {row(t('MCP Server URL'), endpoint)}
        {row('Claude Code', command)}
      </SettingsPanel>
    </div>
  )
}

registry.components.set('mcp/connect', Agents)
registry.widgets.set('mcp-agents', lazy(() => import('./WidgetAgents')))
