import { loadManifest, navigate, queryClient, run, setManifest, t } from '@letterncms/sdk'
import { toast } from './toast'

export interface SwitchableKit { handle: string; name: string }

/**
 * Make the site another kit (the `kits/switch` ability), from wherever the switch is offered: the site is saved first, so the
 * toast can take it back. `fresh` is the kit as it came. Everything on screen is of the old site, so the admin starts over at
 * the dashboard once it is done (unless `home` is off: the screen that offers the switch is the kits'). Resolves with whether the site changed.
 */
export async function switchKit(kit: SwitchableKit, { fresh = false, home = true }: { fresh?: boolean; home?: boolean } = {}): Promise<boolean> {
  const id = toast.loading(fresh ? t('Starting {name} over…', { name: kit.name }) : t('Switching to {name}…', { name: kit.name }))

  try {
    const result = await run<{ switched: boolean; saved?: { handle: string; name: string } }>('kits/switch', { handle: kit.handle, fresh })
    await queryClient.invalidateQueries()
    setManifest(await loadManifest())
    home && navigate('/')
    toast.success(fresh ? t('{name} started over', { name: kit.name }) : t('Switched to {name}', { name: kit.name }), {
      id,
      description: result.saved ? t('{name} is saved as you left it.', { name: result.saved.name }) : undefined,
      action: result.saved && !fresh ? { label: t('Undo'), onClick: () => void switchKit({ handle: result.saved!.handle, name: result.saved!.name }, { home }) } : undefined,
    })

    return result.switched
  } catch (e) {
    toast.error(e, { id })

    return false
  }
}
