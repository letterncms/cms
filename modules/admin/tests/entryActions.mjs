import assert from 'node:assert/strict'
import { test } from 'node:test'
import { entryActionAvailability } from '../src/ui/entryActions.ts'
const none = { create: false, edit: false, publish: false, delete: false }

test('viewers receive no editing actions in any host', () => {
  assert.ok(Object.values(entryActionAvailability(none, { status: 'published' })).every((value) => value === false))
  assert.ok(Object.values(entryActionAvailability(undefined)).every((value) => value === false))
})

test('authoring, creating and publishing capabilities remain independent', () => {
  const editor = entryActionAvailability({ ...none, edit: true }, { status: 'published' })
  assert.equal(editor.edit, true)
  assert.equal(editor.restore, true)
  assert.equal(editor.move, false)
  assert.equal(entryActionAvailability({ ...none, edit: true }, { status: 'draft' }).move, true)
  assert.equal(editor.publish, false)
  assert.equal(editor.duplicate, false)
  const creator = entryActionAvailability({ ...none, create: true }, null)
  assert.equal(creator.edit, true)
  assert.equal(creator.delete, false)
  assert.equal(creator.restore, false)
  assert.equal(creator.duplicate, false)
  const publisher = entryActionAvailability({ ...none, publish: true }, { status: 'draft' })
  assert.equal(publisher.publish, true)
  assert.equal(publisher.edit, false)
  assert.equal(publisher.unpublish, false)
  assert.equal(entryActionAvailability({ ...none, publish: true }, null).publish, false)
})

test('unpublish is offered for a live or scheduled entry only', () => {
  assert.equal(entryActionAvailability({ ...none, publish: true }, { status: 'published' }).unpublish, true)
  assert.equal(entryActionAvailability({ ...none, publish: true }, { status: 'draft' }).unpublish, false)
})
