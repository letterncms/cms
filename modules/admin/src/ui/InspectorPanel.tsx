import { Dialog as Base } from '@base-ui/react/dialog'
import { useContext, useEffect, useState, type ReactNode } from 'react'
import { cn } from './cn'
import { WorkspaceContext } from './Slideover'

/** A workspace inspector docks while the workspace has room for it and becomes a focus-managed sheet when it does not. */
export function useWideInspector(room = 840) {
  const host = useContext(WorkspaceContext)?.host
  const [wide, setWide] = useState(() => (host?.clientWidth ?? window.innerWidth - 52) >= room)
  useEffect(() => {
    if (!host) return
    const observer = new ResizeObserver(() => setWide(host.clientWidth >= room))
    observer.observe(host)
    return () => observer.disconnect()
  }, [host, room])
  return wide
}

export function InspectorPanel({ open, onOpenChange, title, children, className, docked = true }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; className?: string; docked?: boolean }) {
  const workspace = useContext(WorkspaceContext)
  const wide = useWideInspector() && docked
  if (wide) return open ? <aside aria-label={title} className={cn('flex w-[var(--cms-inspector-width)] shrink-0 flex-col border-l border-border bg-bg', className)}>{children}</aside> : null
  // Beside a docked panel the sheet stays on the workspace, and the panel stays usable.
  const beside = workspace?.dock.open ? workspace.host : null
  return <Base.Root open={open} onOpenChange={onOpenChange} modal={!beside} disablePointerDismissal={!!beside}>
    <Base.Portal container={beside ?? undefined}>
      <Base.Backdrop className={cn('inset-0 z-50 bg-overlay', beside ? 'absolute' : 'fixed')} />
      <Base.Popup className={cn('inset-y-0 right-0 z-50 flex w-[min(100%,var(--cms-inspector-width))] flex-col border-l border-border-modal bg-bg shadow-dialog outline-none', beside ? 'absolute' : 'fixed', className)}>
        <Base.Title className="sr-only">{title}</Base.Title>
        {children}
      </Base.Popup>
    </Base.Portal>
  </Base.Root>
}
