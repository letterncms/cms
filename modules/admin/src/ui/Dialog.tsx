import { Dialog as Base } from '@base-ui/react/dialog'
import { createRoot } from 'react-dom/client'
import { useRef, useState, type ReactNode } from 'react'
import { t, type FieldDef } from '@letterncms/sdk'
import { Button } from './Button'
import { Fields } from './Fields'
import { cn } from './cn'
import { IconButton } from './Button'
import { useShortcut } from './shortcuts'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** The × at the top right; confirmations leave it out (Cancel says it). */
  close?: boolean
}

const widths = { sm: 'max-w-[400px]', md: 'max-w-[520px]', lg: 'max-w-[720px]', xl: 'max-w-[960px]' }

/** What a dialog focuses first: its first field, else its main action, never Close. */
const firstField = 'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable=true], [role=combobox]:not([disabled])'

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md', className, close = true }: DialogProps) {
  const popup = useRef<HTMLDivElement>(null)
  return (
    <Base.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Base.Portal>
        <Base.Backdrop className="fixed inset-0 z-50 bg-overlay transition-opacity duration-160 ease-out data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:duration-100 data-[starting-style]:opacity-0" />
        <Base.Popup
          ref={popup}
          initialFocus={(type) => {
            const root = popup.current
            if (!root || type === 'touch') return root
            // A field that asked for focus (autoFocus) already has it.
            const active = document.activeElement
            if (active instanceof HTMLElement && active.closest('[data-dialog-body], [data-dialog-footer]') && root.contains(active)) return active
            return root.querySelector<HTMLElement>(`[data-dialog-body] :is(${firstField})`)
              ?? root.querySelector<HTMLElement>('[data-dialog-footer] [data-variant=primary]:not([disabled])')
              ?? root.querySelector<HTMLElement>('[data-dialog-footer] [data-variant=danger]:not([disabled])')
              ?? root.querySelector<HTMLElement>('[data-dialog-footer] button:not([disabled])')
              ?? root
          }}
          className={cn(
            // A sheet lifted off the page; on a phone, a sheet rising from the bottom edge.
            'fixed left-1/2 top-[12vh] z-50 flex max-h-[76vh] w-[calc(100vw-32px)] -translate-x-1/2 flex-col rounded-xl border border-border-modal bg-float shadow-dialog outline-none transition-[opacity,scale] duration-160 ease-out data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:duration-100 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0',
            'max-sm:transition-[opacity,translate] max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[90dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:data-[starting-style]:scale-100 max-sm:data-[starting-style]:translate-y-4',
            widths[size],
            className,
          )}
        >
          {(title || description) && (
            <div className={cn('shrink-0 px-5 pt-5 max-sm:px-4 max-sm:pt-4', close && 'pr-12')}>
              {title && <Base.Title className="m-0 text-lg font-semibold text-ink">{title}</Base.Title>}
              {description && <Base.Description className="m-0 mt-1 text-sm text-muted">{description}</Base.Description>}
            </div>
          )}
          {close && (title || description) && <Base.Close render={<IconButton icon="close" label={t('Close')} size="sm" className="!absolute right-2 top-2" />} />}
          {children && <div data-dialog-body className={cn('min-h-0 flex-1 overflow-auto px-5 max-sm:px-4', title || description ? 'pt-4' : 'pt-5 max-sm:pt-4', !footer && 'pb-5 max-sm:pb-[calc(16px+env(safe-area-inset-bottom))]')}>{children}</div>}
          {footer && <div data-dialog-footer className="flex shrink-0 items-center justify-end gap-2 px-5 pb-5 pt-5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-4 max-sm:pb-[calc(16px+env(safe-area-inset-bottom))] max-sm:[&>button]:w-full">{footer}</div>}
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  )
}

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirm?: string
  cancel?: string
  danger?: boolean
}

/** Imperative confirmation dialog: `if (await confirm({...})) …` */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    function Confirm() {
      const [open, setOpen] = useState(true)
      const done = (value: boolean) => {
        setOpen(false)
        resolve(value)
        setTimeout(() => {
          root.unmount()
          host.remove()
        }, 250)
      }
      // ⌘↵ confirms from anywhere in it. A destructive one starts on Cancel, so a stray Enter keeps things as they are.
      useShortcut('mod+enter', () => done(true), open)
      return (
        <Dialog
          open={open}
          onOpenChange={(o) => !o && done(false)}
          size="sm"
          close={false}
          title={options.title}
          description={options.description}
          footer={
            <>
              <Button onClick={() => done(false)} autoFocus={options.danger}>{options.cancel ?? t('Cancel')}</Button>
              <Button variant={options.danger ? 'danger' : 'primary'} onClick={() => done(true)} autoFocus={!options.danger}>
                {options.confirm ?? t('Confirm')}
              </Button>
            </>
          }
        />
      )
    }

    root.render(<Confirm />)
  })
}

export interface PromptOptions {
  title: string
  description?: ReactNode
  /** What to ask, as fields — drawn by Fields like every other form. */
  fields: FieldDef[]
  values?: Record<string, any>
  confirm?: string
}

/** Imperative form dialog: `const values = await prompt({ title, fields })` — null when canceled. */
export function prompt(options: PromptOptions): Promise<Record<string, any> | null> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    function Prompt() {
      const [open, setOpen] = useState(true)
      const [values, setValues] = useState<Record<string, any>>(options.values ?? {})
      const done = (value: Record<string, any> | null) => {
        setOpen(false)
        resolve(value)
        setTimeout(() => {
          root.unmount()
          host.remove()
        }, 250)
      }
      return (
        <Dialog
          open={open}
          onOpenChange={(o) => !o && done(null)}
          size="sm"
          title={options.title}
          description={options.description}
          footer={
            <>
              <Button onClick={() => done(null)}>{t('Cancel')}</Button>
              <Button variant="primary" type="submit" form="cms-prompt">{options.confirm ?? t('OK')}</Button>
            </>
          }
        >
          <form id="cms-prompt" onSubmit={(e) => { e.preventDefault(); done(values) }}>
            <Fields fields={options.fields.map((f, i) => ({ autofocus: i === 0, ...f }))} values={values} onChange={(h, v) => setValues((current) => ({ ...current, [h]: v }))} />
          </form>
        </Dialog>
      )
    }

    root.render(<Prompt />)
  })
}
