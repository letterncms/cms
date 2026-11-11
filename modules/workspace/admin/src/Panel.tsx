import { adminUrl, CmsError, Link, panelsFor, registry, t, useAction, useLocation, useManifest, type ComposerOption, type SurfaceAction } from '@letterncms/sdk'
import { Button, Dock, Icon, IconButton, Menu, Notice, Spinner, Surface, Textarea, Tooltip, View, cn, confirm, copyText, fillTemplate, toast, useShortcutLabel, type ActionAsker, type ActionRunner } from '@letterncms/ui'
import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { Composer, coarse } from './Composer'
import { History, NewChatButton } from './History'
import { Rename } from './Rename'
import { Markdown } from './Markdown'
import { agent, panel, threadAt, useFloating, usePanel } from './store'
import { answerText, OPEN, opened, type AnswerTurn, type Call, type Part, type Turn, type UserTurn } from './transcript'
import { go, useThread } from './useThread'

/** How an answer's buttons run their abilities: as turns of the thread, so it says what they did; and ask for theirs in the composer. */
const Runner = createContext<{ run?: ActionRunner; ask?: ActionAsker }>({})

const wideQuery = window.matchMedia('(min-width: 1024px)')
const useWide = () => useSyncExternalStore((change) => {
  wideQuery.addEventListener('change', change)
  return () => wideQuery.removeEventListener('change', change)
}, () => wideQuery.matches)

/**
 * The thread, on every screen: docked at the right edge, the page open and live next
 * to it. A thread's URL is the same surface at full size, the list of threads beside it.
 * It stays mounted while closed, so an answer keeps coming.
 */
export function WorkspacePanel() {
  // The key itself is the module's (index.tsx); here it is said by name, so `?` lists it.
  useShortcutLabel('mod+j', t('Chat'))
  const { path } = useLocation()
  const { mode, title } = usePanel()
  const floating = useFloating()
  const id = threadAt(path)
  useLayoutEffect(() => {
    const state = panel.get()
    if (id === undefined) {
      if (path !== state.contextPath) panel.set({ contextPath: path, dismissed: [], selectedText: '' })
      if (state.mode === 'full') panel.set({ mode: 'docked' })
    } else {
      panel.set({ mode: 'full', history: false, ...(state.thread !== id ? { thread: id, prompt: null } : {}) })
    }
  }, [path, id])
  return (
    <Dock open={mode !== 'closed'} full={mode === 'full'} floating={floating.chosen || floating.required} label={title || t('New Chat')}>
      <Thread open={mode !== 'closed'} full={mode === 'full'} />
    </Dock>
  )
}

function Thread({ open, full }: { open: boolean; full: boolean }) {
  const { thread: id, fresh, prompt, searching, drafts, options, focus: requestedFocus, history, skills, commands } = usePanel()
  useManifest()
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const float = useFloating()
  const wide = useWide()
  const canMaximize = useSyncExternalStore((change) => {
    const media = window.matchMedia('(min-width: 768px)')
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, () => window.matchMedia('(min-width: 768px)').matches)
  // At full size the list has a column of its own; in the dock it is the thread's second page.
  const column = full && wide
  const thread = useThread(id, fresh)
  const answering = agent()
  useEffect(() => panel.set({ awaiting: thread.awaiting.length > 0 }), [thread.awaiting.length])
  const remove = useAction<{ deleted: boolean }, { id: string }>('threads/delete', {
    invalidates: ['threads/list'],
    onSuccess: (_, { id }) => {
      panel.deleted(id)
      toast.success(t('Chat deleted'))
    },
    onError: toast.error,
  })
  const key = id ?? 'new'
  const draft = drafts[key] ?? ''
  // Bumped to move the focus into the composer.
  const [focus, setFocus] = useState(0)
  const [editing, setEditing] = useState<number | null>(null)
  const [renaming, setRenaming] = useState(false)
  useEffect(() => setRenaming(false), [id])
  const scroller = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  // Words handed over from the command palette or the Dashboard.
  useEffect(() => {
    if (!open || !prompt || thread.busy || thread.loading || remove.isPending || editing !== null) return
    panel.set({ prompt: null, searching: false })
    if (searching) thread.search(prompt)
    else thread.send(prompt)
  }, [open, prompt, searching, thread, remove.isPending, editing])

  // To the composer when the thread opens, changes, or is asked to; on a touch screen only when asked, so the keyboard stays down after a command.
  const asked = useRef(requestedFocus)
  useEffect(() => {
    pinned.current = true
    setEditing(null)
    const requested = asked.current !== requestedFocus
    asked.current = requestedFocus
    if (open && (requested || !coarse())) setFocus((f) => f + 1)
  }, [id, open, requestedFocus])

  useLayoutEffect(() => {
    const el = scroller.current
    if (open && el && pinned.current) el.scrollTop = el.scrollHeight
  })

  const skill = skills[key]
  const sendable = !!draft.trim() || !!skill
  const blocked = thread.busy || thread.loading || remove.isPending || editing !== null
  const submit = () => {
    if (!sendable || blocked) return
    pinned.current = true
    // A skill says enough by itself.
    thread.send(draft.trim() || skill!.label)
    panel.draft('')
  }
  const runCommand = (option: ComposerOption, input: Record<string, unknown>, form: boolean, detail?: string) => {
    pinned.current = true
    return thread.command(option.command!.ability, input, option.label, form, detail)
  }
  // A button in an answer runs as a command of the thread, answered like any other; the thread says once what went wrong.
  const runner: ActionRunner = async (ability, input, action) => {
    pinned.current = true
    const result = await thread.command(ability, input, action.label, false)
    if (result !== true) throw new CmsError(result.message, 'invalid_input', 422, result.details)
    return result
  }
  // One that asks first asks in the composer, as a command picked with / does.
  const ask: ActionAsker = (action, scope) => {
    const form = fillTemplate(action.form!, scope)
    panel.command({ values: {}, option: { id: `ask:${action.ability}:${Date.now()}`, label: form.title, icon: action.icon, command: {
      ability: action.ability!, input: action.input ?? {}, scope, confirm: form.confirm ?? action.label,
      load: async () => ({ fields: form.fields, values: form.values ?? {} }),
    } } })
  }

  const surfaces = new Map<string, string>()
  for (const turn of thread.turns) {
    if (turn.role === 'answer') for (const part of turn.parts) {
      if (part.type === 'tool' && part.surface && part.status === 'ok') surfaces.set(part.surface.id, part.id)
    }
  }
  const surfaceProps = { disabled: thread.busy || thread.loading || thread.awaiting.length > 0 || editing !== null, onAction: thread.interact, surfaces }

  const deleteThread = async () => {
    if (!id || thread.busy || thread.loading || remove.isPending) return
    if (await confirm({
      title: t('Delete “{title}”?', { title: thread.title || t('New Chat') }),
      description: t('This chat and its messages will be permanently deleted.'),
      confirm: t('Delete Chat'),
      danger: true,
    })) remove.mutate({ id })
  }

  const empty = !thread.loading && !thread.turns.length
  // "New Chat" is the action; a thread that has nothing in it yet is just the chat.
  const title = thread.title || t('Chat')
  const listing = history && !column
  const composerProps = { thread: id, agent: answering, state: thread.state, options: options[key] ?? {}, setOption: panel.option, busy: thread.busy, loading: thread.loading }
  const footer = panelsFor('workspace.composer', composerProps)

  // Esc puts it away, unless something inside it takes the key first (a menu, a message being edited).
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]')) return
    if (listing) panel.set({ history: false })
    else if (full) panel.minimize()
    else panel.close()
  }

  return (
    <div className="cms-thread flex h-full min-h-0" data-full={full || undefined} onKeyDown={onKeyDown}>
      {column && (
        <div className="flex w-[260px] shrink-0 flex-col border-r border-border">
          <div className="flex h-12 shrink-0 items-center justify-between pl-[calc(1rem+var(--cms-sidebar-toggle,0px))] pr-2">
            <h2 className="m-0 text-sm font-semibold text-ink">{t('Chats')}</h2>
            <NewChatButton />
          </div>
          <History />
        </div>
      )}
      <section aria-label={title} data-empty={(full && empty) || undefined} className="cms-thread-page relative flex min-w-0 flex-1 flex-col">
        <header data-dock-drag className={cn('flex h-12 shrink-0 items-center gap-0.5 border-b border-border pr-2', full && !column ? 'pl-[calc(0.75rem+var(--cms-sidebar-toggle,0px))]' : 'pl-3')}>
          {listing && (
            <Tooltip content={t('Back to Chat')} side="bottom">
              <IconButton icon="arrow-left" label={t('Back to Chat')} title={undefined} className="-ml-1 mr-0.5" onClick={() => panel.set({ history: false })} />
            </Tooltip>
          )}
          {renaming && id && !listing
            ? <Rename id={id} title={title} onDone={(named) => { setRenaming(false); if (named) thread.renamed(named) }} />
            : <h2 className="m-0 min-w-0 flex-1 truncate text-sm font-medium text-ink">{listing ? t('Chats') : title}</h2>}
          {/* A fresh thread is already the new one. */}
          {!column && (id || !empty || listing) && <NewChatButton />}
          {!column && id && !listing && (
            <Tooltip content={t('All Chats')} side="bottom">
              <IconButton icon="history" label={t('All Chats')} title={undefined} onClick={() => panel.set({ history: true, focusList: (panel.get().focusList ?? 0) + 1 })} />
            </Tooltip>
          )}
          {id && !listing && (
            <Menu
              trigger={<IconButton icon="more" label={t('Chat Actions')} disabled={remove.isPending} />}
              items={[
                { label: t('Rename Chat'), icon: 'edit', disabled: thread.loading, onSelect: () => setRenaming(true) },
                { label: t('Delete Chat'), icon: 'trash', danger: true, disabled: thread.busy || thread.loading || remove.isPending, onSelect: deleteThread },
              ]}
            />
          )}
          {canMaximize && !full && !float.required && (
            <Tooltip content={float.chosen ? t('Dock Beside the Page') : t('Detach')} side="bottom">
              <IconButton icon={float.chosen ? 'sidebar' : 'detach'} label={float.chosen ? t('Dock Beside the Page') : t('Detach')} title={undefined} onClick={() => panel.set({ detached: !float.chosen })} />
            </Tooltip>
          )}
          {canMaximize && (
            <Tooltip content={full ? t('Back to the Page') : t('Full Size')} side="bottom">
              <IconButton icon={full ? 'minimize' : 'maximize'} label={full ? t('Back to the Page') : t('Full Size')} title={undefined} onClick={() => (full ? panel.minimize() : panel.maximize())} />
            </Tooltip>
          )}
          {!full && (
            <Tooltip content={t('Close')} shortcut="mod+j" side="bottom">
              <IconButton icon="close" label={t('Close')} title={undefined} onClick={() => panel.close()} />
            </Tooltip>
          )}
        </header>
        {listing ? <History /> : <>
          {empty && !column && <History />}
          <div
            ref={scroller}
            onScroll={(e) => {
              const el = e.currentTarget
              pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
            }}
            className={cn('cms-thread-scroll min-h-0 overflow-y-auto overscroll-contain', empty && !column ? 'shrink-0' : 'flex-1')}
          >
            {thread.loading ? (
              <div className="grid h-full place-items-center text-faint"><Spinner /></div>
            ) : thread.turns.length === 0 ? (
              <Welcome asking={!!answering} />
            ) : (
              <Runner.Provider value={{ run: runner, ask }}><div className="cms-thread-turns cms-thread-width space-y-6 py-5">
                {thread.turns.map((turn, i) => (
                  <TurnView
                    key={`${id}:${turn.id}`}
                    turn={turn}
                    {...surfaceProps}
                    editing={editing === i}
                    onEditingChange={(value) => {
                      if (panel.get().thread === id) setEditing((active) => value ? i : active === i ? null : active)
                    }}
                    editingDisabled={thread.busy || thread.loading || remove.isPending}
                    onEdit={thread.edit}
                  />
                ))}
                {thread.busy && <Working turns={thread.turns} />}
              </div></Runner.Provider>
            )}
          </div>

          {thread.error && (
            <div className="cms-thread-width w-full shrink-0 pb-2">
              <Notice tone="danger" onDismiss={thread.dismissError}>{thread.error}</Notice>
            </div>
          )}

          {thread.awaiting.length > 0 && editing === null && <Approval calls={thread.awaiting} onDecide={thread.decide} />}

          <div className="cms-thread-footer cms-thread-width w-full shrink-0">
            <Composer
              placeholder={thread.awaiting.length ? t('Or say what to do instead…') : answering ? t('Ask anything, or / for a command') : t('Search, or / for a command')}
              focus={focus}
              busy={blocked}
              onSubmit={submit}
              onCommand={runCommand}
            >
              <div className="flex items-center gap-2 px-2 pb-2">
                <div className="flex min-w-0 flex-1 items-center">
                  {footer.map(({ id: panelId, component: Footer }) => <Footer key={panelId} {...composerProps} />)}
                </div>
                {thread.busy && answering ? (
                  <IconButton icon="stop" label={t('Stop')} variant="secondary" onClick={thread.stop} />
                ) : (
                  <IconButton icon="arrow-up" label={answering ? t('Send') : t('Search')} variant="primary" onClick={submit} disabled={!sendable || blocked || !!commands[key]} />
                )}
              </div>
            </Composer>
          </div>
        </>}
      </section>
    </div>
  )
}

/** A new thread: an empty page and the composer, nothing to read first. */
function Welcome({ asking }: { asking: boolean }) {
  return (
    <div className="cms-thread-welcome cms-thread-width flex min-h-full flex-col justify-end pb-3 pt-2">
      <h2 className="cms-thread-greeting m-0 font-semibold tracking-[-0.02em] text-ink">{asking ? t('What should we work on?') : t('What are you looking for?')}</h2>
    </div>
  )
}

interface SurfaceHostProps {
  disabled: boolean
  onAction: (tool: string, action: SurfaceAction) => void
  surfaces: Map<string, string>
}

interface TurnProps extends SurfaceHostProps {
  turn: Turn
  editing: boolean
  onEditingChange: (value: boolean) => void
  editingDisabled: boolean
  onEdit: (turn: UserTurn, text: string, onAccepted?: () => void) => Promise<boolean>
}

function TurnView({ turn, editing, onEditingChange, editingDisabled, onEdit, ...host }: TurnProps) {
  if (turn.role === 'note') {
    return (
      <p className={cn('m-0 flex items-center gap-1.5 text-xs', turn.tone === 'warning' ? 'text-warning' : 'text-faint')}>
        <Icon name={turn.tone === 'warning' ? 'warning' : 'info'} size={13} /> {turn.text}
      </p>
    )
  }
  if (turn.role === 'user') return <Said turn={turn} editing={editing} onEditingChange={onEditingChange} editingDisabled={editingDisabled} onEdit={onEdit} />
  return <Answer turn={turn} {...host} />
}

/** What the person said, searched or ran. A message or a search can be changed, and what followed it goes. */
function Said({ turn, editing, onEditingChange, editingDisabled, onEdit }: Omit<TurnProps, keyof SurfaceHostProps> & { turn: UserTurn }) {
  const [draft, setDraft] = useState('')
  const editButton = useRef<HTMLButtonElement>(null)
  const cancel = () => { onEditingChange(false); requestAnimationFrame(() => editButton.current?.focus()) }
  const save = async () => {
    if (editingDisabled || !draft.trim() || draft.trim() === turn.text) return
    await onEdit(turn, draft, cancel)
  }
  if (turn.kind === 'action') return <p className="m-0 text-right text-xs text-faint">{turn.text}</p>
  const editable = !turn.pending && (turn.kind === 'message' || turn.kind === 'search')
  return (
    <div className="cms-thread-message flex flex-col items-end gap-1">
      {turn.attached && turn.attached.length > 0 && !editing && <Carried items={turn.attached} />}
      {editing ? (
        <form className="cms-thread-message-editor w-full rounded-xl border border-border-strong bg-surface p-3" onSubmit={(e) => { e.preventDefault(); void save() }}>
          <Textarea autoFocus aria-label={t('Edit message')} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={20000} disabled={editingDisabled} rows={2} className="max-h-52 resize-none" onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Escape') { e.preventDefault(); cancel() }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void save() }
          }} />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" disabled={editingDisabled} onClick={cancel}>{t('Cancel')}</Button>
            <Button type="submit" size="sm" variant="primary" disabled={editingDisabled || !draft.trim() || draft.trim() === turn.text}>{t('Save & Send')}</Button>
          </div>
        </form>
      ) : turn.kind === 'command' ? (
        <div className="cms-thread-bubble flex max-w-[85%] items-baseline gap-1.5 rounded-xl px-3.5 py-2 text-sm text-text">
          <span className="shrink-0 font-mono text-xs text-faint">/</span>
          <span className="shrink-0 font-medium">{turn.text}</span>
          {(turn.command?.detail ?? said(turn)) && <span className="min-w-0 truncate text-muted">{turn.command?.detail ?? said(turn)}</span>}
        </div>
      ) : (
        <div className="cms-thread-bubble max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3.5 py-2 text-sm text-text">
          {turn.kind === 'search' && <Icon name="search" size={13} className="-mt-0.5 mr-1.5 inline-block text-faint" />}
          {turn.text}
        </div>
      )}
      {!editing && <div className="cms-thread-message-actions flex items-center gap-0.5">
        {turn.kind !== 'command' && <CopyMessage text={turn.text} />}
        {editable && <Tooltip content={t('Edit message')}><IconButton ref={editButton} icon="edit" label={t('Edit message')} title={undefined} disabled={editingDisabled} onClick={() => { setDraft(turn.text); onEditingChange(true) }} /></Tooltip>}
      </div>}
    </div>
  )
}

/** What chose where a command acts rather than what it says: not repeated after its name. */
const WHERE = new Set(['collection', 'namespace', 'handle', 'id', 'entry', 'locale', 'parentId', 'status'])

/** What a command was given, in words: its short values, after its name. */
function said(turn: UserTurn): string {
  return Object.entries(turn.command?.input ?? {}).filter(([key]) => !WHERE.has(key)).map(([, value]) => value).filter((value): value is string | number => (typeof value === 'string' && value.length > 0 && value.length < 80 && !/^[0-9a-hjkmnp-tv-z]{26}$/i.test(value)) || typeof value === 'number').slice(0, 3).join(' · ')
}

function Answer({ turn, ...host }: { turn: AnswerTurn } & SurfaceHostProps) {
  const text = answerText(turn)
  return (
    <div className="cms-thread-message space-y-2">
      {turn.parts.map((part, i) => <PartView key={part.type === 'tool' ? part.id : i} part={part} {...host} />)}
      {text.trim() && <div className="cms-thread-message-actions flex items-center"><CopyMessage text={text} /></div>}
    </div>
  )
}

/** What a message carried, each thing one click away where it has a place in the admin. */
function Carried({ items }: { items: NonNullable<UserTurn['attached']> }) {
  return (
    <div className="flex max-w-[85%] flex-wrap justify-end gap-x-2 gap-y-0.5">
      {items.map((item, i) => {
        const inner = <><Icon name={item.icon ?? 'file'} size={11} className="shrink-0" /><span className="truncate">{item.label}</span></>
        const className = 'flex min-w-0 max-w-full items-center gap-1 rounded-xs text-xs text-faint no-underline'
        return item.to
          ? <Link key={i} to={item.to} className={cn(className, 'hover:text-muted')}>{inner}</Link>
          : <span key={i} className={className}>{inner}</span>
      })}
    </div>
  )
}

function CopyMessage({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])
  const label = copied ? t('Copied') : t('Copy message')
  return <>
    <Tooltip content={label}><IconButton icon={copied ? 'check' : 'copy'} label={label} title={undefined} onClick={async () => {
      if (await copyText(text, { failed: t('Could not copy the message. Try again.') })) setCopied(true)
    }} /></Tooltip>
    <span role="status" className="sr-only">{copied ? t('Message copied') : ''}</span>
  </>
}

function PartView({ part, disabled, onAction, surfaces }: { part: Part } & SurfaceHostProps) {
  const { run, ask } = useContext(Runner)
  if (part.type === 'text') return <Markdown text={part.text} />
  if (part.type === 'thinking') return <Thinking text={part.text} />
  // A command's or a search's answer: a view to act on, its buttons running as the person.
  if (part.type === 'view') return <div className="cms-thread-view min-w-0"><View root={part.view} embedded run={run} ask={ask} /></div>
  if (part.type === 'surface') return <Surface document={part.surface} disabled />
  if (part.type === 'notice') {
    return (
      <p className={cn('m-0 flex items-center gap-1.5 text-xs', part.tone === 'warning' || part.tone === 'danger' ? 'text-warning' : 'text-faint')}>
        <Icon name={part.tone === 'warning' || part.tone === 'danger' ? 'warning' : 'info'} size={13} /> {part.message}
      </p>
    )
  }
  if (part.type === 'approval') return null
  // Opened for the person: said in a line, the place one click away to go back to.
  if (part.ability === OPEN && part.status === 'ok') {
    const place = opened(part.output)
    if (place) {
      return (
        <p className="m-0 flex min-h-8 items-center gap-1.5 text-xs text-faint">
          <Icon name="arrow-right" size={13} className="shrink-0" />
          <span className="shrink-0">{t('Opened')}</span>
          <a href={adminUrl(place.to)} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); go(place.to) }} className="min-w-0 truncate text-muted underline decoration-border-strong underline-offset-2 hover:text-text">{place.label}</a>
        </p>
      )
    }
  }
  if (part.surface && part.status === 'ok') {
    if (surfaces.get(part.surface.id) !== part.id) return null
    return <Surface document={part.surface} disabled={disabled || part.used} onAction={(action) => onAction(part.id, action)} />
  }
  return <ToolRow part={part} />
}

function Thinking({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button variant="ghost" size="xs" onClick={() => setOpen(!open)} className="-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted" aria-expanded={open}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={11} /> {t('Thought Process')}
      </Button>
      {open && <p className="m-0 mt-1.5 whitespace-pre-wrap border-l border-border pl-3 text-xs leading-relaxed text-muted">{text}</p>}
    </div>
  )
}

const statusIcon = { ok: 'check', error: 'x-circle', declined: 'minus', awaiting: 'pause' } as const

function ToolRow({ part }: { part: Extract<Part, { type: 'tool' }> }) {
  const [open, setOpen] = useState(false)
  const hint = summary(part.input) || detail(part.input)

  return (
    <div className="rounded-sm border border-border">
      <Button variant="ghost" size="md" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full !justify-start !gap-2 !rounded-none !px-2.5 !text-xs !font-normal">
        {part.status === 'running' ? (
          <Spinner size={12} />
        ) : (
          <Icon name={statusIcon[part.status]} size={13} className={cn(part.status === 'ok' ? 'text-success' : part.status === 'error' ? 'text-danger' : 'text-faint')} />
        )}
        <span className={cn('shrink-0 font-medium', part.status === 'declined' ? 'text-faint line-through' : 'text-text')}>{part.label}</span>
        {hint && <span className="min-w-0 flex-1 truncate text-faint">{hint}</span>}
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={11} className="ml-auto shrink-0 text-faint" />
      </Button>
      {open && (
        <div className="space-y-2 border-t border-border bg-surface px-2.5 py-2">
          {part.input !== undefined && <Code label={t('Input')} value={JSON.stringify(part.input, null, 2)} />}
          {part.output && <Code label={part.status === 'error' ? t('Error') : t('Result')} value={pretty(part.output)} />}
        </div>
      )}
    </div>
  )
}

function Code({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="cms-label mb-1">{label}</div>
      <pre className="m-0 max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-2xs leading-relaxed text-muted">{value}</pre>
    </div>
  )
}

function Approval({ calls, onDecide }: { calls: Call[]; onDecide: (ids: string[]) => void }) {
  const danger = calls.some((c) => c.destructive)
  return (
    <div className="cms-thread-width w-full shrink-0 pb-2">
      <div className="flex max-h-[40dvh] flex-col gap-2.5 overflow-y-auto rounded-xl border border-border-strong bg-surface p-3 shadow-sm">
        <p className="m-0 flex items-center gap-1.5 text-sm font-medium text-ink">
          <Icon name="shield" size={14} /> {calls.length === 1 ? t('Allow this action?') : t('Allow these {count} actions?', { count: calls.length })}
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {calls.map((c) => <ApprovalCall key={c.id} call={c} />)}
        </ul>
        {calls.some((c) => c.untrusted) && <p className="m-0 text-xs text-muted">{t('After reading site content')}</p>}
        {/* The safe answer has the focus; the go-ahead says what it does. */}
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => onDecide([])} autoFocus>{t('Decline')}</Button>
          <Button size="sm" variant={danger ? 'danger' : 'primary'} onClick={() => onDecide(calls.map((c) => c.id))}>
            {calls.length === 1 ? calls[0].label : t('Allow All')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** What a call does, in a sentence, with exactly what it sends one click away. */
function ApprovalCall({ call }: { call: Call }) {
  const [open, setOpen] = useState(false)
  const said = summary(call.input)
  const sent = fields(call.input)
  return (
    <li className="flex gap-2">
      <Icon name={call.destructive ? 'trash' : 'edit'} size={13} className={cn('mt-[3px] shrink-0', call.destructive ? 'text-danger' : 'text-muted')} />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm text-text">{said || call.label}</p>
        <Button variant="ghost" size="xs" onClick={() => setOpen(!open)} aria-expanded={open} className="-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted">
          {said ? call.label : t('Details')}
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size={11} />
        </Button>
        {open && (
          <dl className="mx-0 mb-0 mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-l border-border pl-2.5 text-xs">
            {sent.map(([key, value]) => (
              <Fragment key={key}>
                <dt className="font-mono text-2xs leading-5 text-faint">{key}</dt>
                <dd className="m-0 line-clamp-3 min-w-0 break-words text-muted">{value}</dd>
              </Fragment>
            ))}
          </dl>
        )}
      </div>
    </li>
  )
}

function Working({ turns }: { turns: Turn[] }) {
  const last = turns[turns.length - 1]
  const tail = last?.role === 'answer' ? last.parts[last.parts.length - 1] : undefined
  if (tail?.type === 'text' || tail?.type === 'view' || (tail?.type === 'tool' && tail.status === 'running')) return null
  return (
    <p className="m-0 flex items-center gap-2 text-xs text-faint">
      <Spinner size={12} /> {t('Working…')}
    </p>
  )
}

/** What a change does, as the agent put it for whoever approves it (`change_summary`). */
function summary(input: unknown): string {
  const said = input && typeof input === 'object' ? (input as Record<string, unknown>).change_summary : undefined
  return typeof said === 'string' ? said.trim() : ''
}

/** What a call sends, field by field, as short text. */
function fields(input: unknown): [string, string][] {
  if (!input || typeof input !== 'object') return []
  return Object.entries(input as Record<string, unknown>)
    .filter(([key, value]) => key !== 'change_summary' && value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, (typeof value === 'string' ? value : JSON.stringify(value)).slice(0, 300)])
}

/** The most telling field of a tool input, shown next to its label. */
function detail(input: unknown): string {
  if (!input || typeof input !== 'object') return ''
  const i = input as Record<string, unknown>
  for (const key of ['title', 'name', 'query', 'q', 'uri', 'collection', 'handle', 'to', 'id']) {
    if (typeof i[key] === 'string' && i[key]) return String(i[key]).slice(0, 80)
  }
  return ''
}

function pretty(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}
