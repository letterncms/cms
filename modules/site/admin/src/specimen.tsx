/**
 * A page of the site with the draft design on it: the compiled draft stylesheet in place of
 * the saved one (so cascade layers keep their order), and values that change while dragged
 * as custom properties on top, in light or dark.
 */
export function applyDraft(doc: Document | null | undefined, draft: { compiled: string | null; vars: string; mode: 'light' | 'dark' }) {
  if (!doc?.head) return
  const link = doc.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/_cms/site/design-"]')
  let style = doc.getElementById('cms-design-preview') as HTMLStyleElement | null
  if (draft.compiled !== null) {
    if (!style) {
      style = doc.createElement('style')
      style.id = 'cms-design-preview'
      link ? link.after(style) : doc.head.appendChild(style)
    }
    if (style.textContent !== draft.compiled) style.textContent = draft.compiled
    if (link) link.disabled = true
  } else {
    style?.remove()
    if (link) link.disabled = false
  }
  let vars = doc.getElementById('cms-token-preview') as HTMLStyleElement | null
  if (!vars) {
    vars = doc.createElement('style')
    vars.id = 'cms-token-preview'
    doc.head.appendChild(vars)
  }
  const text = draft.vars ? `:root:root:root{${draft.vars}}` : ''
  if (vars.textContent !== text) vars.textContent = text
  if (doc.documentElement.dataset.theme !== draft.mode) doc.documentElement.dataset.theme = draft.mode
}

/** Mark the specimen's card for the part being edited, and bring it into view (smoothly, unless it just loaded). */
export function showPart(doc: Document | null | undefined, part: string | null, smooth: boolean) {
  if (!doc?.body) return
  for (const card of doc.querySelectorAll('[data-part][data-active]')) card.removeAttribute('data-active')
  const card = part ? doc.querySelector<HTMLElement>(`[data-part="${CSS.escape(part)}"]`) : null
  if (!card) return
  card.setAttribute('data-active', '')
  card.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'nearest' })
}
