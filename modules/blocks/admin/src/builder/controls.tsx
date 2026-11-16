import { registry, t, useManifestIfLoaded, type FieldContext, type FieldDef } from '@letterncms/sdk'
import { Button, Icon, IconButton, Tooltip, cn, fieldControlId, fieldVisible, wideFieldTypes, type ButtonProps } from '@letterncms/ui'
import { forwardRef, useState, useSyncExternalStore, type ReactNode } from 'react'

/* The inspector's frame, shared by every tab: sections with a title row, then rows of a
   label column and a control. One gutter (16px), one row (28px controls, 4px apart), one
   label column (88px), so every panel lines up with the next. */

/** The label column every row shares. */
export const labelColumn = 'w-[88px]'

const COLLAPSED = 'cms.inspector.collapsed'

function collapsed(): Record<string, boolean> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(COLLAPSED) ?? '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === 'boolean')) : {}
  } catch {
    return {}
  }
}

/**
 * A titled group of rows. Every title works the same way: it folds and unfolds the
 * section (a folded one shows its caret), and `actions` sit at the right. Whether it
 * is open is remembered per title (unless `remember` is false: it starts as `open` every
 * time); `open` is the default. A section with something set (`empty` false) carries a dot
 * beside its title, as a row's label carries its mark. An empty section with an add action
 * has nothing to unfold: it is its title and the way to add, and adding opens it. One with
 * `fields` of its own to fill shows them.
 */
export function Section({ title, children, open: initial = true, actions, empty, fields, remember = true }: { title: string; children: ReactNode; open?: boolean; actions?: ReactNode; empty?: boolean; fields?: boolean; remember?: boolean }) {
  const [open, setOpenState] = useState(() => (!remember || collapsed()[title] === undefined ? initial : !collapsed()[title]))
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!remember) return
    try {
      localStorage.setItem(COLLAPSED, JSON.stringify({ ...collapsed(), [title]: !next }))
    } catch {
      // Private mode: remember for this session only.
    }
  }
  const bare = !!(empty && actions && !fields)
  const mark = empty === false && <span className="size-1.5 shrink-0 rounded-full bg-focus" aria-hidden />
  return (
    <section data-section={title} className="min-w-0 border-b border-border last:border-b-0">
      <header className="group/section flex h-10 items-center gap-1 pl-4 pr-3">
        {bare ? (
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{title}</span>
        ) : (
          <Button variant="ghost" onClick={() => setOpen(!open)} aria-expanded={open} className="!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold !text-ink focus-visible:!-outline-offset-2">
            <span className="min-w-0 truncate">{title}</span>
            {mark}
            {/* Open sections show their caret on hover; a folded one keeps it, so it reads as one. */}
            <Icon name="chevron-down" size={10} className={cn('shrink-0 text-faint transition-[rotate,opacity] duration-fast', open ? 'opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100' : '-rotate-90')} />
          </Button>
        )}
        {/* Adding something shows it: the section opens. */}
        {actions && <span className="contents" onClickCapture={() => !open && setOpen(true)}>{actions}</span>}
      </header>
      {open && !bare && <div className="space-y-1 px-4 pb-3">{children}</div>}
    </section>
  )
}

/** A panel's content that isn't a section (a tab's own fields at the top): the same gutter and rhythm. */
export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-section="content" className={cn('space-y-1 border-b border-border px-4 py-3 last:border-b-0', className)}>{children}</div>
}

/** A small heading inside a section, with an add button. */
export function SubHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex h-7 items-center justify-between pt-1">
      <span className="text-xs text-muted">{title}</span>
      {action}
    </div>
  )
}

/**
 * The label of a row. A value set here wears the accent behind its label (click it to reset); one
 * that comes from a larger screen, another state or the component wears a quiet grey. Nothing else
 * changes color: the panel stays one quiet column, and a section with either carries a dot.
 */
export function RowLabel({ field, children, htmlFor, className }: { field: FieldDef; children?: ReactNode; htmlFor?: string; className?: string }) {
  const status = field.status as 'own' | 'inherited' | undefined
  const reset = field.reset as (() => void) | undefined
  const label = children ?? field.label
  const base = cn('flex min-h-7 min-w-0 shrink-0 items-center text-left text-xs', labelColumn, status ? 'text-ink' : 'text-muted', className)
  // A name longer than the column wraps in it: every row keeps its label beside its control.
  const text = <span className={cn('min-w-0 py-0.5 leading-[1.25] [overflow-wrap:anywhere]', status && '-ml-1 rounded-xs px-1 box-decoration-clone', status === 'own' ? 'bg-focus-soft' : status === 'inherited' && 'bg-active')}>{label}</span>
  if (status === 'own' && reset) {
    return (
      <Tooltip content={t('Reset {label}', { label: String(field.label ?? '') })}>
        <Button variant="ghost" onClick={reset} className={cn(base, '!h-auto !justify-start !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink')}>{text}</Button>
      </Tooltip>
    )
  }
  if (status === 'inherited') {
    return (
      <Tooltip content={t('Inherited from a larger screen, another state or the component')}>
        <label htmlFor={htmlFor} className={base}>{text}</label>
      </Tooltip>
    )
  }
  return <label htmlFor={htmlFor} className={base} title={field.instructions as string | undefined}>{text}</label>
}

/**
 * Whether a field's label goes above its control rather than beside it: controls that
 * need the panel's width (or say so: `stack`), and choices with words (icon groups and two
 * short words stay beside their label). One rule for every tab.
 */
export function stacks(field: FieldDef): boolean {
  if (field.stack === true || (wideFieldTypes.includes(field.type) && !field.component)) return true
  if (field.type !== 'select' || field.component || field.display !== 'segmented') return false
  const options = Object.values(field.options ?? {})
  const words = options.map((o) => (typeof o === 'string' ? o : o && typeof o === 'object' && 'label' in o ? String(o.label ?? '') : '')).filter(Boolean)
  return words.length > 3 || words.join(' ').length > 20
}

/** Every control in the inspector has one height. */
const panelSize = (size: FieldDef['size']): FieldDef['size'] => (size === 'xs' || size === undefined ? 'sm' : size)

/**
 * Rows of the inspector: the label column and the control, drawn the same way in every
 * tab. Like `<Fields layout="inline">`, plus the inspector's own label and control height.
 * `bare` draws the controls alone (a row a field lays out itself).
 */
export function PanelFields({ fields, values, onChange, disabled, context = {}, className, bare }: { fields: FieldDef[]; values: Record<string, any>; onChange: (handle: string, value: any) => void; disabled?: boolean; context?: FieldContext; className?: string; bare?: boolean }) {
  useSyncExternalStore(registry.fields.subscribe, registry.fields.version)
  const manifest = useManifestIfLoaded()
  return (
    <div className={cn('min-w-0', className ?? 'space-y-1')}>
      {fields.filter((field) => fieldVisible(field, values)).map((field) => {
        const type = manifest?.fieldTypes.find((ft) => ft.key === field.type)
        const Component = registry.fields.get(field.component ?? type?.component ?? field.type) ?? registry.fields.get('json')
        if (!Component) return null
        // Choices stay on one line, shrinking to the panel (`fit`).
        const def = { ...field, size: panelSize(field.size), fit: true, id: fieldControlId(field, context.path) } as FieldDef
        const stacked = !bare && stacks(field)
        const control = <Component field={def} value={values[field.handle] ?? field.default ?? null} onChange={(v: unknown) => onChange(field.handle, v)} disabled={disabled} context={{ ...context, values }} />
        return (
          <div data-field={field.handle} key={field.handle} className={cn('flex min-w-0', stacked ? 'flex-col items-stretch' : 'min-h-7 items-center gap-2', field.className as string | undefined)}>
            {!bare && field.type !== 'toggle' && <RowLabel field={def} htmlFor={def.id as string} className={stacked ? '!w-auto' : undefined} />}
            <div className={cn('flex min-w-0 items-center', !stacked && 'flex-1')}>{control}</div>
          </div>
        )
      })}
    </div>
  )
}

/** The look of an inspector input, for the controls blocks fields draw themselves. */
export const inputClass = 'cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost'

export function display(v: unknown): string {
  if (Array.isArray(v)) return String(v[0])
  if (v && typeof v === 'object' && 'min' in (v as any)) return `${(v as any).min}–${(v as any).max}`
  return String(v)
}

/** A color chip on a checkerboard (so transparency shows). `dark` shows the dark-mode value in its corner. */
export function Swatch({ color, dark, className }: { color: string; dark?: string | null; className?: string }) {
  return (
    <span className={cn('relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]', className)}>
      <span className="absolute inset-0" style={{ background: color }} />
      {dark && <span className="absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]" style={{ background: dark }} />}
      <span className="cms-swatch-edge" />
    </span>
  )
}

/** A quiet line that adds something under a list ("+ Add Step"): the kit's ghost button at a row's size. Takes a menu's trigger props. */
export const AddRow = forwardRef<HTMLButtonElement, ButtonProps>(function AddRow({ className, children, ...props }, ref) {
  return <Button ref={ref} variant="ghost" icon="plus" className={cn('w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink', className)} {...props}>{children}</Button>
})

export function AddButton({ onClick, label = t('Add') }: { onClick: () => void; label?: string }) {
  return (
    <Tooltip content={label}>
      <IconButton icon="plus" label={label} title={undefined} size="xs" onClick={onClick} />
    </Tooltip>
  )
}

export function RemoveButton({ onClick, label = t('Remove') }: { onClick: () => void; label?: string }) {
  return (
    <Tooltip content={label}>
      <IconButton icon="minus" label={label} title={undefined} size="xs" onClick={onClick} className="!text-faint hover:!text-danger" />
    </Tooltip>
  )
}
