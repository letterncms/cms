import { Tooltip as Base } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'
import { Kbd } from './Kbd'

/** Tooltips wait 400ms; once one shows, its neighbours show at once. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <Base.Provider delay={400}>{children}</Base.Provider>
}

export function Tooltip({ content, shortcut, side = 'top', children }: { content: ReactNode; shortcut?: string; side?: 'top' | 'bottom' | 'left' | 'right'; children: ReactElement }) {
  return (
    <Base.Root>
      <Base.Trigger render={children} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6} className="z-[60]">
          {/* Inverted ink, no arrow: a label, not a surface. */}
          <Base.Popup className="flex max-w-72 origin-[var(--transform-origin)] items-center gap-2 rounded-sm bg-ink px-2 py-1 text-xs font-medium text-ink-contrast shadow-pop transition-[opacity,scale] duration-120 ease-out data-[ending-style]:opacity-0 data-[ending-style]:duration-80 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[instant]:transition-none">
            {content}
            {shortcut && <Kbd keys={shortcut} bare className="!text-ink-contrast/60" />}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
