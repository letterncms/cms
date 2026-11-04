import { can, invalidate, loadManifest, locale, navigate, panelsFor, registry, run, t, timeAgo, useAbility, useManifest, useTab, type FieldDef, type User } from '@letterncms/sdk'
import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Avatar, Badge, Button, DataView, Dialog, EmptyState, Fields, NoMatches, FieldsEditor, IconButton, Page, Spinner, SaveBar, Tabs, confirm, toast, type RawField } from '@letterncms/ui'

type RolesResponse = { roles: Record<string, { label: string; description: string; permissions: string[] }>; permissions: Record<string, { name: string; label: string }[]> }

type Tab = 'team' | 'visitors' | 'sign-up' | 'fields'

/** Where visitors sign up and in: the `accounts` settings, kept here as the Sign-Up tab. */
const ACCOUNTS = 'accounts'

/** People: the team, the site's visitors with an account, how visitors sign up, and the fields every profile has. */
export default function Users({ params }: { params: Record<string, string> }) {
  const manifest = useManifest()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const signUp = can('settings.manage')
  const [tab, setTab] = useTab<Tab>(['team', 'visitors', ...(signUp ? ['sign-up' as const] : []), ...(can('collections.manage') ? ['fields' as const] : [])])
  const list = tab === 'team' || tab === 'visitors'
  const kind = tab === 'visitors' ? 'visitors' : 'team'
  const users = useAbility<{ items: User[]; total: number }>('users/list', { search: search || undefined, kind, perPage: 100, page }, { enabled: list })
  const roles = useAbility<RolesResponse>('roles/list')
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('users/fields')
  const [editing, setEditing] = useState<User | 'new' | null>(params.id === 'new' ? 'new' : null)
  const manage = can('users.manage')
  const fields = useProfileFields(tab === 'fields')
  const accounts = useSignUp(signUp && tab === 'sign-up')

  useEffect(() => {
    if (params.id && params.id !== 'new' && users.data) setEditing(users.data.items.find((u) => u.id === params.id) ?? null)
  }, [params.id, users.data])

  // Role names are written in English by default (Admin, Editor); custom ones show as typed.
  const roleLabel = (r: string) => (roles.data?.roles[r]?.label ? t(roles.data.roles[r].label) : r)
  const items = users.data?.items ?? []
  const switchTab = (next: Tab) => { setTab(next); setSearch(''); setPage(1) }

  return (
    <Page
      width="wide"
      crumbs={[{ label: t('Users'), icon: 'users' }]}
      actions={manage && tab === 'team' && <Button variant="primary" icon="user-plus" onClick={() => setEditing('new')}>{t('Invite User')}</Button>}
    >
      <Tabs id="users-tabs" className="mb-6" value={tab} onChange={switchTab} tabs={[
        { value: 'team', label: t('Team') },
        { value: 'visitors', label: t('Visitors') },
        ...(signUp ? [{ value: 'sign-up' as const, label: t('Sign-Up'), indicator: accounts.dirty }] : []),
        ...(can('collections.manage') ? [{ value: 'fields' as const, label: t('Profile Fields'), indicator: fields.dirty }] : []),
      ]} />
      {accounts.body}
      {fields.body}
      {list && (
      <DataView id="users" label={t('Users')} items={items} source={{ ability: 'users/list', input: { search: search || undefined, kind }, perPage: 100 }} rowKey={(u) => u.id} onRowClick={manage ? (u) => setEditing(u) : undefined}
        pagination={users.data && { page, pages: Math.ceil(users.data.total / 100), total: users.data.total, perPage: 100, onPage: setPage }}
        loading={users.isLoading} error={users.isError} onRetry={() => void users.refetch()}
        toolbar={<Fields bare layout="inline" fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: t('Search people…'), className: 'w-64 max-w-full' }]} values={{ search }} onChange={(_, v) => { setSearch(v ?? ''); setPage(1) }} />}
        columns={[
          { id: 'name', label: t('Name'), render: (u) => <span className="flex min-w-0 items-center gap-2"><Avatar name={u.name} initials={u.initials} src={u.avatar} size={24} /><span className="truncate">{u.name}</span>{u.id === manifest.user.id && <span className="text-xs text-faint">{t('You')}</span>}</span> },
          { id: 'email', label: t('Email'), width: 'minmax(200px,1fr)', render: (u) => u.email },
          { id: 'roles', label: t('Roles'), width: 'minmax(160px,0.8fr)', render: (u) => <span className="flex flex-wrap items-center gap-1">{u.status === 'suspended' && <Badge tone="danger">{t('Suspended')}</Badge>}{u.super && <Badge>{t('Super Admin')}</Badge>}{u.roles.map((r) => <Badge key={r}>{roleLabel(r)}</Badge>)}</span> },
          { id: 'two-factor', label: t('Two-Factor'), width: '100px', render: (u) => u.twoFactor ? <Badge tone="success">{t('Two-Factor')}</Badge> : <span className="text-faint">—</span> },
          { id: 'seen', label: t('Last Sign-In'), width: '140px', render: (u) => u.lastLoginAt ? timeAgo(u.lastLoginAt) : t('Never signed in') },
        ]}
        empty={search ? <NoMatches onClear={() => setSearch('')} /> : <EmptyState icon="users" title={tab === 'visitors' ? t('No visitors yet') : t('No users yet')} />}
      />
      )}

      {editing && roles.data && profile.data && <UserDialog user={editing === 'new' ? null : editing} roles={roles.data.roles} profile={profile.data.resolvedFields} onClose={() => { setEditing(null); if (params.id) navigate('/users', { replace: true }) }} />}
    </Page>
  )
}

/**
 * The Sign-Up tab: the visitor accounts settings, in the same form and save bar as every
 * settings page. Once opened it stays, hidden, so its changes wait while another tab is on view.
 */
function useSignUp(active: boolean): { body: ReactNode; dirty: boolean } {
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const Form = panelsFor<{ namespace: string; onDirty?: (dirty: boolean) => void }>('screen.settings', { namespace: ACCOUNTS })[0]?.component
  const [opened, setOpened] = useState(false)
  const [dirty, setDirty] = useState(false)
  if (active && !opened) setOpened(true)
  return {
    dirty,
    body: opened && Form && (
      <div id="users-tabs-sign-up-panel" role="tabpanel" aria-labelledby="users-tabs-sign-up" hidden={!active}>
        <Suspense fallback={<div className="grid place-items-center py-10 text-faint"><Spinner /></div>}>
          <Form namespace={ACCOUNTS} onDirty={setDirty} />
        </Suspense>
      </div>
    ),
  }
}

/** The Profile Fields tab: the fields every profile has, in the same editor as collections. Saved from the bar. */
function useProfileFields(active: boolean): { body: ReactNode; dirty: boolean } {
  const source = useAbility<{ fields: RawField[] }>('users/fields', {}, { refetchOnWindowFocus: false })
  const [fields, setFields] = useState<RawField[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const busy = useRef(false)
  // Changed and changed back is no change.
  const dirty = fields !== null && JSON.stringify(fields) !== JSON.stringify(source.data?.fields ?? [])

  const save = async () => {
    if (!fields || !dirty || busy.current) return
    busy.current = true
    setSaving(true)
    setFailed(null)
    try {
      await run('users/fields-save', { fields })
      invalidate('users/')
      await loadManifest()
      setFields(null)
    } catch (e) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
      busy.current = false
    }
  }

  return {
    dirty,
    // The save bar stays while the changes wait, on whichever tab is on view.
    body: (
      <>
        {active && (!source.data ? <div className="grid place-items-center py-10 text-faint"><Spinner /></div> : (
          <div className="mx-auto w-full max-w-[760px] pb-24">
            <FieldsEditor fields={fields ?? source.data.fields ?? []} onChange={setFields} builtIn={t('Name, email and roles are built in.')} />
          </div>
        ))}
        <SaveBar dirty={dirty} saving={saving} error={failed} onSave={() => void save()} onDiscard={() => { setFields(null); setFailed(null) }} />
      </>
    ),
  }
}

function UserDialog({ user, roles, profile, onClose }: { user: User | null; roles: RolesResponse['roles']; profile: FieldDef[]; onClose: () => void }) {
  const manifest = useManifest()
  const self = user?.id === manifest.user.id
  // A visitor keeps the roles of a visitor; everyone else, and everyone invited, those that open the admin.
  const visitor = !!user?.visitor
  const team = (r: RolesResponse['roles'][string]) => r.permissions.some((p) => p === '*' || p === 'admin.access' || p === 'admin.*')
  const offered = Object.entries(roles).filter(([k, r]) => team(r) !== visitor || user?.roles.includes(k))
  const [values, setValues] = useState<Record<string, any>>({ name: user?.name ?? '', email: user?.email ?? '', roles: user?.roles ?? ['editor'], super: user?.super ?? false })
  const [data, setData] = useState<Record<string, any>>(user?.data ?? {})
  // Access names added or taken away here wait for Save, like everything else in the dialog.
  const [access, setAccess] = useState<{ add: string[]; remove: string[] }>({ add: [], remove: [] })
  const [busy, setBusy] = useState<'save' | 'suspend' | 'invite' | 'remove' | null>(null)
  const manage = can('users.manage')
  const others = !!user && manage && !self

  // The same field renderer as content and settings. Nobody takes away their own way in: another admin does that.
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half' },
    ...(self ? [] : [{ handle: 'roles', type: 'select', label: t('Roles'), multiple: true, options: Object.fromEntries(offered.map(([k, r]) => [k, r.label ? t(r.label) : k])) }]),
    ...(manifest.user.super && !self && !visitor ? [{ handle: 'super', type: 'toggle', label: t('Super Admin'), instructions: t('Bypasses every permission.') }] : []),
  ]

  const submit = async () => {
    setBusy('save')
    try {
      const { super: superAdmin, roles: chosen, ...rest } = values
      const input = { ...rest, data, ...(self ? {} : { roles: chosen }), ...(manifest.user.super && !self && !visitor ? { super: superAdmin } : {}) }
      if (user) {
        await run('users/update', { id: user.id, ...input })
        for (const name of access.remove) await run('users/revoke', { id: user.id, access: name })
        for (const name of access.add) await run('users/grant', { id: user.id, access: name })
      } else await run('users/create', input)
      invalidate('users/')
      toast.success(user ? t('Saved') : t('Invitation sent to {email}', { email: values.email }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const suspend = async (u: User) => {
    setBusy('suspend')
    try {
      await run('users/update', { id: u.id, suspended: u.status !== 'suspended' })
      invalidate('users/')
      toast.success(u.status === 'suspended' ? t('{name} reactivated', { name: u.name }) : t('{name} suspended', { name: u.name }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const invite = async (u: User) => {
    setBusy('invite')
    try {
      await run('users/invite', { id: u.id })
      toast.success(t('Invitation sent'))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const remove = async (u: User) => {
    if (!(await confirm({ title: t('Remove {name}?', { name: u.name }), description: t('They lose access immediately. Their content stays.'), confirm: t('Remove User'), danger: true }))) return
    setBusy('remove')
    try {
      await run('users/delete', { id: u.id })
      invalidate('users/')
      toast.success(t('{name} removed', { name: u.name }))
      onClose()
    } catch (e) {
      toast.error(e)
      setBusy(null)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={user ? t('Edit User') : t('Invite User')}
      description={user ? undefined : t('They get an email to set a password.')}
      footer={<>
        {others && user && <>
          <Button variant="ghost" className="mr-auto text-danger! max-sm:mr-0" loading={busy === 'remove'} disabled={!!busy} onClick={() => void remove(user)}>{t('Remove User')}</Button>
          <Button loading={busy === 'suspend'} disabled={!!busy} onClick={() => void suspend(user)}>{user.status === 'suspended' ? t('Reactivate') : t('Suspend')}</Button>
          {!user.lastLoginAt && !visitor && <Button loading={busy === 'invite'} disabled={!!busy} onClick={() => void invite(user)}>{t('Resend Invitation')}</Button>}
        </>}
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button variant="primary" loading={busy === 'save'} disabled={!values.name || !values.email || (!!busy && busy !== 'save')} onClick={() => void submit()}>{user ? t('Save') : t('Send Invitation')}</Button>
      </>}
    >
      <Fields fields={fields} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      {profile.length > 0 && <Fields className="mt-5 border-t border-border pt-5" fields={profile} values={data} onChange={(h, v) => setData({ ...data, [h]: v })} />}
      {user && <Access id={user.id} value={access} onChange={setAccess} />}
    </Dialog>
  )
}

/**
 * What this person holds beyond their roles: the access names pages can be limited to.
 * Added and removed names are staged; the dialog's Save applies them.
 */
function Access({ id, value, onChange }: { id: string; value: { add: string[]; remove: string[] }; onChange: (next: { add: string[]; remove: string[] }) => void }) {
  const grants = useAbility<{ access: string; source: string; expiresAt: string | null }[]>('users/access', { id })
  const [name, setName] = useState('')
  const manage = can('users.manage')
  const held = (grants.data ?? []).filter((g) => !value.remove.includes(g.access))
  const shown = [...held, ...value.add.filter((a) => !held.some((g) => g.access === a)).map((access) => ({ access, source: 'new', expiresAt: null }))]
  const add = () => {
    const next = name.trim()
    if (!next) return
    setName('')
    if (value.remove.includes(next)) onChange({ ...value, remove: value.remove.filter((r) => r !== next) })
    else if (!shown.some((g) => g.access === next)) onChange({ ...value, add: [...value.add, next] })
  }
  const take = (access: string) => value.add.includes(access)
    ? onChange({ ...value, add: value.add.filter((a) => a !== access) })
    : onChange({ ...value, remove: [...value.remove, access] })

  return (
    <section className="mt-5 border-t border-border pt-5">
      <h3 className="m-0 text-sm font-medium text-text">{t('Access')}</h3>
      {shown.length > 0 && (
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
          {shown.map((g) => (
            <li key={g.access + g.source} className="flex items-center gap-1">
              <Badge>{g.access}</Badge>
              {g.expiresAt && <span className="text-xs text-faint">{t('until {date}', { date: new Date(g.expiresAt).toLocaleDateString(locale()) })}</span>}
              {manage && <IconButton icon="close" size="xs" label={t('Remove {name}', { name: g.access })} onClick={() => take(g.access)} />}
            </li>
          ))}
        </ul>
      )}
      {manage && (
        <form className="mt-2 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); add() }}>
          <Fields bare layout="inline" className="w-48 max-w-full" fields={[{ handle: 'access', type: 'text', label: t('Access Name'), size: 'sm', placeholder: t('magazine') }]} values={{ access: name }} onChange={(_, v) => setName(v ?? '')} />
          <Button size="sm" type="submit" disabled={name.trim() === ''}>{t('Add')}</Button>
        </form>
      )}
    </section>
  )
}
