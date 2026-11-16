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
 * this list instead of the usual one. The way back returns to where the screen was opened from in this
 * visit, else to `backTo` (its list).
 *
 * - By default it is the screen's own state (the editor's Outline): out or folded away as each person
 *   last left it (folded the first time, so the screen gets the room), with nothing under it.
 * - `step`: a step into the place you are (Styling, Code within the design), as a room is one into the
 *   admin: out whenever the sidebar is, like the list it takes the place of, with who is signed in under it.
 *
 * A screen can claim it while what fills it still loads (no children yet): the claim
 * of whatever mounts inside takes over.
 */
export function ScreenSidebar({ title, backTo, backLabel, step, children }: { title: string; backTo: string; backLabel: string; step?: boolean; children: ReactNode }) {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  const claim = sidebar?.claim
  useLayoutEffect(() => claim?.({ title, backTo, backLabel, step }), [claim, title, backTo, backLabel, step])
  return sidebar?.host ? createPortal(children, sidebar.host) : null
}
