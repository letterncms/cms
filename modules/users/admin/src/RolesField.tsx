import { plural, t, useAbility, type FieldProps } from '@letterncms/sdk'
import { useState } from 'react'
import { Badge, Button, Checkbox, Dialog, Fields, List, Row, SectionHeading, Spinner, confirm, cn } from '@letterncms/ui'

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
  const people = known.data.people ?? {}

  // A permission to give only to people you trust says so with a badge, not a sentence.
  const section = ([group, perms]: [string, Permission[]]) => (
    <section key={group} className="mb-8">
      <SectionHeading as="h3" title={group} />
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
    </section>
  )

  return (
    <div className={cn('grid gap-8', disabled && 'pointer-events-none opacity-60')}>
      {/* One column: the roles, as the kit's list (the one on view is the selected row, with how many people hold it), then that role. */}
      <div>
        <List>
          {Object.entries(roles).map(([k, r]) => (
            <Row key={k} selected={k === key} onClick={() => setActive(k)}>
              <span className={cn('min-w-0 flex-1 truncate', k === key && 'font-medium text-ink')}>{r.label}</span>
              {(people[k] ?? 0) > 0 && <span className="shrink-0 text-xs tabular-nums text-faint">{plural(people[k], '{count} person', '{count} people')}</span>}
            </Row>
          ))}
        </List>
        <Button variant="ghost" icon="plus" className="mt-2" onClick={() => setAdding(true)}>{t('New Role')}</Button>
      </div>

      <div className="min-w-0">
        <Fields className="mb-6" fields={[{ handle: 'label', type: 'text', label: t('Name') }, { handle: 'description', type: 'textarea', label: t('Description'), rows: 2 }]} values={role} onChange={(h, v) => set({ ...role, [h]: v ?? '' })} />
        {/* A role that may do everything lists nothing to tick. */}
        {!role.permissions.includes('*') && (
          <>
            {groups.map((group, i) => !collectionOf(group[1]) ? section(group) : i === groups.findIndex(([, p]) => collectionOf(p)) && (
              <div key="collections" role="table" aria-label={t('Collections')} className="mb-8">
                <div role="row" className={cn('m-0 mb-1 grid min-h-7 text-base font-semibold text-ink grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-end gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]')}>
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
            variant="destructive"
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
    <Dialog open onOpenChange={(o) => !o && onClose()} size="sm" title={t('New Role')} submitLabel={t('Create Role')} submitDisabled={!handle} onSubmit={() => onCreate(handle, label)}>
      <Fields fields={[{ handle: 'label', type: 'text', label: t('Name'), placeholder: t('Client Editor'), autofocus: true, instructions: handle ? t('Handle: {handle}', { handle }) : undefined }]} values={{ label }} onChange={(_, v) => setLabel(v ?? '')} />
    </Dialog>
  )
}
