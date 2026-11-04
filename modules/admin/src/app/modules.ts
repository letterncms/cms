import { queryClient, registerAs, registry, reregister, t, unregister, type Manifest, type Registrations } from '@letterncms/sdk'
import { toast } from '../ui'
import { viewRoute } from '../ui/view/View'

type Module = Manifest['modules'][number]

/** Modules on the page right now (by id, with the url they came from). */
const loaded = new Map<string, string>()
/** What modules that were turned off had registered: an ES module runs once per page, so turning one on again puts this back. */
const parked = new Map<string, { url: string; registrations: Registrations }>()

function preload(url: string) {
  if (document.querySelector(`link[rel="modulepreload"][href="${CSS.escape(url)}"]`)) return
  const link = document.createElement('link')
  link.rel = 'modulepreload'
  link.href = url
  document.head.append(link)
}

/**
 * Bring the admin in line with the manifest: load the modules of packages that
 * were turned on and take back what turned-off ones registered (routes, fields,
 * panels, widgets, commands, icons) along with their stylesheets. Runs at boot
 * and whenever the manifest is fetched again, so nothing needs a reload.
 *
 * Modules are fetched in parallel but run one at a time, so everything a module
 * registers is attributed to it. A failing one is reported, never fatal.
 */
export async function syncModules(manifest: Manifest) {
  const wanted = new Map(manifest.modules.map((m) => [m.id, m]))

  for (const [id] of loaded) {
    if (wanted.get(id)?.url === loaded.get(id)) continue
    parked.set(id, { url: loaded.get(id)!, registrations: unregister(id) })
    loaded.delete(id)
  }

  const added = manifest.modules.filter((m) => !loaded.has(m.id))
  added.forEach((m) => parked.get(m.id)?.url !== m.url && preload(m.url))

  const failed: Module[] = []
  for (const m of added) {
    const back = parked.get(m.id)
    loaded.set(m.id, m.url)
    if (back?.url === m.url) {
      reregister(m.id, back.registrations)
      parked.delete(m.id)
      continue
    }
    try {
      await registerAs(m.id, async () => {
        const mod = await import(/* @vite-ignore */ m.url)
        if (typeof mod.default === 'function') await mod.default()
      })
    } catch (error) {
      console.error(`[cms] module ${m.id} failed`, error)
      failed.push(m)
    }
  }

  syncStyles(manifest.styles)
  await syncViews(manifest)
  return failed
}

/** The routes of views, after the modules': a place drawn from data takes its path from any screen still registered there. */
async function syncViews(manifest: Manifest) {
  unregister(VIEWS)
  await registerAs(VIEWS, () => {
    for (const view of manifest.views ?? []) registry.routes.set(view.path, viewRoute(view.id, view.path, { private: view.private }))
  })
}

const VIEWS = 'cms.views'

/** Module stylesheets: link the new ones, unlink those of modules that left. */
function syncStyles(styles: string[]) {
  const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][data-cms-module]')]
  const have = new Set(links.map((l) => l.getAttribute('href')))
  for (const href of styles) {
    if (have.has(href)) continue
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.cmsModule = ''
    document.head.append(link)
  }
  for (const link of links) if (!styles.includes(link.getAttribute('href') ?? '')) link.remove()
}

let queue: Promise<unknown> = Promise.resolve()

/** Follow manifest changes after boot: modules come and go, cached data is refreshed. */
export function followManifest(manifest: Manifest) {
  queue = queue.then(async () => {
    const before = [...loaded.keys()].join()
    const failed = await syncModules(manifest)
    // A module left or arrived: what other screens show may depend on it (widgets, panels, field types).
    if ([...loaded.keys()].join() !== before) void queryClient.invalidateQueries()
    // A module that cannot run without a fresh page (e.g. it needs an import the page does not have yet).
    if (failed.length) window.location.reload()
  })
}

/** Report modules that failed at boot. */
export function reportFailed(failed: Module[]) {
  for (const m of failed) toast.error(t('The {name} admin module failed to load.', { name: m.package ?? m.id }))
}
