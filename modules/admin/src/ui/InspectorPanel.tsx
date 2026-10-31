import { Dialog as Base } from '@base-ui/react/dialog'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from './cn'

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
  if (wide) return open ? <aside aria-label={title} className={cn('flex w-[var(--cms-inspector-width)] shrink-0 flex-col border-l border-border bg-bg', className)}>{children}</aside> : null
  return <Base.Root open={open} onOpenChange={onOpenChange}>
    <Base.Portal>
      <Base.Backdrop className="fixed inset-0 z-50 bg-overlay" />
      <Base.Popup className={cn('fixed inset-y-0 right-0 z-50 flex w-[min(100vw,var(--cms-inspector-width))] flex-col border-l border-border-modal bg-bg shadow-dialog outline-none', className)}>
        <Base.Title className="sr-only">{title}</Base.Title>
        {children}
      </Base.Popup>
    </Base.Portal>
  </Base.Root>
}
