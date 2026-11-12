import { CmsError, invalidate, languages, loadManifest, locale, plural, run, t, useAbility, useManifest, type FieldDef, type SurfaceComponentProps } from '@letterncms/sdk'
import qrcode from 'qrcode-generator'
import { useEffect, useState } from 'react'
import { Badge, Button, Dialog, Fields, List, Row, SaveBar, copyText, toast } from '@letterncms/ui'

/**
 * The Profile section of Account: name and email, the site's profile fields (content/users.yaml) and the
 * admin's language and accent, all drawn as fields and saved together from the bar. Changing the email asks for the
 * password; a new language starts the admin again in it. The theme is not here: it is the account menu's.
 */
export function Profile() {
  const { user, site } = useManifest()
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('user-fields/get')
  const initial: Record<string, any> = { name: user.name, email: user.email, currentPassword: '', data: user.data ?? {}, locale: user.locale ?? '', accent: user.preferences?.accent ?? null }
  const [changes, setChanges] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const values = { ...initial, ...changes }
  const changed = (key: string) => key in changes && JSON.stringify(changes[key]) !== JSON.stringify(initial[key])
  const dirty = ['name', 'email', 'data', 'locale', 'accent'].some(changed)
  const set = (handle: string, value: any) => { setChanges((c) => ({ ...c, [handle]: value })); setErrors(({ [handle]: _, ...rest }) => rest) }

  const discard = () => { setChanges({}); setErrors({}); setFailed(null) }

  const save = async () => {
    if (!dirty || busy) return
    setBusy(true)
    setFailed(null)
    try {
      const emailChanged = changed('email')
      const input = {
        ...(changed('name') ? { name: values.name } : {}),
        ...(emailChanged ? { email: values.email, currentPassword: values.currentPassword } : {}),
        ...(changed('data') ? { data: values.data } : {}),
        ...(changed('locale') ? { locale: values.locale || null } : {}),
        ...(changed('accent') ? { preferences: { accent: values.accent } } : {}),
      }
      if (Object.keys(input).length > 0) await run('account/update', input)
      // The whole admin is drawn in the language: start it again in the new one.
      if (changed('locale')) return window.location.reload()
      await loadManifest()
      discard()
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half', autocomplete: 'name' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half', autocomplete: 'email' },
    ...(values.email !== user.email ? [{ handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, width: 'half' as const, autocomplete: 'current-password' }] : []),
  ]
  // Empty: follow the admin's default language (Settings → General → Admin Language).
  const language: FieldDef[] = [{ handle: 'locale', type: 'select', label: t('Language'), required: true, options: { '': t('Admin Default'), ...languages() } }]
  // Empty: follow the admin's accent (Settings → General → Theme Color).
  const accent: FieldDef[] = [{ handle: 'accent', type: 'select', component: 'accent', label: t('Theme Color'), inherit: site.accent ?? null }]

  // Every section of the page starts at the same edge: no avatar beside the fields (it is in the account menu).
  return (
    <div>
      <SaveBar dirty={dirty} saving={busy} error={failed} onSave={() => void save()} onDiscard={discard} />
      <Fields fields={fields} values={values} onChange={set} errors={errors} />
      {(profile.data?.resolvedFields ?? []).length > 0 && <Fields className="mt-4" fields={profile.data!.resolvedFields} values={values.data} onChange={(h, v) => set('data', { ...values.data, [h]: v })} errors={errors} />}
      <Fields className="mt-4" fields={language} values={values} onChange={set} errors={errors} />
      <Fields className="mt-4" fields={accent} values={values} onChange={set} errors={errors} />
    </div>
  )
}

/**
 * The Security section of Account: the password and two-factor sign-in as two rows, each saying how it
 * stands and offering the one thing to do about it.
 */
export function Security() {
  const { user } = useManifest()
  const [open, setOpen] = useState<'password' | 'setup' | 'off' | null>(null)
  const close = () => setOpen(null)

  return (
    <>
      <List>
        <Row className="min-h-12">
          <span className="min-w-0 flex-1 truncate">{t('Password')}</span>
          <Button onClick={() => setOpen('password')}>{t('Change Password')}</Button>
        </Row>
        <Row className="min-h-12">
          <span className="min-w-0 truncate">{t('Two-Factor Authentication')}</span>
          <Badge tone={user.twoFactor ? 'success' : 'neutral'}>{user.twoFactor ? t('On') : t('Off')}</Badge>
          <span className="flex-1" />
          {user.twoFactor ? <Button variant="destructive" onClick={() => setOpen('off')}>{t('Turn Off')}</Button> : <Button onClick={() => setOpen('setup')}>{t('Set Up')}</Button>}
        </Row>
      </List>
      {open === 'password' && (
        <SecretDialog
          title={t('Change Password')} submitLabel={t('Change Password')} done={t('Password changed')} onClose={close}
          run={(v) => run('account/update', { currentPassword: v.currentPassword ?? '', password: v.password ?? '' })}
          fields={[
            { handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, required: true, autofocus: true, autocomplete: 'current-password' },
            { handle: 'password', type: 'text', label: t('New Password'), secret: true, required: true, autocomplete: 'new-password' },
          ]}
        />
      )}
      {open === 'off' && (
        <SecretDialog
          danger title={t('Turn Off Two-Factor Authentication?')} submitLabel={t('Turn Off')} done={t('Two-factor authentication is off')} onClose={close}
          run={(v) => run('account/two-factor-disable', { password: v.password ?? '' }).then(() => loadManifest())}
          fields={[{ handle: 'password', type: 'text', label: t('Your Password'), secret: true, required: true, autofocus: true, autocomplete: 'current-password' }]}
        />
      )}
      {open === 'setup' && <TwoFactorSetup onClose={close} />}
    </>
  )
}

/** A dialog that asks for a password or two and does one thing with them; what the server refuses is said on its field. */
function SecretDialog({ title, submitLabel, done, fields, run: act, danger, onClose }: { title: string; submitLabel: string; done: string; fields: FieldDef[]; run: (values: Record<string, any>) => Promise<unknown>; danger?: boolean; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await act(values)
      toast.success(done)
      onClose()
    } catch (e) {
      if (e instanceof CmsError && Object.keys(e.details ?? {}).length > 0) setErrors(e.details)
      else toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={title} submitLabel={submitLabel} danger={danger} busy={busy} onSubmit={() => void submit()}>
      <Fields fields={fields} values={values} errors={errors} onChange={(h, v) => { setValues({ ...values, [h]: v }); setErrors(({ [h]: _, ...rest }) => rest) }} />
    </Dialog>
  )
}

const groups = (text: string) => text.match(/.{1,4}/g)?.join(' ') ?? text
const copy = (text: string) => copyText(text, { copied: t('Copied') })

function TwoFactorSetup({ onClose }: { onClose: () => void }) {
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null)
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    run<{ secret: string; uri: string }>('account/two-factor-setup').then(setSetup, (e) => { toast.error(e); onClose() })
  }, [])

  const qr = (() => {
    if (!setup) return ''
    const q = qrcode(0, 'M')
    q.addData(setup.uri)
    q.make()
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true })
  })()

  const confirmCode = async () => {
    setBusy(true)
    try {
      const res = await run<{ recoveryCodes: string[] }>('account/two-factor-confirm', { code: code.replace(/\D/g, '') })
      setRecovery(res.recoveryCodes)
      await loadManifest()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (recovery) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()} title={t('Save Your Recovery Codes')} description={t('Each works once if you lose your device. They are not shown again.')} size="sm"
        footer={<><Button icon="copy" onClick={() => void copy(recovery.join('\n'))}>{t('Copy')}</Button><Button variant="primary" onClick={onClose}>{t('Done')}</Button></>}>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-sunken p-4 font-mono text-sm">{recovery.map((c) => <span key={c}>{c}</span>)}</div>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={t('Set Up Two-Factor Authentication')} submitLabel={t('Turn On')} busy={busy} submitDisabled={!setup || code.replace(/\D/g, '').length !== 6} onSubmit={() => void confirmCode()}>
      <div className="space-y-4">
        {/* The two steps by their labels: scan, then the code the app shows. */}
        <p className="m-0 text-sm font-medium text-ink">{t('Scan With Your Authenticator App')}</p>
        <div className="mx-auto size-44 rounded-lg bg-white p-3 [&_svg]:size-full" role="img" aria-label={t('QR code')} dangerouslySetInnerHTML={{ __html: qr }} />
        {setup && (
          <div className="flex items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5">
            <span className="min-w-0 flex-1 break-words font-mono text-xs text-muted" aria-label={t('Setup Key')}>{groups(setup.secret)}</span>
            <Button size="xs" variant="ghost" icon="copy" onClick={() => void copy(setup.secret)}>{t('Copy')}</Button>
          </div>
        )}
        <Fields fields={[{ handle: 'code', type: 'text', label: t('Code From the App'), placeholder: '123 456', max: 7, mono: true, autofocus: true, inputmode: 'numeric', autocomplete: 'one-time-code' }]} values={{ code }} onChange={(_, v) => setCode(v ?? '')} />
      </div>
    </Dialog>
  )
}

/** What a token may do, by its scope. */
const scopeLabels = (): Record<string, string> => ({ '*': t('Full Access'), read: t('Read Only'), 'entries/*': t('Content Only') })

const tokenFields = (): FieldDef[] => [
  { handle: 'name', type: 'text', label: t('Name'), required: true, placeholder: 'Claude Desktop', autofocus: true },
  // What it may do, all three in view: the choice that matters most about a token.
  { handle: 'scope', type: 'select', label: t('Access'), display: 'segmented', required: true, options: scopeLabels() },
  { handle: 'expires', type: 'select', label: t('Expires'), display: 'segmented', required: true, options: { '30': plural(30, '{count} Day', '{count} Days'), '90': plural(90, '{count} Day', '{count} Days'), '365': t('1 Year'), never: t('Never') } },
]
const newToken = { name: '', scope: '*', expires: '90' }

/** Setting up two-factor sign-in, for whatever opens it as a surface (the Dashboard's Security widget). */
export function TwoFactor({ close }: SurfaceComponentProps) {
  return <TwoFactorSetup onClose={() => close?.()} />
}

/** A new token: named, scoped and given an expiry, then shown once to copy. */
export function NewToken({ close }: SurfaceComponentProps) {
  const [values, setValues] = useState<Record<string, any>>(newToken)
  const [created, setCreated] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const done = () => close?.()

  const create = async () => {
    setBusy(true)
    try {
      const res = await run<{ token: string }>('tokens/create', { name: values.name, scopes: [values.scope], expiresInDays: values.expires === 'never' ? null : Number(values.expires) })
      setCreated(res.token)
      invalidate('tokens/')
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  // Shown once, with what it may do and until when beside it: after this only its name is left.
  return created ? (
    <Dialog open onOpenChange={(o) => !o && done()} title={t('Copy Your Token')} description={t('It is shown only once')} footer={<><Button onClick={done}>{t('Done')}</Button><Button variant="primary" icon="copy" onClick={() => void copy(created)}>{t('Copy Token')}</Button></>}>
      <div className="space-y-3">
        <div className="rounded-sm bg-sunken px-3 py-2 font-mono text-xs"><span className="break-all">{created}</span></div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="text-text">{values.name}</span>
          <Badge>{scopeLabels()[values.scope]}</Badge>
          <span>{values.expires === 'never' ? t('Never expires') : t('Expires {date}', { date: new Date(Date.now() + Number(values.expires) * 86_400_000).toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' }) })}</span>
        </div>
      </div>
    </Dialog>
  ) : (
    <Dialog open onOpenChange={(o) => !o && done()} size="sm" title={t('New Token')} submitLabel={t('Create Token')} busy={busy} submitDisabled={!String(values.name ?? '').trim()} onSubmit={() => void create()}>
      <Fields fields={tokenFields()} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
    </Dialog>
  )
}
