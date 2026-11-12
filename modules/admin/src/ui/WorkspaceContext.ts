import { createContext, type RefObject } from 'react'

/** The shell's places for what a screen puts beside or over its content: the content area, the inspector's desk, the sidebar. */
export const WorkspaceContext = createContext<{
  host: HTMLDivElement | null
  content: RefObject<HTMLDivElement | null>
  /** On the desk at the right of the sheet: where a screen's inspector goes (see `InspectorPanel`), so the sheet is only the canvas. */
  inspector?: HTMLElement | null
  /** The sidebar, for a screen with a state of its own there (see `ScreenSidebar`). */
  sidebar: {
    host: HTMLElement | null
    open: boolean
    setOpen: (open: boolean) => void
    /** Say so while mounted; returns how to stop. */
    claim: (state: { title: string; backTo: string; backLabel: string; nested?: boolean }) => () => void
    /** A screen has said so, and has the sidebar to itself. */
    claimed: boolean
    /** Its list is under its row in the sidebar, not a sidebar of its own. */
    nested: boolean
  }
} | null>(null)
