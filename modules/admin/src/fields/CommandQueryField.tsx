import type { FieldProps } from '@letterncms/sdk'
import { Command } from 'cmdk'

/** The command palette's query: cmdk's own input, so its list filters and keyboard navigation keep working. */
export function CommandQueryField({ field, value, onChange }: FieldProps<string | null>) {
  return <Command.Input autoFocus={field.autofocus === true} value={value ?? ''} onValueChange={onChange} placeholder={(field.placeholder as string) ?? ''} aria-label={field.label} className="h-12 w-full bg-transparent text-base outline-none placeholder:text-faint" />
}
