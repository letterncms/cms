import { t, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Icon, IconButton, Popover, cn } from '@letterncms/ui'
import { useState } from 'react'
import type { DataPath } from './scope'
import { inputClass } from '../controls'
import { Control } from '../fields/controls'

/**
 * `blocks-bind` — pick or type what a value comes from: a path (entry.title, item.url|upper)
 * or a text with {placeholders} ("Posted {entry.date|date:M j}"). `paths` lists the data in scope.
 */
export function BindField({ field, value: raw, onChange, disabled }: FieldProps<string | null>) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const value = raw ?? undefined
  const paths = (field.paths as DataPath[] | undefined) ?? []
  const groups = [...new Set(paths.map((p) => p.group))]
  const label = paths.find((p) => p.path === value)?.label

  return (
    <Control>
      <div className="relative flex min-w-0 flex-1 items-center">
        <Icon name="database" size={13} className="pointer-events-none absolute left-2 text-ink" />
        <input
          id={fieldControlId(field)}
          value={draft ?? value ?? ''}
          placeholder={field.placeholder ?? 'entry.title'}
          disabled={disabled}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft !== null) onChange(draft.trim() || null)
            setDraft(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          title={label}
          aria-label={field.label}
          className={cn(inputClass, '!pl-7 font-mono text-ink placeholder:font-sans')}
        />
      </div>
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        className="w-64 !p-1"
        trigger={
          <IconButton icon="chevron-down" size="xs" label={t('Choose Data')} />
        }
      >
        <div className="max-h-80 overflow-y-auto">
          {groups.map((g) => (
            <div key={g} className="py-1">
              <p className="cms-label m-0 px-2 pb-1">{g}</p>
              {paths.filter((p) => p.group === g).map((p) => (
                <Button
                  key={p.path}
                  variant="ghost"
                  data-active={value === p.path || undefined}
                  onClick={() => {
                    onChange(p.path)
                    setOpen(false)
                  }}
                  className="w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal"
                >
                  <span className="min-w-0 flex-1 truncate">{p.label}</span>
                  <span className="max-w-[50%] shrink-0 truncate font-mono text-2xs text-faint">{p.path}</span>
                  {value === p.path && <Icon name="check" size={11} className="shrink-0" />}
                </Button>
              ))}
            </div>
          ))}
        </div>
        <p className="m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint" title={t('Filters, and text mixed with data')}>
          |date:M j, Y · |excerpt:120 · |upper · |default:Text · By {'{entry.author}'}
        </p>
      </Popover>
    </Control>
  )
}
