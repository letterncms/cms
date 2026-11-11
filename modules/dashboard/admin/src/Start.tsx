import { can, invalidate, Link, run, t, useAbility } from '@letterncms/sdk'
import { Button, Icon, List, Section, toast } from '@letterncms/ui'

interface Step { id: string; label: string; to: string; done: boolean }

/**
 * The guided start, above the widgets of a new site and as wide as they are: its first steps in one column, each a verb that
 * leads to the real screen. It draws nothing once every step is done or someone hid it, and nothing
 * while it loads: most days there is nothing to show.
 */
export function Start() {
  const start = useAbility<{ steps: Step[]; open: boolean }>('dashboard-start/get')
  if (!start.data?.open) return null

  const hide = async () => {
    try {
      await run('dashboard-start/update', { dismissed: true })
      invalidate('dashboard-start/')
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <Section className="mb-8" title={t('Get Started')} actions={<>
      {/* How far along, quietly: a count, no bar. */}
      <span className="text-xs tabular-nums text-faint">{t('{done} of {total}', { done: start.data.steps.filter((step) => step.done).length, total: start.data.steps.length })}</span>
      {can('settings.manage') && <Button variant="ghost" onClick={() => void hide()}>{t('Hide')}</Button>}
    </>}>
      <List>
        {start.data.steps.map((step) => (
          <div key={step.id} role="listitem" className="flex min-h-11 items-center gap-3 px-3 text-sm">
            <Icon name={step.done ? 'check-circle' : 'circle'} size={16} className={step.done ? 'shrink-0 text-success' : 'shrink-0 text-faint'} />
            {step.done ? (
              <span className="min-w-0 flex-1 truncate text-muted">{step.label}</span>
            ) : (
              <Link to={step.to} className="cms-touch -my-px flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-sm font-medium text-ink no-underline -outline-offset-2 hover:underline">
                <span className="min-w-0 flex-1 truncate">{step.label}</span>
                <Icon name="chevron-right" size={14} className="shrink-0 text-faint" />
              </Link>
            )}
          </div>
        ))}
      </List>
    </Section>
  )
}
