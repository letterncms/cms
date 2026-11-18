import { navigate, t, type FieldDef } from '@letterncms/sdk'
import { Button, EmptyState, Fields, NoMatches, SettingsPanel, SortableTree, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useStyling, type Stylesheet } from '@letterncms/blocks'
import { useEffect, useState } from 'react'
import { Group, TreeRow, rowMenu, type Editing, type Entry } from '../parts'
import { arranged, countIn, fromNodes, groupHolding, groupNames, mapGroup, ordered, removeEntry, renameEntry, renameGroupKey, toNodes, type Node } from './arrangement'
import { StyleEditor, type Samples } from './StyleEditor'
import {
  BUILT_IN, HOLDS_STYLES, UNGROUPED, addableElements, allStyles, builtInLabel, className, groupLabel, groupNamed, hasRule, isButton, keepGroup, ownClasses,
  removeStyle, renameClass, revertStyle, setGroup, siteGroups, stylePath, styleAt, styleChanged, takenByStyles, type Placed,
} from './model'

/* Design › Styles: every style of the site in groups, each group a place of its own and each style opening on its
   editor in place of the list. A group holds what the site was given and whatever it made, a class, an element or an
   id, made the same way (New Style) and moved, renamed or deleted the same way; groups of its own inside it, and its
   rows in any order, dragged or moved from a row's ⋯. */

export { stylePath, stylesPlace } from './model'
export type { Samples } from './StyleEditor'

/** What a new style is written as, in the words of the dialog. */
type Made = 'class' | 'element' | 'id'

/** A name for a group inside a list: any words, but not one the list has already. */
async function askInnerGroup(taken: string[], title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: t('Headings'), required: true, autofocus: true }], values: { name: current }, confirm: confirmLabel })
  const name = String(asked?.name ?? '').trim()
  if (!name || name === current) return null
  if (taken.includes(name)) {
    toast.error(t('There is already a group “{name}”.', { name }))
    return null
  }
  return name
}

/** A name for a group of the site's: any words, but none the site was given or has already. */
async function askGroup(sheet: Stylesheet, title: string, confirmLabel: string, current = ''): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'group', type: 'text', label: t('Name'), placeholder: t('Cards'), required: true, autofocus: true }], values: { group: current }, confirm: confirmLabel })
  const name = String(asked?.group ?? '').replace(/\*\/|\n/g, '').trim()
  if (!name || name === current) return null
  const taken = [...BUILT_IN, UNGROUPED].some((id) => id === className(name) || (id === UNGROUPED ? t('Ungrouped') : builtInLabel(id))?.toLowerCase() === name.toLowerCase())
  if (taken) {
    toast.error(t('“{name}” is a group the site already has.', { name }))
    return null
  }
  if (sheet.groups().includes(name)) {
    toast.error(t('There is already a group “{name}”.', { name }))
    return null
  }
  return name
}

/** Which group a style goes in, as a list to pick from: none, one the site was given, or one of its own. */
const groupField = (groups: { id: string; name: string }[]): FieldDef => ({
  handle: 'group',
  type: 'select',
  label: t('Group'),
  placeholder: t('No Group'),
  options: [...HOLDS_STYLES.map((id) => ({ value: id, label: builtInLabel(id)! })), ...groups.map((group) => ({ value: group.name, label: group.name }))],
} as FieldDef)

/** A name as a class or an id takes it, checked: lowercase letters, numbers and hyphens, and none the site or Tailwind has. */
function checkName(name: string, taken: boolean): boolean {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    toast.error(t('A name is lowercase letters, numbers and hyphens, and starts with a letter.'))
    return false
  }
  if (taken) {
    toast.error(t('There is already a style “{name}”.', { name }))
    return false
  }
  return true
}

/**
 * The site's styles at `path` (after /design/styles): its groups, a group's styles, or one style's editor. Each
 * style opens on its editor in place of the list, so a block's Edit Class leads straight to it.
 */
export function Styles({ edit, samples, path }: { edit: Editing; samples: Samples; path: string[] }) {
  const { engine } = useStyling()
  const [search, setSearch] = useState('')
  const [group, key] = path
  const styles = allStyles(edit.sheet)
  const groups = siteGroups(edit.sheet)
  const open = (to: string) => navigate(to)
  // A style reached by another group's address (a block's Edit Class knows the name, not the group): the address its group gives it.
  const found = group && key ? styleAt(edit.sheet, group, key) : undefined
  const misplaced = !!found && found.home !== group
  useEffect(() => {
    if (misplaced && found) navigate(stylePath(found.home, found.id), { replace: true })
  }, [misplaced, found?.home, found?.id])

  /** The group a style made in `into` is written in: one the site was given by its id, one of its own by its name. */
  const groupName = (into: string | null) => (into && (HOLDS_STYLES as readonly string[]).includes(into) ? into : groups.find((each) => each.id === into)?.name ?? null)
  /** Whether a class or an id of this name is there already: a class's name is also no element's, no part's and no Tailwind class's. */
  const takenClass = (name: string) => edit.sheet.utilities().some((rule) => rule.name === name) || !!engine?.valid(name) || takenByStyles().has(name)
  const takenId = (selector: string) => edit.sheet.elements('components').some((rule) => rule.name === selector)

  /** A new style in the group it was made in, unless another is picked: a class, an element or an id. It opens at once. */
  const create = async (into: string | null) => {
    if (into === 'buttons') return void createButton()
    const elements = addableElements(edit.sheet)
    const types = [{ value: 'class', label: t('Class') }, ...(elements.length ? [{ value: 'element', label: t('Element') }] : []), { value: 'id', label: t('ID') }]
    const asked = await prompt({
      title: t('New Style'),
      fields: [
        { handle: 'type', type: 'select', display: 'segmented', block: true, label: t('Type'), options: types } as FieldDef,
        { handle: 'name', type: 'text', label: t('Name'), placeholder: 'card', autofocus: true, if: { type: ['class', 'id'] } },
        { handle: 'element', type: 'select', label: t('Element'), options: elements.map((style) => ({ value: style.id, label: style.label })), if: { type: 'element' } } as FieldDef,
        groupField(groups),
      ],
      values: { type: 'class', name: '', element: elements[0]?.id ?? null, group: groupName(into) },
      confirm: t('Create Style'),
    })
    if (!asked) return
    const type = String(asked.type ?? 'class') as Made
    const chosen = String(asked.group ?? '') || null
    if (type === 'element') {
      const style = elements.find((each) => each.id === asked.element)
      if (!style) return
      // In Elements by itself: only another group is written down.
      edit.change((sheet) => sheet.addElement(style.selector, 'base', chosen === 'elements' ? null : chosen))
      return open(stylePath('elements', style.id))
    }
    const name = className(asked.name)
    if (!name) return
    if (type === 'id') {
      if (!checkName(name, takenId(`#${name}`))) return
      edit.change((sheet) => sheet.addElement(`#${name}`, 'components', chosen))
      return open(stylePath(UNGROUPED, `#${name}`))
    }
    if (!checkName(name, takenClass(name))) return
    // Text of the page's size, which Tailwind can build: a class with nothing to apply isn't one.
    edit.change((sheet) => sheet.setUtility(name, ['text-base']).setUtilityGroup(name, chosen))
    open(stylePath(UNGROUPED, name))
  }
  /** A new look for buttons: a copy of the first one, under btn-. */
  const createButton = async () => {
    const asked = await prompt({ title: t('New Style'), fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'outline', required: true, autofocus: true }], values: { name: '' }, confirm: t('Create Style') })
    const name = `btn-${className(asked?.name)}`
    if (name === 'btn-' || !checkName(name, takenClass(name))) return
    const first = ownClasses(edit.sheet).find((rule) => isButton(rule.name))
    edit.change((sheet) => (first ? sheet.duplicateUtility(first.name, name).setUtilityGroup(name, null) : sheet.setUtility(name, ['text-base'])))
    open(stylePath('buttons', name))
  }

  /** A class or an id under another name, everywhere the site names it; one open stays open. */
  const rename = async (style: Placed) => {
    const id = style.kind === 'id'
    const prefix = isButton(style.selector) ? 'btn-' : ''
    const current = id ? style.selector.slice(1) : style.selector.slice(prefix.length)
    const asked = await prompt({ title: t('Rename “{name}”', { name: style.label }), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true }], values: { name: current }, confirm: t('Rename') })
    const name = className(asked?.name)
    if (!name || name === current) return
    const next = id ? `#${name}` : `${prefix}${name}`
    if (!checkName(name, id ? takenId(next) : takenClass(next))) return
    edit.change((sheet) => (id ? sheet.renameElement(style.selector, next, 'components') : renameClass(sheet, style.selector, next)))
    edit.arrange((a) => renameEntry(a, style.id, next))
    if (key === style.id) navigate(stylePath(group, next), { replace: true })
  }
  const duplicate = async (style: Placed) => {
    const id = style.kind === 'id'
    const prefix = isButton(style.selector) ? 'btn-' : ''
    const asked = await prompt({ title: t('Duplicate “{name}”', { name: style.label }), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true }], values: { name: '' }, confirm: t('Duplicate Style') })
    const name = className(asked?.name)
    if (!name) return
    const next = id ? `#${name}` : `${prefix}${name}`
    if (!checkName(name, id ? takenId(next) : takenClass(next))) return
    edit.change((sheet) => (id ? sheet.duplicateElement(style.selector, next, 'components') : sheet.duplicateUtility(style.selector, next)))
  }
  const remove = (style: Placed) => {
    const left = groupNamed(edit.sheet, style)
    edit.change((sheet) => keepGroup(removeStyle(sheet, style), left))
    if (key === style.id) navigate(stylePath(group))
  }

  /** What every style's ⋯ offers: its name to copy, Revert, and for one the site made Rename, Duplicate and Delete. */
  const styleMenu = (style: Placed, extra: MenuItemDef[] = []): MenuItemDef[] => rowMenu(edit, {
    extra,
    copy: style.kind === 'class' || style.kind === 'id' ? style.selector : undefined,
    revert: styleChanged(edit, style) && (style.kind !== 'class' || hasRule(edit.saved, style)) ? () => revertStyle(edit, style) : null,
    own: style.given ? [] : [
      ...(style.kind === 'element' ? [] : [
        { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(style) },
        { label: t('Duplicate…'), icon: 'copy', onSelect: () => void duplicate(style) },
      ]),
      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => remove(style) },
    ],
  })

  // One style open, in place of its group.
  if (group && key) {
    return found && !misplaced ? <StyleEditor key={`${group}/${key}`} edit={edit} samples={samples} style={found} menu={styleMenu(found)} /> : null
  }

  type Item = { key: string; to: string; label: string; group: string; menu: MenuItemDef[]; changed: boolean; style: Placed }
  const itemsOf = (at: string): Item[] => styles.filter((style) => style.home === at).map((style) => ({ key: style.id, to: stylePath(at, style.id), label: style.label, group: groupLabel(edit.sheet, at) ?? '', menu: styleMenu(style), changed: styleChanged(edit, style), style }))
  /** Where a group's rows are arranged: one the site was given by its id, one of its own by its name. */
  const arrangedAs = (at: string) => groups.find((each) => each.id === at)?.name ?? at
  const ungrouped = styles.some((style) => style.home === UNGROUPED)
  const ids = ordered([...BUILT_IN, ...groups.map((each) => each.id), ...(ungrouped ? [UNGROUPED] : [])], edit.arrangement.order.map((name) => groups.find((each) => each.name === name)?.id ?? name))
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const searchField = (placeholder: string) => (
    <div className="mb-4">
      <Fields bare fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder }]} values={{ search }} onChange={(_, next) => setSearch(String(next ?? ''))} />
    </div>
  )
  /** What a search finds, wherever it stands, with the group it is in. */
  const matches = (items: Item[], detail?: (entry: Item) => string) => {
    const shown = items.filter((entry) => terms.every((word) => `${entry.label} ${entry.key}`.toLowerCase().includes(word)))
    return shown.length ? (
      <Group plain>
        <SettingsPanel className="overflow-hidden">
          <div className="-mx-4 divide-y divide-border sm:-mx-5">
            {shown.map((entry) => <TreeRow key={entry.to} handle={null} onOpen={() => open(entry.to)} label={entry.label} changed={entry.changed} menu={entry.menu} detail={detail?.(entry)} />)}
          </div>
        </SettingsPanel>
      </Group>
    ) : <NoMatches onClear={() => setSearch('')} />
  }
  // What is added under a list: the same two quiet buttons under every list.
  const adding = 'ml-0 !px-1.5 !font-normal !text-muted first:-ml-1.5 hover:!text-ink'
  const actions = (into: string | null, newGroup: () => void) => (edit.readOnly ? undefined : (
    <span className="flex items-center gap-3">
      <Button variant="ghost" size="xs" icon="plus" onClick={() => void create(into)} className={adding}>{t('New Style')}</Button>
      <Button variant="ghost" size="xs" icon="folder" onClick={newGroup} className={adding}>{t('New Group')}</Button>
    </span>
  ))
  /** A list that can be put in another order by dragging, and into groups of its own: the same in every group. */
  const tree = (nodes: Node[], onChange: (nodes: Node[]) => void, depth: number) => (
    <SettingsPanel className="overflow-hidden">
      <SortableTree<Node>
        items={nodes}
        onChange={onChange}
        maxDepth={depth}
        canNest={(node) => node.kind === 'group'}
        indent={20}
        className="-mx-4 !space-y-0 divide-y divide-border sm:-mx-5"
        renderItem={(node, { handle }) => node.kind === 'group'
          ? <TreeRow heading handle={edit.readOnly ? null : handle} label={node.label} detail={countIn(node)} menu={node.menu} />
          : <TreeRow handle={edit.readOnly ? null : handle} onOpen={() => open(node.to ?? stylePath())} label={node.label} locked={node.locked} detail={node.detail} changed={node.changed} menu={node.menu} />}
      />
    </SettingsPanel>
  )

  // A group: what it holds, in the order the site put it and in groups of its own.
  if (group) {
    const items = itemsOf(group)
    const known = group === UNGROUPED || (BUILT_IN as readonly string[]).includes(group) || groups.some((each) => each.id === group)
    const at = arrangedAs(group)
    const entries = arranged(edit.arrangement.groups[at] ?? [], items.map((each) => each.key))
    const write = (next: Entry[]) => edit.arrange((a) => ({ ...a, groups: { ...a.groups, [at]: next } }))
    const names = groupNames(entries)
    const newInner = async () => {
      const name = await askInnerGroup(names, t('New Group'), t('Create Group'))
      // First in the list: what goes in it is dragged under it.
      if (name) write([{ name, items: [] }, ...entries])
    }
    /** A row into one of the list's groups or out of them, or a style the site made to another group of Styles: what dragging does, from a menu. */
    const moveTo = async (item: Item) => {
      const here = groupLabel(edit.sheet, group) ?? group
      const elsewhere = item.style.given || group === 'buttons' ? [] : [
        ...HOLDS_STYLES.map((id) => ({ value: `to:${id}`, label: builtInLabel(id)! })),
        ...groups.map((each) => ({ value: `to:${each.name}`, label: each.name })),
        ...(item.style.kind === 'element' ? [] : [{ value: 'to:', label: t('No Group') }]),
      ].filter((option) => option.value !== `to:${at}` && !(group === UNGROUPED && option.value === 'to:') && !(group === 'elements' && item.style.kind === 'element' && option.value === 'to:elements'))
      const options = [{ value: 'here', label: here }, ...names.map((name) => ({ value: `in:${name}`, label: `${here} › ${name}` })), ...elsewhere]
      const holding = groupHolding(entries, item.key)
      const asked = await prompt({ title: t('Move “{name}” to a Group', { name: item.label }), fields: [{ handle: 'group', type: 'select', label: t('Group'), required: true, options } as FieldDef], values: { group: holding ? `in:${holding}` : 'here' }, confirm: t('Move to Group') })
      if (!asked) return
      const target = String(asked.group ?? 'here')
      const without = removeEntry(entries, item.key)
      if (target.startsWith('to:')) {
        const name = target.slice(3) || null
        const left = groupNamed(edit.sheet, item.style)
        // An element in Elements is there by itself: no group is written for it.
        edit.change((sheet) => keepGroup(setGroup(sheet, item.style, item.style.kind === 'element' && name === 'elements' ? null : name), left))
        return write(without)
      }
      write(target.startsWith('in:') ? mapGroup(without, target.slice(3), (inner) => ({ ...inner, items: [...inner.items, item.key] })) : [...without, item.key])
    }
    const nodes = toNodes(entries, (id) => {
      const item = items.find((each) => each.key === id)
      if (!item) return undefined
      // One Move to Group… on every row that has somewhere to go.
      const movable = !edit.readOnly && (names.length > 0 || (!item.style.given && group !== 'buttons'))
      const menu = movable ? styleMenu(item.style, [{ label: t('Move to Group…'), icon: 'folder', onSelect: () => void moveTo(item) }]) : item.menu
      return { id: `item:${id}`, kind: 'item' as const, label: item.label, to: item.to, menu, changed: item.changed }
    }, (name) => rowMenu(edit, {
      own: [
        {
          label: t('Rename…'), icon: 'edit', onSelect: async () => {
            const next = await askInnerGroup(names, t('Rename Group'), t('Rename'), name)
            if (next) write(mapGroup(entries, name, (inner) => ({ ...inner, name: next })))
          },
        },
        // Its rows stay where it stood.
        { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => write(mapGroup(entries, name, null)) },
      ],
    }))
    // A group of the site's with nothing in it yet: the way to make its first style.
    if (items.length === 0 && names.length === 0) return <EmptyState compact icon="folder" title={t('No styles yet')} action={!edit.readOnly && known && <Button icon="plus" onClick={() => void create(group === UNGROUPED ? null : group)}>{t('New Style')}</Button>} />
    return (
      <>
        {items.length > 7 && searchField(t('Search {items}', { items: groupLabel(edit.sheet, group) ?? t('Styles') }))}
        {terms.length ? matches(items) : (
          <Group plain action={known ? actions(group === UNGROUPED ? null : group, () => void newInner()) : undefined}>
            {tree(nodes, (next) => write(fromNodes(next)), 3)}
          </Group>
        )}
      </>
    )
  }

  // Every group: those the site was given, its own, then the styles in none, in the order the site put them.
  const groupMenu = (name: string): MenuItemDef[] => rowMenu(edit, {
    own: [
      {
        label: t('Rename…'), icon: 'edit', onSelect: async () => {
          const next = await askGroup(edit.sheet, t('Rename Group'), t('Rename'), name)
          if (next) {
            edit.change((sheet) => sheet.renameGroup(name, next))
            edit.arrange((a) => renameGroupKey(a, name, next))
          }
        },
      },
      // Its styles stay, in no group.
      {
        label: t('Delete'), icon: 'trash', danger: true, onSelect: () => {
          edit.change((sheet) => sheet.renameGroup(name, null))
          edit.arrange((a) => renameGroupKey(a, name, null))
        },
      },
    ],
  })
  const newGroup = async () => {
    const name = await askGroup(edit.sheet, t('New Group'), t('Create Group'))
    if (name) edit.change((sheet) => sheet.addGroup(name))
  }
  return (
    <>
      {searchField(t('Search Styles'))}
      {terms.length ? matches(ids.flatMap(itemsOf), (entry) => entry.group) : (
        <Group plain action={actions(null, () => void newGroup())}>
          {tree(ids.map((id) => {
            const items = itemsOf(id)
            const mine = groups.find((each) => each.id === id)
            // A group made or renamed and not saved yet is marked like a style.
            return { id: `item:${id}`, kind: 'item' as const, label: groupLabel(edit.sheet, id) ?? id, to: stylePath(id), locked: !mine && id !== UNGROUPED, detail: items.length, changed: items.some((entry) => entry.changed) || (!!mine && !edit.saved.groups().includes(mine.name)), menu: mine ? groupMenu(mine.name) : [] }
          }), (next) => edit.arrange((a) => ({ ...a, order: next.map((node) => arrangedAs(node.id.slice(5))) })), 0)}
        </Group>
      )}
    </>
  )
}
