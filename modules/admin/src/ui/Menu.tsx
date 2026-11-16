import { ContextMenu as BaseContext } from '@base-ui/react/context-menu'
import { Menu as Base } from '@base-ui/react/menu'
import type { ReactElement } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Kbd } from './Kbd'

export interface MenuItemDef {
  label: string
  /** A second, quieter line under the label. */
  description?: string
  icon?: string
  shortcut?: string
  /** Quiet words at the end of the row: a code, a state. */
  hint?: string
  /** The kit's mark after the label, the dot that says something is set or changed there; the words say what, to a screen reader. */
  mark?: string
  danger?: boolean
  disabled?: boolean
  onSelect?: () => void
  /** Render as a group label instead of an item. */
  heading?: boolean
  separator?: boolean
  checked?: boolean
}

export function Menu({ trigger, items, align = 'end', side = 'bottom', className }: { trigger: ReactElement; items: (MenuItemDef | false | null | undefined)[]; align?: 'start' | 'center' | 'end'; side?: 'top' | 'bottom' | 'left' | 'right'; className?: string }) {
  return (
    <Base.Root>
      <Base.Trigger render={trigger} />
      <Base.Portal>
        <Base.Positioner side={side} align={align} sideOffset={6} className="z-overlay">
          <Base.Popup className={cn(popupClass, className)}>
            <Items items={items} parts={Base} />
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}

/** The same menu on right-click (or long-press) of its child — for actions on a row that has no room for a button. */
export function ContextMenu({ children, items, className }: { children: ReactElement; items: (MenuItemDef | false | null | undefined)[]; className?: string }) {
  return (
    <BaseContext.Root>
      <BaseContext.Trigger render={children} />
      <BaseContext.Portal>
        <BaseContext.Positioner className="z-overlay">
          <BaseContext.Popup className={cn(popupClass, className)}>
            <Items items={items} parts={BaseContext} />
          </BaseContext.Popup>
        </BaseContext.Positioner>
      </BaseContext.Portal>
    </BaseContext.Root>
  )
}

/**
 * The same menu at a point of the window, opened by its caller: a right-click where a ContextMenu's trigger can't be
 * (inside a frame, as the editor's canvas is). Closed by a choice, Escape or a press elsewhere (`onClose`).
 */
export function MenuAt({ at, onClose, items, className }: { at: { x: number; y: number } | null; onClose: () => void; items: (MenuItemDef | false | null | undefined)[]; className?: string }) {
  const point = at ?? { x: 0, y: 0 }
  const anchor = { getBoundingClientRect: () => DOMRect.fromRect({ x: point.x, y: point.y, width: 0, height: 0 }) }
  return (
    <Base.Root open={!!at} onOpenChange={(open) => !open && onClose()}>
      <Base.Portal>
        {/* Beside the point, its top at the pointer: moved up when there is no room below and to the left when there is
            none on the right, as a system's own menu is. */}
        <Base.Positioner anchor={anchor} side="right" align="start" sideOffset={2} collisionPadding={8} collisionAvoidance={{ side: 'flip', align: 'shift' }} className="z-overlay">
          <Base.Popup className={cn(pointClass, className)}>
            <Items items={items} parts={Base} />
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}

const popupBase = 'cms-pop min-w-[200px] max-w-[var(--available-width)] overflow-y-auto overscroll-contain p-1 outline-none'
const popupClass = `${popupBase} max-h-[min(60vh,var(--available-height))]`
/** A menu at a point is shown whole. */
const pointClass = `${popupBase} max-h-[calc(100vh-16px)]`

function Items({ items, parts }: { items: (MenuItemDef | false | null | undefined)[]; parts: typeof Base | typeof BaseContext }) {
  return items.filter(Boolean).map((item, i) => {
    const it = item as MenuItemDef
    if (it.separator) return <parts.Separator key={i} className="-mx-1 my-1 h-px bg-border" />
    if (it.heading) return <div key={i} className="cms-label flex h-6 items-center px-2 [&:not(:first-child)]:mt-1">{it.label}</div>
    return (
      <parts.Item
        key={i}
        disabled={it.disabled}
        onClick={it.onSelect}
        data-danger={it.danger || undefined}
        className={cn('cms-menu-item', it.description && 'py-1.5')}
      >
        {it.icon && <Icon name={it.icon} size={16} />}
        {it.description ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate">{it.label}</span>
            <span className="block truncate text-xs text-faint">{it.description}</span>
          </span>
        ) : it.mark ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 truncate">{it.label}</span>
            <span role="img" aria-label={it.mark} className="size-1.5 shrink-0 rounded-full bg-focus" />
          </span>
        ) : <span className="min-w-0 flex-1 truncate">{it.label}</span>}
        {it.hint && <span className="shrink-0 text-xs text-faint">{it.hint}</span>}
        {it.checked && <Icon name="check" size={16} className="shrink-0 text-ink" />}
        {it.shortcut && <Kbd keys={it.shortcut} bare className="ml-2" />}
      </parts.Item>
    )
  })
}

