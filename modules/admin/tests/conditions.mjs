import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conditionCycles, followRename, nextCondition } from '../src/fields/conditions.ts'

const fields = [
  { handle: 'kind', type: 'select' },
  { handle: 'featured', type: 'toggle' },
  { handle: 'source', type: 'url', if: { kind: ['video', 'audio'] } },
  { handle: 'teaser', type: 'textarea', if: { kind: 'text' }, required_if: { featured: true, kind: 'text' } },
]

test('renaming a field is followed by the conditions that name it', () => {
  const renamed = followRename(fields, 'kind', 'format')
  assert.deepEqual(renamed[2].if, { format: ['video', 'audio'] })
  assert.deepEqual(renamed[3], { handle: 'teaser', type: 'textarea', if: { format: 'text' }, required_if: { featured: true, format: 'text' } })
  assert.equal(renamed[0], fields[0], 'a field without the condition is left as it is')
})

test('removing a field takes the conditions that name it', () => {
  const without = followRename(fields.slice(1), 'kind', null)
  assert.equal('if' in without[1], false)
  assert.deepEqual(without[2], { handle: 'teaser', type: 'textarea', required_if: { featured: true } })
})

test('conditions that come back to their own field are found, through any number of fields', () => {
  assert.deepEqual([...conditionCycles(fields)], [])
  const circle = [{ handle: 'a', if: { b: 1 } }, { handle: 'b', required_if: { c: 1 } }, { handle: 'c', if: { a: 1 } }, { handle: 'd', if: { a: 1 } }]
  assert.deepEqual([...conditionCycles(circle)].sort(), ['a', 'b', 'c'])
})

test('the first condition names a field beside it that is not named yet, with a value it can hold', () => {
  const siblings = [{ handle: 'kind', label: 'Kind', type: 'select', options: { text: 'Text', video: 'Video' } }, { handle: 'featured', label: 'Featured', type: 'toggle' }]
  assert.deepEqual(nextCondition({ handle: 'x' }, siblings).if, { kind: 'text' })
  assert.deepEqual(nextCondition({ handle: 'x', if: { kind: 'text' } }, siblings).if, { kind: 'text', featured: true })
  assert.equal(nextCondition({ handle: 'x', if: { kind: 'text', featured: true } }, siblings), null)
  assert.equal(nextCondition({ handle: 'x' }, []), null)
})
