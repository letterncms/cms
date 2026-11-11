import { navigate, t } from '@letterncms/sdk'
import { Button, NotFoundState, Page } from '../ui'

export function NotFound() {
  return (
    <Page crumbs={[{ label: t('Not Found') }]}>
      <NotFoundState action={<Button onClick={() => navigate('/')}>{t('Go to Dashboard')}</Button>} />
    </Page>
  )
}
