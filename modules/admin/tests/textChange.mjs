// node --test modules/admin/tests/textChange.mjs
// A text replaced from outside the code editor (Discard, a format on save) is one change of only what differs, so the
// cursor and the scroll stay where they were.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { difference } from '../src/ui/textChange.ts'

const apply = (text, change) => (change ? text.slice(0, change.from) + change.insert + text.slice(change.to) : text)

test('only what differs is replaced', () => {
  assert.equal(difference('same', 'same'), null)
  assert.deepEqual(difference('const   x = 1', 'const x = 1'), { from: 6, to: 8, insert: '' })
  assert.deepEqual(difference('a\nb', 'a\nb\n'), { from: 3, to: 3, insert: '\n' })
  for (const [from, to] of [['', 'new'], ['old', ''], ['abcabc', 'abc'], ['x = {a:1}', 'x = { a: 1 }'], ['aaa', 'aaaa']]) {
    assert.equal(apply(from, difference(from, to)), to, `${from} → ${to}`)
  }
})
