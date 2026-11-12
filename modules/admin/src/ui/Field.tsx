import type { ReactNode } from 'react'
import { cn } from './cn'
import { locale, t } from '@letterncms/sdk'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'
import { SettingRow } from './SettingsPanel'

/** Label + control + help/error. Every form row in the admin uses this. */
export function Field({ label, htmlFor, instructions, error, required, children, className, aside, setting }: { label?: ReactNode; htmlFor?: string; instructions?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string; aside?: ReactNode; setting?: 'inline' | 'stacked' | 'end' }) {
  const caption = label && (
    <label htmlFor={htmlFor} className={cn('text-sm font-medium text-text', setting === 'end' && 'cursor-pointer')}>
      {label}
      {required && <span aria-hidden="true" className="ml-0.5 font-normal text-faint">*</span>}
    </label>
  )
  const help = !error && instructions && <p id={htmlFor ? `${htmlFor}-help` : undefined} className="m-0 mt-1 text-xs text-muted">{instructions}</p>
  const issue = error && <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</FieldError>
  if (setting) {
    const text = (caption || aside || help) && (
      <>
        <div className="flex flex-wrap items-center gap-x-2">{caption}{aside}</div>
        {setting === 'end' && issue ? issue : help}
      </>
    )
    return <SettingRow label={text} layout={setting} className={className}>{children}{setting !== 'end' && issue}</SettingRow>
  }
  return (
    <div className={cn('min-w-0', className)}>
      {(label || aside) && (
        <div className="mb-1.5 flex min-h-5 items-center gap-2">
          {caption}
          {aside && <div className="ml-auto flex items-center gap-1">{aside}</div>}
        </div>
      )}
      {children}
      {error ? <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</FieldError> : instructions ? <p id={htmlFor ? `${htmlFor}-help` : undefined} className="m-0 mt-1.5 text-xs text-muted">{instructions}</p> : null}
    </div>
  )
}

/** What's wrong with a field, under it, in place of its help. */
export function FieldError({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <p id={id} role="alert" className={cn('m-0 flex items-start gap-1 text-xs text-danger', className ?? 'mt-1.5')}>
      <Icon name="error" size={14} className="shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  )
}

/**
 * Beside the label of a field whose value is set in another language of the entry: a lock, and that
 * language's code. The field itself is closed here; the tooltip names the language.
 */
export function SharedMark({ from, className }: { from: string; className?: string }) {
  let language = from.toUpperCase()
  try { language = new Intl.DisplayNames([locale()], { type: 'language' }).of(from) ?? language } catch { /* a code the browser does not know stays a code */ }
  return (
    <Tooltip content={t('Set in {language}', { language })}>
      <span tabIndex={0} className={cn('inline-flex shrink-0 cursor-default items-center gap-1 rounded-xs text-2xs font-medium uppercase text-faint', className)}>
        <Icon name="lock" size={12} />
        <span className="sr-only">{t('Set in {language}', { language })}</span>
        <span aria-hidden="true">{from}</span>
      </span>
    </Tooltip>
  )
}
