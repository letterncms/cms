import { Popover as Base } from '@base-ui/react/popover'
import { useRef, type ReactElement, type ReactNode } from 'react'
import { cn } from './cn'

export interface PopoverProps {
  trigger: ReactElement
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  modal?: boolean
  returnFocus?: () => HTMLElement | null | false
}

export function Popover({ trigger, children, side = 'bottom', align = 'start', open, onOpenChange, className, modal = false, returnFocus }: PopoverProps) {
  const popup = useRef<HTMLDivElement>(null)
  const anchor = useRef<HTMLButtonElement>(null)
  return (
    <Base.Root open={open} onOpenChange={(o) => onOpenChange?.(o)} modal={modal}>
      <Base.Trigger ref={anchor} render={trigger} />
      <Base.Portal>
        <Base.Positioner side={side} align={align} sideOffset={6} className="z-50">
          <Base.Popup ref={popup} initialFocus={(interaction) => {
            const target = interaction === 'touch' ? popup.current : popup.current?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]') ?? popup.current
            target?.focus({ preventScroll: true })
            return false
          }} finalFocus={() => { const target = returnFocus ? returnFocus() : anchor.current; if (target) target.focus({ preventScroll: true }); return false }} className={cn('cms-pop max-h-[var(--available-height)] overflow-auto p-1 outline-none', className)}>{children}</Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
