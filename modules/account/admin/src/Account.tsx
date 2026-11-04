import { can, CmsError, invalidate, languages, loadManifest, locale, panelsFor, plural, registry, run, t, timeAgo, useAbility, useManifest, type FieldDef } from '@letterncms/sdk'
import qrcode from 'qrcode-generator'
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { Avatar, Button, Dialog, Fields, Page, SaveBar, Section, StatusDot, confirm, toast } from '@letterncms/ui'

/** What the page's one Save stores: the profile and its language. */
interface Form {
  values: Record<string, any>
  set: (handle: string, value: any) => void
  errors: Record<string, string>
}

const FormContext = createContext<Form | null>(null)
const useForm = () => useContext(FormContext)!

/**
 * The signed-in person's account: the sections registered in the `account.sections`
 * slot — core's (profile, security, API & agents) the same way as plugins'. Fields are
 * saved together, from the bar; security steps each have a dialog of their own. The theme
 * is not here: it is the account menu's, and changes as it is chosen.
 */
export default function Account() {
  const { user } = useManifest()
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const initial: Record<string, any> = { name: user.name, email: user.email, currentPassword: '', data: user.data ?? {}, locale: user.locale ?? '' }
  const [changes, setChanges] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const values = { ...initial, ...changes }
  const changed = (key: string) => key in changes && JSON.stringify(changes[key]) !== JSON.stringify(initial[key])
  const dirty = ['name', 'email', 'data', 'locale'].some(changed)

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

  return (
    <Page width="narrow" crumbs={[{ label: t('Account'), icon: 'user' }]}>
      <SaveBar dirty={dirty} saving={busy} error={failed} onSave={() => void save()} onDiscard={discard} />
      <FormContext.Provider value={{ values, errors, set: (handle, value) => { setChanges((c) => ({ ...c, [handle]: value })); setErrors(({ [handle]: _, ...rest }) => rest) } }}>
        {panelsFor('account.sections', {}).map(({ id, component: Part }) => <Part key={id} />)}
      </FormContext.Provider>
    </Page>
  )
}

export function Profile() {
  const { user } = useManifest()
  const { values, set, errors } = useForm()
  // Name and email, then the site's profile fields (content/users.yaml) — all drawn as fields — and the admin's language.
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('users/fields')
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half', autocomplete: 'name' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half', autocomplete: 'email' },
    ...(values.email !== user.email ? [{ handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, width: 'half' as const, autocomplete: 'current-password', instructions: t('Needed to change your email.') }] : []),
  ]
  // Empty: follow the admin's default language (Settings → General → Admin Language).
  const language: FieldDef[] = [{ handle: 'locale', type: 'select', label: t('Language'), required: true, options: { '': t('Admin Default'), ...languages() }, width: 'half' }]

  return (
    <Section title={t('Profile')}>
      <div className="flex items-start gap-5 max-sm:flex-col max-sm:gap-4">
        <Avatar name={values.name || user.name} initials={user.initials} src={user.avatar} size={40} className="mt-6 max-sm:mt-0 dark:bg-sunken! dark:text-text" />
        <div className="w-full min-w-0 flex-1">
          <Fields fields={fields} values={values} onChange={set} errors={errors} />
          {(profile.data?.resolvedFields ?? []).length > 0 && <Fields className="mt-4" fields={profile.data!.resolvedFields} values={values.data} onChange={(h, v) => set('data', { ...values.data, [h]: v })} errors={errors} />}
          <Fields className="mt-4" fields={language} values={values} onChange={set} errors={errors} />
        </div>
      </div>
    </Section>
  )
}

/** A row of the Security and API sections: what it is, how it stands, and what to do about it. */
function Row({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        {meta && <div className="mt-0.5 text-xs text-faint">{meta}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}

export function Security() {
  const { user } = useManifest()
  const [dialog, setDialog] = useState<'password' | 'setup' | 'disable' | null>(null)
  return (
    <Section title={t('Security')}>
      <div className="-mt-3 divide-y divide-border">
        <Row title={t('Password')}>
          <Button size="sm" onClick={() => setDialog('password')}>{t('Change Password')}</Button>
        </Row>
        <Row title={t('Two-Factor Authentication')} meta={t('A code from an authenticator app at sign-in.')}>
          <StatusDot status={user.twoFactor ? 'success' : 'neutral'} label={user.twoFactor ? t('On') : t('Off')} />
          {user.twoFactor
            ? <Button size="sm" onClick={() => setDialog('disable')}>{t('Turn Off')}</Button>
            : <Button size="sm" onClick={() => setDialog('setup')}>{t('Set Up')}</Button>}
        </Row>
      </div>
      {dialog === 'password' && <PasswordDialog onClose={() => setDialog(null)} />}
      {dialog === 'setup' && <TwoFactorSetup onClose={() => setDialog(null)} />}
      {dialog === 'disable' && <TwoFactorOff onClose={() => setDialog(null)} />}
    </Section>
  )
}

/** A dialog that is a small form: Enter submits it, and its footer has Cancel and the one thing it does. */
function FormDialog({ title, description, submit, disabled, busy, danger, onSubmit, onClose, children }: { title: string; description?: string; submit: string; disabled: boolean; busy: boolean; danger?: boolean; onSubmit: () => void; onClose: () => void; children: ReactNode }) {
  const id = `account-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={title}
      description={description}
      size="sm"
      footer={<><Button onClick={onClose}>{t('Cancel')}</Button><Button type="submit" form={id} variant={danger ? 'danger' : 'primary'} loading={busy} disabled={disabled}>{submit}</Button></>}
    >
      <form id={id} onSubmit={(e: FormEvent) => { e.preventDefault(); if (!disabled && !busy) onSubmit() }}>{children}</form>
    </Dialog>
  )
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState({ currentPassword: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    try {
      await run('account/update', values)
      toast.success(t('Password changed'))
      onClose()
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <FormDialog title={t('Change Password')} submit={t('Change Password')} busy={busy} disabled={!values.currentPassword || values.password.length < 10} onSubmit={() => void submit()} onClose={onClose}>
      <Fields
        fields={[
          { handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, autofocus: true, autocomplete: 'current-password' },
          { handle: 'password', type: 'text', label: t('New Password'), secret: true, autocomplete: 'new-password', instructions: t('At least 10 characters, with letters and numbers.') },
        ]}
        values={values}
        errors={errors}
        onChange={(h, v) => setValues({ ...values, [h]: v ?? '' })}
      />
    </FormDialog>
  )
}

const groups = (text: string) => text.match(/.{1,4}/g)?.join(' ') ?? text
const copy = (text: string) => navigator.clipboard.writeText(text).then(() => toast.success(t('Copied')), toast.error)

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
    <FormDialog title={t('Set Up Two-Factor Authentication')} description={t('Scan the code with your authenticator app, then enter the code it shows.')} submit={t('Turn On')} busy={busy} disabled={!setup || code.replace(/\D/g, '').length !== 6} onSubmit={() => void confirmCode()} onClose={onClose}>
      <div className="space-y-4">
        <div className="mx-auto size-44 rounded-lg bg-white p-3 [&_svg]:size-full" role="img" aria-label={t('QR code')} dangerouslySetInnerHTML={{ __html: qr }} />
        {setup && (
          <div className="flex items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5">
            <span className="min-w-0 flex-1 break-words font-mono text-xs text-muted" aria-label={t('Setup Key')}>{groups(setup.secret)}</span>
            <Button size="xs" variant="ghost" icon="copy" onClick={() => void copy(setup.secret)}>{t('Copy')}</Button>
          </div>
        )}
        <Fields fields={[{ handle: 'code', type: 'text', label: t('Code'), placeholder: '123 456', max: 7, mono: true, autofocus: true, inputmode: 'numeric', autocomplete: 'one-time-code' }]} values={{ code }} onChange={(_, v) => setCode(v ?? '')} />
      </div>
    </FormDialog>
  )
}

function TwoFactorOff({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    try {
      await run('account/two-factor-disable', { password })
      await loadManifest()
      toast.success(t('Two-factor authentication is off'))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <FormDialog title={t('Turn Off Two-Factor Authentication?')} submit={t('Turn Off')} danger busy={busy} disabled={!password} onSubmit={() => void submit()} onClose={onClose}>
      <Fields fields={[{ handle: 'password', type: 'text', label: t('Your Password'), secret: true, autofocus: true, autocomplete: 'current-password' }]} values={{ password }} onChange={(_, v) => setPassword(v ?? '')} />
    </FormDialog>
  )
}

/** What a token may do, by its scope. */
const scopeLabels = (): Record<string, string> => ({ '*': t('Full Access'), read: t('Read Only'), 'entries/*': t('Content Only') })

const tokenFields = (): FieldDef[] => [
  { handle: 'name', type: 'text', label: t('Name'), required: true, placeholder: 'Claude Desktop', autofocus: true },
  { handle: 'scope', type: 'select', label: t('Access'), required: true, options: scopeLabels() },
  { handle: 'expires', type: 'select', label: t('Expires'), display: 'segmented', required: true, options: { '30': plural(30, '{count} Day', '{count} Days'), '90': plural(90, '{count} Day', '{count} Days'), '365': t('1 Year'), never: t('Never') } },
]
const newToken = { name: '', scope: '*', expires: '90' }

/**
 * Everything that reaches the admin from outside as you: what plugins put in the
 * `account.api` slot (letterncms/mcp: how to connect an agent), then your tokens.
 */
export function Api() {
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const tokens = useAbility<{ id: string; name: string; scopes: string[]; lastUsedAt: string | null; expiresAt: string | null; createdAt: string }[]>('tokens/list', {}, { enabled: can('tokens.manage') })
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, any>>(newToken)
  const [created, setCreated] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (!can('tokens.manage')) return null

  const close = () => { setOpen(false); setCreated(null); setValues(newToken) }
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

  return (
    <Section title={t('API & Agents')} actions={<Button size="sm" icon="plus" onClick={() => setOpen(true)}>{t('New Token')}</Button>}>
      {panelsFor('account.api', {}).map(({ id, component: Part }) => <Part key={id} />)}
      <div className="mb-1 mt-5 text-xs text-muted first:mt-2">{t('Tokens')}</div>
      {tokens.isLoading ? null : (tokens.data ?? []).length === 0 ? (
        <p className="m-0 py-2 text-sm text-faint">{t('No tokens yet')}</p>
      ) : (
        <div className="divide-y divide-border">
          {(tokens.data ?? []).map((token) => (
            <Row
              key={token.id}
              title={token.name}
              meta={[
                token.scopes.map((s) => scopeLabels()[s] ?? s).join(', '),
                token.lastUsedAt ? t('Used {time}', { time: timeAgo(token.lastUsedAt) }) : t('Never used'),
                token.expiresAt && t('Expires {date}', { date: new Date(token.expiresAt).toLocaleDateString(locale(), { dateStyle: 'medium' }) }),
              ].filter(Boolean).join(' · ')}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  if (await confirm({ title: t('Revoke “{name}”?', { name: token.name }), description: t('Anything using it stops working immediately.'), confirm: t('Revoke'), danger: true })) {
                    run('tokens/revoke', { id: token.id }).then(() => { invalidate('tokens/'); toast.success(t('Token revoked')) }, toast.error)
                  }
                }}
              >
                {t('Revoke')}
              </Button>
            </Row>
          ))}
        </div>
      )}

      {open && (created ? (
        <Dialog open onOpenChange={(o) => !o && close()} title={t('Copy Your Token')} description={t('It is shown only once.')} footer={<Button variant="primary" onClick={close}>{t('Done')}</Button>}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5 font-mono text-xs">
              <span className="min-w-0 flex-1 break-all">{created}</span>
              <Button size="xs" variant="ghost" icon="copy" onClick={() => void copy(created)}>{t('Copy')}</Button>
            </div>
            <p className="m-0 text-xs text-muted">{t('Send it as')} <code className="font-mono text-text">Authorization: Bearer …</code></p>
          </div>
        </Dialog>
      ) : (
        <FormDialog title={t('New Token')} submit={t('Create Token')} busy={busy} disabled={!values.name.trim()} onSubmit={() => void create()} onClose={close}>
          <Fields fields={tokenFields()} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
        </FormDialog>
      ))}
    </Section>
  )
}
