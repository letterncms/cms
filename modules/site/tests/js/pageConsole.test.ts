import assert from 'node:assert/strict'
import { test } from 'node:test'
import { describe, docAt, sourceOf, substitute } from '../../admin/src/code/pageConsole.ts'

test('a value shows as a browser console shows it', () => {
  assert.equal(describe('plain'), 'plain')
  assert.equal(describe(['a', 1, null, undefined]), '["a", 1, null, undefined]')
  assert.equal(describe({ a: 1, 'b-c': [true] }), '{a: 1, "b-c": [true]}')
  assert.equal(describe(new Map([['k', 2]])), 'Map(1) {"k" => 2}')
  assert.equal(describe(function named() {}), 'ƒ named()')
  assert.equal(describe(10n), '10n')
  assert.equal(describe(new TypeError('nope')), 'TypeError: nope')
  assert.equal(describe({ a: { b: { c: { d: 1 } } } }), '{a: {b: {…}}}')
  assert.equal(describe(Array.from({ length: 25 }, (_, i) => i)).endsWith(', …5 more]'), true)
  const loop: Record<string, unknown> = {}
  loop.self = loop
  assert.equal(describe(loop), '{self: [Circular]}')
  // An element of the page, by its tag, id and classes.
  assert.equal(describe({ nodeType: 1, nodeName: 'DIV', id: 'hero', classList: ['a', 'b'] }), '<div#hero.a.b>')
})

test('placeholders are filled as console.log fills them', () => {
  assert.equal(substitute(['%s is %d years', 'Ada', '36.5', 'extra']), 'Ada is 36 years extra')
  assert.equal(substitute(['%cstyled', 'color: red']), 'styled')
  assert.equal(substitute(['%o', { a: 1 }]), '{a: 1}')
  assert.equal(substitute(['100%%']), '100%%')
  assert.equal(substitute(['no placeholders', 2]), 'no placeholders 2')
})

test('a message comes from the first script of the site in its stack', () => {
  const stack = 'Error\n    at console.log (about:srcdoc:3:12)\n    at mount (http://example.test/_cms/site/scripts/hero-0123456789.js:4:7)\n    at x (http://example.test/_cms/site/custom-abc.js:1:1)'
  assert.deepEqual(sourceOf(stack), { url: 'http://example.test/_cms/site/scripts/hero-0123456789.js', line: 4, column: 7 })
  assert.equal(sourceOf('Error\n    at about:srcdoc:1:1'), undefined)
  // What was typed in the console reaches the console's own code: no line of the site is where it came from.
  assert.equal(sourceOf(`Error\n    at about:srcdoc:1:1\n    at evaluate (${import.meta.resolve('../../admin/src/code/pageConsole.ts')}:9:9)`), undefined)
})

test('a published file is found by its address', () => {
  assert.equal(docAt('/_cms/site/custom-d25ac93800.js'), 'js')
  assert.equal(docAt('http://example.test/_cms/site/scripts/hero-0123456789.js?v=1'), 'scripts/hero.js')
  assert.equal(docAt('/_cms/site/scripts/lib/ease-abcdef0123.js'), 'scripts/lib/ease.js')
  assert.equal(docAt('/_cms/site/styles/cards-0123456789.css'), 'styles/cards.css')
  assert.equal(docAt('/_cms/assets/letterncms-blocks/runtime/cms-BtoDlTRV.js'), null)
})
