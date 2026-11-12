import { boot, brand, navigate, request, t, CmsError, type FieldDef } from '@letterncms/sdk'
import { useState, type FormEvent, type ReactNode } from 'react'
import { BrandMark } from '../../app/Brand'
import { Button, Fields, Notice } from '../../ui'

type Mode = 'login' | 'two-factor' | 'forgot' | 'reset'

export function AuthScreen({ path, onAuthenticated }: { path: string; onAuthenticated: () => void }) {
  const params = new URLSearchParams(window.location.search)
  const [mode, setMode] = useState<Mode>(path.startsWith('/reset') && params.get('token') ? 'reset' : 'login')

  return (
    <div className="flex min-h-screen flex-col bg-sunken">
      {/* From one height on every step, like the installer: the mark and the heading stay put from step to step. */}
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col px-5 pb-16 pt-[14vh]">
        <div className="mb-8 flex items-center gap-2.5">
          <BrandMark size={24} />
          <span className="text-sm font-semibold tracking-[-0.01em] text-ink">{boot.site.name}</span>
        </div>
        {mode === 'login' && <Login onDone={onAuthenticated} onTwoFactor={() => setMode('two-factor')} onForgot={() => setMode('forgot')} />}
        {mode === 'two-factor' && <TwoFactor onDone={onAuthenticated} onBack={() => setMode('login')} />}
        {mode === 'forgot' && <Forgot onBack={() => setMode('login')} />}
        {mode === 'reset' && (
          <Reset
            token={params.get('token') ?? ''}
            email={params.get('email') ?? ''}
            invite={params.get('invite') === '1'}
            onDone={() => {
              navigate('/', { replace: true })
              setMode('login')
            }}
          />
        )}
      </div>
      <p className="pb-6 text-center text-xs text-faint">{brand().name} {boot.version}</p>
    </div>
  )
}

function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="m-0 text-xl font-semibold tracking-[-0.015em] text-ink">{title}</h1>
      {children && <p className="m-0 mt-1 text-sm text-muted">{children}</p>}
    </div>
  )
}

function useSubmit() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<CmsError | null>(null)
  const submit = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof CmsError ? e : new CmsError(String(e)))
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, submit }
}

function ErrorNote({ error }: { error: CmsError | null }) {
  if (!error) return null
  const detail = Object.values(error.details)[0]
  return <Notice tone="danger">{detail && error.type === 'invalid_input' ? detail : error.message}</Notice>
}

// Sign-in forms are fields too: drawn by Fields before there is a manifest.
const loginFields = (): FieldDef[] => [
  // Plain fields, both: an icon in one and not the other sets their words 22px apart.
  { handle: 'email', type: 'text', label: t('Email'), size: 'lg', inputmode: 'email', autocomplete: 'username', autofocus: true },
  { handle: 'password', type: 'text', label: t('Password'), secret: true, size: 'lg', autocomplete: 'current-password' },
  { handle: 'remember', type: 'toggle', label: t('Keep Me Signed In'), display: 'checkbox' },
]

function Login({ onDone, onTwoFactor, onForgot }: { onDone: () => void; onTwoFactor: () => void; onForgot: () => void }) {
  const [values, setValues] = useState<Record<string, any>>({ email: '', password: '', remember: true })
  const { busy, error, submit } = useSubmit()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit(async () => {
      const res = await request<{ twoFactor?: boolean }>('POST', 'auth/login', values)
      res.twoFactor ? onTwoFactor() : onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Heading title={t('Sign In')} />
      <Fields fields={loginFields()} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      <ErrorNote error={error} />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
        {t('Sign In')}
      </Button>
      <Button variant="ghost" size="lg" className="w-full font-normal text-muted" onClick={onForgot}>
        {t('Reset Password')}
      </Button>
    </form>
  )
}

function TwoFactor({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [code, setCode] = useState('')
  const { busy, error, submit } = useSubmit()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(async () => {
          await request('POST', 'auth/two-factor', { code })
          onDone()
        })
      }}
      className="space-y-4"
    >
      <Heading title={t('Two-Factor Code')}>{t('Enter the 6-digit code from your authenticator app, or a recovery code.')}</Heading>
      <Fields bare fields={[{ handle: 'code', type: 'text', label: t('Code'), size: 'lg', mono: true, inputmode: 'numeric', autocomplete: 'one-time-code', placeholder: '123 456', autofocus: true }]} values={{ code }} onChange={(_, v) => setCode(v ?? '')} />
      <ErrorNote error={error} />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
        {t('Verify Code')}
      </Button>
      <Button variant="ghost" size="lg" className="w-full font-normal text-muted" onClick={onBack}>
        {t('Back to Sign In')}
      </Button>
    </form>
  )
}

function Forgot({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { busy, error, submit } = useSubmit()

  return sent ? (
    <div>
      <Heading title={t('Check Your Inbox')}>{t('If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.', { email })}</Heading>
      <Button size="lg" className="w-full" onClick={onBack}>
        {t('Back to Sign In')}
      </Button>
    </div>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(async () => {
          await request('POST', 'auth/forgot', { email })
          setSent(true)
        })
      }}
      className="space-y-4"
    >
      <Heading title={t('Reset Password')} />
      <Fields fields={[{ handle: 'email', type: 'text', label: t('Email'), size: 'lg', inputmode: 'email', autocomplete: 'username', autofocus: true }]} values={{ email }} onChange={(_, v) => setEmail(v ?? '')} />
      <ErrorNote error={error} />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
        {t('Send Reset Link')}
      </Button>
      <Button variant="ghost" size="lg" className="w-full font-normal text-muted" onClick={onBack}>
        {t('Back to Sign In')}
      </Button>
    </form>
  )
}

function Reset({ token, email, invite, onDone }: { token: string; email: string; invite: boolean; onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const { busy, error, submit } = useSubmit()

  return done ? (
    <div>
      <Heading title={t('Password Saved')}>{t('You can sign in with your new password.')}</Heading>
      <Button variant="primary" size="lg" className="w-full" onClick={onDone}>
        {t('Continue to Sign In')}
      </Button>
    </div>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(async () => {
          await request('POST', 'auth/reset', { token, email, password, invite })
          setDone(true)
        })
      }}
      className="space-y-4"
    >
      <Heading title={invite ? t('Welcome') : t('Choose a New Password')}>{email}</Heading>
      <Fields fields={[{ handle: 'password', type: 'text', label: t('New Password'), secret: true, size: 'lg', autocomplete: 'new-password', autofocus: true }]} values={{ password }} onChange={(_, v) => setPassword(v ?? '')} />
      <ErrorNote error={error} />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
        {t('Save Password')}
      </Button>
      <Button variant="ghost" size="lg" className="w-full font-normal text-muted" onClick={onDone}>
        {t('Back to Sign In')}
      </Button>
    </form>
  )
}
