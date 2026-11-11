import './styles.css'
import { invalidate, registry, run, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Button, Field, List, Row, confirm, copyText, toast } from '@letterncms/ui'
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
    <Field label={label}>
      <div className="flex min-h-9 items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5 font-mono text-xs">
        <span className="min-w-0 flex-1 break-all">{value}</span>
        <Button size="xs" variant="ghost" icon="copy" className="font-sans" onClick={() => void copyText(value, { copied: t('Copied') })}>{t('Copy')}</Button>
      </div>
    </Field>
  )
  return (
    <div id="mcp" className="scroll-mt-16 space-y-4">
      {(connected.data?.agents.length ?? 0) > 0 && (
        <List>
          {connected.data!.agents.map((agent) => (
            <Row key={agent.name} className="min-h-12">
              <span className="min-w-0 truncate font-medium">{agent.name}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-muted">{agent.lastUsedAt ? t('Active {time}', { time: timeAgo(agent.lastUsedAt) }) : t('Not used yet')}</span>
              <Button variant="destructive" onClick={() => void disconnect(agent.name)}>{t('Disconnect')}</Button>
            </Row>
          ))}
        </List>
      )}
      {row(t('MCP Server URL'), endpoint)}
      {row('Claude Code', command)}
    </div>
  )
}

registry.components.set('mcp/connect', Agents)
registry.widgets.set('mcp-agents', lazy(() => import('./WidgetAgents')))
