import { plural, t, useAbility, type FieldProps } from '@letterncms/sdk'
import { useState } from 'react'
import { Badge, Button, Checkbox, Dialog, Fields, Icon, Spinner, confirm, cn } from '@letterncms/ui'

type Role = { label: string; description: string; permissions: string[] }
type Roles = Record<string, Role>
type Permission = { name: string; label: string; description: string; trusted?: boolean }
type Permissions = Record<string, Permission[]>

const pattern = (p: string) => new RegExp('^' + p.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$')

/** Wildcard grant check, same rules as the server. */
function grants(perms: string[], name: string): boolean {
  return perms.some((p) => p === '*' || p === name || pattern(p).test(name))
}

/** What a collection's entries allow, as the columns of one table. */
const ACTIONS = ['view', 'create', 'edit', 'publish', 'delete'] as const
const collectionOf = (perms: Permission[]) => {
  const handle = perms[0]?.name.match(/^entries\.([^.]+)\./)?.[1]
  return handle && perms.every((p) => p.name.startsWith(`entries.${handle}.`) && (ACTIONS as readonly string[]).includes(p.name.split('.')[2])) ? handle : null
}

/**
 * Roles and what each may do (the `roles` value of the `roles` settings): the roles
 * first, the selected one's permissions beside them — collections as one table.
 */
export function RolesField({ value, onChange, disabled }: FieldProps<Roles | null>) {
  const known = useAbility<{ permissions: Permissions; people?: Record<string, number> }>('roles/list')
  const roles = value ?? {}
  const [active, setActive] = useState<string>(Object.keys(roles)[0] ?? 'admin')
  const [adding, setAdding] = useState(false)

  if (!known.data) return <div className="grid h-24 place-items-center text-faint"><Spinner /></div>
  const key = roles[active] ? active : Object.keys(roles)[0]
  const role = roles[key]
  if (!role) return null

  const all = Object.values(known.data.permissions).flat().map((p) => p.name)
  const set = (next: Role) => onChange({ ...roles, [key]: next })
  const toggle = (perm: string, on: boolean) => {
    if (on) return set({ ...role, permissions: grants(role.permissions, perm) ? role.permissions : [...role.permissions, perm] })
    // Off for one of what a wildcard grants: the wildcard becomes the rest of what it granted.
    const next = role.permissions.flatMap((p) => (p === perm ? [] : p.includes('*') && pattern(p).test(perm) ? all.filter((n) => n !== perm && pattern(p).test(n)) : [p]))
    set({ ...role, permissions: [...new Set(next)] })
  }

  const groups = Object.entries(known.data.permissions)
  const collections = groups.filter(([, perms]) => collectionOf(perms))
  // Each group is headed like every section of the admin.
  const head = 'm-0 mb-3 text-base font-semibold text-ink'
  const people = known.data.people ?? {}

  // A permission to give only to people you trust says so with a badge, not a sentence.
  const section = ([group, perms]: [string, Permission[]]) => (
    <div key={group} className="mb-6">
      <h3 className={head}>{group}</h3>
      <div className="grid gap-2">
        {perms.map((p) => (
          <Checkbox key={p.name} checked={grants(role.permissions, p.name)} onChange={(on) => toggle(p.name, on)} label={
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{p.label}</span>
              {p.trusted && <Badge tone="warning">{t('Trusted Only')}</Badge>}
              {p.description && <span className="text-xs text-muted">{p.description}</span>}
            </span>
          } />
        ))}
      </div>
    </div>
  )

  return (
    <div className={cn('grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]', disabled && 'pointer-events-none opacity-60')}>
      {/* The roles lie on a strip of desk; the one on view is a slip of paper on it, as in the sidebar. */}
      <div className="space-y-px self-start rounded-lg bg-surface p-1 md:sticky md:top-16">
        {Object.entries(roles).map(([k, r]) => (
          <button key={k} type="button" aria-current={k === key || undefined} onClick={() => setActive(k)} className={cn('flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors duration-120', k === key ? 'bg-bg font-medium text-ink shadow-raise' : 'text-muted hover:bg-hover hover:text-text')}>
            <span className="flex-1 truncate">{r.label}</span>
            {/* How many people hold it, not how many rules it has. */}
            {(people[k] ?? 0) > 0 && <span className="text-xs tabular-nums text-faint" title={plural(people[k], '{count} person', '{count} people')}>{people[k]}</span>}
          </button>
        ))}
        <button type="button" onClick={() => setAdding(true)} className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-left text-sm text-muted hover:bg-hover hover:text-text">
          <Icon name="plus" size={14} />
          {t('New Role')}
        </button>
      </div>

      <div className="min-w-0">
        <Fields className="mb-6" fields={[{ handle: 'label', type: 'text', label: t('Name'), width: 'half' }, { handle: 'description', type: 'text', label: t('Description') }]} values={role} onChange={(h, v) => set({ ...role, [h]: v ?? '' })} />
        {role.permissions.includes('*') ? (
          <p className="text-sm text-muted">{t('This role has every permission.')}</p>
        ) : (
          <>
            {groups.map((group, i) => !collectionOf(group[1]) ? section(group) : i === groups.findIndex(([, p]) => collectionOf(p)) && (
              <div key="collections" role="table" aria-label={t('Collections')} className="mb-6">
                <div role="row" className={cn(head, 'mb-1 grid grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-end gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]')}>
                  <span role="columnheader">{t('Collections')}</span>
                  {ACTIONS.map((action) => <span key={action} role="columnheader" className="truncate text-center text-xs font-medium text-muted">{collections[0][1].find((p) => p.name.endsWith(`.${action}`))?.label ?? action}</span>)}
                </div>
                <div role="rowgroup">
                  {collections.map(([group, perms]) => (
                    <div key={group} role="row" className="grid min-h-8 grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-center gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]">
                      <span role="rowheader" className="truncate text-sm">{group}</span>
                      {ACTIONS.map((action) => {
                        const perm = perms.find((p) => p.name.endsWith(`.${action}`))
                        return (
                          <span key={action} role="cell" className="grid place-items-center">
                            {perm && <Checkbox checked={grants(role.permissions, perm.name)} onChange={(on) => toggle(perm.name, on)} label={<span className="sr-only">{`${perm.label}: ${group}`}</span>} />}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        {key !== 'admin' && (
          <Button
            variant="ghost"
            icon="trash"
            onClick={async () => {
              if (await confirm({ title: t('Delete the “{name}” role?', { name: role.label }), description: t('People with this role lose its permissions when you save.'), confirm: t('Delete Role'), danger: true })) {
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
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={t('New Role')} footer={<><Button onClick={onClose}>{t('Cancel')}</Button><Button variant="primary" type="submit" form="new-role" disabled={!handle}>{t('Create Role')}</Button></>}>
      <form id="new-role" onSubmit={(e) => { e.preventDefault(); if (handle) onCreate(handle, label) }}>
        <Fields fields={[{ handle: 'label', type: 'text', label: t('Name'), placeholder: t('Client Editor'), autofocus: true, instructions: handle ? t('Handle: {handle}', { handle }) : undefined }]} values={{ label }} onChange={(_, v) => setLabel(v ?? '')} />
      </form>
    </Dialog>
  )
}
