import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

// i18n.ts reads what the page booted with from api.ts, which needs a browser: here it gets only that.
registerHooks({ resolve(specifier, context, next) {
  return specifier === './api' ? { url: 'data:text/javascript,export const boot = globalThis.window.__CMS__', shortCircuit: true } : next(specifier, context)
} })

globalThis.document = { documentElement: {} }
globalThis.window = { __CMS__: { locale: 'nl', brand: { name: 'Acme' }, messages: { Views: 'Weergaven', 'Views||page views': 'Paginaweergaven', 'Ask {brand}': 'Vraag {brand}' } } }
const { t, words, setLocale } = await import('../../../admin-sdk/src/i18n.ts')

test('a context is part of the key and never shown', () => {
  assert.equal(words('Views||page views'), 'Views')
  assert.equal(words('Views'), 'Views')
  assert.equal(words('a || b||where'), 'a || b')
  // Only plain lowercase words after the last `||` are a context: anything else is text someone wrote.
  assert.equal(words('Red||Blue'), 'Red||Blue')
  assert.equal(words('a||b c'), 'a')
  assert.equal(words('x||Y'), 'x||Y')
})

test('a meaning the language lacks reads as its word for the plain key', () => {
  assert.equal(t('Views||list views'), 'Weergaven')
  assert.equal(t('Kept {name}', { name: 'x||y' }), 'Kept x||y')
})

test('one English word has a translation per meaning', () => {
  assert.equal(t('Views'), 'Weergaven')
  assert.equal(t('Views||page views'), 'Paginaweergaven')
  assert.equal(t('Ask {brand}'), 'Vraag Acme')
})

test('a meaning nobody translated reads as its words, in English too', () => {
  assert.equal(t('Expired||order'), 'Expired')
  setLocale('en', {})
  assert.equal(t('Views||page views'), 'Views')
  assert.equal(t('Delete “{title}”?||entry', { title: 'About' }), 'Delete “About”?')
})
