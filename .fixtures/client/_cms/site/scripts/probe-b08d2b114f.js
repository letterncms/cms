export function mount(el, props, { token, reducedMotion, signal }) {
  el.dataset.mounted = JSON.stringify({ props, primary: token('color.primary'), reducedMotion })
  window.__mounts = (window.__mounts ?? 0) + 1
  signal.addEventListener('abort', () => (document.documentElement.dataset.aborted = props.name))
  return () => (document.documentElement.dataset.cleaned = props.name)
}
export function unmount(el) {
  document.documentElement.dataset.unmounted = el.dataset.mounted ? 'yes' : 'no'
}