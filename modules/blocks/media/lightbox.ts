// A Gallery's pictures, large (MediaBlocks::gallery). Each picture is a link to its largest file, which is where it goes
// without scripts; with them it opens in a modal <dialog>: focus stays inside and goes back to the picture after,
// Escape closes it, the arrow keys, the buttons and a swipe go from one picture to the next.
type Picture = { href: string; srcset: string; width: number; height: number; alt: string; caption: string }

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const dialogs = new WeakMap<HTMLElement, HTMLDialogElement>()
let bound = false

function pictures(gallery: HTMLElement): { links: HTMLAnchorElement[]; items: Picture[] } {
  const links = [...gallery.querySelectorAll<HTMLAnchorElement>(':scope > li a[href]')]
  const items = links.map((link) => ({
    href: link.href,
    srcset: link.dataset.srcset ?? '',
    width: Number(link.dataset.width) || 0,
    height: Number(link.dataset.height) || 0,
    alt: link.querySelector('img')?.alt ?? '',
    caption: link.dataset.caption ?? '',
  }))
  return { links, items }
}

/** The gallery's dialog, from the template the page brought: in the page's language, with its icons. */
function dialogFor(gallery: HTMLElement): HTMLDialogElement | null {
  const known = dialogs.get(gallery)
  if (known?.isConnected) return known
  const template = gallery.querySelector<HTMLTemplateElement>('template[data-cms-lightbox-dialog]')
  const dialog = template?.content.firstElementChild?.cloneNode(true) as HTMLDialogElement | undefined
  if (!dialog) return null
  document.body.append(dialog)
  dialogs.set(gallery, dialog)
  return dialog
}

function open(gallery: HTMLElement, start: number) {
  const dialog = dialogFor(gallery)
  if (!dialog) return
  const { links, items } = pictures(gallery)
  const image = dialog.querySelector<HTMLImageElement>('.cms-lightbox__image')!
  const caption = dialog.querySelector<HTMLElement>('.cms-lightbox__caption')!
  const count = dialog.querySelector<HTMLElement>('.cms-lightbox__count')!
  const stage = dialog.querySelector<HTMLElement>('.cms-lightbox__stage')!
  const previous = dialog.querySelector<HTMLButtonElement>('[data-cms-lightbox-previous]')!
  const next = dialog.querySelector<HTMLButtonElement>('[data-cms-lightbox-next]')!
  const close = dialog.querySelector<HTMLButtonElement>('[data-cms-lightbox-close]')!
  let at = start

  const show = (index: number) => {
    at = (index + items.length) % items.length
    const item = items[at]
    image.classList.add('is-loading')
    // Its own shape before it loads, so nothing around it moves.
    if (item.width && item.height) {
      image.width = item.width
      image.height = item.height
    } else {
      image.removeAttribute('width')
      image.removeAttribute('height')
    }
    image.removeAttribute('srcset')
    image.sizes = '100vw'
    if (item.srcset) image.srcset = item.srcset
    image.src = item.href
    image.alt = item.alt
    caption.textContent = item.caption
    caption.hidden = item.caption === ''
    count.textContent = items.length > 1 ? `${at + 1} / ${items.length}` : ''
    // The ones either side, ready for the next step.
    for (const near of [items[(at + 1) % items.length], items[(at - 1 + items.length) % items.length]]) {
      const ahead = new Image()
      ahead.sizes = '100vw'
      if (near.srcset) ahead.srcset = near.srcset
      ahead.src = near.href
    }
  }

  const loaded = () => image.classList.remove('is-loading')
  const step = (by: number) => items.length > 1 && show(at + by)
  const back = () => step(-1)
  const forward = () => step(1)
  const shut = () => dialog.close()
  const keys = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') back()
    else if (event.key === 'ArrowRight') forward()
    else if (event.key === 'Home') show(0)
    else if (event.key === 'End') show(items.length - 1)
    else return
    event.preventDefault()
  }
  // A press on the dark around the picture closes it, as Escape does.
  const outside = (event: MouseEvent) => (event.target === dialog || event.target === stage) && shut()
  let from: { x: number; y: number } | null = null
  const down = (event: PointerEvent) => event.pointerType !== 'mouse' && (from = { x: event.clientX, y: event.clientY })
  const up = (event: PointerEvent) => {
    if (!from) return
    const dx = event.clientX - from.x
    const dy = event.clientY - from.y
    from = null
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
  }

  const one = items.length < 2
  previous.hidden = one
  next.hidden = one
  image.addEventListener('load', loaded)
  image.addEventListener('error', loaded)
  previous.addEventListener('click', back)
  next.addEventListener('click', forward)
  close.addEventListener('click', shut)
  dialog.addEventListener('keydown', keys)
  dialog.addEventListener('click', outside)
  stage.addEventListener('pointerdown', down)
  stage.addEventListener('pointerup', up)
  dialog.addEventListener(
    'close',
    () => {
      image.removeEventListener('load', loaded)
      image.removeEventListener('error', loaded)
      previous.removeEventListener('click', back)
      next.removeEventListener('click', forward)
      close.removeEventListener('click', shut)
      dialog.removeEventListener('keydown', keys)
      dialog.removeEventListener('click', outside)
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointerup', up)
      // Back to the picture it showed last, so the visitor carries on from there.
      ;(links[at] ?? links[start])?.focus({ preventScroll: !reduced() })
    },
    { once: true },
  )

  show(start)
  dialog.showModal()
  close.focus()
}

export function start() {
  if (bound) return
  bound = true
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('[data-cms-lightbox] > li a[href]')
    const gallery = link?.closest<HTMLElement>('[data-cms-lightbox]')
    if (!link || !gallery) return
    const index = pictures(gallery).links.indexOf(link)
    if (index < 0 || !dialogFor(gallery)) return
    event.preventDefault()
    open(gallery, index)
  })
}
