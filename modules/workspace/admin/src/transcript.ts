import type { SurfaceDocument, ViewNode } from '@letterncms/sdk'

/**
 * The neutral transcript, as the server keeps it (Cms\Modules\Workspace\Transcript): a thread's
 * turns, the person's and the answers, and `apply`, which builds an answer from the events it
 * streams with, exactly as the server does.
 */
export type ToolStatus = 'running' | 'ok' | 'error' | 'declined' | 'awaiting'

export interface Call {
  id: string
  name: string
  label: string
  input: Record<string, unknown>
  destructive: boolean
  /** The thread holds words others may have written, so changes ask first. */
  untrusted?: boolean
}

export type Part =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool'; id: string; name: string; label: string; ability?: string; input?: unknown; status: ToolStatus; output?: string; surface?: SurfaceDocument; used?: boolean }
  | { type: 'view'; view: ViewNode }
  | { type: 'surface'; surface: SurfaceDocument }
  | { type: 'notice'; tone: string; message: string }
  | { type: 'approval'; calls: Call[]; decided?: boolean }

export interface Attached {
  label: string
  kind?: string
  icon?: string
  to?: string
}

export interface UserTurn {
  id: string
  role: 'user'
  kind: 'message' | 'command' | 'search' | 'action'
  text: string
  command?: { ability: string; label: string; input: Record<string, unknown>; detail?: string }
  attached?: Attached[]
  /** An edit: the turn this one took the place of. */
  replaces?: string
  at?: string
  /** Shown before the server took it. */
  pending?: boolean
}

export interface AnswerTurn {
  id: string
  role: 'answer'
  parts: Part[]
  agent?: string
  at?: string
}

/** A line the thread says itself, kept only while it is on view (Stopped.). */
export interface NoteTurn {
  id: string
  role: 'note'
  text: string
  tone: string
}

export type Turn = UserTurn | AnswerTurn | NoteTurn

let local = 0
export const localId = () => `local-${++local}`

function patchTool(turns: Turn[], id: string, patch: Partial<Extract<Part, { type: 'tool' }>>): Turn[] {
  for (let t = turns.length - 1; t >= 0; t--) {
    const turn = turns[t]
    if (turn.role !== 'answer') continue
    const p = turn.parts.findIndex((part) => part.type === 'tool' && part.id === id)
    if (p >= 0) {
      const parts = turn.parts.slice()
      parts[p] = { ...(parts[p] as Extract<Part, { type: 'tool' }>), ...patch }
      const next = turns.slice()
      next[t] = { ...turn, parts }
      return next
    }
  }
  return turns
}

/** Turns with one event applied, as the server applies it. */
export function apply(turns: Turn[], event: string, data: any): Turn[] {
  if (event === 'tool_result') {
    return patchTool(turns, data.id, {
      status: data.declined ? 'declined' : data.ok ? 'ok' : 'error',
      ...(data.output !== undefined ? { output: String(data.output).slice(0, 4000) } : {}),
      ...(data.input !== undefined ? { input: data.input } : {}),
      ...(data.surface ? { surface: data.surface } : {}),
      ...(data.ability ? { ability: data.ability } : {}),
    })
  }
  if (event === 'surface_used') return patchTool(turns, data.id, { used: true })

  const part: Part | null = event === 'text' || event === 'thinking' ? { type: event, text: String(data.delta ?? '') }
    : event === 'tool' ? { type: 'tool', id: data.id, name: data.name, label: data.label ?? data.name, status: 'running', ...(data.ability ? { ability: data.ability } : {}) }
      : event === 'notice' ? { type: 'notice', tone: data.tone ?? 'neutral', message: data.message ?? '' }
        : event === 'view' ? { type: 'view', view: data.view }
          : event === 'surface' ? { type: 'surface', surface: data.surface }
            : event === 'approval' ? { type: 'approval', calls: data.calls ?? [] }
              : null
  if (!part) return turns

  let next = turns.slice()
  let last = next[next.length - 1]
  if (last?.role !== 'answer') {
    last = { id: localId(), role: 'answer', parts: [] }
    next.push(last)
  }
  const parts = last.parts.slice()
  const tail = parts[parts.length - 1]
  if ((part.type === 'text' || part.type === 'thinking') && tail?.type === part.type) parts[parts.length - 1] = { ...tail, text: tail.text + part.text }
  else parts.push(part)
  next[next.length - 1] = { ...last, parts }

  if (part.type === 'approval') {
    for (const call of part.calls) next = patchTool(next, call.id, { status: 'awaiting', input: call.input })
  }
  return next
}

/** What waits for the person's go-ahead: the last answer's approval, until decided. */
export function awaiting(turns: Turn[]): Call[] {
  const last = turns.findLast((turn) => turn.role !== 'note')
  if (last?.role !== 'answer') return []
  const approval = last.parts.findLast((part) => part.type === 'approval')
  return approval?.type === 'approval' && !approval.decided ? approval.calls : []
}

/** The approval decided; with `declined`, none of its calls ran. */
export function decided(turns: Turn[], declined = false, approved: string[] = []): Turn[] {
  const index = turns.findLastIndex((turn) => turn.role === 'answer')
  const last = turns[index]
  if (last?.role !== 'answer') return turns
  const at = last.parts.findLastIndex((part) => part.type === 'approval' && !part.decided)
  if (at < 0) return turns
  const approval = last.parts[at] as Extract<Part, { type: 'approval' }>
  let next = turns.slice()
  next[index] = { ...last, parts: last.parts.map((part, i) => i === at ? { ...approval, decided: true } : part) }
  for (const call of approval.calls) next = patchTool(next, call.id, { status: declined || !approved.includes(call.id) ? 'declined' : 'running' })
  return next
}

/** Text of an answer, for copying. */
export const answerText = (turn: AnswerTurn) => turn.parts.filter((part) => part.type === 'text').map((part) => (part as { text: string }).text).join('\n\n')

/** The ability that opens a place of the admin for the person: any agent's ok result for it moves the admin there. */
export const OPEN = 'admin/open'

/** Where an `admin/open` result leads, and what it's called, from its output. */
export function opened(output: string | undefined): { to: string; label: string } | null {
  try {
    const value = JSON.parse(output ?? '')
    return value && typeof value.to === 'string' && value.to.startsWith('/') && !value.to.startsWith('//') ? { to: value.to, label: typeof value.label === 'string' ? value.label : value.to } : null
  } catch {
    return null
  }
}
