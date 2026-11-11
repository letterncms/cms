import { Dialog as Base } from '@base-ui/react/dialog'
import { useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'
import { WorkspaceContext } from './Slideover'

/** A workspace inspector docks on desktop and becomes a focus-managed sheet on smaller screens. */
export function useWideInspector() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setWide(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return wide
}

export function InspectorPanel({ open, onOpenChange, title, children, className, docked = true }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; className?: string; docked?: boolean }) {
  const wide = useWideInspector() && docked
  // Stays on until it has moved out of sight.
  const [mounted, setMounted] = useState(open)
  useEffect(() => { if (open) setMounted(true) }, [open])
  // Placed by the shell on the desk, at the right of the sheet; drawn where it is without a shell (previews).
  const desk = useContext(WorkspaceContext)?.inspector
  const place = (panel: ReactNode) => (desk ? createPortal(panel, desk) : panel)
  if (wide) return place(
    <div
      className="cms-side-panel"
      style={{ '--cms-side-panel-width': 'var(--cms-inspector-width)' } as CSSProperties}
      data-cms-inspector={open || undefined}
      data-hidden={!open || undefined}
      inert={!open}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && !open) setMounted(false) }}
    >
      {/* On the desk, beside the sheet: the sheet's edge separates them, and fields lie on it as white slips (data-cms-desk). */}
      {(open || mounted) && <aside aria-label={title} data-cms-desk className={cn('flex h-full w-[var(--cms-inspector-width)] flex-col bg-surface', className)}>{children}</aside>}
    </div>
  )
  return <Base.Root open={open} onOpenChange={onOpenChange}>
    <Base.Portal>
      <Base.Backdrop className="fixed inset-0 z-overlay bg-overlay transition-opacity duration-move ease-out data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Base.Popup className={cn('fixed inset-y-0 right-0 z-overlay flex w-[min(100vw,var(--cms-inspector-width))] flex-col border-l border-border-modal bg-float shadow-dialog outline-none transition-[translate] duration-move ease-out data-[ending-style]:pointer-events-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full', className)}>
        <Base.Title className="sr-only">{title}</Base.Title>
        {children}
      </Base.Popup>
    </Base.Portal>
  </Base.Root>
}
