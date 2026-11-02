import { t } from '@letterncms/sdk'
import { useContext, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './Button'
import { WorkspaceContext } from './Slideover'
import { Tooltip } from './Tooltip'

/** Whether the screen's own sidebar is out, for a screen that has one. */
export function useScreenSidebar() {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  return { open: sidebar?.open ?? false, setOpen: sidebar?.setOpen ?? (() => {}) }
}

/**
 * What a screen puts in the left sidebar's place, for as long as it's mounted:
 * the builder's outline. The screen starts with it folded away, and the same button
 * and key as ever bring it out. There's one panel on the left, whatever is in it.
 */
export function ScreenSidebar({ title, children }: { title: string; children: ReactNode }) {
  const sidebar = useContext(WorkspaceContext)?.sidebar
  const claim = sidebar?.claim
  useLayoutEffect(() => claim?.(title), [claim, title])
  if (!sidebar?.host) return null
  return createPortal(
    <aside aria-label={title} className="flex h-full w-[248px] flex-col bg-surface">
      <div className="flex h-12 shrink-0 items-center justify-between pl-4 pr-2">
        <h2 className="m-0 min-w-0 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        <Tooltip content={t('Hide {name}', { name: title })} shortcut="mod+\\" side="bottom">
          <IconButton icon="sidebar" label={t('Hide {name}', { name: title })} title={undefined} size="sm" onClick={() => sidebar.setOpen(false)} />
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>,
    sidebar.host,
  )
}
