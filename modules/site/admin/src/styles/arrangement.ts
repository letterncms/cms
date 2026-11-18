import type { MenuItemDef, TreeItem } from '@letterncms/ui'
import type { Arrangement, Entry } from '../parts'

/* How the styles are listed (settings.json `arrangement`): rows in order and groups inside a group, read against
   what a group holds now, and written back after a drag, a move, a rename. */

/** A row of a list in the tree it is dragged in: a style that opens, or a group of the site's inside the list. */
export type Node = TreeItem & { kind: 'item' | 'group'; label: string; to?: string; menu: MenuItemDef[]; changed?: boolean; locked?: boolean; detail?: number }

/** Keys in the order the site put them, those it didn't name after them as they stand. */
export const ordered = (keys: string[], order: string[]) => [...order.filter((key) => keys.includes(key)), ...keys.filter((key) => !order.includes(key))]

/** A group's rows as arranged, among the styles it has: what is gone is left out, what is new comes last. Its own groups stay, empty or not. */
export function arranged(entries: Entry[], keys: string[]): Entry[] {
  const placed = new Set<string>()
  const keep = (list: Entry[]): Entry[] => list.flatMap((entry): Entry[] => {
    if (typeof entry !== 'string') return [{ name: entry.name, items: keep(entry.items) }]
    if (!keys.includes(entry) || placed.has(entry)) return []
    placed.add(entry)
    return [entry]
  })
  const kept = keep(entries)
  return [...kept, ...keys.filter((key) => !placed.has(key))]
}

/** A style taken out of a list, wherever it stands in it. */
export const removeEntry = (entries: Entry[], key: string): Entry[] => entries.flatMap((entry): Entry[] => (typeof entry === 'string' ? (entry === key ? [] : [entry]) : [{ name: entry.name, items: removeEntry(entry.items, key) }]))

/** The group of a list a style stands in, if any. */
export const groupHolding = (entries: Entry[], key: string, within: string | null = null): string | null => {
  for (const entry of entries) {
    if (entry === key) return within
    if (typeof entry !== 'string') {
      const found = groupHolding(entry.items, key, entry.name)
      if (found) return found
    }
  }
  return null
}

/** The names of a list's own groups, at every depth. */
export const groupNames = (entries: Entry[]): string[] => entries.flatMap((entry) => (typeof entry === 'string' ? [] : [entry.name, ...groupNames(entry.items)]))

/** How many styles a group holds, in its groups too. */
export const countIn = (node: Node): number => ((node.children ?? []) as Node[]).reduce((sum, child) => sum + (child.kind === 'group' ? countIn(child) : 1), 0)

/** Rows as the tree draws them. */
export function toNodes(entries: Entry[], itemOf: (key: string) => Node | undefined, menuOf: (name: string) => MenuItemDef[]): Node[] {
  return entries.flatMap((entry): Node[] => {
    if (typeof entry !== 'string') return [{ id: `group:${entry.name}`, kind: 'group', label: entry.name, menu: menuOf(entry.name), children: toNodes(entry.items, itemOf, menuOf) }]
    const node = itemOf(entry)
    return node ? [node] : []
  })
}

/** What the tree holds after a drag, as the arrangement writes it. */
export const fromNodes = (nodes: Node[]): Entry[] => nodes.map((node) => (node.kind === 'group' ? { name: node.label, items: fromNodes((node.children ?? []) as Node[]) } : node.id.slice(5)))

/** A group of a list changed where it stands, or taken out (null), its rows staying where it stood. */
export function mapGroup(entries: Entry[], name: string, change: ((group: { name: string; items: Entry[] }) => Entry) | null): Entry[] {
  return entries.flatMap((entry): Entry[] => {
    if (typeof entry === 'string') return [entry]
    if (entry.name === name) return change ? [change(entry)] : entry.items
    return [{ name: entry.name, items: mapGroup(entry.items, name, change) }]
  })
}

/** A style renamed wherever the arrangement names it. */
export function renameEntry(arrangement: Arrangement, from: string, to: string): Arrangement {
  const swap = (entries: Entry[]): Entry[] => entries.map((entry) => (typeof entry === 'string' ? (entry === from ? to : entry) : { name: entry.name, items: swap(entry.items) }))
  return { ...arrangement, groups: Object.fromEntries(Object.entries(arrangement.groups).map(([at, entries]) => [at, swap(entries)])) }
}

/** A group of the site's renamed in the arrangement, or gone from it (null). */
export function renameGroupKey(arrangement: Arrangement, from: string, to: string | null): Arrangement {
  const groups = Object.fromEntries(Object.entries(arrangement.groups).flatMap(([at, entries]) => (at !== from ? [[at, entries]] : to ? [[to, entries]] : [])))
  const order = arrangement.order.flatMap((name) => (name !== from ? [name] : to ? [to] : []))
  return { order, groups }
}

