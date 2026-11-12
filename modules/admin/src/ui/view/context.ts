import type { ViewAction } from '@letterncms/sdk'
import { createContext, useContext, useEffect } from 'react'
import type { Scope } from './scope'

export interface ViewHost {
  scope: Scope
  /** Load what the view shows again (after an action changed it). */
  refresh: () => void
  /** Run a button's or row's action: an ability, a place, a dialog or a component. */
  act: (action: ViewAction, scope: Scope, busy?: (on: boolean) => void) => Promise<void>
  /** Drawn without anything to act with (a reply the assistant has moved on from). */
  disabled: boolean
  /** The view belongs to the settings sidebar. */
  settings?: boolean
  /** An assistant reply: its buttons report the node and event, and the server runs them through approvals. */
  emit?: (node: string, name: string) => void
  /** Drawn inside something else, beside the place at this path: a way there adds nothing. */
  at?: string
}

export const ViewContext = createContext<ViewHost>({ scope: {}, refresh: () => {}, act: async () => {}, disabled: true })

export const useView = () => useContext(ViewContext)

/** The tab a node is drawn in, so a form there can mark the tab while it has changes. */
export const TabContext = createContext<{ id: string; dirty: (id: string, dirty: boolean) => void } | null>(null)

/** For a component in a view's tab: marks the tab while what it edits has unsaved changes, as a form there does. */
export function useTabDirty(dirty: boolean) {
  const tab = useContext(TabContext)
  useEffect(() => { tab?.dirty(tab.id, dirty) }, [tab, dirty])
}
