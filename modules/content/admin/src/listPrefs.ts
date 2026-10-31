import { getManifest, type EntrySummary } from '@letterncms/sdk'
import { readViewPrefs, useViewPrefs, type ViewPrefs, type ViewPrefsChange } from '@letterncms/ui'

export type ListView = 'table' | 'grid' | 'calendar'

/** How one person looks at one collection: kept in their preferences, so it follows them. */
export type ListPrefs = ViewPrefs

export interface Person {
  id: string
  name: string
  initials: string
  avatar: string | null
}

/** A row as entries/list and entries/tree hand it out. */
export type ListItem = EntrySummary & {
  author: Person | null
  translations?: string[]
  values?: Record<string, any>
  children?: ListItem[]
}

const collectionView = (handle: string): ListView => getManifest().collections.find((c) => c.handle === handle)?.defaultView ?? 'table'

export function readListPrefs(handle: string, fallbackView: ListView = collectionView(handle)): ListPrefs {
  return readViewPrefs(`entries.${handle}`, fallbackView)
}

export function useListPrefs(handle: string, fallbackView: ListView = collectionView(handle)): [ListPrefs, (change: ViewPrefsChange) => void] {
  return useViewPrefs(`entries.${handle}`, fallbackView)
}
