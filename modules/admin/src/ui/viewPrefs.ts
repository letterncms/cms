import { getManifest, setPreference } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import type { OverviewView } from './ViewControls'

export type CalendarDate = 'published' | 'updated'
export interface ViewPrefs { view: OverviewView; sort: string | null; columns: string[] | null; calendarDate: CalendarDate }
export type ViewPrefsChange = Partial<Omit<ViewPrefs, 'view'>> & { view?: OverviewView | null }

function stored(handle: string): Partial<ViewPrefs> {
  const value = getManifest().user.preferences?.[handle]
  return value && typeof value === 'object' ? (value as Partial<ViewPrefs>) : {}
}

/** Whoever shows an overview's preferences hears when they change, wherever that was done. */
const listeners = new Set<(handle: string) => void>()

/** Put an overview's view, sort and columns in place at once (a saved view): every list and control showing them follows. */
export function setViewPrefs(handle: string, prefs: ViewPrefsChange): void {
  void setPreference(handle, prefs).catch(() => {})
  listeners.forEach((l) => l(handle))
}

export function readViewPrefs(handle: string, fallbackView: OverviewView = 'table'): ViewPrefs {
  const saved = stored(handle)
  const view = saved.view && ['table', 'grid', 'calendar'].includes(saved.view) ? saved.view : fallbackView
  return { view, calendarDate: saved.calendarDate === 'updated' ? 'updated' : 'published', sort: typeof saved.sort === 'string' ? saved.sort : null, columns: Array.isArray(saved.columns) ? saved.columns.filter((id): id is string => typeof id === 'string') : null }
}

/**
 * View, sort and columns of an overview. Changes show at once and are saved
 * to the account a moment later (one save for a burst of clicks).
 */
export function useViewPrefs(handle: string, fallbackView: OverviewView = 'table'): [ViewPrefs, (change: ViewPrefsChange) => void] {
  const read = () => readViewPrefs(handle, fallbackView)
  const [prefs, setPrefs] = useState<ViewPrefs>(read)

  // Another overview: its own preferences. And the same overview's, changed from elsewhere (a saved view applied to it).
  useEffect(() => {
    setPrefs(read())
    const listener = (changed: string) => { if (changed === handle) setPrefs(read()) }
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [handle, fallbackView])

  const update = (change: ViewPrefsChange) => {
    // Changing sort or columns should not turn the inherited view into a personal override.
    void setPreference(handle, { ...stored(handle), ...change }, 800).catch(() => {})
    listeners.forEach((l) => l(handle))
  }

  return [prefs, update]
}
