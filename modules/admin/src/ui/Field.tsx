import type { ReactNode } from 'react'
import { cn } from './cn'

/** Label + control + help/error. Every form row in the admin uses this. */
export function Field({ label, htmlFor, instructions, error, required, children, className, aside }: { label?: ReactNode; htmlFor?: string; instructions?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <div className={cn('min-w-0', className)}>
      {(label || aside) && (
        <div className="mb-1.5 flex items-center gap-2">
          {label && (
            <label htmlFor={htmlFor} className="text-sm font-medium text-text">
              {label}
              {required && <span className="ml-0.5 text-faint">*</span>}
            </label>
          )}
          {aside && <div className="ml-auto flex items-center gap-1">{aside}</div>}
        </div>
      )}
      {children}
      {error ? <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="m-0 mt-1.5 text-xs text-danger">{error}</p> : instructions ? <p id={htmlFor ? `${htmlFor}-help` : undefined} className="m-0 mt-1.5 text-xs text-faint">{instructions}</p> : null}
    </div>
  )
}
