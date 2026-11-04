import { eventStream, events, loadManifest, navigate, queryClient, run, screenContext, t, CmsError, type SurfaceAction } from '@letterncms/sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { attachments, forget, messageContext } from './context'
import { agent, panel } from './store'
import { apply, awaiting as waiting, decided, localId, OPEN, opened, type Call, type Turn, type UserTurn } from './transcript'

interface Loaded {
  id: string
  title: string
  turns: Turn[]
  awaiting: Call[]
  /** What the agent shows of its state (a model picked); null without one. */
  agent: Record<string, unknown> | null
}

/**
 * Open a place of the admin for the person. A full-size thread steps back beside the page; on a phone,
 * where the thread covers the page, it makes way for it.
 */
export function go(to: string) {
  if (panel.get().mode === 'full') panel.set({ mode: 'docked' })
  navigate(to)
  if (window.matchMedia('(max-width: 767px)').matches) panel.close()
}

/** Why a command did not run, for the form that asked for it. */
export interface Refusal {
  message: string
  details: Record<string, string>
}

/** One thread: its turns, what streams into it, and what can be done in it. */
export function useThread(thread: string | null, fresh = 0) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [state, setState] = useState<Record<string, unknown> | null>(null)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  const current = useRef(thread)
  const currentFresh = useRef(fresh)

  // Load a saved thread (unless it is the one we are streaming into).
  useEffect(() => {
    if (thread === current.current && fresh === currentFresh.current && (turns.length || busy)) return
    currentFresh.current = fresh
    abort.current?.abort()
    abort.current = null
    setBusy(false)
    setLoading(false)
    current.current = thread
    setTurns([])
    setTitle('')
    setState(null)
    setError(null)
    if (!thread) return
    let canceled = false
    setLoading(true)
    run<Loaded>('threads/get', { id: thread })
      .then((loaded) => {
        if (canceled) return
        setTurns(loaded.turns)
        setTitle(loaded.title)
        setState(loaded.agent)
        panel.set({ title: loaded.title })
      })
      .catch((e: CmsError) => {
        if (canceled) return
        if (e.status === 404) panel.deleted(thread)
        else setError(e.message)
      })
      .finally(() => !canceled && setLoading(false))
    return () => {
      canceled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread, fresh])

  useEffect(() => () => abort.current?.abort(), [])

  /** One turn, streamed. Resolves with whether the server took it, or why it refused it. */
  const stream = useCallback(async (body: Record<string, unknown>, { shown, onAccepted, form = false }: { shown?: UserTurn; onAccepted?: () => void; form?: boolean } = {}): Promise<true | Refusal> => {
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    setError(null)
    let working = { thread: current.current, title: panel.get().title || String(body.message ?? body.search ?? shown?.text ?? t('New Chat')) }
    panel.set({ working })
    if (shown) setTurns((list) => [...list, shown])
    let mutated = false
    let accepted = false
    let refused: Refusal | null = null
    const said = typeof body.message === 'string'
    // The agent names a thread when it first answers in it, or when the message that started it changed.
    const edited = (body.edit as { turn: string } | undefined)?.turn
    const names = said && (!turns.some((turn) => turn.role === 'answer' && turn.agent) || (edited !== undefined && turns.find((turn) => turn.role === 'user')?.id === edited))
    try {
      // Only what someone says carries the page; deciding and clicking go on from there.
      if (body.edit) forget(current.current)
      const page = said ? await messageContext(current.current) : null
      if (controller.signal.aborted) return { message: '', details: {} }
      await eventStream(
        'workspace/turn',
        { thread: current.current, ...body, ...(page ? { context: page.context, agent: panel.get().options[current.current ?? 'new'] ?? {} } : {}) },
        (event, data) => {
          if (controller.signal.aborted || abort.current !== controller) return
          switch (event) {
            case 'thread':
              current.current = data.id
              page?.carry(data.id)
              working = { thread: data.id, title: data.title }
              panel.set({ working })
              setTitle(data.title)
              panel.created(data.id, data.title)
              void queryClient.invalidateQueries({ queryKey: ['threads/list'] })
              break
            case 'turn': {
              const turn = data.turn as Turn
              if (turn.role === 'user') {
                accepted = true
                setTurns((list) => {
                  const at = turn.replaces ? list.findIndex((other) => other.id === turn.replaces) : list.findLastIndex((other) => other.role === 'user' && other.pending)
                  return at < 0 ? [...list, turn] : [...list.slice(0, at), turn, ...(turn.replaces ? [] : list.slice(at + 1))]
                })
                if (turn.replaces) onAccepted?.()
              } else setTurns((list) => [...list, turn])
              break
            }
            case 'error':
              refused = { message: data.message, details: data.details ?? {} }
              break
            case 'done':
              setTitle(data.thread.title)
              setState(data.agent ?? null)
              panel.set({ title: data.thread.title })
              break
            default:
              // The agent opened a place for the person: the admin goes there now, the thread beside it. Only as it happens, never on a reload.
              if (event === 'tool_result' && data.ok && data.ability === OPEN) {
                const place = opened(data.output)
                if (place) go(place.to)
              }
              if (event === 'tool_result' && data.mutated) {
                mutated = true
                void queryClient.invalidateQueries()
                // An open editor shows what just changed.
                events.emit('content.changed')
              }
              setTurns((list) => apply(list, event, data))
          }
        },
        controller.signal,
      )
    } catch (e) {
      if (!controller.signal.aborted) refused = { message: e instanceof CmsError || e instanceof Error ? e.message : t('Something went wrong.'), details: e instanceof CmsError ? e.details : {} }
    } finally {
      if (refused && !accepted) setTurns((list) => list.filter((turn) => !(turn.role === 'user' && turn.pending)))
      // A command is answered at once; whatever it changed shows everywhere.
      if (body.command && !refused) {
        mutated = true
        void queryClient.invalidateQueries()
        events.emit('content.changed')
      }
      if (mutated) {
        try {
          await loadManifest() // Package and schema changes bring the shared component registry along immediately.
        } catch { /* The next screen loads it. */ }
      }
      if (panel.get().working === working) panel.set({ working: null })
      if (abort.current === controller) {
        abort.current = null
        setBusy(false)
      }
      void queryClient.invalidateQueries({ queryKey: ['threads/list'] })
      if (names && current.current && accepted && agent()) void name(current.current)
    }
    // A refusal that a form asked for is said on its fields; anything else in the thread.
    if (refused && !(form && Object.keys((refused as Refusal).details).length)) setError((refused as Refusal).message)
    return refused ?? true
  }, [turns])

  /** The agent names a thread after its first answer; until then it goes by its first words. */
  const name = async (id: string) => {
    try {
      const { title: named } = await run<{ title: string }>('threads/rename', { id })
      if (current.current === id) {
        setTitle(named)
        panel.set({ title: named })
      }
      void queryClient.invalidateQueries({ queryKey: ['threads/list'] })
    } catch { /* It keeps the name it has. */ }
  }

  const pendingTurn = (kind: UserTurn['kind'], text: string, extra: Partial<UserTurn> = {}): UserTurn => ({ id: localId(), role: 'user', kind, text, pending: true, ...extra })

  /** Plain words: for the agent when there is one, otherwise a search. Shown at once with what it carries, so nothing moves when the server has it. */
  const send = useCallback((text: string) => {
    const words = text.trim()
    if (!words) return
    // A new message declines anything still waiting (the server does the same).
    setTurns((list) => decided(list, true))
    const state = panel.get()
    const skill = state.skills[current.current ?? 'new']
    const carried = agent() ? [
      ...attachments(screenContext.get(), state).map((item) => ({ label: item.label, ...(item.kind ? { kind: item.kind } : {}), ...(item.icon ? { icon: item.icon } : {}), ...(item.to && /^\/[A-Za-z0-9/_.-]{0,199}$/.test(item.to) ? { to: item.to } : {}) })),
      ...(skill ? [{ kind: 'skill', label: skill.label, ...(skill.icon ? { icon: skill.icon } : {}) }] : []),
    ] : []
    void stream(agent() ? { message: words } : { search: words }, { shown: pendingTurn(agent() ? 'message' : 'search', words, carried.length ? { attached: carried } : {}) })
  }, [stream])

  /** A search, without the agent: fast, and no tokens. */
  const search = useCallback((text: string) => {
    const words = text.trim()
    if (!words) return
    setTurns((list) => decided(list, true))
    void stream({ search: words }, { shown: pendingTurn('search', words) })
  }, [stream])

  /** Run an ability for the person: resolves with why it did not, for the `form` that asked for it to show. */
  const command = useCallback((ability: string, input: Record<string, unknown>, label: string, form = false, detail?: string) => (
    stream({ command: { ability, input, label, ...(detail ? { detail } : {}) } }, { shown: pendingTurn('command', label, { command: { ability, label, input, ...(detail ? { detail } : {}) } }), form })
  ), [stream])

  const edit = useCallback(async (turn: UserTurn, text: string, onAccepted?: () => void) => {
    if (abort.current || loading || !current.current || turn.pending || !text.trim()) return false
    const body = agent() && turn.kind === 'message' ? { message: text.trim() } : { search: text.trim() }
    return (await stream({ ...body, edit: { turn: turn.id, original: turn.text } }, { onAccepted })) === true
  }, [loading, stream])

  const decide = useCallback((approve: string[]) => {
    setTurns((list) => decided(list, false, approve))
    void stream({ approve })
  }, [stream])

  const stop = useCallback(() => {
    abort.current?.abort()
    abort.current = null
    setBusy(false)
    panel.set({ working: null })
    setTurns((list) => [...list.filter((turn) => !(turn.role === 'user' && turn.pending)), { id: localId(), role: 'note', text: t('Stopped. The step in progress still finishes on the server.'), tone: 'neutral' }])
  }, [])

  const interact = useCallback((tool: string, action: SurfaceAction) => {
    if (abort.current || waiting(turns).length || !current.current || loading) return
    const part = turns.flatMap((turn) => turn.role === 'answer' ? turn.parts : []).find((p) => p.type === 'tool' && p.id === tool)
    if (part?.type !== 'tool' || !part.surface || part.used) return
    void stream({ action: { tool, ...action } }, { shown: pendingTurn('action', t('Selected an action in “{title}”.', { title: part.surface.title })) })
  }, [turns, loading, stream])

  /** Named by the person: it shows at once. */
  const renamed = useCallback((named: string) => { setTitle(named); panel.set({ title: named }) }, [])

  return { renamed, turns, awaiting: waiting(turns), state, title, busy, loading, error, send, search, command, edit, decide, stop, interact, dismissError: () => setError(null) }
}
