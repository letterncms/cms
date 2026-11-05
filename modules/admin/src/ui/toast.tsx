import { Toaster as Sonner, toast as sonner } from 'sonner'
import { CmsError, t } from '@letterncms/sdk'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { Spinner } from './Spinner'

/** Toasts lie at the bottom right of the sheet (bottom centre on a phone): a float with one line and at most one action, gone after 4s unless pointed at. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      expand
      visibleToasts={3}
      duration={4000}
      // 16px from the corner of the sheet, which lies 8px in from the window.
      offset={24}
      mobileOffset={16}
      style={{ '--width': '360px' } as CSSProperties}
      icons={{ success: <Icon name="check-circle" size={16} />, error: <Icon name="error" size={16} />, warning: <Icon name="warning" size={16} />, info: <Icon name="info" size={16} />, loading: <Spinner size={16} /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'cms-toast flex w-full items-start gap-2.5 rounded-lg border border-border-float bg-float px-3 py-2.5 font-sans text-sm text-text shadow-pop',
          icon: 'mt-0.5 flex shrink-0 text-muted',
          content: 'min-w-0 flex-1',
          title: 'line-clamp-2 text-text',
          description: 'mt-0.5 text-xs text-muted',
          actionButton: '-my-0.5 -mr-1 ml-1 h-6 shrink-0 rounded-xs px-2 text-xs font-medium text-text transition-colors duration-120 hover:bg-hover active:bg-active',
          cancelButton: '-my-0.5 h-6 shrink-0 rounded-xs px-2 text-xs font-medium text-muted transition-colors duration-120 hover:bg-hover hover:text-text',
          error: '[&_[data-icon]]:text-danger',
          success: '[&_[data-icon]]:text-success',
          warning: '[&_[data-icon]]:text-warning',
        },
      }}
    />
  )
}

/** Toasts. `toast.error(err)` accepts a CmsError and shows its message. */
export const toast = Object.assign((message: string, options?: Parameters<typeof sonner>[1]) => sonner(message, options), {
  success: (message: string, options?: Parameters<typeof sonner.success>[1]) => sonner.success(message, options),
  /** Pass `{ id }` to turn a loading toast into the error. */
  error: (error: unknown, options: string | { id?: string | number; fallback?: string } = {}) => {
    const { id, fallback = t('Something went wrong.') } = typeof options === 'string' ? { fallback: options } : options
    // The CMS's own errors are written for people; a browser's (DOMException, TypeError…) are not.
    const ours = error instanceof CmsError || (error instanceof Error && error.constructor === Error)
    if (!ours && typeof error !== 'string' && error != null) console.error(error)
    const message = ours ? (error as Error).message : typeof error === 'string' ? error : fallback
    const details = error instanceof CmsError ? Object.values(error.details).slice(0, 3).join(' · ') : undefined
    return sonner.error(message, { id, description: details || undefined })
  },
  loading: (message: string, options?: Parameters<typeof sonner.loading>[1]) => sonner.loading(message, options),
  promise: sonner.promise as <T>(promise: Promise<T> | (() => Promise<T>), options?: Parameters<typeof sonner.promise<T>>[1]) => unknown,
  dismiss: sonner.dismiss,
})

/**
 * Puts text on the clipboard and says how it went, in words of its own: `copied` when it
 * worked (nothing without it), `failed` when it didn't (`null`: nothing, for a caller that
 * shows the text instead). Resolves with whether it worked.
 */
export function copyText(text: string, { copied, failed = t('Couldn’t copy to the clipboard') }: { copied?: string; failed?: string | null } = {}): Promise<boolean> {
  return (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error('clipboard'))).then(
    () => {
      if (copied) toast.success(copied)
      return true
    },
    (error) => {
      console.error(error)
      if (failed) toast.error(failed)
      return false
    },
  )
}
