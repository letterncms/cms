import { useContext, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { WorkspaceContext } from './WorkspaceContext'

/** Whether the sidebar is out on a screen with a state of its own. */
export function useScreenSidebar() {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  return { open: sidebar?.open ?? false, setOpen: sidebar?.setOpen ?? (() => {}) }
}

/**
 * A list of the screen's own in the sidebar, for as long as it's mounted: the same frame with a way back,
 * this list instead of the usual one (the editor's Outline). It's out or folded away as each person last
 * left it (folded the first time, so the screen gets the room). The way back returns to where the screen
 * was opened from in this visit, else to `backTo` (its list).
 *
 * A screen can claim it while what fills it still loads (no children yet): the claim
 * of whatever mounts inside takes over.
 */
export function ScreenSidebar({ title, backTo, backLabel, children }: { title: string; backTo: string; backLabel: string; children: ReactNode }) {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  const claim = sidebar?.claim
  useLayoutEffect(() => claim?.({ title, backTo, backLabel }), [claim, title, backTo, backLabel])
  return sidebar?.host ? createPortal(children, sidebar.host) : null
}
