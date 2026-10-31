import { useEffect, useState, type RefObject } from 'react'
import { useShortcut } from './shortcuts'
import type { DataSelection } from './DataTable'

/** Consistent j/k, x, Enter and Escape behavior in overview tables and cards. */
export function useRecordNavigation<T>({ resetKey, onOpen, selection, enabled = true, scope }: { scope?: RefObject<HTMLElement | null>; resetKey: string; onOpen?: (id: string) => void; selection?: DataSelection<T>; enabled?: boolean }) {
  const [cursor, setCursor] = useState<string | null>(null)
  useEffect(() => setCursor(null), [resetKey])
  const blocked = () => {
    if (document.querySelector('[role="menu"]')) return true
    const dialogs = [...document.querySelectorAll('[role="dialog"]')]
    const dialog = dialogs.at(-1)
    return !!dialog && (!scope?.current || !dialog.contains(scope.current))
  }
  const move = (step: number) => {
    if (blocked()) return
    const rows = [...(scope?.current ?? document).querySelectorAll<HTMLElement>('[data-entry]')]
    if (!rows.length) return
    const index = cursor ? rows.findIndex((row) => row.dataset.entry === cursor) : -1
    const next = rows[Math.min(rows.length - 1, Math.max(0, index + step))]
    setCursor(next.dataset.entry!)
    next.scrollIntoView({ block: 'nearest' })
  }
  useShortcut('j', () => move(1), enabled)
  useShortcut('k', () => move(-1), enabled)
  useShortcut('x', () => { if (cursor && !blocked()) selection?.onSelect([cursor], !selection.ids.has(cursor)) }, enabled && !!cursor && !!selection)
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.target !== document.body || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || blocked()) return
      if (event.key === 'Enter' && cursor && onOpen) { event.preventDefault(); onOpen(cursor) }
      else if (event.key === 'Escape' && selection?.ids.size) selection.onSelect([...selection.ids], false)
      else if (event.key === 'Escape') setCursor(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cursor, enabled, onOpen, selection, scope])
  return cursor
}
