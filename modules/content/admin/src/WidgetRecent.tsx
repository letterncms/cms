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
        const own = manifest.collections.find((x) => x.handle === e.collection)
        // A built-in page is one of the site's pages, as the Pages screen lists it.
        const c = manifest.collections.find((x) => x.handle === own?.within) ?? own
        const when = e.updatedAt ?? e.publishedAt
        return (
          <WidgetRow
            key={e.id}
            to={`/content/${e.collection}/${e.id}`}
            icon={c?.icon ?? 'file'}
            title={<span className="font-medium">{e.title || t('Untitled')}</span>}
            meta={
              // Columns of fixed width, so every row's collection, status and time line up; a narrow tile leaves the first ones out (a screen reader still hears them).
              // Only hidden below a width: shown, a column keeps its own width, never the width of its words.
              <span className="flex min-w-0 items-center gap-4">
                <span className="w-24 shrink-0 truncate text-faint @max-lg:sr-only">{c?.title}</span>
                <StatusDot status={e.displayStatus} label={statusLabel(e.displayStatus)} className="w-24 shrink-0 @max-md:sr-only" />
                <time dateTime={when ?? undefined} className="w-24 text-right">{when ? timeAgo(when) : null}</time>
              </span>
            }
          />
        )
      })}
    </Widget>
  )
}
