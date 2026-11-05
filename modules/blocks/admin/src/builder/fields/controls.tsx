import { registry, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { cn } from '@letterncms/ui'
import type { ReactNode } from 'react'

/* Helpers for the inspector's composite fields. Values of the design vocabulary are
   `blocks-token` and `blocks-color`; selects, segmented controls and toggles are core types
   (size: 'sm'); a row's status and reset live on its inline label. */

/** Conditional sub-fields (`if`), as in Fields. */
export function shown(field: FieldDef, values: Record<string, any>): boolean {
  const rule = field.if as Record<string, unknown> | undefined
  return !rule || Object.entries(rule).every(([h, expected]) => (Array.isArray(expected) ? expected.includes(values[h]) : values[h] === expected))
}

/** One field definition drawn with its registered component — for composite fields. */
export function SubField({ field, ...props }: Omit<FieldProps, 'context'> & { context?: FieldProps['context'] }) {
  const Component = registry.fields.get(field.component ?? field.type) ?? registry.fields.get('json')
  if (!Component) return null
  return (
    <div className={cn('min-w-0 flex-1', field.className as string | undefined)}>
      <Component field={field} {...props} context={props.context ?? {}} />
    </div>
  )
}

/** A field's control area: a row that takes the space it is given. */
export function Control({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('relative flex min-w-0 flex-1 items-center gap-1', className)}>{children}</div>
}

export { RowLabel } from '../controls'
