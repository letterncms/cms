import { can, navigate, run, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, DataView, EmptyState, Page, toast } from '@letterncms/ui'

interface Screen {
  handle: string
  label: string
  path: string | null
  id: string | null
  status: 'default' | 'draft' | 'customised' | 'conflict'
}

/** Every public account page, with the ones nobody customised yet: those aren't entries until someone does. */
export default function AccountPages() {
  const screens = useAbility<Screen[]>('accounts/screens')
  const items = screens.data ?? []
  const status: Record<Screen['status'], [string, 'neutral' | 'info' | 'success' | 'warning']> = {
    default: [t('Standard'), 'neutral'],
    draft: [t('Draft'), 'info'],
    customised: [t('Customised'), 'success'],
    conflict: [t('A page has this address'), 'warning'],
  }
  const edit = (screen: Screen) => run<{ id: string }>('accounts/screen-customise', { handle: screen.handle }).then(({ id }) => navigate(`/content/screens/${id}`), toast.error)

  return (
    <Page width="wide" crumbs={[{ label: t('Account Pages'), icon: 'user' }]}>
      <DataView id="account-pages" label={t('Account Pages')} items={items} dates={() => ({ publishedAt: null, updatedAt: null })} rowKey={(s) => s.handle} onRowClick={can('entries.screens.create') ? edit : undefined}
        loading={screens.isLoading} error={screens.isError} onRetry={() => void screens.refetch()}
        columns={[
          { id: 'label', label: t('Page'), render: (s) => s.label },
          { id: 'path', label: t('Address'), width: 'minmax(160px,0.6fr)', render: (s) => s.path ?? <span className="text-faint">{t('Shown inside other pages')}</span> },
          { id: 'status', label: t('Status'), width: '200px', render: (s) => <Badge tone={status[s.status][1]}>{status[s.status][0]}</Badge> },
        ]}
        actions={can('entries.screens.create') ? (s) => <Button size="xs" onClick={() => edit(s)}>{s.id ? t('Edit') : t('Customise')}</Button> : undefined}
        empty={<EmptyState icon="user" title={t('No account pages')} />}
      />
    </Page>
  )
}
