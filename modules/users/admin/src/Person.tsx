import { can, invalidate, locale, navigate, run, t, useAbility, useManifest, type FieldDef, type SurfaceComponentProps, type User } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Badge, Button, Dialog, Fields, IconButton, confirm, toast } from '@letterncms/ui'

type RolesResponse = { roles: Record<string, { label: string; description: string; permissions: string[] }>; permissions: Record<string, { name: string; label: string }[]> }

/**
 * One person, in the dialog that edits them: from a row of Users (`user`), by address (`id`, or
 * `new` to invite someone), or from the Invite User button (neither). Closing it from an address
 * leads back to the list.
 */
export default function Person({ props, close }: SurfaceComponentProps<{ id?: string | null; user?: User }>) {
  const id = props.user ? undefined : props.id && props.id !== 'new' ? props.id : undefined
  const roles = useAbility<RolesResponse>('roles/list')
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('users/fields')
  const loaded = useAbility<User>('users/get', { id }, { enabled: !!id })
  const done = close ?? (() => navigate('/users', { replace: true }))
  // Someone who isn't there (any more): back to the list.
  useEffect(() => { if (loaded.isError) done() }, [loaded.isError])
  const user = props.user ?? (id ? loaded.data : null)
  if (!roles.data || !profile.data || user === undefined) return null
  return <UserDialog user={user} roles={roles.data.roles} profile={profile.data.resolvedFields} onClose={done} />
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
          <Button variant="destructive" className="mr-auto max-sm:mr-0" loading={busy === 'remove'} disabled={!!busy} onClick={() => void remove(user)}>{t('Remove User')}</Button>
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
