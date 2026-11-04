import type { ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

/** Label + control + help/error. Every form row in the admin uses this. */
export function Field({ label, htmlFor, instructions, error, required, children, className, aside }: { label?: ReactNode; htmlFor?: string; instructions?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <div className={cn('min-w-0', className)}>
      {(label || aside) && (
        <div className="mb-1.5 flex min-h-5 items-center gap-2">
          {label && (
            <label htmlFor={htmlFor} className="text-sm font-medium text-text">
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 font-normal text-faint">*</span>}
            </label>
          )}
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
