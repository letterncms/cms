import { Tooltip as Base } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'
import { Kbd } from './Kbd'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <Base.Provider delay={450}>{children}</Base.Provider>
}

export function Tooltip({ content, shortcut, side = 'top', children }: { content: ReactNode; shortcut?: string; side?: 'top' | 'bottom' | 'left' | 'right'; children: ReactElement }) {
  return (
    <Base.Root>
      <Base.Trigger render={children} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6} className="z-[60]">
          <Base.Popup className="cms-pop flex items-center gap-2 !rounded-sm !border-transparent !bg-ink px-2 py-1 text-xs font-medium !text-ink-contrast">
            {content}
            {shortcut && <Kbd keys={shortcut} className="opacity-80 [&_kbd]:border-white/20 [&_kbd]:bg-white/10 [&_kbd]:text-ink-contrast" />}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
