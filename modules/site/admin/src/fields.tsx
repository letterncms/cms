import { t, type FieldProps } from '@letterncms/sdk'
import { Icon, cn, fieldControlId } from '@letterncms/ui'
import { useState } from 'react'

/** `site-file` — a font file, dropped or chosen. */
export function FileField({ field, onChange, disabled }: FieldProps<File | null>) {
  const [over, setOver] = useState(false)
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const file = e.dataTransfer.files?.[0]; if (file && !disabled) onChange(file) }}
      className={cn('flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text', over ? 'border-focus bg-hover' : 'border-border-strong')}
    >
      <Icon name="upload" size={14} />
      {(field.placeholder as string | undefined) ?? t('Choose a File')}
      <input id={fieldControlId(field)} type="file" accept={field.accept as string | undefined} disabled={disabled} className="hidden" onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0]); e.target.value = '' }} />
    </label>
  )
}


