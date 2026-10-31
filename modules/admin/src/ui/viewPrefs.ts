import { getManifest, run } from '@letterncms/sdk'
import { useEffect, useRef, useState } from 'react'
import type { OverviewView as ListView } from './ViewControls'

export type CalendarDate = 'published' | 'updated'
export interface ViewPrefs { view: ListView; sort: string | null; columns: string[] | null; calendarDate: CalendarDate }
export type ViewPrefsChange = Partial<Omit<ViewPrefs, 'view'>> & { view?: ListView | null }

function stored(handle: string): Partial<ViewPrefs> {
  const value = getManifest().user.preferences?.[handle]
  return value && typeof value === 'object' ? (value as Partial<ViewPrefs>) : {}
}

export function readViewPrefs(handle: string, fallbackView: ListView = 'table'): ViewPrefs {
  const saved = stored(handle)
  const view = saved.view && ['table', 'grid', 'calendar'].includes(saved.view) ? saved.view : fallbackView
  return { view, calendarDate: saved.calendarDate === 'updated' ? 'updated' : 'published', sort: typeof saved.sort === 'string' ? saved.sort : null, columns: Array.isArray(saved.columns) ? saved.columns.filter((id): id is string => typeof id === 'string') : null }
}

/**
 * View, sort and columns of an overview. Changes show at once and are saved
 * to the account a moment later (one save for a burst of clicks).
 */
export function useViewPrefs(handle: string, fallbackView: ListView = 'table'): [ViewPrefs, (change: ViewPrefsChange) => void] {
  const read = () => readViewPrefs(handle, fallbackView)
  const [prefs, setPrefs] = useState<ViewPrefs>(read)
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; save: () => void } | null>(null)

  // Another overview: its own preferences. Leaving saves what is still waiting.
  useEffect(() => {
    setPrefs(read())
    return () => {
      if (!pending.current) return
      clearTimeout(pending.current.timer)
      pending.current.save()
      pending.current = null
    }
  }, [handle, fallbackView])

  const update = (change: ViewPrefsChange) => {
    // The manifest is this session's copy of the preferences; keep it current for the next visit.
    const user = getManifest().user
    // Changing sort or columns should not turn the inherited view into a personal override.
    const saved = { ...stored(handle), ...change }
    user.preferences = { ...(user.preferences ?? {}), [handle]: saved }
    const next = read()
    setPrefs(next)
    const save = () => void run('account/update', { preferences: { [handle]: saved } }).catch(() => {})
    if (pending.current) clearTimeout(pending.current.timer)
    pending.current = { timer: setTimeout(() => { pending.current = null; save() }, 800), save }
  }

  return [prefs, update]
}
