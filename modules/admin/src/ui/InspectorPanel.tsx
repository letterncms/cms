import { Dialog as Base } from '@base-ui/react/dialog'
import { useContext, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { t } from '@letterncms/sdk'
import { IconButton } from './Button'
import { Icon } from './Icon'
import { cn } from './cn'
import { SheetHandle } from './Dialog'
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

/** How many panels are open at the right edge, docked beside the sheet: the chat floats clear of them. */
let openPanels = 0
const watchers = new Set<() => void>()
const subscribe = (watch: () => void) => { watchers.add(watch); return () => { watchers.delete(watch) } }
/** Whether a panel is open at the right edge: the chat's dock floats beside it instead of squeezing the page. */
export function useInspectorOpen() {
  return useSyncExternalStore(subscribe, () => openPanels > 0)
}

/** On a phone, a `sheet` rises from the bottom edge with the kit's grip, so what it is about stays in view above it. */
const phoneSheet = 'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:h-[72dvh] max-sm:w-full max-sm:rounded-t-xl max-sm:border-l-0 max-sm:border-t max-sm:pb-[env(safe-area-inset-bottom)] max-sm:data-[starting-style]:translate-x-0 max-sm:data-[starting-style]:translate-y-full max-sm:data-[ending-style]:translate-x-0 max-sm:data-[ending-style]:translate-y-full'

export function InspectorPanel({ open, onOpenChange, title, children, className, docked = true, sheet = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; className?: string; docked?: boolean; sheet?: boolean }) {
  const wide = useWideInspector() && docked
  const popup = useRef<HTMLDivElement>(null)
  // Stays on until it has moved out of sight.
  const [mounted, setMounted] = useState(open)
  useEffect(() => { if (open) setMounted(true) }, [open])
  // Placed by the shell on the desk, at the right of the sheet; drawn where it is without a shell (previews).
  const desk = useContext(WorkspaceContext)?.inspector
  const place = (panel: ReactNode) => (desk ? createPortal(panel, desk) : panel)
  const holds = wide && open
  useEffect(() => {
    if (!holds) return
    openPanels++
    watchers.forEach((watch) => watch())
    return () => { openPanels--; watchers.forEach((watch) => watch()) }
  }, [holds])
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
      <Base.Popup ref={popup} className={cn('fixed inset-y-0 right-0 z-overlay flex w-[min(100vw,var(--cms-inspector-width))] flex-col border-l border-border-modal bg-float shadow-dialog outline-none transition-[translate] duration-move ease-out data-[ending-style]:pointer-events-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full', sheet && `cms-panel-sheet ${phoneSheet}`, className)}>
        <Base.Title className="sr-only">{title}</Base.Title>
        {sheet && <SheetHandle sheet={popup} onDismiss={() => onOpenChange(false)} />}
        {children}
      </Base.Popup>
    </Base.Portal>
  </Base.Root>
}

/**
 * The first row of every panel at the right, lined up with the page's top bar: the way back, what it is about
 * (a title, or `children` for tabs or a name to rename), its actions, and its close.
 */
export function PanelHeader({ title, icon, children, actions, onBack, backLabel, onClose, bordered = true, className }: { title?: ReactNode; icon?: string; children?: ReactNode; actions?: ReactNode; onBack?: () => void; backLabel?: string; onClose?: () => void; bordered?: boolean; className?: string }) {
  return (
    <div className={cn('flex h-12 shrink-0 items-center gap-1 pr-2', onBack ? 'pl-2' : 'pl-4', bordered && 'border-b border-border', className)}>
      {onBack && <IconButton icon="arrow-left" label={backLabel ? t('Back to {name}', { name: backLabel }) : t('Back')} size="sm" onClick={onBack} />}
      {icon && <Icon name={icon} size={16} className={cn('shrink-0 text-muted', onBack && 'ml-1')} />}
      {children ?? <span className={cn('min-w-0 flex-1 truncate text-sm font-semibold text-ink', (onBack || icon) && 'pl-1')}>{title}</span>}
      {actions}
      {/* A phone's sheet has its grip to close it. */}
      {onClose && <IconButton icon="close" label={t('Close Panel')} size="sm" onClick={onClose} className="max-sm:in-[.cms-panel-sheet]:hidden" />}
    </div>
  )
}
