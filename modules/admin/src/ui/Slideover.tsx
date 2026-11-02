import { Dialog as Base } from '@base-ui/react/dialog'
import { t } from '@letterncms/sdk'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Icon } from './Icon'
import { IconButton } from './Button'
import { cn } from './cn'

interface SlideoverProps {
  id: string
  open: boolean
  expanded: boolean
  onOpenChange: (open: boolean) => void
  onExpandedChange: (expanded: boolean) => void
  title: ReactNode
  icon?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** Keeps workspace overlays anchored to the content area, independently of sidebar width. */
export const WorkspaceContext = createContext<{
  host: HTMLDivElement | null
  content: RefObject<HTMLDivElement | null>
  /** The sidebar, for a screen with a state of its own there (see `ScreenSidebar`). */
  sidebar: {
    host: HTMLElement | null
    open: boolean
    setOpen: (open: boolean) => void
    /** Say so while mounted; returns how to stop. */
    claim: (state: { title: string; backTo: string; backLabel: string }) => () => void
    /** A screen has said so. */
    claimed: boolean
  }
} | null>(null)

/** A persistent workspace overlay. Expansion leaves global navigation available. */
export function Slideover({ id, open, expanded, onOpenChange, onExpandedChange, title, icon, actions, children, className }: SlideoverProps) {
  const workspace = useContext(WorkspaceContext)
  const popup = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 639px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const change = () => setNarrow(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  // Covered content cannot receive focus, while the sidebar remains fully usable.
  useEffect(() => {
    const content = workspace?.content.current
    if (!content || !open || (!expanded && !narrow)) return
    const previous = content.inert
    content.inert = true
    return () => { content.inert = previous }
  }, [workspace?.content, open, expanded, narrow])

  return (
    <Base.Root open={open} onOpenChange={onOpenChange} modal={!workspace && (expanded || narrow)} disablePointerDismissal>
      <Base.Portal keepMounted container={workspace ? workspace.host : undefined}>
        <Base.Popup
          id={id}
          ref={popup}
          aria-modal={!workspace && (expanded || narrow) || undefined}
          className={cn('cms-slideover', className)}
          data-expanded={expanded || undefined}
          data-workspace={workspace ? '' : undefined}
          initialFocus={(type) => type === 'touch' ? popup.current : popup.current?.querySelector('textarea') ?? popup.current}
        >
          <header className="cms-slideover-header">
            {icon && <Icon name={icon} size={17} className="shrink-0 text-ink" />}
            <Base.Title className="m-0 min-w-0 flex-1 truncate text-sm font-semibold text-ink">{title}</Base.Title>
            <div className="flex shrink-0 items-center gap-0.5">
              {actions}
              <IconButton icon={expanded ? 'minimize' : 'maximize'} label={expanded ? t('Minimize') : t('Expand')} onClick={() => onExpandedChange(!expanded)} className="max-sm:hidden" />
              <Base.Close render={<IconButton icon="close" label={t('Close')} />} />
            </div>
          </header>
          {children}
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  )
}
