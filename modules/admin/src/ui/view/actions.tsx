import { CmsError, loadManifest, navigate, queryClient, registry, run, t, type ViewAction } from '@letterncms/sdk'
import { Suspense, useCallback, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Button } from '../Button'
import { ComponentBoundary } from '../ComponentBoundary'
import { confirm, Dialog } from '../Dialog'
import { Fields } from '../Fields'
import { toast } from '../toast'
import { useView, ViewContext } from './context'
import { fill, holds, input, safeUrl, type Scope } from './scope'
import { ViewNodes } from './render'

type Open = { kind: 'dialog' | 'component'; action: ViewAction; scope: Scope } | { kind: 'form'; action: ViewAction; scope: Scope; done: () => void }

/**
 * Runs actions for a view, and holds what an action opens (a dialog of nodes, a component).
 * After an ability changed something, every list and form of the view loads again.
 */
/** Runs an ability for an action, in place of calling it directly: a thread runs it as a turn of its own. */
export type ActionRunner = (ability: string, input: Record<string, unknown>, action: ViewAction) => Promise<unknown>

/** Asks for an action's `form` in place of the dialog: a thread asks in its composer. */
export type ActionAsker = (action: ViewAction, scope: Scope) => void

export function useActions(scope: Scope, refresh: () => void, runner?: ActionRunner, ask?: ActionAsker): { act: (action: ViewAction, scope: Scope, busy?: (on: boolean) => void) => Promise<void>; layer: ReactNode } {
  const [open, setOpen] = useState<Open | null>(null)
  const close = useCallback(() => setOpen(null), [])

  /** Runs the ability, then what the action says follows. Throws what went wrong. */
  const perform = useCallback(async (action: ViewAction, here: Scope, values: Record<string, unknown> | null) => {
    const own = input(action.input, { ...here, values })
    // A form's values are the input unless the action names what goes in it.
    const given = values && Object.keys(own).length === 0 ? values : own
    const result = runner ? await runner(action.ability!, given, action) : await run(action.ability!, given)
    const after = { ...here, values, result }
    // A thread says what happened in the turn it adds; anywhere else, a toast does.
    if (action.success && !runner) toast.success(fill(action.success, after))
    const then = Array.isArray(action.then) ? action.then : action.then ? [action.then] : []
    if (then.includes('manifest')) await loadManifest()
    // Whatever the change touched shows it now, here and on every other screen.
    void queryClient.invalidateQueries()
    refresh()
    if (then.includes('back')) window.history.back()
    if (then.includes('open') && action.to) navigate(place(fill(action.to, after)))
  }, [refresh, runner])

  const act = useCallback(async (action: ViewAction, local: Scope, busy?: (on: boolean) => void) => {
    const here = { ...scope, ...local }
    if (action.confirm) {
      const c = fill(action.confirm, here)
      if (!(await confirm({ title: c.title, description: c.text, confirm: c.confirm ?? action.label, danger: c.danger ?? action.variant === 'danger' }))) return
    }
    if (action.copy !== undefined) {
      await navigator.clipboard.writeText(String(fill(action.copy, here) ?? ''))
      toast.success(action.success ? fill(action.success, here) : t('Copied'))
      return
    }
    if (action.dialog) return setOpen({ kind: 'dialog', action, scope: here })
    if (action.component) return setOpen({ kind: 'component', action, scope: here })
    if (action.href) {
      const url = safeUrl(fill(action.href, here))
      if (url) window.open(url, '_blank', 'noopener')
      return
    }
    if (action.ability && action.form && ask) return ask(action, here)
    if (action.ability && action.form) {
      // Asks first, in a dialog that stays open with what was wrong until it worked or was put away.
      await new Promise<void>((done) => setOpen({ kind: 'form', action, scope: here, done }))
      return
    }
    if (action.ability) {
      // Busy while it runs, not while it asked: a button stays itself behind its own dialog, and takes the focus back.
      busy?.(true)
      try {
        await perform(action, here, null)
      } catch (e) {
        // A thread says what went wrong itself, once.
        if (!runner) toast.error(e)
        throw e
      } finally {
        busy?.(false)
      }
      return
    }
    if (action.to) navigate(place(fill(action.to, here)))
  }, [scope, perform, runner, ask])

  const layer = open && (
    open.kind === 'dialog' ? <ActionDialog action={open.action} scope={open.scope} onClose={close} act={act} refresh={refresh} />
      : open.kind === 'form' ? <FormDialog action={open.action} scope={open.scope} perform={perform} onClose={() => { close(); open.done() }} />
        : <ActionComponent action={open.action} scope={open.scope} onClose={close} />
  )
  return { act, layer }
}

/** An action's questions: its fields, and Confirm. A refusal shows on the fields it is about; the dialog stays. */
function FormDialog({ action, scope, perform, onClose }: { action: ViewAction; scope: Scope; perform: (action: ViewAction, scope: Scope, values: Record<string, unknown>) => Promise<void>; onClose: () => void }) {
  const form = fill(action.form!, scope)
  const [values, setValues] = useState<Record<string, unknown>>(form.values ?? {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await perform(action, scope, values)
      onClose()
    } catch (e) {
      const details = e instanceof CmsError ? e.details : {}
      setErrors(details)
      // What isn't about one field is said under them.
      setError(Object.keys(details).length ? null : e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={form.title} description={form.text} onSubmit={() => void submit()} submitLabel={form.confirm ?? action.label} danger={action.variant === 'danger'} busy={busy}>
      <Fields fields={action.form!.fields.map((f, i) => ({ autofocus: i === 0, ...f }))} values={values} errors={errors} onChange={(h, v) => { setValues((current) => ({ ...current, [h]: v })); setErrors(({ [h]: _, ...rest }) => rest) }} />
      {error && <p role="alert" className="m-0 mt-3 text-sm text-danger">{error}</p>}
    </Dialog>
  )
}

/** A place to go, without the query values that came out empty (`?locale=` when none is chosen). */
export function place(to: string): string {
  if (typeof to !== 'string') return ''
  const [path, query] = to.split('?')
  if (query === undefined) return to
  const kept = new URLSearchParams([...new URLSearchParams(query)].filter(([, v]) => v !== ''))
  return kept.size ? `${path}?${kept}` : path
}

/** A dialog an action opens: its nodes drawn with the row it was opened for, its buttons under them. */
function ActionDialog({ action, scope, onClose, act, refresh }: { action: ViewAction; scope: Scope; onClose: () => void; act: (action: ViewAction, scope: Scope) => Promise<void>; refresh: () => void }) {
  const dialog = action.dialog!
  const buttons = (dialog.actions ?? []).filter((a) => holds(a.when, scope) && !(a.unless !== undefined && holds(a.unless, scope)))
  return (
    <ViewContext.Provider value={{ scope, refresh, act, disabled: false }}>
      <Dialog open onOpenChange={(o) => !o && onClose()} title={fill(dialog.title, scope)} description={dialog.text ? fill(dialog.text, scope) : undefined} size={dialog.size ?? 'md'}
        footer={buttons.length > 0 ? <>{buttons.map((a, i) => <ActionButton key={i} action={a} variant={a.variant ?? (i === buttons.length - 1 ? 'primary' : 'default')} after={onClose} />)}</> : undefined}>
        <div className="space-y-5"><ViewNodes nodes={dialog.body} /></div>
      </Dialog>
    </ViewContext.Provider>
  )
}

/** A component of the catalog an action opens, such as the dialog that edits one person. It closes itself. */
function ActionComponent({ action, scope, onClose }: { action: ViewAction; scope: Scope; onClose: () => void }) {
  useSyncExternalStore(registry.components.subscribe, registry.components.version)
  const Component = registry.components.get(action.component!)
  if (!Component) return null
  return (
    <ComponentBoundary label={action.label}>
      <Suspense fallback={null}>
        <Component props={fill(action.props ?? {}, scope)} disabled={false} onAction={() => {}} close={onClose} scope={scope} />
      </Suspense>
    </ComponentBoundary>
  )
}

/** A button bound to an action. `after` runs once it succeeded (a dialog closing). */
export function ActionButton({ action, variant, size, after, scope: local = {}, compact }: { action: ViewAction; variant?: ViewAction['variant']; size?: 'sm' | 'md'; after?: () => void; scope?: Scope; compact?: boolean }) {
  // Run with where the button is drawn: in a dialog, the row it was opened for.
  const { act, disabled, scope: here, at } = useView()
  const [busy, setBusy] = useState(false)
  // A way to where it is drawn already adds nothing (Open in an answer, beside the page it opens).
  const away = action.to && !action.ability && !action.dialog && !action.component && at !== undefined ? place(String(fill(action.to, { ...here, ...local }))) : null
  const style = variant ?? action.variant ?? 'default'
  // Shown but not yet possible: Go Live while a check is open.
  const blocked = action.disabled !== undefined && holds(action.disabled, { ...here, ...local })
  if (away !== null && away === at) return null
  const click = async () => {
    try {
      await act(action, { ...here, ...local }, setBusy)
      after?.()
    } catch { /* told in a toast */ }
  }
  return (
    <Button size={size} icon={action.icon} variant={style === 'default' ? 'secondary' : style} loading={busy} disabled={disabled || busy || blocked} onClick={() => void click()} aria-label={compact ? action.label : undefined} title={compact ? action.label : undefined}>
      {compact ? <span className="max-sm:sr-only">{action.label}</span> : action.label || t('Open')}
    </Button>
  )
}

/** Actions shown for a scope: those whose `when` holds and whose `unless` does not. */
export function shown(actions: ViewAction[] | undefined, scope: Scope): ViewAction[] {
  return (actions ?? []).filter((a) => holds(a.when, scope) && !(a.unless !== undefined && holds(a.unless, scope)))
}
