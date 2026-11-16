import { t } from '@letterncms/sdk'
import { EmptyState, Icon, IconButton, Pressable, ResizeHandle, cn } from '@letterncms/ui'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { describe as describeDoc, type DocId } from './documents'
import { docAt, runPage, type Message, type PageRun } from './pageConsole'

/* The panel under the editor: the console of a page of the site. It runs the page with the saved code, lists what
   the page logs and what fails, and runs what is typed on it. */

export interface Entry extends Message {
  id: number
  /** The same message again and again is one line, counted. */
  count: number
}

export interface ConsoleCounts {
  errors: number
  warnings: number
}

const MOST = 1000

export interface ConsolePanelProps {
  open: boolean
  height: number
  onHeight: (height: number) => void
  onClose: () => void
  /** Changes when the code was saved: the page runs again. */
  saved: number
  /** Opens a document of the site at a line, from where a message came from. */
  onOpen: (id: DocId, line?: number, column?: number) => void
  onCounts: (counts: ConsoleCounts) => void
}

export function ConsolePanel({ open, height, onHeight, onClose, saved, onOpen, onCounts }: ConsolePanelProps) {
  const frame = useRef<HTMLIFrameElement>(null)
  const page = useRef<PageRun | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const next = useRef(0)
  const [started, setStarted] = useState(open)
  const [path, setPath] = useState('/')
  const [typedPath, setTypedPath] = useState('/')
  const [run, setRun] = useState(0)
  const [entries, setEntries] = useState<Entry[]>([])
  const [showPage, setShowPage] = useState(false)
  const [input, setInput] = useState('')
  const history = useRef<{ items: string[]; at: number }>({ items: [], at: 0 })
  const counts = useRef(onCounts)
  counts.current = onCounts

  useEffect(() => { if (open) setStarted(true) }, [open])

  // The page runs once the console is first opened, and again with each save, each page and each reload.
  useEffect(() => {
    if (!started || !frame.current) return
    const add = (message: Message) => setEntries((all) => {
      const last = all.at(-1)
      if (last && last.level === message.level && last.text === message.text && last.source?.url === message.source?.url && last.source?.line === message.source?.line && message.level !== 'input' && message.level !== 'result') {
        return [...all.slice(0, -1), { ...last, count: last.count + 1 }]
      }
      return [...all, { ...message, id: ++next.current, count: 1 }].slice(-MOST)
    })
    // Each run starts the console afresh, as a browser's does when its page loads again.
    setEntries([])
    add({ level: 'page', text: path })
    page.current = runPage(frame.current, path, {
      message: add,
      navigate: (to) => { setPath(to); setTypedPath(to) },
    })
    return () => {
      page.current?.destroy()
      page.current = null
    }
  }, [started, path, run, saved])

  useEffect(() => {
    counts.current({ errors: entries.filter((entry) => entry.level === 'error').reduce((sum, entry) => sum + entry.count, 0), warnings: entries.filter((entry) => entry.level === 'warn').reduce((sum, entry) => sum + entry.count, 0) })
  }, [entries])

  // What arrives shows, unless someone scrolled up to read.
  const pinned = useRef(true)
  useEffect(() => {
    const el = list.current
    if (el && pinned.current) el.scrollTop = el.scrollHeight
  }, [entries, open])

  const evaluate = () => {
    const code = input.trim()
    if (!code || !page.current) return
    history.current = { items: [...history.current.items.filter((item) => item !== code), code].slice(-50), at: 0 }
    pinned.current = true
    page.current.evaluate(code)
    setInput('')
  }
  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      evaluate()
    } else if ((event.key === 'ArrowUp' && el.selectionStart === 0) || (event.key === 'ArrowDown' && el.selectionEnd === el.value.length)) {
      // Back through what was run, as a terminal does.
      const { items, at } = history.current
      const step = event.key === 'ArrowUp' ? 1 : -1
      const to = Math.max(0, Math.min(items.length, at + step))
      if (to === at) return
      event.preventDefault()
      history.current.at = to
      setInput(to === 0 ? '' : items[items.length - to])
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault()
      setEntries([])
    }
  }
  const go = (to: string) => {
    const clean = to.trim() || '/'
    const next = clean.startsWith('/') ? clean : `/${clean}`
    setTypedPath(next)
    if (next === path) setRun((count) => count + 1)
    else setPath(next)
  }

  return (
    <section aria-label={t('Console')} className={cn('relative shrink-0 flex-col border-t border-border bg-bg', open ? 'flex' : 'hidden')} style={{ height }}>
      <ResizeHandle grows="up" value={height} min={120} max={Math.round(window.innerHeight * 0.75)} onResize={(value) => onHeight(Math.max(120, Math.min(value, Math.round(window.innerHeight * 0.75))))} onReset={() => onHeight(240)} label={t('Resize Console')} className="-top-1" />
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border pl-3 pr-1.5">
        <h2 className="m-0 text-xs font-medium text-ink">{t('Console')}</h2>
        {/* The page it runs, by its address: another typed here, or a link followed on it. */}
        <form className="ml-2 flex min-w-0 flex-1 items-center" onSubmit={(event) => { event.preventDefault(); go(typedPath) }}>
          <input aria-label={t('Page')} value={typedPath} onChange={(event) => setTypedPath(event.target.value)} onBlur={() => setTypedPath(path)} spellCheck={false} className="cms-input h-6 w-full max-w-64 min-w-0 rounded-sm px-2 font-mono text-2xs" />
        </form>
        <IconButton icon="refresh" size="xs" label={t('Reload Page')} onClick={() => setRun((count) => count + 1)} />
        <IconButton icon={showPage ? 'eye-off' : 'eye'} size="xs" label={showPage ? t('Hide Page') : t('Show Page')} onClick={() => setShowPage(!showPage)} />
        <IconButton icon="slash" size="xs" label={t('Clear Console')} shortcut="ctrl+l" onClick={() => setEntries([])} />
        <IconButton icon="close" size="xs" label={t('Close Console')} shortcut="ctrl+`" onClick={onClose} />
      </div>
      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div ref={list} role="log" aria-label={t('Console Messages')} onScroll={(event) => { const el = event.currentTarget; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24 }} className="min-h-0 flex-1 overflow-y-auto font-mono text-2xs leading-4">
            {entries.length === 0 && started ? <EmptyState compact icon="terminal" title={t('Nothing logged')} /> : entries.map((entry) => <Line key={entry.id} entry={entry} onOpen={onOpen} />)}
          </div>
          <label className="flex shrink-0 items-start gap-2 border-t border-border px-3 py-1.5">
            <Icon name="chevron-right" size={12} className="mt-0.5 shrink-0 text-focus" />
            <textarea
              aria-label={t('Run on the Page')}
              value={input}
              rows={Math.min(6, input.split('\n').length)}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="min-w-0 flex-1 resize-none bg-transparent font-mono text-2xs leading-4 text-text outline-none"
            />
          </label>
        </div>
        {/* The page itself: beside the messages when shown (over them on a phone), and running behind them when not. */}
        <div className={cn('min-h-0 border-border bg-white', showPage ? 'w-[45%] shrink-0 border-l max-md:absolute max-md:inset-0 max-md:w-full max-md:border-l-0' : 'pointer-events-none invisible absolute inset-0')}>
          {started && <iframe ref={frame} title={t('Page')} sandbox="allow-same-origin allow-scripts allow-forms" className="size-full border-0" />}
        </div>
      </div>
    </section>
  )
}

const LEVEL_LOOK: Partial<Record<Entry['level'], string>> = {
  error: 'bg-danger-soft text-danger',
  warn: 'bg-warning-soft text-ink',
  debug: 'text-muted',
  result: 'text-muted',
}
const LEVEL_ICON: Partial<Record<Entry['level'], string>> = { error: 'x-circle', warn: 'warning', input: 'chevron-right', result: 'chevron-left' }

/** One message: what it says, how many times, and where it came from (a file of the site opens at its line). */
function Line({ entry, onOpen }: { entry: Entry; onOpen: ConsolePanelProps['onOpen'] }) {
  if (entry.level === 'page') {
    return <div className="flex items-center gap-2 border-b border-border px-3 py-1 text-faint"><Icon name="arrow-right" size={12} />{t('Ran {page}', { page: entry.text })}</div>
  }
  const doc = entry.source ? docAt(entry.source.url) : null
  const where = entry.source ? `${doc ? describeDoc(doc).title : entry.source.url.split('/').pop()?.split('?')[0]}${entry.source.line ? `:${entry.source.line}` : ''}` : null
  const icon = LEVEL_ICON[entry.level]
  const long = entry.text.length > 160 || entry.text.includes('\n')
  const text = <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{entry.text}</span>
  return (
    <div className={cn('flex items-start gap-2 border-b border-border px-3 py-1', LEVEL_LOOK[entry.level])}>
      <span className="grid size-4 shrink-0 place-items-center">{icon && <Icon name={icon} size={12} className={entry.level === 'input' ? 'text-focus' : entry.level === 'warn' ? 'text-warning' : undefined} />}</span>
      {/* A long value is one line until opened, as are an error's stack and a trace: the console stays readable. */}
      {entry.detail || long ? (
        <details className="group/more min-w-0 flex-1">
          <summary className="flex cursor-default items-start gap-1">
            <Icon name="chevron-right" size={12} className="mt-0.5 shrink-0 text-faint transition-transform duration-fast group-open/more:rotate-90" />
            <span className="min-w-0 flex-1 truncate group-open/more:whitespace-pre-wrap group-open/more:break-words">{entry.text}</span>
          </summary>
          {entry.detail && <pre className="m-0 mt-1 whitespace-pre-wrap break-words pl-4 text-muted">{entry.detail}</pre>}
        </details>
      ) : text}
      {entry.count > 1 && <span className="shrink-0 rounded-full bg-active px-1.5 text-faint">{entry.count}</span>}
      {where && (doc
        ? <Pressable compact onClick={() => onOpen(doc, entry.source?.line, entry.source?.column)} className="shrink-0 rounded-xs text-faint underline-offset-2 hover:text-text hover:underline">{where}</Pressable>
        : <span className="shrink-0 text-faint">{where}</span>)}
    </div>
  )
}
