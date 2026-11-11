// Form fields that need a script (they still work without one).
//   Sliders: the track fills up to the thumb (--cms-range, 0 to 1) and an <output for> shows the value.
//   Tag fields: typed words become tags, each sent as name[]; without the script the words are sent comma-separated.

const X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>'

function slider(input: HTMLInputElement) {
  const update = () => {
    const min = Number(input.min || 0)
    const max = Number(input.max || 100)
    input.style.setProperty('--cms-range', String(max > min ? (Number(input.value) - min) / (max - min) : 0))
    for (const output of document.querySelectorAll<HTMLOutputElement>(`output[for~="${CSS.escape(input.id)}"]`)) {
      output.value = `${output.dataset.prefix ?? ''}${Number(input.value).toLocaleString(document.documentElement.lang || undefined)}${output.dataset.suffix ?? ''}`
    }
  }
  input.addEventListener('input', update)
  update()
}

function tags(box: HTMLElement) {
  const input = box.querySelector<HTMLInputElement>('.cms-tags__input')
  if (!input) return
  const name = box.dataset.name ?? `${input.name}[]`
  const max = Number(box.dataset.max || 20)
  const length = Number(box.dataset.length || 40)
  input.removeAttribute('name')

  const values = () => [...box.querySelectorAll<HTMLInputElement>('.cms-tag input[type=hidden]')].map((hidden) => hidden.value)
  const changed = () => input.dispatchEvent(new Event('change', { bubbles: true }))
  const add = (text: string) => {
    let added = false
    for (const word of text.split(',')) {
      const value = word.trim().slice(0, length)
      if (!value || values().length >= max || values().some((v) => v.toLowerCase() === value.toLowerCase())) continue
      const tag = document.createElement('span')
      tag.className = 'cms-tag'
      const label = document.createElement('span')
      label.textContent = value
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'cms-tag__remove'
      remove.setAttribute('aria-label', `${box.dataset.remove ?? 'Remove'} ${value}`)
      remove.innerHTML = X
      const hidden = document.createElement('input')
      hidden.type = 'hidden'
      hidden.name = name
      hidden.value = value
      tag.append(label, remove, hidden)
      input.before(tag)
      added = true
    }
    input.value = ''
    if (added) changed()
  }

  input.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ',') && input.value.trim()) {
      event.preventDefault()
      add(input.value)
    } else if (event.key === 'Enter') {
      event.preventDefault()
    } else if (event.key === 'Backspace' && input.value === '') {
      const last = [...box.querySelectorAll('.cms-tag')].pop()
      if (last) {
        last.remove()
        changed()
      }
    }
  })
  input.addEventListener('paste', (event) => {
    const text = event.clipboardData?.getData('text') ?? ''
    if (text.includes(',')) {
      event.preventDefault()
      add(text)
    }
  })
  input.addEventListener('blur', () => input.value.trim() && add(input.value))
  box.addEventListener('click', (event) => {
    const remove = (event.target as HTMLElement).closest('.cms-tag__remove')
    if (remove) {
      remove.closest('.cms-tag')?.remove()
      changed()
    }
    if (event.target === box || remove) input.focus()
  })
}

const done = new WeakSet<Element>()
const once = <T extends Element>(setup: (el: T) => void) => (el: T) => done.has(el) || (done.add(el), setup(el))

export function start() {
  document.querySelectorAll<HTMLInputElement>('input.cms-range').forEach(once(slider))
  document.querySelectorAll<HTMLElement>('[data-cms-tags]').forEach(once(tags))
}
