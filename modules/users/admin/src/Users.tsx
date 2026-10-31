import { can, invalidate, locale, navigate, run, t, timeAgo, useAbility, useManifest, type FieldDef, type User } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Avatar, Badge, Button, DataView, Dialog, EmptyState, Fields, IconButton, Menu, Page, Segmented, confirm, toast } from '@letterncms/ui'

type RolesResponse = { roles: Record<string, { label: string; description: string; permissions: string[] }>; permissions: Record<string, { name: string; label: string }[]> }

export default function Users({ params }: { params: Record<string, string> }) {
  const manifest = useManifest()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [kind, setKind] = useState<'team' | 'visitors'>('team')
  const users = useAbility<{ items: User[]; total: number }>('users/list', { search: search || undefined, kind, perPage: 100, page })
  const roles = useAbility<RolesResponse>('roles/list')
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('users/fields')
  const [editing, setEditing] = useState<User | 'new' | null>(params.id === 'new' ? 'new' : null)
  const manage = can('users.manage')

  useEffect(() => {
    if (params.id && params.id !== 'new' && users.data) setEditing(users.data.items.find((u) => u.id === params.id) ?? null)
  }, [params.id, users.data])

  // Role names are written in English by default (Admin, Editor); custom ones show as typed.
  const roleLabel = (r: string) => (roles.data?.roles[r]?.label ? t(roles.data.roles[r].label) : r)
  const items = users.data?.items ?? []

  return (
    <Page
      width="wide"
      crumbs={[{ label: t('Users'), icon: 'users' }]}
      actions={
        <>
          {(can('collections.manage') || manage) && <Menu trigger={<IconButton icon="more" label={t('More')} />} items={[
            can('collections.manage') && { label: t('Profile Fields'), icon: 'field', onSelect: () => navigate('/users/fields') },
            manage && { label: t('Roles'), icon: 'shield', onSelect: () => navigate('/settings/roles') },
          ]} />}
          {manage && <Button variant="primary" icon="user-plus" onClick={() => setEditing('new')}>{t('Invite User')}</Button>}
        </>
      }
    >
      <DataView id="users" label={t('Users')} items={items} source={{ ability: 'users/list', input: { search: search || undefined, kind }, perPage: 100 }} rowKey={(u) => u.id} onRowClick={manage ? (u) => setEditing(u) : undefined}
        pagination={users.data && { page, pages: Math.ceil(users.data.total / 100), total: users.data.total, perPage: 100, onPage: setPage }}
        loading={users.isLoading} error={users.isError} onRetry={() => void users.refetch()}
        toolbar={<span className="flex flex-wrap items-center gap-2">
          <Segmented size="sm" value={kind} onChange={(v) => { setKind(v as 'team' | 'visitors'); setPage(1) }} options={[{ value: 'team', label: t('Team') }, { value: 'visitors', label: t('Visitors') }]} />
          <Fields bare layout="inline" fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: t('Search people…'), className: 'w-64 max-w-full' }]} values={{ search }} onChange={(_, v) => { setSearch(v ?? ''); setPage(1) }} />
        </span>}
        columns={[
          { id: 'name', label: t('Name'), render: (u) => <span className="flex min-w-0 items-center gap-2"><Avatar name={u.name} initials={u.initials} src={u.avatar} size={24} /><span className="truncate">{u.name}</span>{u.id === manifest.user.id && <span className="text-xs text-faint">{t('You')}</span>}</span> },
          { id: 'email', label: t('Email'), width: 'minmax(200px,1fr)', render: (u) => u.email },
          { id: 'roles', label: t('Roles'), width: 'minmax(160px,0.8fr)', render: (u) => <span className="flex flex-wrap items-center gap-1">{u.status === 'suspended' && <Badge tone="danger">{t('Suspended')}</Badge>}{u.super && <Badge>{t('Super Admin')}</Badge>}{u.roles.map((r) => <Badge key={r}>{roleLabel(r)}</Badge>)}</span> },
          { id: 'security', label: t('Security'), width: '90px', render: (u) => u.twoFactor ? <Badge tone="success">{t('2FA')}</Badge> : '—' },
          { id: 'seen', label: t('Last Sign-In'), width: '140px', render: (u) => u.lastLoginAt ? timeAgo(u.lastLoginAt) : t('Never signed in') },
        ]}
        actions={manage ? (u) => u.id !== manifest.user.id ? <Menu
                trigger={<IconButton icon="more" label={t('More')} size="xs" />}
                items={[
                  { label: t('Edit'), icon: 'edit', onSelect: () => setEditing(u) },
                  !u.lastLoginAt && !u.visitor && { label: t('Resend Invitation'), icon: 'mail', onSelect: () => run('users/invite', { id: u.id }).then(() => toast.success(t('Invitation sent')), toast.error) },
                  { label: u.status === 'suspended' ? t('Reactivate') : t('Suspend'), icon: 'shield', onSelect: () => run('users/update', { id: u.id, suspended: u.status !== 'suspended' }).then(() => { invalidate('users/'); toast.success(t('Saved')) }, toast.error) },
                  { separator: true, label: '' },
                  {
                    label: t('Remove User…'),
                    icon: 'trash',
                    danger: true,
                    onSelect: async () => {
                      if (await confirm({ title: t('Remove {name}?', { name: u.name }), description: t('They lose access immediately. Their content stays.'), confirm: t('Remove'), danger: true })) {
                        run('users/delete', { id: u.id }).then(() => { invalidate('users/'); toast.success(t('{name} removed', { name: u.name })) }, toast.error)
                      }
                    },
                  },
                ]}
              /> : null : undefined}
        empty={search ? <EmptyState icon="search" title={t('No matches')} action={<Button onClick={() => setSearch('')}>{t('Clear Search')}</Button>} /> : <EmptyState icon="users" title={t('No users yet')} />}
      />


      {editing && roles.data && profile.data && <UserDialog user={editing === 'new' ? null : editing} roles={roles.data.roles} profile={profile.data.resolvedFields} onClose={() => { setEditing(null); if (params.id) navigate('/users', { replace: true }) }} />}
    </Page>
  )
}

function UserDialog({ user, roles, profile, onClose }: { user: User | null; roles: RolesResponse['roles']; profile: FieldDef[]; onClose: () => void }) {
  const manifest = useManifest()
  const [values, setValues] = useState<Record<string, any>>({ name: user?.name ?? '', email: user?.email ?? '', roles: user?.roles ?? ['editor'], super: user?.super ?? false })
  const [data, setData] = useState<Record<string, any>>(user?.data ?? {})
  const [busy, setBusy] = useState(false)

  // The same field renderer as content and settings.
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half' },
    { handle: 'roles', type: 'select', label: t('Roles'), multiple: true, options: Object.fromEntries(Object.entries(roles).map(([k, r]) => [k, r.label ? t(r.label) : k])) },
    ...(manifest.user.super ? [{ handle: 'super', type: 'toggle', label: t('Super Admin'), instructions: t('Bypasses every permission.') }] : []),
  ]

  const submit = async () => {
    setBusy(true)
    try {
      const { super: superAdmin, ...rest } = values
      const input = { ...rest, data, ...(manifest.user.super ? { super: superAdmin } : {}) }
      if (user) await run('users/update', { id: user.id, ...input })
      else await run('users/create', input)
      invalidate('users/')
      toast.success(user ? t('Saved') : t('Invitation sent to {email}', { email: values.email }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={user ? t('Edit User') : t('Invite User')}
      description={user ? undefined : t('They get an email with a link to set their password. It works for 7 days.')}
      footer={<><Button onClick={onClose}>{t('Cancel')}</Button><Button variant="primary" loading={busy} disabled={!values.name || !values.email} onClick={submit}>{user ? t('Save') : t('Send Invitation')}</Button></>}
    >
      <Fields fields={fields} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      {profile.length > 0 && <Fields className="mt-5 border-t border-border pt-5" fields={profile} values={data} onChange={(h, v) => setData({ ...data, [h]: v })} />}
      {user && <Access id={user.id} />}
    </Dialog>
  )
}

/** What this person holds beyond their roles: the access names pages can be limited to. */
function Access({ id }: { id: string }) {
  const grants = useAbility<{ access: string; source: string; expiresAt: string | null }[]>('users/access', { id })
  const [name, setName] = useState('')
  const manage = can('users.manage')
  const add = () => run('users/grant', { id, access: name.trim() }).then(() => { setName(''); invalidate('users/access') }, toast.error)

  return (
    <section className="mt-5 border-t border-border pt-5">
      <h3 className="m-0 text-sm font-medium text-ink">{t('Access')}</h3>
      <p className="m-0 mt-1 text-xs text-muted">{t('Names pages can be limited to, like magazine. Plugins add them too, for example after a purchase.')}</p>
      {(grants.data ?? []).length > 0 && (
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
          {grants.data!.map((g) => (
            <li key={g.access + g.source} className="flex items-center gap-1">
              <Badge>{g.access}</Badge>
              {g.expiresAt && <span className="text-xs text-faint">{t('until {date}', { date: new Date(g.expiresAt).toLocaleDateString(locale()) })}</span>}
              {manage && <IconButton icon="close" size="xs" label={t('Remove {name}', { name: g.access })} onClick={() => run('users/revoke', { id, access: g.access }).then(() => invalidate('users/access'), toast.error)} />}
            </li>
          ))}
        </ul>
      )}
      {manage && (
        <span className="mt-3 flex items-center gap-2">
          <Fields bare layout="inline" fields={[{ handle: 'access', type: 'text', label: t('Access Name'), size: 'sm', placeholder: t('Access name'), className: 'w-48 max-w-full' }]} values={{ access: name }} onChange={(_, v) => setName(v ?? '')} />
          <Button size="sm" disabled={name.trim() === ''} onClick={add}>{t('Add')}</Button>
        </span>
      )}
    </section>
  )
}
