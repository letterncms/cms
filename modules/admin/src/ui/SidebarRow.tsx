import { boot, Link, t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'
import { Kbd } from './Kbd'
import { Marquee } from './Marquee'
import { ContextMenu, type MenuItemDef } from './Menu'
import { Tooltip } from './Tooltip'

export interface SidebarRowAction extends MenuItemDef {
  /** Also a button on the row, shown on hover and focus (it needs an `icon`). */
  quick?: boolean
}

export interface SidebarRowProps {
  label: string
  icon?: string
  to?: string
  onClick?: () => void
  active?: boolean
  /** The rail: the icon alone, its label in a tooltip. */
  collapsed?: boolean
  title?: string
  /** A count, or a dot in the rail. */
  badge?: ReactNode
  shortcut?: string | null
  status?: ReactNode
  /** Everything the row can do, in its context menu; `quick` ones are buttons on the row too. */
  actions?: (SidebarRowAction | false | null | undefined)[]
  /** A row being dragged into place must not drag its link out of the page. */
  sortable?: boolean
}

/**
 * Every row in the sidebar: a link or button, its label sliding to show its end
 * when it does not fit, quick actions on hover, and all of them on right-click
 * (or long-press) after Open in New Tab. Navigation and actions are siblings so
 * buttons never live inside a link.
 */
export function SidebarRow({ label, icon, to, onClick, active, collapsed, title, badge, shortcut, status, actions = [], sortable }: SidebarRowProps) {
  const own = actions.filter((a): a is SidebarRowAction => !!a)
  const quick = own.filter((a) => a.quick && a.icon)
  const menu: (MenuItemDef | false)[] = [
    to !== undefined && { label: t('Open in New Tab'), icon: 'external', onSelect: () => window.open(boot.base + (to === '/' ? '' : to), '_blank', 'noopener') },
    to !== undefined && own.length > 0 && { separator: true, label: '' },
    ...own,
  ]

  const main = {
    className: 'cms-sidebar-row-main',
    onClick,
    draggable: sortable ? false : undefined,
    title: collapsed ? undefined : title ?? label,
    'aria-label': label,
    'aria-current': active ? 'page' as const : undefined,
    children: <>
      {icon && <Icon name={icon} size={16} className="shrink-0" />}
      {!collapsed && <Marquee>{label}</Marquee>}
      {!collapsed && status && <span className="cms-sidebar-row-status">{status}</span>}
      {badge
        ? collapsed ? <span className="cms-sidebar-row-dot" aria-hidden="true" /> : <span className="cms-sidebar-row-badge">{badge}</span>
        : !collapsed && shortcut ? <Kbd keys={shortcut} className="cms-sidebar-row-shortcut" /> : null}
    </>,
  }
  const link = to !== undefined ? <Link to={to} {...main} /> : <button type="button" {...main} />

  const row = (
    <div className={cn('cms-sidebar-row', active && 'cms-sidebar-row-active')} data-collapsed={collapsed || undefined}>
      {collapsed ? <Tooltip content={label} shortcut={shortcut ?? undefined} side="right">{link}</Tooltip> : link}
      {!collapsed && quick.length > 0 && (
        // The group names the row, so "Unpin" is heard as Unpin Pages.
        <div className="cms-sidebar-row-actions" role="group" aria-label={label}>
          {quick.map((action) => (
            <Tooltip key={action.label} content={action.label}>
              <IconButton icon={action.icon!} size="xs" label={action.label} title={undefined} disabled={action.disabled} onClick={action.onSelect} />
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  )
  return menu.some(Boolean) ? <ContextMenu items={menu}>{row}</ContextMenu> : row
}
