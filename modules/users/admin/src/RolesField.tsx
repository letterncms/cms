import { t, useAbility, type FieldProps } from '@letterncms/sdk'
import { useState } from 'react'
import { Button, Dialog, Fields, Icon, Spinner, confirm, cn } from '@letterncms/ui'

type Role = { label: string; description: string; permissions: string[] }
type Roles = Record<string, Role>
type Permissions = Record<string, { name: string; label: string; description: string }[]>

/** Wildcard grant check, same rules as the server. */
function grants(perms: string[], name: string): boolean {
  return perms.some((p) => p === '*' || p === name || new RegExp('^' + p.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$').test(name))
}

/**
 * Roles and what each may do (the `roles` value of the `roles` settings):
 * the roles on the left, the selected one's permissions on the right.
 */
export function RolesField({ value, onChange, disabled }: FieldProps<Roles | null>) {
  const known = useAbility<{ permissions: Permissions }>('roles/list')
  const roles = value ?? {}
  const [active, setActive] = useState<string>(Object.keys(roles)[0] ?? 'admin')
  const [adding, setAdding] = useState(false)

  if (!known.data) return <div className="grid h-24 place-items-center text-faint"><Spinner /></div>
  const key = roles[active] ? active : Object.keys(roles)[0]
  const role = roles[key]
  if (!role) return null

  const set = (next: Role) => onChange({ ...roles, [key]: next })
  const toggle = (perm: string, on: boolean) => {
    const current = role.permissions.filter((p) => p !== perm)
    set({ ...role, permissions: on ? [...current, perm] : current })
  }

  return (
    <div className={cn('grid grid-cols-[160px_1fr] gap-6', disabled && 'pointer-events-none opacity-60')}>
      <div className="space-y-px">
        {Object.entries(roles).map(([k, r]) => (
          <button key={k} type="button" onClick={() => setActive(k)} className={cn('flex h-8 w-full items-center rounded-sm px-2 text-left text-sm', k === key ? 'bg-active font-medium text-ink' : 'text-muted hover:bg-hover')}>
            <span className="flex-1 truncate">{r.label}</span>
            <span className="text-xs tabular-nums text-faint">{r.permissions.includes('*') ? t('All') : r.permissions.length}</span>
          </button>
        ))}
        <button type="button" onClick={() => setAdding(true)} className="flex h-8 w-full items-center gap-1.5 rounded-sm px-2 text-left text-sm text-muted hover:bg-hover hover:text-text">
          <Icon name="plus" size={14} />
          {t('New Role')}
        </button>
      </div>

      <div className="min-w-0">
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Fields className="col-span-2" fields={[{ handle: 'label', type: 'text', label: t('Name'), width: 'half' }, { handle: 'description', type: 'textarea', label: t('Description'), rows: 1, width: 'half' }]} values={role} onChange={(h, v) => set({ ...role, [h]: v ?? '' })} />
        </div>
        {role.permissions.includes('*') ? (
          <p className="text-sm text-muted">{t('This role has every permission.')}</p>
        ) : (
          Object.entries(known.data.permissions).map(([group, perms]) => (
            <div key={group} className="mb-6">
              <h3 className="m-0 mb-2 border-b border-border pb-1.5 text-sm font-semibold">{group}</h3>
              <Fields
                className="!gap-y-2"
                // Short labels (a collection's View, Edit, Publish…) share a row; long ones get their own.
                fields={perms.map((p) => ({ handle: p.name, type: 'toggle', label: p.label, instructions: p.description || undefined, display: 'checkbox', width: perms.every((q) => q.label.length <= 12 && !q.description) ? ('third' as const) : ('full' as const) }))}
                values={Object.fromEntries(perms.map((p) => [p.name, grants(role.permissions, p.name)]))}
                onChange={(name, on) => toggle(name, !!on)}
              />
            </div>
          ))
        )}
        {key !== 'admin' && (
          <Button
            variant="ghost"
            className="text-danger"
            onClick={async () => {
              if (await confirm({ title: t('Delete the “{name}” role?', { name: role.label }), description: t('People with this role lose its permissions when you save.'), confirm: t('Delete'), danger: true })) {
                const { [key]: _removed, ...rest } = roles
                onChange(rest)
                setActive(Object.keys(rest)[0])
              }
            }}
          >
            {t('Delete Role')}
          </Button>
        )}
      </div>

      {adding && (
        <NewRole
          onClose={() => setAdding(false)}
          onCreate={(handle, label) => {
            onChange({ ...roles, [handle]: { label, description: '', permissions: ['admin.access'] } })
            setActive(handle)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}

function NewRole({ onClose, onCreate }: { onClose: () => void; onCreate: (handle: string, label: string) => void }) {
  const [label, setLabel] = useState('')
  const handle = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={t('New Role')} footer={<><Button onClick={onClose}>{t('Cancel')}</Button><Button variant="primary" disabled={!handle} onClick={() => onCreate(handle, label)}>{t('Create')}</Button></>}>
      <Fields fields={[{ handle: 'label', type: 'text', label: t('Name'), placeholder: t('Client Editor'), autofocus: true, instructions: handle ? t('Handle: {handle}', { handle }) : undefined }]} values={{ label }} onChange={(_, v) => setLabel(v ?? '')} />
    </Dialog>
  )
}
