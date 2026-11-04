import { useContext, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { WorkspaceContext } from './Slideover'

/** Whether the sidebar is out on a screen with a state of its own, and whether its list is nested under the screen's row. */
export function useScreenSidebar() {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  return { open: sidebar?.open ?? false, setOpen: sidebar?.setOpen ?? (() => {}), nested: sidebar?.nested ?? false }
}

/**
 * A list of the screen's own in the sidebar, for as long as it's mounted.
 *
 * - By default it is a state of the sidebar, like the settings one (the editor's
 *   Outline): the same frame with a way back, this list instead of the usual one,
 *   out or folded away as each person last left it (folded the first time, so the
 *   screen gets the room). The way back returns to where the screen was opened
 *   from in this visit, else to `backTo` (its list).
 * - `nested`: sections of one screen (the design system's). They go under the
 *   screen's row in the sidebar, which stays as it is; only when that row isn't
 *   there (under More) do they take the sidebar over as above, out from the start.
 *   `useScreenSidebar().nested` says which, so rows can drop their icons under the row.
 *
 * A screen can claim it while what fills it still loads (no children yet): the claim
 * of whatever mounts inside takes over.
 */
export function ScreenSidebar({ title, backTo, backLabel, nested, children }: { title: string; backTo: string; backLabel: string; nested?: boolean; children: ReactNode }) {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  const claim = sidebar?.claim
  useLayoutEffect(() => claim?.({ title, backTo, backLabel, nested }), [claim, title, backTo, backLabel, nested])
  return sidebar?.host ? createPortal(children, sidebar.host) : null
}
