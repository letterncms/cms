import { t, type FieldProps } from '@letterncms/sdk'
import { useEffect, useRef, useState } from 'react'
import { Button, fieldControlId, Icon, Textarea } from '@letterncms/ui'
import { slugify } from '@letterncms/ui'

/**
 * A document's title, set large above its body. `onEnter` (a function on the
 * field definition) runs when Enter is pressed — titles are one line — and
 * `onDown` when ↓ leaves its last line.
 */
export function TitleField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const onEnter = field.onEnter as (() => void) | undefined
  const onDown = field.onDown as (() => void) | undefined
  return (
    <Textarea
      appearance="plain"
      id={fieldControlId(field)}
      aria-describedby={field.describedBy as string | undefined}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        const el = e.currentTarget
        if (e.key === 'Enter') {
          e.preventDefault()
          onEnter?.()
        } else if (e.key === 'ArrowDown' && onDown && !e.shiftKey && el.selectionStart === el.value.length) {
          e.preventDefault()
          onDown()
        }
      }}
      placeholder={(field.placeholder as string) ?? ''}
      autoFocus={field.autofocus === true}
      rows={1}
      disabled={disabled}
      aria-label={field.label}
      invalid={!!error}
      className="text-display font-semibold text-ink placeholder:text-faint/60"
    />
  )
}

/** An entry's URL with its slug editable in place. The URL to show is the field's `uri` option; the value is the slug. */
export function UriField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const uri = String(field.uri ?? '')
  const slug = value ?? ''
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(slug)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => setDraft(slug), [slug])

  return (
    <div className="flex h-6 w-full min-w-0 items-center gap-1.5 text-sm text-faint">
      <Icon name="link" size={13} className="shrink-0" />
      {editing ? (
        <input
          ref={input}
          autoFocus
          id={fieldControlId(field)}
          aria-describedby={field.describedBy as string | undefined}
          aria-label={field.label}
          value={draft}
          onChange={(e) => setDraft(slugify(e.target.value, true))}
          onBlur={() => {
            setEditing(false)
            const s = slugify(draft)
            if (s && s !== slug) onChange(s)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') input.current?.blur()
            if (e.key === 'Escape') {
              setDraft(slug)
              setEditing(false)
            }
          }}
          className="h-6 w-72 min-w-0 max-w-full rounded-xs border border-focus bg-bg px-1.5 font-mono text-xs text-text outline-none"
        />
      ) : (
        <Button variant="ghost" size="xs" id={fieldControlId(field)} aria-describedby={field.describedBy as string | undefined} disabled={disabled || uri === '/'} onClick={() => setEditing(true)} aria-label={uri === '/' ? undefined : t('Edit URL')} className="min-w-0 max-w-full shrink !justify-start !px-1 text-left font-mono !font-normal !text-inherit hover:!text-text disabled:!opacity-100 disabled:hover:!bg-transparent" title={uri}>
          <span className="truncate">{uri}</span>
        </Button>
      )}
    </div>
  )
}
