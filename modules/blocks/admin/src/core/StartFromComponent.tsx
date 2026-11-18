import { t, useAbility } from '@letterncms/sdk'
import { Dialog, PagePreview, Pressable } from '@letterncms/ui'
import { componentPage, type ComponentDef } from './Inserter'

/** The category of components a new page can start from (Components::PAGES). */
export const PAGE_COMPONENTS = 'Pages'

/** The whole pages to start from: components of the category Pages that are not synced, so the page gets a copy. */
export function usePageComponents(enabled: boolean): ComponentDef[] {
  const list = useAbility<ComponentDef[]>('components/list', { category: PAGE_COMPONENTS, synced: false }, { enabled, staleTime: 60_000 })
  return enabled ? list.data ?? [] : []
}

/** An empty page's choice of a whole page to start from: a copy of its blocks, to change from there. Blank is what it already is. */
export function StartFromComponent({ open, onOpenChange, components, onChoose }: { open: boolean; onOpenChange: (open: boolean) => void; components: ComponentDef[]; onChoose: (component: ComponentDef) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title={t('Start From a Component')}>
      <div className="grid gap-4 sm:grid-cols-2">
        {components.map((component) => (
          <Pressable key={component.handle} onClick={() => onChoose(component)} className="block min-w-0 rounded-md p-1 text-left hover:bg-hover">
            <PagePreview src={componentPage(component.handle)} maxHeight={280} whole />
            <span className="mt-2 block truncate text-sm font-medium text-text">{component.title}</span>
            {component.description && <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{component.description}</span>}
          </Pressable>
        ))}
      </div>
    </Dialog>
  )
}
