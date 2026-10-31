import { invalidate, languages, loadManifest, locale, panelsFor, plural, registry, run, t, timeAgo, useAbility, useAction, useManifest, type FieldDef } from '@letterncms/sdk'
import qrcode from 'qrcode-generator'
import { useState, useSyncExternalStore } from 'react'
import { Avatar, Badge, Button, Dialog, Fields, Page, Section, confirm, toast } from '@letterncms/ui'
import { getThemePreference, setThemePreference, type ThemePreference } from '@letterncms/ui'

/**
 * The signed-in person's account: a header, then the sections registered in the
 * `account.sections` slot — core's (profile, password, two-factor, appearance,
 * tokens) the same way as plugins' (the MCP plugin's "Connect an AI Agent").
 */
export default function Account() {
  const manifest = useManifest()
  const user = manifest.user
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)

  return (
    <Page width="narrow" crumbs={[{ label: t('Account'), icon: 'user' }]}>
      <div className="mb-10 flex items-center gap-4">
        <Avatar name={user.name} initials={user.initials} src={user.avatar} size={56} />
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">{user.name}</h1>
          <p className="m-0 text-sm text-muted">{user.email}</p>
        </div>
      </div>
      {panelsFor('account.sections', {}).map(({ id, component: Part }) => <Part key={id} />)}
    </Page>
  )
}

export function Profile() {
  const { user } = useManifest()
  // Name and email, then the site's profile fields (content/users.yaml) — all drawn as fields.
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('users/fields')
  const [values, setValues] = useState<Record<string, any>>({ name: user.name, email: user.email, currentPassword: '' })
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [busy, setBusy] = useState(false)
  const emailChanged = values.email !== user.email
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half' },
    ...(emailChanged ? [{ handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, width: 'half' as const, instructions: t('Needed to change your email.') }] : []),
  ]

  const save = async () => {
    setBusy(true)
    try {
      await run('account/update', { name: values.name, email: values.email, ...(data ? { data } : {}), ...(emailChanged ? { currentPassword: values.currentPassword } : {}) })
      await loadManifest()
      setData(null)
      setValues((v) => ({ ...v, currentPassword: '' }))
      toast.success(t('Profile saved'))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title={t('Profile')}>
      <Fields className="pt-2" fields={fields} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      {(profile.data?.resolvedFields ?? []).length > 0 && <Fields className="mt-5" fields={profile.data!.resolvedFields} values={data ?? user.data ?? {}} onChange={(h, v) => setData({ ...(data ?? user.data ?? {}), [h]: v })} />}
      <div className="mt-4"><Button variant="primary" disabled={values.name === user.name && !emailChanged && !data} loading={busy} onClick={save}>{t('Save Profile')}</Button></div>
    </Section>
  )
}

export function Password() {
  const passwordFields: FieldDef[] = [
    { handle: 'currentPassword', type: 'text', label: t('Current Password'), secret: true, width: 'half' },
    { handle: 'password', type: 'text', label: t('New Password'), secret: true, width: 'half', instructions: t('At least 10 characters, with letters and numbers.') },
  ]
  const [values, setValues] = useState({ currentPassword: '', password: '' })
  const [busy, setBusy] = useState(false)
  return (
    <Section title={t('Password')}>
      <Fields className="pt-2" fields={passwordFields} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      <div className="mt-4">
        <Button
          variant="primary"
          disabled={!values.currentPassword || values.password.length < 10}
          loading={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await run('account/update', values)
              setValues({ currentPassword: '', password: '' })
              toast.success(t('Password changed'))
            } catch (e) {
              toast.error(e)
            } finally {
              setBusy(false)
            }
          }}
        >
          {t('Change Password')}
        </Button>
      </div>
    </Section>
  )
}

export function TwoFactor() {
  const enabled = useManifest().user.twoFactor
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null)
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState<string[] | null>(null)
  const [disabling, setDisabling] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const qr = (() => {
    if (!setup) return ''
    const q = qrcode(0, 'M')
    q.addData(setup.uri)
    q.make()
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true })
  })()

  return (
    <Section title={t('Two-Factor Authentication')} description={t('Sign-in also asks for a code from an authenticator app.')} actions={enabled ? <Badge tone="success">{t('On')}</Badge> : <Badge>{t('Off')}</Badge>}>
      {enabled ? (
        <Button className="mt-2" onClick={() => setDisabling(true)}>{t('Turn Off')}</Button>
      ) : (
        <Button className="mt-2" icon="shield" onClick={async () => setSetup(await run('account/two-factor-setup'))}>{t('Set Up Two-Factor')}</Button>
      )}

      <Dialog
        open={!!setup && !recovery}
        onOpenChange={(o) => !o && setSetup(null)}
        title={t('Scan with Your Authenticator App')}
        description={t('Then enter the 6-digit code it shows.')}
        size="sm"
        footer={
          <Button
            variant="primary"
            loading={busy}
            disabled={code.replace(/\D/g, '').length !== 6}
            onClick={async () => {
              setBusy(true)
              try {
                const res = await run<{ recoveryCodes: string[] }>('account/two-factor-confirm', { code })
                setRecovery(res.recoveryCodes)
                await loadManifest()
              } catch (e) {
                toast.error(e)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t('Verify and Turn On')}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="mx-auto size-44 rounded-lg bg-white p-3 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="m-0 break-all text-center font-mono text-xs text-faint">{setup?.secret}</p>
          <Fields bare fields={[{ handle: 'code', type: 'text', label: t('Code'), placeholder: '123 456', max: 7 }]} values={{ code }} onChange={(_, v) => setCode(v ?? '')} />
        </div>
      </Dialog>

      <Dialog
        open={disabling}
        onOpenChange={(o) => { setDisabling(o); setPassword('') }}
        title={t('Turn off two-factor authentication?')}
        size="sm"
        footer={
          <Button
            variant="primary"
            loading={busy}
            disabled={!password}
            onClick={async () => {
              setBusy(true)
              try {
                await run('account/two-factor-disable', { password })
                await loadManifest()
                setDisabling(false)
                setPassword('')
                toast.success(t('Two-factor authentication is off'))
              } catch (e) {
                toast.error(e)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t('Turn Off')}
          </Button>
        }
      >
        <Fields fields={[{ handle: 'password', type: 'text', label: t('Your Password'), secret: true }]} values={{ password }} onChange={(_, v) => setPassword(v ?? '')} />
      </Dialog>

      <Dialog open={!!recovery} onOpenChange={() => { setRecovery(null); setSetup(null) }} title={t('Save Your Recovery Codes')} description={t('Each works once if you lose your device. They are not shown again.')} size="sm" footer={<Button variant="primary" onClick={() => { setRecovery(null); setSetup(null) }}>{t('I saved them')}</Button>}>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-sunken p-4 font-mono text-sm">{recovery?.map((c) => <span key={c}>{c}</span>)}</div>
      </Dialog>
    </Section>
  )
}

export function Appearance() {
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference())
  const manifest = useManifest()
  const language = useAction('account/update', { onSuccess: () => window.location.reload(), onError: toast.error })
  // Empty: follow the admin's default language (Settings → Admin).
  const options = [{ value: '', label: t('Admin Default') }, ...Object.entries(languages()).map(([value, label]) => ({ value, label }))]
  return (
    <Section title={t('Appearance')}>
      <Fields
        className="pt-2"
        fields={[
          { handle: 'theme', type: 'select', label: t('Theme'), display: 'segmented', required: true, options: { system: t('System'), light: t('Light'), dark: t('Dark') } },
          { handle: 'locale', type: 'select', label: t('Language'), required: true, options, width: 'half' },
        ]}
        values={{ theme, locale: manifest.user.locale ?? '' }}
        onChange={(handle, value) => {
          if (handle === 'locale') return language.mutate({ locale: value || null })
          setThemePreference(value)
          setTheme(value)
        }}
      />
    </Section>
  )
}

/** What a token may do, by its scope. */
const scopeLabels = (): Record<string, string> => ({ '*': t('Everything you can do'), read: t('Read Only'), 'entries/*': t('Content Only') })

const tokenFields = (): FieldDef[] => [
  { handle: 'name', type: 'text', label: t('Name'), required: true, placeholder: 'Claude Desktop' },
  { handle: 'scopes', type: 'select', label: t('Access'), multiple: true, options: scopeLabels() },
  { handle: 'expires', type: 'select', label: t('Expires'), display: 'segmented', required: true, options: { '30': plural(30, '{count} day', '{count} days'), '90': plural(90, '{count} day', '{count} days'), '365': t('1 year'), never: t('Never') } },
]
const newToken = { name: '', scopes: ['*'], expires: '90' }

export function Tokens() {
  const tokens = useAbility<{ id: string; name: string; scopes: string[]; lastUsedAt: string | null; expiresAt: string | null; createdAt: string }[]>('tokens/list')
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, any>>(newToken)
  const [created, setCreated] = useState<string | null>(null)

  return (
    <Section title={t('API Tokens')} description={t('For the REST API, MCP clients and scripts. A token acts as you.')} actions={<Button size="sm" icon="plus" onClick={() => setOpen(true)}>{t('New Token')}</Button>}>
      {tokens.isLoading ? null : (tokens.data ?? []).length === 0 ? (
        <p className="m-0 py-3 text-sm text-faint">{t('No tokens yet')}</p>
      ) : (
        <div className="divide-y divide-border">
          {(tokens.data ?? []).map((token) => (
            <div key={token.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{token.name}</div>
                <div className="text-xs text-faint">
                  {[
                    token.scopes.map((s) => scopeLabels()[s] ?? s).join(', '),
                    token.lastUsedAt ? t('Used {time}', { time: timeAgo(token.lastUsedAt) }) : t('Never used'),
                    token.expiresAt && t('Expires {date}', { date: new Date(token.expiresAt).toLocaleDateString(locale(), { dateStyle: 'medium' }) }),
                  ].filter(Boolean).join(' · ')}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={async () => {
                  if (await confirm({ title: t('Revoke “{name}”?', { name: token.name }), description: t('Anything using it stops working immediately.'), confirm: t('Revoke'), danger: true })) {
                    run('tokens/revoke', { id: token.id }).then(() => invalidate('tokens/'), toast.error)
                  }
                }}
              >
                {t('Revoke')}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) { setCreated(null); setValues(newToken) } }}
        title={created ? t('Copy Your Token') : t('New API Token')}
        description={created ? t('It is shown only once.') : undefined}
        footer={
          created ? (
            <Button variant="primary" onClick={() => { setOpen(false); setCreated(null); setValues(newToken) }}>{t('Done')}</Button>
          ) : (
            <Button
              variant="primary"
              disabled={!values.name || values.scopes.length === 0}
              onClick={async () => {
                try {
                  const res = await run<{ token: string }>('tokens/create', { name: values.name, scopes: values.scopes, expiresInDays: values.expires === 'never' ? null : Number(values.expires) })
                  setCreated(res.token)
                  invalidate('tokens/')
                } catch (e) {
                  toast.error(e)
                }
              }}
            >
              {t('Create Token')}
            </Button>
          )
        }
      >
        {created ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-sm bg-sunken p-3 font-mono text-xs">
              <span className="flex-1 break-all">{created}</span>
              <Button size="xs" icon="copy" onClick={() => navigator.clipboard.writeText(created).then(() => toast.success(t('Copied')))}>{t('Copy')}</Button>
            </div>
            <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-muted">{t('Header')}</dt>
              <dd className="m-0 truncate font-mono text-text">Authorization: Bearer …</dd>
              <dt className="text-muted">MCP</dt>
              <dd className="m-0 truncate font-mono text-text">{window.location.origin}/mcp</dd>
            </dl>
          </div>
        ) : (
          <Fields fields={tokenFields()} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
        )}
      </Dialog>
    </Section>
  )
}
