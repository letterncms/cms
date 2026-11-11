import { Dialog as Base } from '@base-ui/react/dialog'
import { createRoot } from 'react-dom/client'
import { useId, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { t, type FieldDef } from '@letterncms/sdk'
import { Button } from './Button'
import { Fields } from './Fields'
import { cn } from './cn'
import { IconButton } from './Button'
import { useShortcut } from './shortcuts'
import { Pressable } from './Pressable'

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
  /** A question that needs an answer before anything else (a confirmation): `alertdialog`. */
  alert?: boolean
  /**
   * Makes it a form: its body is the form (Enter submits) and, without a `footer` of its own,
   * the footer has Cancel and the submit button, which says `submitLabel`.
   */
  onSubmit?: () => void
  submitLabel?: string
  /** Not submittable yet: its button is off. */
  submitDisabled?: boolean
  /** A destructive form: its button is red. */
  danger?: boolean
  /** Being submitted: its button spins, and nothing closes it meanwhile. */
  busy?: boolean
}

/**
 * The grip at the top of a sheet that rises from a phone's bottom edge: drag it down and the sheet follows and goes,
 * let go early and it returns; pressed (or reached with a keyboard), it closes. Every sheet has the same one, and
 * it is real: never a bar that only looks like a grip. Below `sm` only; `sheet` is the element that moves.
 */
export function SheetHandle({ sheet, onDismiss }: { sheet: RefObject<HTMLElement | null>; onDismiss: () => void }) {
  const drag = useRef<{ y: number; at: number; moved: number } | null>(null)
  const move = (to: string, animate: boolean) => {
    const el = sheet.current
    if (!el) return
    el.style.transition = animate ? '' : 'none'
    el.style.translate = to
  }
  const down = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { y: event.clientY, at: event.timeStamp, moved: 0 }
  }
  const follow = (event: PointerEvent<HTMLElement>) => {
    if (!drag.current) return
    drag.current.moved = Math.max(0, event.clientY - drag.current.y)
    move(`0 ${drag.current.moved}px`, false)
  }
  const up = (event: PointerEvent<HTMLElement>) => {
    const from = drag.current
    drag.current = null
    if (!from) return
    const height = sheet.current?.offsetHeight ?? 0
    const fast = from.moved / Math.max(1, event.timeStamp - from.at) > 0.5
    // Far enough, or flicked: it goes. Hardly moved at all: that was a press, which closes too.
    if (from.moved < 4) onDismiss()
    else if (from.moved > Math.min(120, height / 3) || (fast && from.moved > 24)) {
      // On down and out while it fades: never back up the way it came.
      move('0 100%', true)
      onDismiss()
    } else move('', true)
  }
  return (
    <Pressable compact aria-label={t('Close')} onPointerDown={down} onPointerMove={follow} onPointerUp={up} onPointerCancel={() => { drag.current = null; move('', true) }}
      // A press that was no pointer's (the keyboard, a screen reader's activate): the pointer's own is told apart above, by how far it moved.
      onClick={(event) => { if (event.detail === 0) onDismiss() }}
      className="group/grip -mb-1 flex h-6 w-full shrink-0 cursor-grab touch-none items-center justify-center rounded-t-xl active:cursor-grabbing sm:hidden">
      <span aria-hidden className="h-1 w-9 rounded-full bg-border-strong transition-colors duration-base group-hover/grip:bg-border-hover group-active/grip:bg-faint" />
    </Pressable>
  )
}

const widths = { sm: 'max-w-[400px]', md: 'max-w-[520px]', lg: 'max-w-[720px]', xl: 'max-w-[960px]' }

/** What a dialog focuses first: its first field, else its main action, never Close. */
const firstField = 'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable=true], [role=combobox]:not([disabled])'

export function Dialog({ open, onOpenChange, title, description, children, footer: own, size = 'md', className, close = true, alert = false, onSubmit, submitLabel, submitDisabled = false, danger = false, busy = false }: DialogProps) {
  const popup = useRef<HTMLDivElement>(null)
  const form = useId()
  const [scrolled, setScrolled] = useState(false)
  const footer = own ?? (onSubmit && (
    <>
      <Button onClick={() => onOpenChange(false)} disabled={busy}>{t('Cancel')}</Button>
      <Button variant={danger ? 'danger' : 'primary'} type="submit" form={form} loading={busy} disabled={submitDisabled}>{submitLabel ?? t('Save')}</Button>
    </>
  ))
  const body = onSubmit ? <form id={form} onSubmit={(e) => { e.preventDefault(); if (!busy && !submitDisabled) onSubmit() }}>{children}</form> : children
  return (
    <Base.Root open={open} onOpenChange={(o) => { if (!busy || o) onOpenChange(o) }}>
      <Base.Portal>
        <Base.Backdrop className="fixed inset-0 z-overlay bg-overlay transition-opacity duration-move ease-out data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:duration-fast data-[starting-style]:opacity-0" />
        <Base.Popup
          ref={popup}
          {...(alert ? { role: 'alertdialog' } : {})}
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
            'fixed left-1/2 top-[12vh] z-overlay flex max-h-[76vh] w-[calc(100vw-32px)] -translate-x-1/2 flex-col rounded-xl border border-border-modal bg-float shadow-dialog outline-none transition-[opacity,scale] duration-move ease-out data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:duration-fast data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0',
            'max-sm:transition-[opacity,translate] max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[90dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:data-[starting-style]:scale-100 max-sm:data-[starting-style]:translate-y-4',
            widths[size],
            className,
          )}
        >
          {/* On a phone the grip is the sheet's one way out, on every sheet: no × beside it. (Cancel, where a question is asked, is an answer.) */}
          <SheetHandle sheet={popup} onDismiss={() => { if (!busy) onOpenChange(false) }} />
          {(title || description) && (
            // Under the title an edge shows while the body is scrolled, so rows pass under a line and never meet the title.
            <div className={cn('shrink-0 border-b px-5 pb-3 pt-5 transition-colors duration-base max-sm:px-4 max-sm:pt-1', scrolled ? 'border-border' : 'border-transparent', close && 'sm:pr-12')}>
              {title && <Base.Title className="m-0 text-lg font-semibold text-ink">{title}</Base.Title>}
              {description && <Base.Description className="m-0 mt-1 text-sm text-muted">{description}</Base.Description>}
            </div>
          )}
          {close && (title || description) && <Base.Close render={<IconButton icon="close" label={t('Close')} size="sm" className="!absolute right-2 top-2 max-sm:hidden" />} />}
          {body && <div data-dialog-body onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)} className={cn('min-h-0 flex-1 overflow-auto px-5 max-sm:px-4', title || description ? 'pt-1' : 'pt-5 max-sm:pt-1', !footer && 'pb-5 max-sm:pb-[calc(16px+env(safe-area-inset-bottom))]')}>{body}</div>}
          {footer && <div data-dialog-footer className="flex shrink-0 items-center justify-end gap-2 px-5 pb-5 pt-5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:gap-3 max-sm:px-4 max-sm:pb-[calc(24px+env(safe-area-inset-bottom))] max-sm:[&>button]:h-11 max-sm:[&>button]:w-full">{footer}</div>}
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  )
}

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  /** The button that goes through with it, as a verb: "Delete", "Publish", "Discard". Never "OK" or "Confirm". */
  confirm: string
  cancel?: string
  danger?: boolean
}

/** The confirmation on view: a second one never stacks on it (a double click asks once). */
let asking = false

/** Imperative confirmation dialog: `if (await confirm({ title, confirm, danger: true })) …` */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (asking) return Promise.resolve(false)
  asking = true
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    function Confirm() {
      const [open, setOpen] = useState(true)
      const done = (value: boolean) => {
        setOpen(false)
        asking = false
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
          alert
          title={options.title}
          description={options.description}
          footer={
            <>
              <Button onClick={() => done(false)} autoFocus={options.danger}>{options.cancel ?? t('Cancel')}</Button>
              <Button variant={options.danger ? 'danger' : 'primary'} onClick={() => done(true)} autoFocus={!options.danger}>
                {options.confirm}
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
  /** The button that submits it, as a verb: "Rename", "Add". Never "OK". */
  confirm: string
}

/** Imperative form dialog: `const values = await prompt({ title, fields, confirm })` — null when canceled. */
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
          onSubmit={() => done(values)}
          submitLabel={options.confirm}
        >
          <Fields fields={options.fields.map((f, i) => ({ autofocus: i === 0, ...f }))} values={values} onChange={(h, v) => setValues((current) => ({ ...current, [h]: v }))} />
        </Dialog>
      )
    }

    root.render(<Prompt />)
  })
}
