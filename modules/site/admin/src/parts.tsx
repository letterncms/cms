import { t, type FieldDef } from '@letterncms/sdk'
import { Button, Fields, Icon, IconButton, Menu, Pressable, Section, SettingsPanel, Tooltip, cn, copyText, type MenuItemDef } from '@letterncms/ui'
import type { Stylesheet } from '@letterncms/blocks'
import type { ReactNode } from 'react'

/* What every section of the design is drawn with: a group of rows in a card, a row for a value of the theme, a
   row for a setting, and a row that opens, drawn as a page of settings draws its groups. One column, one control
   width, one row height. What the site was given carries a lock, what is changed and not yet saved a mark, and every row's ⋯
   takes a change back. */

/** The stylesheet being edited, and the way to change it: every section reads and writes the same draft. */
export interface Editing {
  sheet: Stylesheet
  /** The stylesheet as the site has it: what every change is made on, and what Revert returns to. */
  saved: Stylesheet
  change: (edit: (sheet: Stylesheet) => Stylesheet) => void
  /** Without `settings.manage` the page is read: nothing is added, changed or removed. */
  readOnly: boolean
  /** Every value the theme has before the site names its own: Tailwind's, then the CMS's, by variable. */
  defaults: Map<string, string>
  /** The colours of Tailwind's palette, by variable. */
  palette: Set<string>
  /** The @keyframes animations can run, Tailwind's and the site's, by name. */
  keyframes: Record<string, string>
  /** Which side of light-dark() the preview shows. */
  mode: 'light' | 'dark'
}

/** A variable and those that belong to it (a text size's line height, `--text-xl--line-height`). */
const family = (sheet: Stylesheet, name: string) => sheet.variables().filter((other) => other.name === name || other.name.startsWith(`${name}--`)).map((other) => other.name)

/** Whether the draft has a variable (and what belongs to it) otherwise than the site has it. */
export function changed(edit: Editing, ...names: string[]): boolean {
  return names.some((name) => [...new Set([...family(edit.sheet, name), ...family(edit.saved, name)])].some((each) => (edit.sheet.variable(each) ?? null) !== (edit.saved.variable(each) ?? null)))
}

/** The variables back as the site has them, what belongs to them included. */
export function revert(edit: Editing, ...names: string[]) {
  edit.change((sheet) => names.flatMap((name) => [...new Set([...family(sheet, name), ...family(edit.saved, name)])]).reduce((next, each) => next.setVariable(each, edit.saved.variable(each) ?? null), sheet))
}

/**
 * What every row's ⋯ offers, in this order: copying the name classes are written with, taking a change back to
 * what the site has (there on every row, open only while there is one), then what the row's own does (Rename,
 * Delete). Read only, it copies and nothing else.
 */
export function rowMenu(edit: Editing, { copy, revert, extra = [], own = [] }: { copy?: string; revert?: (() => void) | null; extra?: MenuItemDef[]; own?: MenuItemDef[] }): MenuItemDef[] {
  const parts: MenuItemDef[][] = [
    [
      ...(copy ? [{ label: t('Copy Name'), icon: 'copy', onSelect: () => void copyText(copy, { copied: t('Copied {reference}', { reference: copy }) }) }] : []),
      ...(!edit.readOnly && revert !== undefined ? [{ label: t('Revert'), icon: 'undo', disabled: !revert, onSelect: () => revert?.() }] : []),
    ],
    edit.readOnly ? [] : extra,
    edit.readOnly ? [] : own,
  ].filter((part) => part.length > 0)
  return parts.flatMap((part, i) => (i === 0 ? part : [{ separator: true, label: '' }, ...part]))
}

/** A row's ⋯: the kit's reveal, there on touch and on hover or focus where a pointer hovers. */
export const RowMenu = ({ items }: { items: MenuItemDef[] }) => (items.length > 0 ? <Menu trigger={<IconButton icon="more" label={t('Actions')} size="xs" className="cms-reveal shrink-0" />} items={items} /> : <NoAction />)

/** A row of a list in its panel: a line under it but the last, its controls in one line, as a setting's row. Only a row that opens is lit under the pointer. */
const ROW = 'cms-reveal-row'

/** The place a row's ⋯ takes, kept where a row has none, so every row's control ends at the same line. */
export const NoAction = () => <span className="size-6 shrink-0" />

/** The mark of a change not yet saved, before a row's name. */
export const Changed = ({ on }: { on: boolean }) => (on ? <span role="img" aria-label={t('Unsaved changes')} className="size-1.5 shrink-0 rounded-full bg-focus" /> : null)

/** What the site was given and can change but not rename or delete: a lock after its name. */
export const Locked = ({ on, label }: { on: boolean; label?: string }) => (on ? (
  <Tooltip content={label ?? t('Built In')}>
    {/* Its hint shows under the pointer even inside a row that opens. */}
    <span role="img" aria-label={label ?? t('Built In')} className="pointer-events-auto relative grid shrink-0 place-items-center text-faint"><Icon name="lock" size={12} /></span>
  </Tooltip>
) : null)

/** A row's name, with what marks it: built in, changed and not saved. */
const Name = ({ children, locked, changed: unsaved, className }: { children: ReactNode; locked?: boolean; changed?: boolean; className?: string }) => (
  <span className={cn('flex min-w-0 items-center gap-1.5 text-sm text-text', className)}>
    <span className="truncate">{children}</span>
    <Locked on={!!locked} />
    <Changed on={!!unsaved} />
  </span>
)

/**
 * A list of rows under its title, as a page of settings draws its groups: the title over a panel with a line
 * between its rows, what adds one beside the title. `plain` content (a grid of tiles) has no panel. A group that
 * is its whole section has no title (the bar already says it): the way to add is then a named button under it.
 */
export function Group({ title, onAdd, addLabel, action, plain, children }: { title?: string; onAdd?: () => void; addLabel?: string; action?: ReactNode; plain?: boolean; children: ReactNode }) {
  const add = onAdd && addLabel && (
    <Tooltip content={addLabel}>
      <IconButton icon="plus" label={addLabel} title={undefined} size="xs" onClick={onAdd} />
    </Tooltip>
  )
  return (
    <Section
      className="mb-7"
      title={title}
      // Over the panel's rows: what stands over their columns ends where their controls do.
      actions={title && (action || add) ? <span className="flex items-center gap-2 pr-4 sm:pr-5">{action}{add}</span> : undefined}
    >
      {plain ? children : <SettingsPanel className="overflow-hidden">{children}</SettingsPanel>}
      {/* Without a title there is no head to hold a lone +: the way to add is a named button under the list. */}
      {!title && (action || add) && (
        <div className="flex h-9 items-center">
          {action ?? <Button variant="ghost" size="xs" icon="plus" onClick={onAdd} className="-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink">{addLabel}</Button>}
        </div>
      )}
    </Section>
  )
}

/** One control of a row, drawn by Fields like every control of the admin: the same height in every group. */
export function Control({ handle, label, value, onChange, field, disabled, className }: { handle: string; label: string; value: unknown; onChange: (value: string | null) => void; field?: Partial<FieldDef>; disabled?: boolean; className?: string }) {
  return (
    <Fields
      bare
      className={cn('flex min-w-0 flex-1', className)}
      disabled={disabled}
      fields={[{ handle, type: 'text', label, size: 'sm', mono: true, ...field } as FieldDef]}
      values={{ [handle]: value ?? null }}
      onChange={(_, next) => onChange(next === null || next === undefined || next === '' ? null : String(next))}
    />
  )
}

/**
 * One value of the theme: an optional sample, its name, its control, the same width in every group, and its ⋯.
 * `below` adds a specimen line, `after` something beside the control; `wide` puts the controls at the row's end,
 * after the name (a colour's two swatches). `locked` marks a value the site was given, `changed` one not saved yet.
 */
export function TokenRow({ name, sample, after, below, wide, locked, changed: unsaved, menu, children }: { name: string; sample?: ReactNode; after?: ReactNode; below?: ReactNode; wide?: boolean; locked?: boolean; changed?: boolean; menu: MenuItemDef[]; children: ReactNode }) {
  return (
    <div className={ROW}>
      <div className="flex min-h-12 items-center gap-2 py-2">
        {sample !== undefined && <span className="grid w-7 shrink-0 place-items-center">{sample}</span>}
        <Name locked={locked} changed={unsaved} className={wide ? 'flex-1' : sample !== undefined ? 'w-[84px] shrink-0 max-sm:w-20' : 'w-[120px] shrink-0 max-sm:w-20'}>{name}</Name>
        {/* On a phone the value takes the row; what stands beside it waits for a wider screen. */}
        {wide ? children : <div className="flex w-56 min-w-0 shrink gap-1 max-lg:w-48 max-sm:w-auto max-sm:flex-1">{children}</div>}
        {!wide && <span className="flex min-w-0 flex-1 items-center max-sm:hidden">{after}</span>}
        <RowMenu items={menu} />
      </div>
      {below}
    </div>
  )
}

/** A row of a setting that has a label of its own instead of a name, in a value row's columns. */
export function Setting({ label, changed: unsaved, menu, children }: { label: string; changed?: boolean; menu: MenuItemDef[]; children: ReactNode }) {
  return (
    <div className={cn(ROW, 'flex min-h-12 items-center gap-2 py-2')}>
      <Name changed={unsaved} className="w-[120px] shrink-0 max-sm:w-20">{label}</Name>
      <div className="flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1">{children}</div>
      <span className="min-w-0 flex-1 max-sm:hidden" />
      <RowMenu items={menu} />
    </div>
  )
}

/**
 * A row that leads to its own place, which takes the list's place: a group of styles, a style. Its name, what it
 * looks like or holds, and the way in; lit under the pointer, as it opens. Its ⋯ (what the site's own can be done
 * with) stands before the way in.
 */
export function OpenRow({ onOpen, label, sample, detail, locked, changed: unsaved, menu = [] }: { onOpen: () => void; label: string; sample?: ReactNode; detail?: ReactNode; locked?: boolean; changed?: boolean; menu?: MenuItemDef[] }) {
  return (
    // Lit to the panel's edges, as the row opens.
    <div className="cms-reveal-row relative -mx-4 flex min-h-12 items-center gap-2 px-4 py-2 transition-colors duration-base hover:bg-hover sm:-mx-5 sm:px-5">
      <Pressable inset onClick={onOpen} aria-label={label} className="absolute inset-0" />
      <Name locked={locked} changed={unsaved} className={cn('pointer-events-none', sample ? 'w-28 shrink-0 max-sm:w-20' : 'flex-1')}>{label}</Name>
      {sample && <span className="pointer-events-none flex min-w-0 flex-1">{sample}</span>}
      {detail !== undefined && <span className="pointer-events-none shrink-0 text-xs tabular-nums text-muted">{detail}</span>}
      <span className="relative flex"><RowMenu items={menu} /></span>
      <Icon name="chevron-right" size={14} className="pointer-events-none shrink-0 text-faint" />
    </div>
  )
}
