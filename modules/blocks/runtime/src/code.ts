// Code blocks: copy buttons, and syntax highlighting loaded only where a page has code.
let bound = false

export function start() {
  const blocks = [...document.querySelectorAll<HTMLElement>('code[data-cms-highlight]:not([data-highlighted])')]
  if (blocks.length) import('./highlight').then(({ highlight }) => blocks.forEach(highlight))
  if (bound) return
  bound = true
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-cms-copy]')
    if (!button) return
    const code = button.closest('.cms-code')?.querySelector('code')?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(code)
      const label = button.querySelector('span')
      if (label) {
        const before = label.textContent
        label.textContent = 'Copied'
        setTimeout(() => (label.textContent = before), 1600)
      }
    } catch {
      // Clipboard blocked: the code stays selectable.
    }
  })
}
