import { getManifest, type EntrySummary } from '@letterncms/sdk'
import { readViewPrefs, useViewPrefs, type OverviewView, type ViewPrefs, type ViewPrefsChange } from '@letterncms/ui'

/** A row as entries/list and entries/tree hand it out. */
export type ListItem = EntrySummary & {
  translations?: string[]
  values?: Record<string, any>
  children?: ListItem[]
}

const collectionView = (handle: string): OverviewView => getManifest().collections.find((c) => c.handle === handle)?.defaultView ?? 'table'

/** How one person looks at one collection: kept in their preferences, so it follows them. */
export function readListPrefs(handle: string, fallbackView: OverviewView = collectionView(handle)): ViewPrefs {
  return readViewPrefs(`entries.${handle}`, fallbackView)
}

export function useListPrefs(handle: string, fallbackView: OverviewView = collectionView(handle)): [ViewPrefs, (change: ViewPrefsChange) => void] {
  return useViewPrefs(`entries.${handle}`, fallbackView)
}
