import { blockNavigation, t } from '@letterncms/sdk'
import { useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'
import { Icon } from './Icon'
import { useShortcut } from './shortcuts'
import { WorkspaceContext } from './Slideover'
import { Spinner } from './Spinner'
import { Tooltip } from './Tooltip'

export interface SaveBarProps {
  /** There are changes: the bar is up. */
  dirty: boolean
  /** Saving them: Save spins, Discard waits. */
  saving?: boolean
  /** Saving failed: the bar stays and says why. */
  error?: string | null
  onSave: () => void
  onDiscard: () => void
}

/** Every save bar on view: a page with several forms (a settings page and its tabs) shows one bar for all of them. */
interface Bar { dirty: boolean; saving: boolean; error?: string | null; onSave: () => void; onDiscard: () => void }
const bars = new Map<number, Bar>()
const listeners = new Set<() => void>()
let version = 0
let next = 0
const notify = () => { version++; listeners.forEach((l) => l()) }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

/**
 * The one way to save a form (settings, a screen's Settings tab, an account, a menu):
 * a bar over the bottom of the sheet that is there only while there are changes,
 * with Discard and Save (⌘S). Leaving the screen with changes asks first. A screen
 * shows no Save button of its own. With changes in more than one form on view (two
 * tabs of a page), one bar saves or discards them all.
 */
export function SaveBar({ dirty, saving = false, error, onSave, onDiscard }: SaveBarProps) {
  const host = useContext(WorkspaceContext)?.host ?? null
  const id = useRef(0)
  if (!id.current) id.current = ++next
  useLayoutEffect(() => {
    const before = bars.get(id.current)
    bars.set(id.current, { dirty, saving, error, onSave, onDiscard })
    if (!before || before.dirty !== dirty || before.saving !== saving || before.error !== error) notify()
  })
  useLayoutEffect(() => () => { bars.delete(id.current); notify() }, [])
  useSyncExternalStore(subscribe, () => version)
  const changed = [...bars.entries()].filter(([, bar]) => bar.dirty)
  // The first form with changes draws the bar; the others leave it to that one.
  const leader = changed.length === 0 || changed[0][0] === id.current
  const all = changed.length > 1 && leader ? changed.map(([, bar]) => bar) : null
  const busy = all ? all.some((bar) => bar.saving) : saving
  const failed = all ? all.find((bar) => bar.error)?.error : error

  // Kept for its way out once the changes are saved or discarded.
  const [shown, setShown] = useState(dirty)
  useEffect(() => {
    if (dirty) return setShown(true)
    const timer = setTimeout(() => setShown(false), 120)
    return () => clearTimeout(timer)
  }, [dirty])

  useEffect(() => blockNavigation(() => (dirty ? t('Discard unsaved changes?') : null)), [dirty])
  // While the form is on view ⌘S is always its save, so the browser never offers to save the page. Each form saves its own.
  useShortcut('mod+s', () => { if (dirty && !saving) onSave() })

  if ((!shown && !dirty) || !leader) return null
  const save = () => { if (busy) return; if (all) all.forEach((bar) => { if (!bar.saving) bar.onSave() }); else onSave() }
  const discard = () => { if (all) all.forEach((bar) => bar.onDiscard()); else onDiscard() }
  const bar = (
    <div role="region" aria-label={t('Unsaved changes')} className="cms-savebar" data-state={dirty ? 'open' : 'closed'}>
      {failed ? (
        <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <Icon name="warning" size={16} className="shrink-0 text-ink-danger" />
          <span className="min-w-0 truncate" title={failed}>{failed}</span>
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-sm font-medium">
          <span className="size-2 shrink-0 rounded-full bg-signal" aria-hidden />
          <span className="truncate">{t('Unsaved changes')}</span>
        </span>
      )}
      <button type="button" className="cms-savebar-discard" disabled={busy || !dirty} onClick={discard}>{t('Discard')}</button>
      <Tooltip content={t('Save')} shortcut="mod+s">
        <button type="button" className={cn('cms-savebar-save', busy && 'cursor-wait')} disabled={!dirty} aria-busy={busy || undefined} onClick={save}>
          {busy && <Spinner size={14} className="absolute inset-0 m-auto" />}
          <span className={cn(busy && 'invisible')}>{t('Save')}</span>
        </button>
      </Tooltip>
    </div>
  )
  return host ? createPortal(bar, host) : bar
}
