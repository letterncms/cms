import { Tooltip as Base } from '@base-ui/react/tooltip'
import { useRender } from '@base-ui/react/use-render'
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import { Kbd } from './Kbd'

/** Tooltips wait 400ms; once one shows, its neighbours show at once. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <Base.Provider delay={400}>{children}</Base.Provider>
}

type TooltipProps = {
  content: ReactNode
  shortcut?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactElement
  ref?: Ref<HTMLElement>
} & Omit<HTMLAttributes<HTMLElement>, 'content' | 'children'>

/**
 * `open` and `onOpenChange` hold it open on a press too, for a hint that touch must reach; a press then doesn't close it.
 * With no `content` it is only its `children`, so a hint that is sometimes there is written `<Tooltip content={maybe}>`.
 * Props and a ref it doesn't know reach `children`, so it can be a menu's or a popover's `trigger` itself.
 */
export function Tooltip({ content, shortcut, side = 'top', open, onOpenChange, children, ref, ...props }: TooltipProps) {
  if (content === null || content === undefined || content === '' || content === false) return <Plain ref={ref} props={props}>{children}</Plain>
  return (
    <Base.Root open={open} onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}>
      <Base.Trigger ref={ref as Ref<HTMLButtonElement>} render={children} closeOnClick={open === undefined} {...props} />
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

function Plain({ children, ref, props }: { children: ReactElement; ref?: Ref<HTMLElement>; props: Record<string, unknown> }) {
  return useRender({ render: children, ref, props })
}
