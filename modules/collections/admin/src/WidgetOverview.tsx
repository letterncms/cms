import { can, navigate, plural, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Button, Widget, WidgetRow, compactNumber } from '@letterncms/ui'

interface Overview {
  handle: string
  title: string
  singular: string
  icon: string
  total: number
  drafts: number
  updatedAt: string | null
}

/** Home-screen widget: each collection you can view, with its entries and drafts. */
export default function WidgetOverview() {
  const overview = useAbility<Overview[]>('collections/overview')
  const manage = can('collections.manage')

  return (
    <Widget
      action={manage && { label: t('Manage'), to: '/collections' }}
      query={overview}
      empty={overview.data?.length === 0 && { icon: 'collection', title: t('No collections yet'), action: manage && <Button size="sm" icon="plus" onClick={() => navigate('/collections/new')}>{t('New Collection')}</Button> }}
    >
      {overview.data?.slice(0, 8).map((c) => (
        <WidgetRow
          key={c.handle}
          to={`/content/${c.handle}`}
          icon={c.icon}
          title={<span className="font-medium">{c.title}</span>}
          meta={
            <span className="flex items-center gap-4">
              {c.updatedAt && <span className="hidden @md:inline">{t('Changed {time}', { time: timeAgo(c.updatedAt) })}</span>}
              {c.drafts > 0 && <span>{plural(c.drafts, '{count} draft', '{count} drafts')}</span>}
              <span className="min-w-6 text-right text-sm text-text">{compactNumber(c.total)}</span>
            </span>
          }
        />
      ))}
    </Widget>
  )
}
