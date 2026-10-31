import { Toaster as Sonner, toast as sonner } from 'sonner'
import { CmsError, t } from '@letterncms/sdk'

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'cms-pop flex font-sans w-[356px] items-start gap-2.5 px-3.5 py-3 text-sm text-text',
          title: 'font-medium text-ink',
          description: 'text-muted text-xs mt-0.5',
          actionButton: 'ml-auto h-6 rounded-xs bg-ink px-2 text-xs font-medium text-ink-contrast',
          cancelButton: 'h-6 rounded-xs px-2 text-xs text-muted',
          error: '[&_[data-icon]]:text-danger',
          success: '[&_[data-icon]]:text-success',
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
    const message = error instanceof CmsError || error instanceof Error ? error.message : typeof error === 'string' ? error : fallback
    const details = error instanceof CmsError ? Object.values(error.details).slice(0, 3).join(' · ') : undefined
    return sonner.error(message, { id, description: details || undefined })
  },
  loading: (message: string, options?: Parameters<typeof sonner.loading>[1]) => sonner.loading(message, options),
  promise: sonner.promise as <T>(promise: Promise<T> | (() => Promise<T>), options?: Parameters<typeof sonner.promise<T>>[1]) => unknown,
  dismiss: sonner.dismiss,
})
