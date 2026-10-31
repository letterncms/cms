import { navigate, t, timeAgo, useAbility, useManifest, type EntrySummary } from '@letterncms/sdk'
import { Button, StatusDot, Widget, WidgetRow, statusLabel } from '@letterncms/ui'

/** Home-screen widget: the entries changed last, across the collections you can view. */
export default function WidgetRecent() {
  const manifest = useManifest()
  const recent = useAbility<EntrySummary[]>('content/recent', { limit: 8 })
  const first = manifest.collections.find((c) => c.can.create)

  return (
    <Widget
      query={recent}
      empty={recent.data?.length === 0 && { icon: 'file', title: t('Nothing edited yet'), action: first && <Button size="sm" icon={first.icon} onClick={() => navigate(`/content/${first.handle}/new`)}>{first.newLabel}</Button> }}
    >
      {recent.data?.map((e) => {
        const c = manifest.collections.find((x) => x.handle === e.collection)
        return (
          <WidgetRow
            key={e.id}
            to={`/content/${e.collection}/${e.id}`}
            icon={c?.icon ?? 'file'}
            title={<span className="font-medium">{e.title || t('Untitled')}</span>}
            meta={
              <span className="flex items-center gap-4">
                <span className="hidden text-faint @lg:inline">{c?.title}</span>
                <StatusDot status={e.displayStatus} label={t(statusLabel(e.displayStatus))} className="hidden w-20 @md:inline-flex" />
                <span className="w-16 text-right">{timeAgo(e.updatedAt)}</span>
              </span>
            }
          />
        )
      })}
    </Widget>
  )
}
