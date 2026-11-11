// node --experimental-vm-modules --test modules/admin/tests/theme.mjs
// The admin's theme: kept in this browser for the first paint, and on the person's account so it follows them.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'

/** theme.ts in a browser of its own: what it kept, whether the system is dark, and the manifest the page came with (or none). */
async function setup({ kept = null, systemDark = false, manifest = null } = {}) {
  const store = new Map(kept ? [['cms.theme', kept]] : [])
  const saves = []
  const followers = []
  const html = { dataset: {} }
  let current = manifest
  const context = createContext({
    window: { matchMedia: () => ({ matches: systemDark, addEventListener() {} }) },
    localStorage: { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) },
    document: { documentElement: html },
    MutationObserver: class { observe() {} disconnect() {} },
  })
  const sdk = new SyntheticModule(['getManifest', 'onManifest', 'setPreference'], function () {
    this.setExport('getManifest', () => { if (!current) throw new Error('Manifest not loaded yet.'); return current })
    this.setExport('onManifest', (listener) => { followers.push(listener); return () => {} })
    this.setExport('setPreference', (key, value) => { saves.push([key, value]); return Promise.resolve() })
  }, { context })
  const react = new SyntheticModule(['useSyncExternalStore'], function () { this.setExport('useSyncExternalStore', (_, get) => get()) }, { context })
  const theme = new SourceTextModule(stripTypeScriptTypes(readFileSync(new URL('../src/ui/theme.ts', import.meta.url), 'utf8')), { context })
  await theme.link((name) => name === '@letterncms/sdk' ? sdk : react)
  await theme.evaluate()
  return { ...theme.namespace, html, store, saves, arrive: (next) => { current = next; followers.forEach((follow) => follow(next)) } }
}

const account = (theme) => ({ user: { preferences: theme ? { theme } : {} } })

test('a page that comes with its manifest takes the account’s theme over what this browser kept', async () => {
  const theme = await setup({ kept: 'light', manifest: account('dark') })
  assert.equal(theme.html.dataset.theme, 'dark')
  assert.equal(theme.store.get('cms.theme'), 'dark')
  assert.equal(theme.getThemePreference(), 'dark')
  assert.deepEqual(theme.saves, [], 'following the account is not a change to save')
})

test('signing in later follows the account too, and an account without a choice leaves the browser’s', async () => {
  const theme = await setup({ kept: 'dark' })
  theme.applyTheme()
  assert.equal(theme.html.dataset.theme, 'dark')
  theme.arrive(account(null))
  assert.equal(theme.getThemePreference(), 'dark')
  theme.arrive(account('light'))
  assert.equal(theme.html.dataset.theme, 'light')
  assert.equal(theme.store.get('cms.theme'), 'light')
})

test('choosing a theme keeps it here and on the account; before sign-in, here only', async () => {
  const guest = await setup()
  guest.setThemePreference('dark')
  assert.equal(guest.html.dataset.theme, 'dark')
  assert.deepEqual(guest.saves, [])

  const signedIn = await setup({ manifest: account(null) })
  signedIn.setThemePreference('dark')
  assert.equal(signedIn.store.get('cms.theme'), 'dark')
  assert.deepEqual(signedIn.saves, [['theme', 'dark']])
})

test('system follows the system, and a value nobody chose counts as system', async () => {
  const dark = await setup({ kept: 'sepia', systemDark: true })
  dark.applyTheme()
  assert.equal(dark.getThemePreference(), 'system')
  assert.equal(dark.html.dataset.theme, 'dark')
})
