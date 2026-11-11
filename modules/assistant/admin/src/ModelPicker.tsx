import { getManifest, setPreference, t, useAbility, type ComposerPanelProps } from '@letterncms/sdk'
import { Button, Icon, Menu, Skeleton } from '@letterncms/ui'
import { useEffect } from 'react'
import { answering } from './sources'

interface Model {
  id: string
  name: string
  description: string
}

interface Status {
  configured: boolean
  /** The default from Settings → Assistant. */
  model: string
  models: Model[]
}

const PREFERENCE = 'assistant.model'

/** New threads start with the person's last pick, while it is still offered; otherwise with the default. */
function preferred(status: Status): string {
  const saved = getManifest().user.preferences?.[PREFERENCE]
  return status.models.some((m) => m.id === saved) ? (saved as string) : status.model
}

/**
 * Which model the next message runs on, in the composer. A change applies from the next message and
 * stays with the thread; a thread saved with a model no longer offered falls back to the default.
 */
export function ModelPicker({ thread, agent, state, options, setOption, loading }: ComposerPanelProps) {
  const ready = answering(agent)
  const status = useAbility<Status>('assistant/status', {}, { staleTime: 60_000, enabled: ready })
  const models = status.data?.models ?? []
  const offered = (id: unknown): id is string => typeof id === 'string' && models.some((m) => m.id === id)
  const value = offered(options.model) ? options.model : offered(state?.model) ? state.model : !status.data ? undefined : thread ? status.data.model : preferred(status.data)
  const current = models.find((m) => m.id === value)
  // A new thread sends the pick it starts with.
  const start = !thread && options.model === undefined ? current?.id : undefined
  useEffect(() => { if (start) setOption('model', start) }, [start, setOption])
  if (!ready || loading) return null
  // The picker's place holds while the models load: the composer's foot doesn't jump when they arrive.
  if (status.isLoading) return <span className="flex h-7 items-center px-2" aria-hidden="true"><Skeleton className="h-3 w-20" /></span>
  if (!current) return null
  return (
    <Menu
      side="top"
      align="start"
      className="w-72"
      trigger={
        <Button variant="ghost" aria-label={t('Model: {name}', { name: current.name })} className="min-w-0 shrink !gap-1 !pl-2 !pr-1.5 !text-xs !font-normal !text-muted hover:!text-text data-[popup-open]:bg-hover data-[popup-open]:!text-text">
          <span className="truncate">{current.name}</span>
          <Icon name="chevron-down" size={12} className="shrink-0 text-faint" />
        </Button>
      }
      items={[
        { label: t('Model'), heading: true },
        ...models.map((m) => ({ label: m.name, description: m.description, checked: m.id === current.id, onSelect: () => { if (m.id !== current.id) { setOption('model', m.id); void setPreference(PREFERENCE, m.id).catch(() => {}) } } })),
      ]}
    />
  )
}
