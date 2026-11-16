import { t, type FieldDef } from '@letterncms/sdk'
import { Button, Fields, Icon, IconButton, Menu, Tooltip, cn, copyText, type MenuItemDef } from '@letterncms/ui'
import type { Stylesheet } from '@letterncms/blocks'
import type { ReactNode } from 'react'

/* What every section of the Styling page is drawn with: a group of rows in a card, a row for a value of the
   theme, a row for a setting, and a row that opens. One column, one control width, one row height. What is
   changed and not yet saved carries a mark, and its menu takes it back to what the site has. */

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

/** The menu item that takes a change back, for a row that has one. */
export const revertItem = (onSelect: () => void): MenuItemDef => ({ label: t('Revert'), icon: 'undo', onSelect })

/** A row's ⋯: the kit's reveal, there on touch and on hover or focus where a pointer hovers. */
export const rowAction = 'cms-reveal shrink-0'

/** A row of a list in its card: a line under it but the last, a soft fill under the one pointed at, its controls in one line. */
export const ROW = 'cms-reveal-row px-3 transition-colors duration-base hover:bg-hover'

/** The place a row's ⋯ takes, kept where a row has none, so every row's control ends at the same line. */
export const NoAction = () => <span className="size-6 shrink-0" />

/** The mark of a change not yet saved, before a row's name. */
export const Changed = ({ on }: { on: boolean }) => (on ? <span role="img" aria-label={t('Unsaved changes')} className="size-1.5 shrink-0 rounded-full bg-focus" /> : null)

/**
 * A list of rows under its title, in a card of their own with a line between them; `plain` content (a grid of
 * tiles) without the card. A group that is its whole section has no title (the bar already says it): the way
 * to add is then a named button under the list.
 */
export function Group({ title, onAdd, addLabel, action, plain, children }: { title?: string; onAdd?: () => void; addLabel?: string; action?: ReactNode; plain?: boolean; children: ReactNode }) {
  return (
    <section className="mb-7">
      {title && (
        <div className="flex h-9 items-center gap-2 pl-0.5 pr-3">
          <h3 className="cms-label m-0 min-w-0 flex-1 truncate">{title}</h3>
          {action}
          {onAdd && addLabel && (
            <Tooltip content={addLabel}>
              <IconButton icon="plus" label={addLabel} title={undefined} size="xs" onClick={onAdd} />
            </Tooltip>
          )}
        </div>
      )}
      {plain ? children : <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg">{children}</div>}
      {/* Without a title there is no head to hold a lone +: the way to add is a named button under the list. */}
      {!title && (action || (onAdd && addLabel)) && (
        <div className="flex h-9 items-center">
          {action ?? <Button variant="ghost" size="xs" icon="plus" onClick={onAdd} className="-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink">{addLabel}</Button>}
        </div>
      )}
    </section>
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
 * One value of the theme: an optional sample, its name (a click copies it, as classes are written with it),
 * its control, the same width in every group, and a menu. `below` adds a specimen line, `after` something
 * beside the control; `wide` puts the controls at the row's end, after the name (a colour's two swatches).
 * `changed` marks a value the site does not have yet.
 */
export function TokenRow({ name, copy: copied = name, sample, after, below, wide, changed: unsaved, menu, children }: { name: string; copy?: string; sample?: ReactNode; after?: ReactNode; below?: ReactNode; wide?: boolean; changed?: boolean; menu?: MenuItemDef[]; children: ReactNode }) {
  const copy = () => void copyText(copied, { copied: t('Copied {reference}', { reference: copied }) })
  return (
    <div className={cn(ROW, 'group')}>
      <div className="flex min-h-10 items-center gap-2 py-1.5">
        {sample !== undefined && <span className="grid w-7 shrink-0 place-items-center">{sample}</span>}
        <span className={cn('flex min-w-0 items-center gap-1.5', wide ? 'flex-1' : sample !== undefined ? 'w-[84px] max-sm:w-16' : 'w-[120px] max-sm:w-20')}>
          <Tooltip content={t('Copy Name')}>
            <Button variant="ghost" size="xs" onClick={copy} aria-label={t('Copy {reference}', { reference: copied })} className="min-w-0 shrink !justify-start !bg-transparent !px-0 text-left !text-sm !font-normal !text-text hover:!text-ink">
              <span className="truncate">{name}</span>
            </Button>
          </Tooltip>
          <Changed on={!!unsaved} />
        </span>
        {/* On a phone the value takes the row; what stands beside it waits for a wider screen. */}
        {wide ? children : <div className="flex w-56 min-w-0 shrink gap-1 max-lg:w-48 max-sm:w-auto max-sm:flex-1">{children}</div>}
        {!wide && <span className="flex min-w-0 flex-1 items-center max-sm:hidden">{after}</span>}
        {menu && menu.length > 0 ? <Menu trigger={<IconButton icon="more" label={t('Actions')} size="xs" className={rowAction} />} items={menu} /> : <NoAction />}
      </div>
      {below}
    </div>
  )
}

/** A row of a setting that has a label of its own instead of a name, in a value row's columns. */
export function Setting({ label, changed: unsaved, action, children }: { label: string; changed?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <div className={cn(ROW, 'flex min-h-10 items-center gap-2 py-1.5')}>
      <span className="flex w-[120px] shrink-0 items-center gap-1.5 text-sm text-text max-sm:w-20"><span className="truncate">{label}</span><Changed on={!!unsaved} /></span>
      <div className="flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1">{children}</div>
      <span className="min-w-0 flex-1 max-sm:hidden" />
      {action ? <span className={rowAction}>{action}</span> : <NoAction />}
    </div>
  )
}

/** A row that leads to its own editor, which takes the list's place: a style, an element. Its name, then what it looks like. */
export function OpenRow({ onOpen, label, sample, changed: unsaved, menu }: { onOpen: () => void; label: string; sample: ReactNode; changed?: boolean; menu?: ReactNode }) {
  return (
    <div className={cn(ROW, 'group flex items-center gap-2 py-1.5')}>
      <Button variant="ghost" onClick={onOpen} className="!h-auto min-h-9 min-w-0 flex-1 shrink !justify-start !gap-3 !rounded-xs !bg-transparent !px-0 text-left !text-sm !font-normal focus-visible:!-outline-offset-2 hover:text-ink">
        <span className="flex w-28 shrink-0 items-center gap-1.5 text-text max-sm:w-20"><span className="truncate">{label}</span><Changed on={!!unsaved} /></span>
        {sample}
        <Icon name="chevron-right" size={14} className="ml-auto shrink-0 text-faint" />
      </Button>
      {menu ?? <NoAction />}
    </div>
  )
}
