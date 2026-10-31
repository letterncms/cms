import { ContextMenu as BaseContext } from '@base-ui/react/context-menu'
import { Menu as Base } from '@base-ui/react/menu'
import type { ReactElement, ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Kbd } from './Kbd'

export interface MenuItemDef {
  label: string
  /** A second, quieter line under the label. */
  description?: string
  icon?: string
  shortcut?: string
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
        <Base.Positioner side={side} align={align} sideOffset={6} className="z-50">
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
        <BaseContext.Positioner className="z-50">
          <BaseContext.Popup className={cn(popupClass, className)}>
            <Items items={items} parts={BaseContext} />
          </BaseContext.Popup>
        </BaseContext.Positioner>
      </BaseContext.Portal>
    </BaseContext.Root>
  )
}

const popupClass = 'cms-pop max-h-[var(--available-height)] min-w-44 overflow-y-auto overscroll-contain p-1 outline-none'

function Items({ items, parts }: { items: (MenuItemDef | false | null | undefined)[]; parts: typeof Base | typeof BaseContext }) {
  return items.filter(Boolean).map((item, i) => {
    const it = item as MenuItemDef
    if (it.separator) return <parts.Separator key={i} className="my-1 h-px bg-border" />
    if (it.heading) return <div key={i} className="cms-caps px-2 pb-1 pt-2">{it.label}</div>
    return (
      <parts.Item
        key={i}
        disabled={it.disabled}
        onClick={it.onSelect}
        className={cn(
          'flex select-none items-center gap-2 rounded-xs px-2 text-sm outline-none data-[highlighted]:bg-hover data-[disabled]:opacity-40',
          it.description ? 'min-h-7 py-1.5' : 'h-7',
          it.danger ? 'text-danger' : 'text-text',
        )}
      >
        {it.icon && <Icon name={it.icon} size={14} className={it.danger ? '' : 'text-muted'} />}
        {it.description ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate">{it.label}</span>
            <span className="block truncate text-xs text-faint">{it.description}</span>
          </span>
        ) : <span className="flex-1">{it.label}</span>}
        {it.checked && <Icon name="check" size={14} />}
        {it.shortcut && <Kbd keys={it.shortcut} />}
      </parts.Item>
    )
  })
}

/** A generic menu panel item for custom popovers. */
export function MenuButton({ icon, label, onClick, active, hint, className }: { icon?: string; label: ReactNode; onClick?: () => void; active?: boolean; hint?: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-sm outline-none hover:bg-hover focus-visible:bg-hover', active && 'bg-active', className)}>
      {icon && <Icon name={icon} size={14} className="text-muted" />}
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </button>
  )
}
