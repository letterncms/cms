import { prefetch, registry, t, useScreen, type ComposerOption, type ComposerSource, type ContextItem, type FieldDef, type Registered } from '@letterncms/sdk'
import { Button, Fields, Icon, Kbd, Pressable, Spinner, Textarea, Tooltip, cn } from '@letterncms/ui'
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react'
import { answersHere, runnable } from './commands'
import { attachments, hints, offered } from './context'
import { fillTemplate } from '@letterncms/ui'
import { answers, chosenWords, commandInput, ready, schemaFields } from './schema'
import { agent, panel, usePanel, type Pending } from './store'
import type { Refusal } from './useThread'

interface Trigger {
  char: '@' | '/'
  query: string
  /** Where the trigger stands in the text. */
  start: number
}

/** A touch screen, where focusing a field brings up the keyboard. */
export const coarse = () => window.matchMedia('(pointer: coarse)').matches

/** @ anywhere after a space, / only at the start of a line: a path in a sentence isn't a command. */
function triggerAt(text: string, caret: number, mentions: boolean): Trigger | null {
  const match = /(?:^|\s)@([^\s@]*)$|(?:^|\n)\/([^\n/]*)$/.exec(text.slice(0, caret))
  if (!match || (match[1] !== undefined && !mentions)) return null
  const char = match[1] !== undefined ? '@' : '/'
  const query = match[1] ?? match[2] ?? ''
  return { char, query, start: caret - query.length - 1 }
}

interface Group {
  source: Registered<ComposerSource>
  /** Its own heading: the source's, or one of its lines' `group`. */
  label: string
  options: ComposerOption[]
}

/** How well a line answers what was typed: its name is it, starts with it, has a word that does, has it; or only its other words do. */
function rank(option: ComposerOption, query: string): number {
  const term = query.trim().toLowerCase()
  if (!term) return 0
  const label = option.label.trim().toLowerCase()
  if (label === term) return 4
  if (label.startsWith(term)) return 3
  if (label.split(/[\s\-–—/]+/).some((word) => word.startsWith(term))) return 2
  return label.includes(term) ? 1 : 0
}

/** What the sources registered for this trigger find, as they find it. A slow one doesn't hold up the rest. */
function useOptions(trigger: Trigger | null) {
  const version = useSyncExternalStore(registry.composer.subscribe, registry.composer.version)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  /** What every source has answered for: until it is what is typed, the lines on view are an earlier query's. */
  const [done, setDone] = useState<string | null>(null)
  const char = trigger?.char
  const query = trigger?.query
  const asked = char ? char + (query ?? '') : null
  useEffect(() => {
    if (!char) {
      setGroups([])
      setDone(null)
      return
    }
    let canceled = false
    setLoading(true)
    const sources = registry.composer.all().filter((source) => source.trigger === char).sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
    const timer = setTimeout(() => {
      const found = new Map<string, ComposerOption[]>()
      let pending = sources.length
      if (!pending) { setLoading(false); setDone(char + (query ?? '')) }
      for (const source of sources) {
        void Promise.resolve().then(() => source.search(query ?? '')).catch(() => [] as ComposerOption[]).then((options) => {
          if (canceled) return
          found.set(source.id, options)
          // One heading per name, whichever source a line comes from (Settings pages and the settings module's abilities), and a line said once.
          const seen = new Set<string>()
          const byLabel = new Map<string, Group>()
          for (const s of sources) {
            for (const option of found.get(s.id) ?? []) {
              const said = `${option.kind ?? ''}:${option.label.trim().toLowerCase()}`
              if (seen.has(said)) continue
              seen.add(said)
              const label = option.group ?? s.label
              if (!byLabel.has(label)) byLabel.set(label, { source: s, label, options: [] })
              byLabel.get(label)!.options.push(option)
            }
          }
          // In each group the closest names first; lines that rank alike keep their source's order.
          setGroups([...byLabel.values()].map((group) => ({ ...group, options: group.options.map((option, i) => ({ option, i, rank: rank(option, query ?? '') })).sort((a, b) => b.rank - a.rank || a.i - b.i).map(({ option }) => option) })))
          if (--pending === 0) { setLoading(false); setDone(char + (query ?? '')) }
        })
      }
    }, query ? 120 : 0)
    return () => {
      canceled = true
      clearTimeout(timer)
    }
  }, [char, query, version])
  return { groups, loading, settled: !loading && asked !== null && done === asked }
}

/** The chips: what the message carries. Each comes off with its ×. Only with an agent: a search or a command carries nothing. */
function Attachments({ onAdd }: { onAdd: () => void }) {
  const state = usePanel()
  const screen = useScreen()
  const key = state.thread ?? 'new'
  const items = attachments(screen, state)
  const skill = state.skills[key]
  const auto = new Set(offered(screen, state).map((item) => item.id))
  const off = screen.title && !screen.private && state.dismissed.includes('page')
  const remove = (item: ContextItem) => {
    if (item.id === 'text') panel.set({ selectedText: '' })
    else if (auto.has(item.id)) panel.set({ dismissed: [...state.dismissed, item.id] })
    else panel.set({ attached: { ...state.attached, [key]: (state.attached[key] ?? []).filter((other) => other.id !== item.id) } })
  }
  return (
    <div className="flex flex-wrap items-center gap-1 px-2 pt-2">
      <Tooltip content={t('Add Context')} shortcut="@">
        <Pressable compact aria-label={t('Add Context')} onClick={onAdd} className="cms-thread-chip justify-center !px-0 w-[22px] text-muted hover:text-text">
          <span aria-hidden="true" className="text-xs leading-none">@</span>
        </Pressable>
      </Tooltip>
      {skill && <Chip icon={skill.icon ?? 'sparkle'} label={skill.label} hint={skill.detail ?? skill.label} strong onRemove={() => panel.set({ skills: { ...state.skills, [key]: null } })} />}
      {items.map((item) => (
        <Chip key={item.id} icon={item.icon ?? 'file'} label={item.label} hint={(item.kind && hints[item.kind]?.()) ?? item.label} strong={!auto.has(item.id)} onRemove={() => remove(item)} />
      ))}
      {off && (
        <Pressable compact onClick={() => panel.set({ dismissed: state.dismissed.filter((id) => id !== 'page') })} className="cms-thread-chip pr-1.5 text-faint hover:text-text">
          <Icon name="plus" size={11} /><span className="truncate">{screen.title}</span>
        </Pressable>
      )}
    </div>
  )
}

function Chip({ icon, label, hint, strong, onRemove }: { icon: string; label: string; hint: string; strong?: boolean; onRemove: () => void }) {
  return (
    <span className={cn('cms-thread-chip', strong ? 'text-text' : 'text-muted')}>
      <Tooltip content={hint}>
        <span tabIndex={0} className="flex min-w-0 items-center gap-1 outline-offset-1"><Icon name={icon} size={11} className="shrink-0" /><span className="truncate">{label}</span></span>
      </Tooltip>
      <Pressable compact aria-label={t('Remove {name}', { name: label })} onClick={onRemove} className="grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-text">
        <Icon name="close" size={10} />
      </Pressable>
    </span>
  )
}

/** The lines `@` or `/` offer, above the composer. The keys stay in the text field. */
function Picker({ id, trigger, groups, loading, active, onActive, onPick }: { id: string; trigger: Trigger; groups: Group[]; loading: boolean; active: number; onActive: (index: number) => void; onPick: (option: ComposerOption) => void }) {
  const list = useRef<HTMLDivElement>(null)
  // The pointer chooses only once it really moves: a list opening under a resting pointer keeps the keyboard's line.
  const moved = useRef(false)
  useLayoutEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])
  let index = -1
  return (
    <div ref={list} onMouseMove={() => { moved.current = true }} id={id} role="listbox" aria-label={trigger.char === '@' ? t('Add Context') : t('Commands')} className="cms-pop absolute inset-x-0 bottom-full z-sticky mb-1.5 max-h-80 overflow-y-auto overscroll-contain p-1">
      {groups.map(({ source, label, options }) => (
        <div key={`${source.id}:${label}`} role="group" aria-label={label}>
          <div className="flex h-6 items-center px-2 text-2xs font-medium text-faint">{label}</div>
          {options.map((option) => {
            index++
            const at = index
            return (
              <div
                key={option.id}
                id={`${id}-${at}`}
                role="option"
                aria-selected={at === active}
                onMouseEnter={() => { if (moved.current) onActive(at) }}
                onMouseMove={() => { if (at !== active) onActive(at) }}
                onMouseDown={(e) => { e.preventDefault(); onPick(option) }}
                className={cn('cms-thread-option flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm', at === active ? 'bg-hover text-ink' : 'text-text')}
              >
                <Icon name={option.icon ?? 'file'} size={14} className="shrink-0 text-muted" />
                <span className="shrink-0 truncate">{option.label}</span>
                {option.detail && <span className="min-w-0 flex-1 truncate text-xs text-faint">{option.detail}</span>}
                {option.shortcut && <span className="ml-auto shrink-0 pl-2 [@media(pointer:coarse)]:hidden"><Kbd keys={option.shortcut} /></span>}
              </div>
            )
          })}
        </div>
      ))}
      {groups.length === 0 && (
        <div className="flex h-8 items-center gap-2 px-2 text-sm text-muted">
          {loading ? <><Spinner size={12} /> {t('Looking…')}</> : t('No matches')}
        </div>
      )}
    </div>
  )
}

/** What a command picked with / still needs, asked right in the composer: its fields, and Run. */
function CommandForm({ pending, busy, onRun, onCancel }: { pending: Pending; busy: boolean; onRun: (input: Record<string, unknown>, detail: string) => Promise<true | Refusal>; onCancel: () => void }) {
  const command = pending.option.command!
  // Fields from the ability's schema, or loaded with what they hold now (a settings page).
  const [loaded, setLoaded] = useState<FieldDef[] | null>(null)
  const [before, setBefore] = useState<Record<string, unknown>>({})
  const fields = command.load ? loaded ?? [] : schemaFields(command.schema, command.input ?? {}, command.required, command.ability)
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...Object.fromEntries(fields.filter((f) => f.default !== undefined).map((f) => [f.handle, f.default])), ...pending.values }))
  useEffect(() => {
    if (!command.load) return
    let canceled = false
    void command.load().then((form) => {
      if (canceled) return
      setLoaded(form.fields)
      setBefore(form.values ?? {})
      setValues((current) => ({ ...(form.values ?? {}), ...current }))
    }).catch((e) => !canceled && setError(e instanceof Error ? e.message : String(e)))
    return () => { canceled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const form = useId()
  const run = async () => {
    if (running || busy) return
    setRunning(true)
    setError(null)
    const given = answers(fields, values)
    // What a loaded form held already isn't sent again: a settings page saves what changed, and says so.
    const changed = command.load && command.into ? Object.fromEntries(Object.entries(given).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(before[key]))) : given
    const input = command.scope ? fillTemplate(command.input ?? {}, { ...command.scope, values: changed }) : commandInput(command.input ?? {}, changed, command.into)
    // A view action without input takes the form's answers as its input.
    const sent = command.scope && Object.keys(command.input ?? {}).length === 0 ? changed : input
    const result = await onRun(sent, chosenWords(fields, changed))
    setRunning(false)
    if (result === true) return
    setErrors(result.details)
    // What isn't about one field is said under them.
    setError(Object.keys(result.details).some((key) => fields.some((f) => f.handle === key)) ? null : result.message)
  }
  return (
    <form id={form} aria-label={pending.option.label} onSubmit={(e) => { e.preventDefault(); void run() }} onKeyDown={(e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCancel() }
      // Enter in a line of it runs it, as in any form.
      if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.target instanceof HTMLInputElement) { e.preventDefault(); void run() }
    }} className="cms-thread-command px-3 pb-1 pt-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
        <Icon name={pending.option.icon ?? 'command'} size={14} className="text-muted" />
        <span className="min-w-0 truncate">{pending.option.label}</span>
      </div>
      {command.load && !loaded && !error && <div className="grid h-16 place-items-center text-faint"><Spinner size={14} /></div>}
      {fields.length > 0 && (
        // A long form scrolls in its place; the thread above keeps its room.
        <div className="cms-thread-command-fields -mx-1 max-h-[min(50dvh,440px)] overflow-y-auto overscroll-contain px-1 pb-1">
          <Fields fields={fields.map((f, i) => ({ autofocus: i === 0, ...f }))} values={values} errors={errors} onChange={(handle, value) => {
            setValues((current) => ({ ...current, [handle]: value }))
            setErrors(({ [handle]: _, ...rest }) => rest)
            panel.command({ ...pending, values: { ...pending.values, [handle]: value } })
          }} />
        </div>
      )}
      {error && <p role="alert" className="m-0 mt-2 text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-1.5 pb-1.5 pt-3">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={running}>{t('Cancel')}</Button>
        <Button size="sm" type="submit" variant={command.destructive ? 'danger' : 'primary'} loading={running} disabled={busy || (!!command.load && !loaded)} autoFocus={fields.length === 0 && !command.load}>{command.confirm ?? (command.load ? t('Save') : t('Run'))}</Button>
      </div>
    </form>
  )
}

export interface ComposerProps {
  placeholder: string
  /** Bumped to move the focus here. */
  focus: number
  busy: boolean
  onSubmit: () => void
  /** Run an ability picked with / with this input; resolves with why it did not. `form`: its form asked, and shows that; `detail`: what it chose, in words. */
  onCommand: (option: ComposerOption, input: Record<string, unknown>, form: boolean, detail?: string) => Promise<true | Refusal>
  children: ReactNode
}

/**
 * Where a turn is written: plain words, what @ attaches (with an agent) and the commands / offers,
 * as it is typed. Enter sends, Shift+Enter breaks the line. A command that needs input asks for it here.
 */
export function Composer({ placeholder, focus, busy, onSubmit, onCommand, children }: ComposerProps) {
  const { drafts, thread, commands, palette } = usePanel()
  const key = thread ?? 'new'
  const draft = drafts[key] ?? ''
  const pending = commands[key] ?? null
  const mentions = agent() !== null
  const input = useRef<HTMLTextAreaElement>(null)
  const [caret, setCaret] = useState(0)
  const [closedAt, setClosedAt] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const listId = useId()
  // ⌘K wrote a `/`: the caret goes after it in the same render, so its menu is open the moment the composer is drawn.
  const [written, setWritten] = useState(palette)
  if (written !== palette) {
    setWritten(palette)
    setCaret(draft.length)
    setClosedAt(null)
  }

  const found = pending ? null : triggerAt(draft, caret, mentions)
  const trigger = found && found.start !== closedAt ? found : null
  const { groups, loading, settled } = useOptions(trigger)
  const options = groups.flatMap((group) => group.options)
  const open = trigger !== null

  // What / offers is at hand before anyone types it.
  useEffect(() => { void runnable() }, [])
  // A frame on: the panel may only now have come out, and what was clicked has just taken the focus.
  useEffect(() => {
    if (!focus || pending) return
    const frame = requestAnimationFrame(() => input.current?.focus())
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])
  // The line chosen stays chosen while more lines arrive: the first, or the one the keyboard moved to.
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => { setActive(0); setActiveId(null) }, [trigger?.char, trigger?.query])
  useEffect(() => {
    if (activeId === null) return
    const at = options.findIndex((o) => o.id === activeId)
    if (at >= 0 && at !== active) setActive(at)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.map((o) => o.id).join('|')])
  const enter = useRef(false)
  useEffect(() => { enter.current = false }, [trigger?.char, trigger?.query])
  useEffect(() => {
    if (!enter.current || !settled) return
    enter.current = false
    if (options.length > 0) pick(options[Math.min(active, options.length - 1)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled])
  // A place about to be opened starts loading while it is chosen.
  const chosen = open ? options[Math.min(active, options.length - 1)] : undefined
  useEffect(() => { if (chosen?.to && chosen.perform) prefetch(chosen.to) }, [chosen?.to, chosen?.perform])
  const choose = (index: number) => { setActive(index); setActiveId(options[index]?.id ?? null) }
  // Writing away from a closed picker opens it again the next time; the menu ⌘K opened is let go of, the words kept.
  useEffect(() => {
    if (found) return
    setClosedAt(null)
    panel.leavePalette()
  }, [found])
  // And the caret after the `/`, with what was typed after it before selected, so typing starts over.
  useEffect(() => {
    if (!palette || !panel.inPalette()) return
    const frame = requestAnimationFrame(() => {
      const el = input.current
      if (!el) return
      el.focus()
      const text = el.value
      el.setSelectionRange(text.lastIndexOf('/') + 1, text.length)
      setCaret(text.length)
    })
    return () => cancelAnimationFrame(frame)
  }, [palette])

  const write = (text: string, at: number) => {
    panel.draft(text)
    setCaret(at)
    requestAnimationFrame(() => {
      input.current?.focus()
      input.current?.setSelectionRange(at, at)
    })
  }
  const pick = (option: ComposerOption) => {
    if (!trigger) return
    const after = draft.slice(trigger.start + 1 + trigger.query.length)
    // A `/` on a line of its own after the message takes its line with it.
    const before = after ? draft.slice(0, trigger.start) : draft.slice(0, trigger.start).replace(/\n$/, '')
    // From ⌘K: what is picked is the palette's answer. Done elsewhere (a place, the theme), a dock that came out only for it goes again.
    if (panel.inPalette() && (option.perform || option.command || option.skill)) {
      panel.draft(before + after)
      setCaret(before.length)
      panel.pickedFromPalette(!!option.perform && !answersHere.has(option))
      if (option.perform) option.perform()
      else if (option.skill) panel.set({ skills: { ...panel.get().skills, [key]: option } })
      else runCommand(option)
      if (!option.perform || panel.get().mode !== 'closed') requestAnimationFrame(() => input.current?.focus())
      return
    }
    if (option.insert !== undefined) {
      write(before + option.insert + after, before.length + option.insert.length)
      return
    }
    if (option.command) {
      write(before + after, before.length)
      runCommand(option)
      return
    }
    if (option.perform || option.skill) {
      write(before + after, before.length)
      if (option.perform) option.perform()
      else panel.set({ skills: { ...panel.get().skills, [key]: option } })
      return
    }
    // The message keeps its sense: "compare with @Blog". The chip is what carries it.
    const mention = `@${option.label} `
    write(before + mention + after, before.length + mention.length)
    panel.set({ attached: { ...panel.get().attached, [key]: [...(panel.get().attached[key] ?? []).filter((item) => item.id !== option.id), option] } })
  }
  const runCommand = (option: ComposerOption) => {
    const chosen = option.command!.input ?? {}
    // Nothing it requires is missing and it takes nothing back: it runs at once. Anything else asks here first.
    if (!option.command!.load && !option.command!.scope && ready(option.command!.schema, chosen) && !option.command!.destructive) void onCommand(option, chosen, false)
    else panel.command({ option, values: {} })
  }
  const addContext = () => {
    const at = input.current?.selectionStart ?? draft.length
    const space = at > 0 && !/\s/.test(draft[at - 1]) ? ' ' : ''
    write(`${draft.slice(0, at)}${space}@${draft.slice(at)}`, at + space.length + 1)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (open && options.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        choose((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
        return
      }
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
        e.preventDefault()
        // Typed faster than the lines come: the first line for what is typed, once it is in, never an earlier query's.
        if (settled) pick(options[Math.min(active, options.length - 1)])
        else enter.current = true
        return
      }
    }
    if (open && e.key === 'Escape') {
      e.preventDefault()
      // The menu ⌘K opened goes with its `/`, as a palette does; one typed only closes, the words kept.
      if (!panel.inPalette()) setClosedAt(trigger.start)
      else {
        panel.dismissPalette()
        const rest = panel.get().drafts[key] ?? ''
        setCaret(rest.length)
        requestAnimationFrame(() => input.current?.setSelectionRange(rest.length, rest.length))
      }
      return
    }
    // Likewise with no lines yet; with none at all, a `/` someone typed is their words, and the menu ⌘K opened sends nothing.
    if (open && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!settled) enter.current = true
      else if (!panel.inPalette()) onSubmit()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }
  const cancel = () => {
    panel.command(null)
    // On a touch screen the keyboard stays down until someone taps to write.
    if (!coarse()) requestAnimationFrame(() => input.current?.focus())
  }

  return (
    <div className="relative">
      {open && <Picker id={listId} trigger={trigger} groups={groups} loading={loading} active={Math.min(active, Math.max(0, options.length - 1))} onActive={choose} onPick={pick} />}
      <div className="cms-thread-composer overflow-hidden rounded-lg border border-border bg-bg transition-colors focus-within:border-border-strong">
        {pending ? (
          <CommandForm key={pending.option.id} pending={pending} busy={busy} onCancel={cancel} onRun={async (input, detail) => {
            const result = await onCommand(pending.option, input, true, detail)
            if (result === true) cancel()
            return result
          }} />
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
            {mentions && <Attachments onAdd={addContext} />}
            <Textarea
              ref={input}
              value={draft}
              onChange={(e) => { panel.draft(e.target.value); setCaret(e.target.selectionStart) }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder={placeholder}
              aria-label={placeholder}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={open && options.length > 0 ? `${listId}-${active}` : undefined}
              className="cms-thread-input max-h-52 min-h-0 resize-none border-0 bg-transparent px-3 pt-2.5 text-sm shadow-none focus:ring-0 focus-visible:outline-none"
            />
            {children}
          </form>
        )}
      </div>
    </div>
  )
}
