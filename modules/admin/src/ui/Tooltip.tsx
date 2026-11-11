import { Tooltip as Base } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'
import { Kbd } from './Kbd'

/** Tooltips wait 400ms; once one shows, its neighbours show at once. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <Base.Provider delay={400}>{children}</Base.Provider>
}

/** `open` and `onOpenChange` hold it open on a press too, for a hint that touch must reach; a press then doesn't close it. */
export function Tooltip({ content, shortcut, side = 'top', open, onOpenChange, children }: { content: ReactNode; shortcut?: string; side?: 'top' | 'bottom' | 'left' | 'right'; open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactElement }) {
  return (
    <Base.Root open={open} onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}>
      <Base.Trigger render={children} closeOnClick={open === undefined} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6} className="z-tooltip">
          {/* Inverted ink, no arrow: a label, not a surface. */}
          <Base.Popup className="flex max-w-72 origin-[var(--transform-origin)] items-center gap-2 rounded-sm bg-ink px-2 py-1 text-xs font-medium text-ink-contrast shadow-pop transition-[opacity,scale] duration-base ease-out data-[ending-style]:opacity-0 data-[ending-style]:duration-fast data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[instant]:transition-none">
            {content}
            {shortcut && <Kbd keys={shortcut} bare className="!text-ink-contrast/60" />}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
