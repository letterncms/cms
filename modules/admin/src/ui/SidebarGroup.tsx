import type { ReactNode } from 'react'

/**
 * Rows of the sidebar under a heading (none without a `title`), apart from the group before them, with what
 * adds one to it beside the heading (`action`).
 */
export function SidebarGroup({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="cms-sidebar-group" aria-label={title || undefined}>
      {title && (
        <div className="cms-sidebar-group-title">
          <h3 className="cms-label m-0 min-w-0 flex-1 truncate">{title}</h3>
          {action}
        </div>
      )}
      <div className="space-y-px">{children}</div>
    </section>
  )
}
