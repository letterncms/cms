import { Dialog as Base } from '@base-ui/react/dialog'
import { createRoot } from 'react-dom/client'
import { useState, type ReactNode } from 'react'
import { t, type FieldDef } from '@letterncms/sdk'
import { Button } from './Button'
import { Fields } from './Fields'
import { cn } from './cn'
import { IconButton } from './Button'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const widths = { sm: 'max-w-[400px]', md: 'max-w-[520px]', lg: 'max-w-[720px]', xl: 'max-w-[960px]' }

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md', className }: DialogProps) {
  return (
    <Base.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Base.Portal>
        <Base.Backdrop className="fixed inset-0 z-50 bg-overlay transition-opacity duration-180 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Base.Popup
          className={cn(
            'fixed left-1/2 top-[12vh] z-50 flex max-h-[76vh] w-[calc(100vw-32px)] -translate-x-1/2 flex-col rounded-xl border border-border-modal bg-bg shadow-dialog outline-none transition-[opacity,transform] duration-180 ease-out data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0',
            widths[size],
            className,
          )}
        >
          {(title || description) && (
            <div className="flex items-start gap-3 px-5 pb-2 pt-4">
              <div className="min-w-0 flex-1">
                {title && <Base.Title className="m-0 text-lg font-semibold tracking-[-0.01em] text-ink">{title}</Base.Title>}
                {description && <Base.Description className="m-0 mt-1 text-sm text-muted">{description}</Base.Description>}
              </div>
              <Base.Close render={<IconButton icon="close" label={t('Close')} size="sm" className="-mr-1.5 -mt-0.5" />} />
            </div>
          )}
          {children && <div className="min-h-0 flex-1 overflow-auto px-5 py-3">{children}</div>}
          {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
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
      return (
        <Dialog
          open={open}
          onOpenChange={(o) => !o && done(false)}
          size="sm"
          title={options.title}
          description={options.description}
          footer={
            <>
              <Button onClick={() => done(false)}>{options.cancel ?? t('Cancel')}</Button>
              <Button variant={options.danger ? 'danger' : 'primary'} onClick={() => done(true)} autoFocus>
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
