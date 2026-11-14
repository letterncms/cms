import { t, type FieldDef } from '@letterncms/sdk'
import { Button, Fields, Icon, IconButton, Menu, Tooltip, cn, copyText, type MenuItemDef } from '@letterncms/ui'
import type { Stylesheet } from '@letterncms/blocks'
import type { ReactNode } from 'react'

/* What every section of the Styling page is drawn with: a group of rows on hairlines, a row for a value of
   the theme, a row for a setting, and a row that opens. One column, one control width, one row height. */

/** The stylesheet being edited, and the way to change it: every section reads and writes the same draft. */
export interface Editing {
  sheet: Stylesheet
  change: (edit: (sheet: Stylesheet) => Stylesheet) => void
  /** Without `settings.manage` the page is read: nothing is added, changed or removed. */
  readOnly: boolean
  /** Whether the stylesheet has dark values, and which side the preview shows. */
  dark: boolean
  mode: 'light' | 'dark'
}

/** A row's ⋯: the kit's reveal, there on touch and on hover or focus where a pointer hovers. */
export const rowAction = 'cms-reveal shrink-0'

/** The place a row's ⋯ takes, kept where a row has none, so every row's control ends at the same line. */
export const NoAction = () => <span className="size-6 shrink-0" />

/**
 * A list of rows on hairlines, no card. A group that is its whole section has no title (the bar already
 * says it): the way to add is then a named button under the list.
 */
export function Group({ title, onAdd, addLabel, action, children }: { title?: string; onAdd?: () => void; addLabel?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6">
      {title && (
        <div className="flex h-9 items-center justify-between border-b border-border">
          <h3 className="m-0 text-xs font-semibold text-ink">{title}</h3>
          {action}
          {onAdd && addLabel && (
            <Tooltip content={addLabel}>
              <IconButton icon="plus" label={addLabel} title={undefined} size="xs" onClick={onAdd} />
            </Tooltip>
          )}
        </div>
      )}
      {children}
      {/* Without a title there is no head to hold a lone +: the way to add is a named button under the list. */}
      {!title && (action || (onAdd && addLabel)) && (
        <div className="flex h-9 items-center border-t border-border">
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
 * beside the control; `wide` gives the controls the row (colours, with a column for each side).
 */
export function TokenRow({ name, sample, after, below, wide, menu, children }: { name: string; sample?: ReactNode; after?: ReactNode; below?: ReactNode; wide?: boolean; menu?: MenuItemDef[]; children: ReactNode }) {
  const copy = () => void copyText(name, { copied: t('Copied {reference}', { reference: name }) })
  return (
    <div className="cms-reveal-row group border-b border-border last:border-b-0">
      {/* A phone gives a colour its name on one line and its two values, whole, on the next. */}
      <div className={cn('flex min-h-9 items-center gap-2 py-1', wide && 'max-sm:flex-wrap')}>
        {sample !== undefined && <span className="grid w-7 shrink-0 place-items-center">{sample}</span>}
        <Tooltip content={t('Copy Name')}>
          <Button variant="ghost" size="xs" onClick={copy} aria-label={t('Copy {reference}', { reference: name })} className={cn('!justify-start !bg-transparent !px-0 text-left font-mono !font-normal hover:text-ink', wide ? 'min-w-0 flex-1 shrink max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]' : sample !== undefined ? 'w-[84px] max-sm:w-16' : 'w-[120px] max-sm:w-20')}>
            <span className="truncate">{name}</span>
          </Button>
        </Tooltip>
        {/* On a phone the value takes the row; what stands beside it waits for a wider screen. */}
        {wide ? children : <div className="flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1">{children}</div>}
        {!wide && <span className="flex min-w-0 flex-1 items-center max-sm:hidden">{after}</span>}
        {menu && menu.length > 0 ? <Menu trigger={<IconButton icon="more" label={t('Actions')} size="xs" className={cn(rowAction, wide && 'max-sm:order-2')} />} items={menu} /> : <span className={cn('size-6 shrink-0', wide && 'max-sm:order-2')} />}
      </div>
      {below}
    </div>
  )
}

/** A row of a setting that has a label of its own instead of a name, in a value row's columns. */
export function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0">
      <span className="w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20">{label}</span>
      <div className="flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1">{children}</div>
      <span className="min-w-0 flex-1 max-sm:hidden" />
      <NoAction />
    </div>
  )
}

/** A row that opens to show its controls. */
export function Disclosure({ open, onToggle, label, aside, menu, children }: { open: boolean; onToggle: () => void; label: ReactNode; aside?: ReactNode; menu?: ReactNode; children: ReactNode }) {
  return (
    <div className="cms-reveal-row group border-b border-border last:border-b-0">
      <div className="flex min-h-10 items-center gap-2">
        <Button variant="ghost" aria-expanded={open} onClick={onToggle} className="!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink">
          <Icon name="chevron-right" size={12} className={cn('shrink-0 text-faint transition-transform duration-fast', open && 'rotate-90')} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {aside}
        </Button>
        {menu}
      </div>
      {open && <div className="pb-3 pl-[18px]">{children}</div>}
    </div>
  )
}

/** A row that leads to its own editor, which takes the list's place: a class, an element. */
export function OpenRow({ onOpen, label, sample, summary, menu }: { onOpen: () => void; label: ReactNode; sample?: ReactNode; summary?: string; menu?: ReactNode }) {
  return (
    <div className="cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0">
      <Button variant="ghost" onClick={onOpen} className="!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-2 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink">
        {sample}
        <span className="shrink-0 text-ink">{label}</span>
        <span className="min-w-0 flex-1 truncate text-muted">{summary}</span>
        <Icon name="chevron-right" size={12} className="shrink-0 text-faint" />
      </Button>
      {menu ?? <NoAction />}
    </div>
  )
}

/** A length of the theme in CSS pixels (rem and em at 16px; a clamp() at its largest), for bars and samples. */
export function px(value: string | undefined): number {
  const text = String(value ?? '').trim()
  const clamp = /^clamp\((.*)\)$/.exec(text)
  const last = clamp ? clamp[1].split(',').pop()!.trim() : text
  const n = parseFloat(last)
  if (Number.isNaN(n)) return 0
  return /r?em$/.test(last) ? n * 16 : n
}
