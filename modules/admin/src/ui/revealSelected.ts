/**
 * Opens a list where its value is: the chosen option (`aria-selected="true"`, or `data-selected`) is scrolled to
 * the middle of `list`. As a ref (`ref={revealSelected}`) it does so each time the list appears.
 */
export function revealSelected(list: HTMLElement | null) {
  revealOption(list, list?.querySelector<HTMLElement>('[aria-selected="true"], [data-selected]'), true)
}

/**
 * Scrolls `list` just enough to show `item` (the option the arrow keys reached), or to its middle with `center`:
 * the list's own scroll and nothing around it, so the inspector or the page never moves.
 */
export function revealOption(list: HTMLElement | null | undefined, item: HTMLElement | null | undefined, center = false) {
  if (!list || !item || list.scrollHeight <= list.clientHeight) return
  const box = list.getBoundingClientRect()
  // A popup that opens with a zoom is drawn smaller for a moment: measure in the list's own pixels.
  const scale = box.height / list.offsetHeight || 1
  const top = (item.getBoundingClientRect().top - box.top) / scale + list.scrollTop
  const bottom = top + item.offsetHeight
  if (center) list.scrollTop = top - (list.clientHeight - item.offsetHeight) / 2
  else if (top < list.scrollTop) list.scrollTop = top
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
}
