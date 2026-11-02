import { useContext, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { WorkspaceContext } from './Slideover'

/** Whether the sidebar is out on a screen with a state of its own. */
export function useScreenSidebar() {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  return { open: sidebar?.open ?? false, setOpen: sidebar?.setOpen ?? (() => {}) }
}

/**
 * A state of the sidebar for as long as it's mounted, like the settings one: the
 * same frame with a way back, this list instead of the usual one. The sidebar
 * starts folded away on such a screen, which gets the room.
 */
export function ScreenSidebar({ title, backTo, backLabel, children }: { title: string; backTo: string; backLabel: string; children: ReactNode }) {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  const claim = sidebar?.claim
  useLayoutEffect(() => claim?.({ title, backTo, backLabel }), [claim, title, backTo, backLabel])
  return sidebar?.host ? createPortal(children, sidebar.host) : null
}
