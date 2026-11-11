import { blockNavigation, t } from '@letterncms/sdk'
import { useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { Button } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'
import { useShortcut } from './shortcuts'
import { WorkspaceContext } from './Slideover'
import { Spinner } from './Spinner'
import { useTheme } from './theme'
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
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
const anyDirty = () => [...bars.values()].some((bar) => bar.dirty)
// Toasts about changes not saved yet ("Removed Title", with Undo): they go once nothing is left to save.
const untilClean = new Set<string | number>()
const notify = () => {
  version++
  if (!anyDirty()) { untilClean.forEach((id) => toast.dismiss(id)); untilClean.clear() }
  listeners.forEach((l) => l())
}

/** Whether a save bar is up: the toasts rise above it, so none covers its Save. */
export function useSaveBarOpen(): boolean {
  return useSyncExternalStore(subscribe, anyDirty)
}

/** A toast about unsaved changes (one with Undo): it closes when they are saved or discarded. */
export function untilSaved(id: string | number): void {
  untilClean.add(id)
}

/**
 * The one way to save a form (settings, a screen's Settings tab, an account, a menu):
 * a bar over the bottom of the sheet that is there only while there are changes,
 * with Discard and Save (⌘S). Leaving the screen with changes asks first. A screen
 * shows no Save button of its own. With changes in more than one form on view (two
 * tabs of a page), one bar saves or discards them all.
 */
export function SaveBar({ dirty, saving = false, error, onSave, onDiscard }: SaveBarProps) {
  const host = useContext(WorkspaceContext)?.host ?? null
  const theme = useTheme()
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
  useShortcut('mod+s', () => { if (dirty && !saving) onSave() }, true, t('Save'))

  if ((!shown && !dirty) || !leader) return null
  const save = () => { if (busy) return; if (all) all.forEach((bar) => { if (!bar.saving) bar.onSave() }); else onSave() }
  const discard = () => { if (all) all.forEach((bar) => bar.onDiscard()); else onDiscard() }
  const bar = (
    <div role="region" aria-label={t('Unsaved changes')} className="cms-savebar" data-state={dirty ? 'open' : 'closed'}>
      {/* The bar is ink, the other theme's ground: what is on it is set in that theme, so its buttons are the kit's own. */}
      <div data-theme={theme === 'dark' ? 'light' : 'dark'} className="contents">
      {failed ? (
        <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <Icon name="warning" size={16} className="shrink-0 text-danger" />
          <span className="min-w-0 truncate" title={failed}>{failed}</span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{t('Unsaved changes')}</span>
      )}
      <Button variant="ghost" disabled={busy || !dirty} onClick={discard}>{t('Discard')}</Button>
      <Tooltip content={t('Save')} shortcut="mod+s">
        {/* Busy, not disabled: it keeps the focus while it saves. */}
        <Button variant="primary" className={cn('relative', busy && 'cursor-wait')} disabled={!dirty} aria-busy={busy || undefined} onClick={save}>
          {busy && <Spinner size={14} className="absolute inset-0 m-auto" />}
          <span className={cn(busy && 'invisible')}>{t('Save')}</span>
        </Button>
      </Tooltip>
      </div>
    </div>
  )
  return host ? createPortal(bar, host) : bar
}
