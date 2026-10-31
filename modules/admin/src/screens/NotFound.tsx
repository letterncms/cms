import { navigate, t } from '@letterncms/sdk'
import { Button, EmptyState, Page } from '../ui'

export function NotFound() {
  return (
    <Page crumbs={[{ label: t('Not Found') }]}>
      <EmptyState
        icon="question"
        title={t('Page not found')}
        description={t('It may have moved, or the plugin that adds it is turned off.')}
        action={
          <Button size="sm" onClick={() => navigate('/')}>
            {t('Go Home')}
          </Button>
        }
        className="min-h-[50vh]"
      />
    </Page>
  )
}
