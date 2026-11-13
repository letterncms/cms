import { loadManifest, navigate, queryClient, run, setManifest, t } from '@letterncms/sdk'
import { toast } from './toast'

export interface SwitchableSite { handle: string; name: string }

/**
 * Make the site another site (the `sites/switch` ability), from wherever the switch is offered: the site is saved first, so the
 * toast can take it back. `fresh` is the site as it came. Everything on screen is of the old site, so the admin starts over at
 * the dashboard once it is done (unless `home` is off: the screen that offers the switch is the sites'). Resolves with whether the site changed.
 */
export async function switchSite(site: SwitchableSite, { fresh = false, home = true }: { fresh?: boolean; home?: boolean } = {}): Promise<boolean> {
  const id = toast.loading(fresh ? t('Starting {name} over…', { name: site.name }) : t('Switching to {name}…', { name: site.name }))

  try {
    const result = await run<{ switched: boolean; saved?: { handle: string; name: string } }>('sites/switch', { handle: site.handle, fresh })
    await queryClient.invalidateQueries()
    setManifest(await loadManifest())
    home && navigate('/')
    toast.success(fresh ? t('{name} started over', { name: site.name }) : t('Switched to {name}', { name: site.name }), {
      id,
      description: result.saved ? t('{name} is saved as you left it.', { name: result.saved.name }) : undefined,
      action: result.saved && !fresh ? { label: t('Undo'), onClick: () => void switchSite({ handle: result.saved!.handle, name: result.saved!.name }, { home }) } : undefined,
    })

    return result.switched
  } catch (e) {
    toast.error(e, { id })

    return false
  }
}
