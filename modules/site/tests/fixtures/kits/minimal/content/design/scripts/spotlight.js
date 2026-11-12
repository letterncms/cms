// A block behaviour: a soft light that follows the pointer across the block it is on.
//
// Any block can name a script in this folder:
//   { "behavior": { "module": "spotlight", "props": { "ease": 0.12 }, "when": "idle" } }
// The site calls mount() when that block is in the page, and the function mount() returns
// when it leaves. Libraries added with `cms vendor add` are imported here by name.

export function mount(el, { ease = 0.12 }, { reducedMotion, signal }) {
  // No pointer to follow on touch, and some people ask for less motion:
  // the light then rests where styles/spotlight.css puts it.
  if (reducedMotion || !matchMedia('(hover: hover)').matches) return

  let x = 50
  let y = 0
  let toX = x
  let toY = y
  let frame = 0

  const step = () => {
    x += (toX - x) * ease
    y += (toY - y) * ease
    el.style.setProperty('--spot-x', `${x.toFixed(2)}%`)
    el.style.setProperty('--spot-y', `${y.toFixed(2)}%`)
    frame = Math.abs(toX - x) + Math.abs(toY - y) > 0.1 ? requestAnimationFrame(step) : 0
  }

  // `signal` ends with the block, and takes this listener with it.
  el.addEventListener('pointermove', (event) => {
    const box = el.getBoundingClientRect()
    toX = ((event.clientX - box.left) / box.width) * 100
    toY = ((event.clientY - box.top) / box.height) * 100
    frame ||= requestAnimationFrame(step)
  }, { signal, passive: true })

  return () => {
    cancelAnimationFrame(frame)
    el.style.removeProperty('--spot-x')
    el.style.removeProperty('--spot-y')
  }
}
