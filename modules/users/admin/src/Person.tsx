import { can, invalidate, locale, navigate, run, t, useAbility, useManifest, type FieldDef, type SurfaceComponentProps, type User } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Button, Dialog, Field, Fields, IconButton, Input, List, Row, Skeleton, confirm, toast } from '@letterncms/ui'

type RolesResponse = { roles: Record<string, { label: string; description: string; permissions: string[] }>; permissions: Record<string, { name: string; label: string }[]> }

/**
 * One person, in the dialog that edits them: from a row of Users (`user`), by address (`id`, or
 * `new` to invite someone), or from the Invite User button (neither). Closing it from an address
 * leads back to the list.
 */
export default function Person({ props, close }: SurfaceComponentProps<{ id?: string | null; user?: User }>) {
  const id = props.user ? undefined : props.id && props.id !== 'new' ? props.id : undefined
  const roles = useAbility<RolesResponse>('roles/list')
  const profile = useAbility<{ resolvedFields: FieldDef[] }>('user-fields/get')
  const loaded = useAbility<User>('users/get', { id }, { enabled: !!id })
  const done = close ?? (() => navigate('/users', { replace: true }))
  // Someone who isn't there (any more): back to the list.
  useEffect(() => { if (loaded.isError) done() }, [loaded.isError])
  const user = props.user ?? (id ? loaded.data : null)
  // Its fields are on their way: the dialog is there at once, in the shape of what is coming.
  if (!roles.data || !profile.data || user === undefined) return (
    <Dialog open onOpenChange={(o) => !o && done()} title={props.user || id ? t('Edit User') : t('Invite User')}>
      <div className="grid gap-4" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
        <Skeleton className="h-14" />
      </div>
    </Dialog>
  )
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
  const [access, setAccess] = useState<Staged>({ add: [], remove: [] })
  const [busy, setBusy] = useState<'save' | 'suspend' | 'invite' | 'remove' | null>(null)
  const manage = can('users.manage')
  const others = !!user && manage && !self

  // The same field renderer as content and settings. Nobody takes away their own way in: another admin does that.
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), required: true, width: 'half' },
    { handle: 'email', type: 'email', label: t('Email'), required: true, width: 'half' },
    ...(self ? [] : [{ handle: 'roles', type: 'select', label: t('Roles'), multiple: true, options: Object.fromEntries(offered.map(([k, r]) => [k, r.label ? t(r.label) : k])) }]),
    ...(manifest.user.super && !self && !visitor ? [{ handle: 'super', type: 'toggle', label: t('Super Admin') }] : []),
  ]

  const submit = async () => {
    setBusy('save')
    try {
      const { super: superAdmin, roles: chosen, ...rest } = values
      const input = { ...rest, data, ...(self ? {} : { roles: chosen }), ...(manifest.user.super && !self && !visitor ? { super: superAdmin } : {}) }
      if (user) {
        await run('users/update', { id: user.id, ...input })
        // One grant at a time: what another source gave under the same name stays.
        for (const grant of access.remove) await run('users/revoke', { id: user.id, access: grant.access, source: grant.source })
        for (const name of access.add) await run('users/grant', { id: user.id, access: name })
      } else await run('users/create', input)
      invalidate('users/', 'people/')
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
      invalidate('users/', 'people/')
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
    if (!(await confirm({ title: t('Delete {name}?', { name: u.name }), description: t('They lose access immediately. Their content stays.'), confirm: t('Delete User'), danger: true }))) return
    setBusy('remove')
    try {
      await run('users/delete', { id: u.id })
      invalidate('users/', 'people/')
      toast.success(t('{name} deleted', { name: u.name }))
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
      onSubmit={() => void submit()}
      submitLabel={user ? t('Save') : t('Send Invitation')}
      submitDisabled={!values.name || !values.email || (!!busy && busy !== 'save')}
      busy={busy === 'save'}
    >
      <Fields fields={fields} values={values} onChange={(h, v) => setValues({ ...values, [h]: v })} />
      {profile.length > 0 && <Fields className="mt-5 border-t border-border pt-5" fields={profile} values={data} onChange={(h, v) => setData({ ...data, [h]: v })} />}
      {user && <Access id={user.id} value={access} onChange={setAccess} />}
      {/* What can be done with the person, apart from the form: what ends the account last. */}
      {others && user && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pb-1 pt-5">
          <Button loading={busy === 'suspend'} disabled={!!busy} onClick={() => void suspend(user)}>{user.status === 'suspended' ? t('Reactivate') : t('Suspend')}</Button>
          {!user.lastLoginAt && !visitor && <Button loading={busy === 'invite'} disabled={!!busy} onClick={() => void invite(user)}>{t('Resend Invitation')}</Button>}
          <Button variant="destructive" icon="trash" className="sm:ml-auto" loading={busy === 'remove'} disabled={!!busy} onClick={() => void remove(user)}>{t('Delete User')}</Button>
        </div>
      )}
    </Dialog>
  )
}

interface Grant { access: string; source: string; expiresAt: string | null }
interface Staged { add: string[]; remove: { access: string; source: string }[] }

/**
 * What this person holds beyond their roles: the access names pages can be limited to, each as it was given,
 * by whom (a plugin's order, say) and until when. Taking one away takes that grant only; adding and taking
 * away wait for the dialog's Save like everything else in it.
 */
function Access({ id, value, onChange }: { id: string; value: Staged; onChange: (next: Staged) => void }) {
  const grants = useAbility<Grant[]>('users/access', { id })
  const [name, setName] = useState('')
  const manage = can('users.manage')
  const gone = (g: Grant) => value.remove.some((r) => r.access === g.access && r.source === g.source)
  const held = (grants.data ?? []).filter((g) => !gone(g))
  const add = () => {
    const next = name.trim()
    if (!next) return
    setName('')
    if (!held.some((g) => g.access === next && g.source === 'admin') && !value.add.includes(next)) onChange({ ...value, add: [...value.add, next] })
  }
  if (!grants.data || (!manage && held.length === 0)) return null

  // Who gave it, in words: "shop:order-7" is Shop. What was given here by hand says nothing.
  const giver = (source: string) => source === 'admin' ? '' : source.split(/[:/]/)[0].replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="mt-5 grid gap-3">
      {(held.length > 0 || value.add.length > 0) && (
        <Field label={t('Page Access')}>
          <List>
            {held.map((g) => (
              <Row key={`${g.access}:${g.source}`} actions={manage && <IconButton icon="close" label={t('Remove {name}', { name: g.access })} onClick={() => onChange({ ...value, remove: [...value.remove, { access: g.access, source: g.source }] })} />}>
                <span className="min-w-0 truncate font-medium">{g.access}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted">{[giver(g.source), g.expiresAt && t('until {date}', { date: new Date(g.expiresAt).toLocaleDateString(locale()) })].filter(Boolean).join(' · ')}</span>
              </Row>
            ))}
            {value.add.map((access) => (
              <Row key={`new:${access}`} actions={<IconButton icon="close" label={t('Remove {name}', { name: access })} onClick={() => onChange({ ...value, add: value.add.filter((a) => a !== access) })} />}>
                <span className="min-w-0 flex-1 truncate font-medium">{access}</span>
              </Row>
            ))}
          </List>
        </Field>
      )}
      {manage && (
        <Field label={held.length > 0 || value.add.length > 0 ? t('Access Name') : t('Page Access')} htmlFor="person-access">
          <div className="flex items-center gap-2">
            <Input id="person-access" className="min-w-0 flex-1" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
            <Button size="md" disabled={name.trim() === ''} onClick={add}>{t('Add Access')}</Button>
          </div>
        </Field>
      )}
    </div>
  )
}
