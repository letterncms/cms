import { boot, getManifest, navigate, setPreference, useScreen, type ComposerOption, type ContextItem } from '@letterncms/sdk'
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
  /** Bumped when ⌘K writes a `/` in the composer, so the composer puts the caret after it. */
  palette: number
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
  /** The mode last switched to here, so what reads it is drawn again (the preference holds it). */
  chosen?: 'ai' | 'local'
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
let state: State = { ...restored(), fresh: 0, palette: 0, history: false, title: '', prompt: null, searching: false, focus: 0, contextPath: '/', dismissed: [], selectedText: '', attached: {}, skills: {}, commands: {}, drafts: {}, options: {}, working: null, awaiting: false }
/** Where maximizing started, to return to. */
let returnTo: string | null = null
/** What had the focus before the dock took it. */
let returnFocus: Element | null = null
/** When the thread was last put away, and whether the chat button takes the focus when it comes back. */
let closedAt = -Infinity
let toggleFocus = false

/** The chat button, drawn again: whether the thread was put away a moment ago, and whether the focus is its to take (once). */
export function toggleReturn(): { back: boolean; focus: boolean } {
  const focus = toggleFocus
  toggleFocus = false
  return { back: performance.now() - closedAt < 300, focus }
}

export function threadPath(id: string | null) {
  return id ? `/chat/${encodeURIComponent(id)}` : '/chat/new'
}

export function threadAt(path: string): string | null | undefined {
  const match = /^\/chat\/([^/]+)$/.exec(path)
  return match ? (match[1] === 'new' ? null : decodeURIComponent(match[1])) : undefined
}

const MODE = 'workspace.mode'

/** Whether plain words go to the AI or stay on the site (a search), as this person last switched it; until then, AI once it's set up. */
export function chosenMode(): 'ai' | 'local' {
  const saved = getManifest().user.preferences?.[MODE]
  return saved === 'local' || saved === 'ai' ? saved : ready() ? 'ai' : 'local'
}

/** Switch it: from the next message on, in every thread. */
export function chooseMode(mode: 'ai' | 'local') {
  void setPreference(MODE, mode).catch(() => {})
  panel.set({ chosen: mode })
}

/** The agent this site has for this person, set up and theirs to use, whatever mode they're in. */
export function ready(): { name: string; label: string } | null {
  return (getManifest().config?.workspace?.agent as { name: string; label: string } | null | undefined) ?? null
}

/** An agent this person could use once it's set up: its name, and where to set it up when they may. */
export function setup(): { label: string; to: string | null } | null {
  return (getManifest().config?.workspace?.setup as { label: string; to: string | null } | null | undefined) ?? null
}

/** The agent that answers plain language now: none in Local mode, or without one, and then a message is a search. */
export function agent(): { name: string; label: string } | null {
  return chosenMode() === 'local' ? null : ready()
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

/** A `/…` line at the end of a draft: what ⌘K writes, and what is typed after it. */
const SLASH = /(^|\n)\/[^\n]*$/

/** The `/` ⌘K wrote, while its menu is open: in which thread's composer, and whether the dock came out only for it (and goes again with it). */
let palette: { key: string; opened: boolean } | null = null

/** The menu ⌘K opened is done with: its `/…` line goes from the draft, unless what was typed is kept. */
function letGo(strip: boolean) {
  const was = palette
  palette = null
  const draft = was ? state.drafts[was.key] ?? '' : ''
  if (was && strip && SLASH.test(draft)) panel.set({ drafts: { ...state.drafts, [was.key]: draft.replace(SLASH, '') } })
  return was
}

/** What the last click away pressed: a click on Search that let go of the menu has done its work, and doesn't open it again. */
let letGoBy: Element | null = null

// A click anywhere but the dock lets go of the menu ⌘K opened, as of any palette. What the dock opens over the page (a menu, a dialog) is the dock's.
document.addEventListener('pointerdown', (e) => {
  letGoBy = null
  if (!palette || !(e.target instanceof Element) || e.target.closest('.cms-dock, [role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]')) return
  letGoBy = e.target
  panel.dismissPalette()
}, true)

/** A modal dialog of the page (a confirmation, Customize Sidebar) has the keys, and everything under it is inert, the dock with it. */
const modal = () => !!document.querySelector('.cms-dock')?.parentElement?.closest('[data-base-ui-inert]')

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
    letGo(true)
    if (state.mode === 'closed') return
    const full = state.mode === 'full'
    panel.set({ mode: 'closed' })
    if (full) navigate(returnTo ?? '/', { overlay: returnTo !== null })
    // Back where it was, or to what opens it again: the chat button, drawn again now that the thread is gone, takes it as it comes.
    closedAt = performance.now()
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected && returnFocus !== document.body) returnFocus.focus()
    else toggleFocus = true
    returnFocus = null
  },
  /**
   * ⌘K and the sidebar's Search: the composer with `/` written and its menu open, everything the admin can find and do.
   * What is written stays: the `/` goes on a line of its own after it. From inside, ⌘K puts the menu away again.
   */
  palette(from?: Element | null) {
    if (modal() || (from && letGoBy && from.contains(letGoBy))) return
    const inside = state.mode !== 'closed' && !!document.activeElement?.closest('.cms-dock')
    if (palette && inside) return panel.dismissPalette()
    const at = key()
    // A command asking for its input gives the composer back; the list of chats goes back to the thread.
    if (state.commands[at]) panel.command(null)
    const draft = state.drafts[at] ?? ''
    const next = SLASH.test(draft) ? draft : draft.trim() ? `${draft.trimEnd()}\n/` : '/'
    palette = { key: at, opened: state.mode === 'closed' || (palette?.opened ?? false) }
    if (state.mode === 'closed') returnFocus = document.activeElement
    panel.set({ mode: state.mode === 'closed' ? 'docked' : state.mode, history: false, drafts: { ...state.drafts, [at]: next }, palette: state.palette + 1, focus: state.focus + 1 })
  },
  /** Whether the menu on view is the one ⌘K opened. */
  inPalette: () => palette !== null && palette.key === key(),
  /** Esc, a click away, ⌘K again: its line goes, and a dock that came out only for it goes again. */
  dismissPalette() {
    const was = letGo(true)
    if (was?.opened) panel.close()
  },
  /** A line was picked. One that does its work elsewhere (a place, the theme) leaves no dock behind that came out only for it; one that answers in the thread keeps it. */
  pickedFromPalette(elsewhere: boolean) {
    const was = letGo(true)
    if (!was?.opened || !elsewhere) return
    panel.close()
    // What was picked takes the admin elsewhere: the focus goes there, not to the chat button.
    toggleFocus = false
  },
  /** The `/` was written away, or the caret left it: what is there now is someone's message, kept as it is. */
  leavePalette() {
    if (palette?.key === key()) letGo(false)
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
    if (id !== state.thread) letGo(true)
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
  /** Send these words in the thread on view, as a message or (without an agent) a search. */
  send(prompt: string) {
    if (prompt.trim()) panel.set({ prompt: prompt.trim(), searching: false })
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
