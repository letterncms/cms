import { boot, getManifest, navigate, useScreen, type ComposerOption, type ContextItem } from '@letterncms/sdk'
import { useSyncExternalStore } from 'react'

/** Where the thread is: out of the way, docked beside the page, or taking the whole window (a thread's own URL). */
export type Mode = 'closed' | 'docked' | 'full'

/** What `/` picked that still asks for input before it runs, per thread. */
export interface Pending {
  option: ComposerOption
  values: Record<string, unknown>
}

interface State {
  mode: Mode
  /** Over the page rather than beside it, by this person's choice. */
  detached: boolean
  /** In the dock, the list of chats takes the thread's place. */
  history: boolean
  /** Bumped to move the focus into the list of chats (All Chats). */
  focusList?: number
  thread: string | null
  /** Bumped for a fresh thread, so a new one starts over even when the last was never saved (its first turn failed). */
  fresh: number
  title: string
  prompt: string | null
  /** The prompt is a search, whatever answers messages. */
  searching: boolean
  focus: number
  contextPath: string
  /** What this person took off with its ×, of what a screen offers; it comes back on the next screen. */
  dismissed: string[]
  /** Text selected on the page. */
  selectedText: string
  /** Picked with @ for the next message, per thread ('new' before it exists). */
  attached: Record<string, ContextItem[]>
  /** A skill picked with / for the next message, likewise. */
  skills: Record<string, ComposerOption | null>
  /** A command picked with / that asks for its input first, likewise. */
  commands: Record<string, Pending | null>
  drafts: Record<string, string>
  /** What the agent's own controls in the composer chose, per thread ('new' before it exists): sent with the next message. */
  options: Record<string, Record<string, unknown>>
  working: { thread: string | null; title: string } | null
  /** Calls in the thread wait for this person's go-ahead. */
  awaiting: boolean
}

const OPEN = 'cms.chat.open'
const DETACHED = 'cms.chat.detached'
const CURRENT = 'cms.chat.current'

/** Reloading brings the thread back where it was; a phone or small window starts with the page. */
function restored(): Pick<State, 'mode' | 'thread' | 'detached'> {
  try {
    const open = localStorage.getItem(OPEN) === 'true' && window.matchMedia('(min-width: 1024px)').matches
    return { mode: open ? 'docked' : 'closed', thread: sessionStorage.getItem(CURRENT) || null, detached: localStorage.getItem(DETACHED) === 'true' }
  } catch {
    return { mode: 'closed', thread: null, detached: false }
  }
}

const listeners = new Set<() => void>()
let state: State = { ...restored(), fresh: 0, history: false, title: '', prompt: null, searching: false, focus: 0, contextPath: '/', dismissed: [], selectedText: '', attached: {}, skills: {}, commands: {}, drafts: {}, options: {}, working: null, awaiting: false }
/** Where maximizing started, to return to. */
let returnTo: string | null = null
/** What had the focus before the dock took it. */
let returnFocus: Element | null = null

export function threadPath(id: string | null) {
  return id ? `/chat/${encodeURIComponent(id)}` : '/chat/new'
}

export function threadAt(path: string): string | null | undefined {
  const match = /^\/chat\/([^/]+)$/.exec(path)
  return match ? (match[1] === 'new' ? null : decodeURIComponent(match[1])) : undefined
}

/** The agent that answers plain language for this person, when there is one: without it, a message is a search and nothing mentions AI. */
export function agent(): { name: string; label: string } | null {
  return (getManifest().config?.workspace?.agent as { name: string; label: string } | null | undefined) ?? null
}

const here = () => window.location.pathname.slice(boot.base.length) || '/'

/** The thread's URL replaces the page's while the page stays open underneath: nothing is being left. */
function visit(id: string | null, replace = false) {
  const path = threadPath(id)
  if (here() !== path) navigate(path, { replace, overlay: true })
}

function persist() {
  try {
    localStorage.setItem(OPEN, String(state.mode !== 'closed'))
    localStorage.setItem(DETACHED, String(state.detached))
    if (state.thread) sessionStorage.setItem(CURRENT, state.thread)
    else sessionStorage.removeItem(CURRENT)
  } catch { /* Optional preference. */ }
}

const key = () => state.thread ?? 'new'

/** The one thread of the admin: where it is, in-memory drafts and picks survive moving between screens. */
export const panel = {
  get: () => state,
  key,
  set(patch: Partial<State>) {
    const before = state
    state = { ...state, ...(patch.thread !== undefined && patch.thread !== state.thread ? { title: '' } : {}), ...patch }
    listeners.forEach((listener) => listener())
    if (state.mode !== before.mode || state.thread !== before.thread || state.detached !== before.detached) persist()
  },
  /** Bring it up, with the focus in its composer. */
  open() {
    if (state.mode === 'closed') {
      returnFocus = document.activeElement
      panel.set({ mode: 'docked', focus: state.focus + 1 })
    } else panel.set({ focus: state.focus + 1 })
  },
  close() {
    if (state.mode === 'closed') return
    const full = state.mode === 'full'
    panel.set({ mode: 'closed' })
    if (full) navigate(returnTo ?? '/', { overlay: returnTo !== null })
    // Back where it was, or to what opens it again.
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected && returnFocus !== document.body) returnFocus.focus()
    else document.querySelector<HTMLElement>('[data-workspace-toggle]')?.focus()
    returnFocus = null
  },
  /** ⌘J: bring it up; from inside it, put it away again. */
  toggle() {
    const inside = document.activeElement?.closest('.cms-dock')
    if (state.mode === 'closed' || !inside) panel.open()
    else if (state.mode === 'full') panel.minimize()
    else panel.close()
  },
  maximize() {
    returnTo = here() + window.location.search
    visit(state.thread)
  },
  minimize() {
    if (state.mode !== 'full') return
    navigate(returnTo ?? '/', { overlay: returnTo !== null })
  },
  /** Open a thread where the thread is. */
  select(id: string | null) {
    if (state.mode === 'full') visit(id)
    if (state.mode === 'closed') returnFocus = document.activeElement
    panel.set({ thread: id, mode: state.mode === 'closed' ? 'docked' : state.mode, history: false, prompt: null, focus: state.focus + 1 })
  },
  /** A fresh thread. One whose first turn is still on its way goes on, and is that new thread. */
  newChat() {
    if (state.working?.thread !== null) panel.set({ fresh: state.fresh + 1 })
    panel.select(null)
  },
  ask(prompt?: string) {
    // An unsent message waits where it was written; a saved, finished thread starts fresh.
    if (state.drafts[key()]?.trim()) panel.select(state.thread)
    else panel.newChat()
    if (prompt?.trim()) panel.set({ prompt: prompt.trim(), searching: false })
  },
  /** Search in the thread on view, without asking the agent. */
  search(query: string) {
    if (query.trim()) panel.set({ prompt: query.trim(), searching: true })
  },
  draft(value: string) {
    panel.set({ drafts: { ...state.drafts, [key()]: value } })
  },
  option(name: string, value: unknown) {
    panel.set({ options: { ...state.options, [key()]: { ...(state.options[key()] ?? {}), [name]: value } } })
  },
  command(pending: Pending | null) {
    panel.set({ commands: { ...state.commands, [key()]: pending } })
  },
  deleted(id: string) {
    const { [id]: removed, ...drafts } = state.drafts
    const { [id]: picked, ...options } = state.options
    panel.set({ drafts, options })
    // A slow deletion must not pull someone away from another thread.
    if (here() === threadPath(id)) visit(null, true)
    if (state.thread === id) panel.set({ thread: null, prompt: null, focus: state.focus + 1 })
  },
  created(id: string, title: string) {
    if (state.thread !== id) {
      const { new: picked, ...options } = state.options
      const { new: pending, ...commands } = state.commands
      panel.set({ thread: id, title, drafts: { ...state.drafts, [id]: state.drafts.new ?? '', new: '' }, options: picked ? { ...options, [id]: picked } : options, commands: pending ? { ...commands, [id]: pending } : commands })
    }
    else panel.set({ title })
    if (here() === '/chat/new') visit(id, true)
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}

export function usePanel(): State {
  return useSyncExternalStore(panel.subscribe, panel.get)
}

/** Over the page: by choice, or because the screen has the right edge in use. */
export function useFloating() {
  return { chosen: usePanel().detached, required: useScreen().rightEdge === true }
}
