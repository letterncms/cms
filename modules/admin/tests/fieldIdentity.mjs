import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fieldControlId } from '../src/ui/fieldIdentity.ts'

test('record fields keep their public focus target while nested handles remain distinct', () => {
  assert.equal(fieldControlId({ handle: 'title' }), 'f-title')
  assert.equal(fieldControlId({ handle: 'title' }, ['seo']), 'f-seo.title')
  assert.notEqual(fieldControlId({ handle: 'title' }), fieldControlId({ handle: 'title' }, ['seo']))
})

test('repeater items and nested groups have distinct stable form identities', () => {
  const one = fieldControlId({ handle: 'title' }, ['sections', '0', 'content'])
  const two = fieldControlId({ handle: 'title' }, ['sections', '1', 'content'])
  assert.equal(one, 'f-sections.0.content.title')
  assert.notEqual(one, two)
  assert.equal(fieldControlId({ handle: 'title', id: one }), one)
})
