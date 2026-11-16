// node --test modules/admin/tests/undo.mjs
// The admin's one undo stack, and the line comparison a version is shown with.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { UndoStack } from '../src/ui/undo.ts'
import { diffLines, textsDiffer } from '../src/ui/lineDiff.ts'

test('each change is a step, a run of one group close together is one, and a new change drops redo', () => {
  const stack = new UndoStack()
  stack.push('a', '', 0)
  stack.push('ab', '', 10)
  assert.equal(stack.undo('abc'), 'ab')
  assert.equal(stack.undo('ab'), 'a')
  assert.equal(stack.undo('a'), undefined)
  assert.equal(stack.redo('a'), 'ab')
  assert.equal(stack.canRedo, true)
  stack.push('ab', '', 20)
  assert.equal(stack.canRedo, false)

  const typing = new UndoStack()
  typing.push('', 'title', 0)
  typing.push('h', 'title', 100)
  typing.push('hi', 'title', 200)
  // Another block, or a pause, is a step of its own.
  typing.push('hi!', 'body', 300)
  typing.push('hi!x', 'body', 5000)
  assert.deepEqual([typing.undo('now'), typing.undo('hi!x'), typing.undo('hi!'), typing.undo('')], ['hi!x', 'hi!', '', undefined])
})

test('after an undo the next change is a step of its own', () => {
  const stack = new UndoStack()
  stack.push('a', 'g', 0)
  assert.equal(stack.undo('ab'), 'a')
  stack.push('a', 'g', 10)
  stack.push('ax', 'g', 20)
  assert.equal(stack.undo('axy'), 'a')
})

test('lines both keep, lose and gain, in order', () => {
  const lines = diffLines('a\nb\nc\nd', 'a\nc\nd\ne')
  assert.deepEqual(lines.map((line) => `${line.kind}:${line.text}`), ['same:a', 'del:b', 'same:c', 'same:d', 'add:e'])
  assert.deepEqual(lines.find((line) => line.kind === 'add'), { kind: 'add', text: 'e', b: 4 })
  assert.deepEqual(diffLines('x', 'x').map((line) => line.kind), ['same'])
  assert.equal(textsDiffer('a\n', 'a'), false)
  assert.equal(textsDiffer('a', 'b'), true)
})
