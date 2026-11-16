import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'
import { ContextMenu, type MenuItemDef } from './Menu'
import type { SidebarRowAction } from './SidebarRow'

/** A file, or a folder when it has `children` (an empty folder has an empty list). */
export interface FileTreeNode {
  id: string
  name: string
  /** A file's icon; a folder draws its own, open or closed. */
  icon?: string
  children?: FileTreeNode[]
  /** Beside the name: a dot for unsaved changes, a spinner while it works. */
  status?: ReactNode
  /** At the row's end, quiet: a version, a count. */
  badge?: ReactNode
  /** Everything the row can do, in its context menu; `quick` ones (with an icon) are buttons on the row too. */
  actions?: (SidebarRowAction | false | null | undefined)[]
}

interface Visible {
  node: FileTreeNode
  depth: number
  parent: string | null
}

const INDENT = 12

/**
 * Files in their folders, as a code editor has them: folders open and close (and stay as they were left, in
 * `expanded`), the open file is marked, each row has its actions on right-click and its quick ones on hover.
 * It is one tree to the keyboard: ↑↓ move, → opens a folder or goes into it, ← closes it or goes up to it,
 * Home and End, Enter or Space opens, and typing a name's first letters goes to it.
 */
export function FileTree({ nodes, active, onOpen, expanded, onExpandedChange, label, className }: {
  nodes: FileTreeNode[]
  /** The file open now. */
  active: string | null
  onOpen: (id: string) => void
  expanded: string[]
  onExpandedChange: (expanded: string[]) => void
  label: string
  className?: string
}) {
  const open = useMemo(() => new Set(expanded), [expanded])
  const visible = useMemo(() => {
    const out: Visible[] = []
    const walk = (list: FileTreeNode[], depth: number, parent: string | null) => {
      for (const node of list) {
        out.push({ node, depth, parent })
        if (node.children && open.has(node.id)) walk(node.children, depth + 1, node.id)
      }
    }
    walk(nodes, 0, null)
    return out
  }, [nodes, open])

  // One row takes the Tab stop: the one with the focus last, else the open file, else the first.
  const [focused, setFocused] = useState<string | null>(null)
  const stop = visible.some((row) => row.node.id === focused) ? focused : visible.some((row) => row.node.id === active) ? active : visible[0]?.node.id ?? null
  const tree = useRef<HTMLDivElement>(null)
  const focus = (id: string) => {
    setFocused(id)
    const row = () => tree.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)
    // A row on screen takes the focus at once, so keys pressed quickly follow each other; one a folder just opened shows next frame.
    const now = row()
    if (now) now.focus()
    else requestAnimationFrame(() => row()?.focus())
  }
  const toggle = (id: string, to = !open.has(id)) => onExpandedChange(to ? [...expanded.filter((x) => x !== id), id] : expanded.filter((x) => x !== id))

  // The file opened from elsewhere (a link, a tab, one just made) is in view, its folders open: once, as soon as
  // the tree has it, so a folder closed afterwards stays closed.
  const revealed = useRef<string | null>(null)
  useEffect(() => {
    if (!active || revealed.current === active) return
    const path: string[] = []
    const find = (list: FileTreeNode[], trail: string[]): boolean => list.some((node) => node.id === active ? (path.push(...trail), true) : !!node.children && find(node.children, [...trail, node.id]))
    if (!find(nodes, [])) return
    revealed.current = active
    if (path.some((id) => !open.has(id))) onExpandedChange([...new Set([...expanded, ...path])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, nodes])
  useEffect(() => {
    if (active) tree.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(active)}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, visible.length])

  const typed = useRef({ text: '', at: 0 })
  const key = (event: KeyboardEvent, index: number) => {
    const row = visible[index]
    const folder = !!row.node.children
    const go = (to: number) => { const next = visible[Math.max(0, Math.min(visible.length - 1, to))]; if (next) focus(next.node.id) }
    switch (event.key) {
      case 'ArrowDown': go(index + 1); break
      case 'ArrowUp': go(index - 1); break
      case 'Home': go(0); break
      case 'End': go(visible.length - 1); break
      case 'ArrowRight':
        if (!folder) return
        if (!open.has(row.node.id)) toggle(row.node.id, true)
        else if (row.node.children!.length) go(index + 1)
        break
      case 'ArrowLeft':
        if (folder && open.has(row.node.id)) toggle(row.node.id, false)
        else if (row.parent) focus(row.parent)
        break
      case 'Enter':
      case ' ':
        if (folder) toggle(row.node.id)
        else onOpen(row.node.id)
        break
      default: {
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return
        const now = Date.now()
        typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + event.key.toLowerCase(), at: now }
        const order = [...visible.slice(index + (typed.current.text.length === 1 ? 1 : 0)), ...visible.slice(0, index + 1)]
        const match = order.find((candidate) => candidate.node.name.toLowerCase().startsWith(typed.current.text))
        if (match) focus(match.node.id)
      }
    }
    event.preventDefault()
  }

  return (
    <div ref={tree} role="tree" aria-label={label} className={cn('space-y-px', className)}>
      {visible.map((row, index) => {
        const { node, depth } = row
        const folder = !!node.children
        const on = !folder && node.id === active
        const own = (node.actions ?? []).filter((a): a is SidebarRowAction => !!a)
        const quick = own.filter((a) => a.quick && a.icon)
        const item = (
          <div
            key={node.id}
            role="treeitem"
            data-tree-id={node.id}
            aria-level={depth + 1}
            aria-expanded={folder ? open.has(node.id) : undefined}
            aria-selected={folder ? undefined : on}
            aria-current={on ? 'page' : undefined}
            tabIndex={node.id === stop ? 0 : -1}
            onFocus={() => setFocused(node.id)}
            onClick={() => (folder ? toggle(node.id) : onOpen(node.id))}
            onKeyDown={(event) => key(event, index)}
            className={cn('cms-sidebar-row cms-reveal-row h-7 gap-1.5 pr-1 text-sm -outline-offset-2 pointer-coarse:h-11', on && 'cms-sidebar-row-active font-medium')}
            style={{ paddingInlineStart: 6 + depth * INDENT }}
          >
            {/* A line down from each open folder, as far as what it holds goes. */}
            {Array.from({ length: depth }, (_, level) => <span key={level} aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-border" style={{ insetInlineStart: 6 + level * INDENT + 7 }} />)}
            <span aria-hidden className="grid w-4 shrink-0 place-items-center text-faint">
              {folder && <Icon name="chevron-right" size={12} className={cn('transition-transform duration-fast', open.has(node.id) && 'rotate-90')} />}
            </span>
            <Icon name={folder ? (open.has(node.id) ? 'folder-open' : 'folder') : node.icon ?? 'file'} size={16} className={cn('shrink-0', on ? 'text-ink' : 'text-faint')} />
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            {node.status && <span className="flex shrink-0 items-center">{node.status}</span>}
            {node.badge && <span className="shrink-0 font-mono text-2xs text-faint tabular-nums">{node.badge}</span>}
            {quick.length > 0 && (
              // For the pointer: the keyboard and screen readers have the same actions in the row's context menu.
              <span className="cms-reveal flex shrink-0 items-center" aria-hidden="true" onClick={(event) => event.stopPropagation()}>
                {quick.map((action) => <IconButton key={action.label} icon={action.icon!} size="xs" label={action.label} tabIndex={-1} disabled={action.disabled} onClick={action.onSelect} />)}
              </span>
            )}
          </div>
        )
        const menu: MenuItemDef[] = own
        return menu.length ? <ContextMenu key={node.id} items={menu}>{item}</ContextMenu> : item
      })}
    </div>
  )
}
