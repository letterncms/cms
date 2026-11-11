import type { FieldProps } from '@letterncms/sdk'
import { cn } from '@letterncms/ui'

/** A menu item's label, edited in place in its row. `display: fallback` shows the placeholder as the label it falls back to. */
export function LabelField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  return (
    <input
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      aria-label={field.label}
      autoFocus={field.autofocus === true}
      // Its focus shows as the fill a row has under the pointer: a ring would draw a field inside the row.
      className={cn('-mx-1 h-7 w-[calc(100%+0.5rem)] min-w-0 rounded-xs bg-transparent px-1 text-sm font-medium text-text outline-none focus-visible:bg-hover', field.display === 'fallback' ? 'placeholder:text-text' : 'placeholder:font-normal placeholder:text-faint')}
    />
  )
}
