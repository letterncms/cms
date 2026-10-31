// node --test cms/themes/admin/tests/calendar.mjs
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calendarDayKey, calendarRange } from '../src/ui/calendar.ts'

test('leap months include February 29 in six complete Monday-first weeks', () => {
  const range = calendarRange('2024-02')
  assert.equal(range.days.length, 42)
  assert.equal(range.start.getDay(), 1)
  assert.ok(range.days.some((day) => calendarDayKey(day) === '2024-02-29'))
  assert.equal(calendarDayKey(range.first), '2024-02-01')
  assert.equal(calendarDayKey(range.end), '2024-03-11')
})

test('invalid month values fall back to the current month', () => {
  const today = calendarDayKey(new Date()).slice(0, 7)
  for (const value of ['2026-00', '2026-13', '2026-1', 'garbage']) assert.equal(calendarRange(value).month, today)
})

test('daylight saving changes do not duplicate or skip local calendar days', () => {
  const before = process.env.TZ
  process.env.TZ = 'Europe/Brussels'
  try {
    const range = calendarRange('2026-03')
    assert.equal(new Set(range.days.map(calendarDayKey)).size, 42)
    assert.ok(range.days.some((day) => calendarDayKey(day) === '2026-03-29'))
    assert.ok(range.days.some((day) => calendarDayKey(day) === '2026-03-30'))
    assert.ok(range.days.every((day) => day.getHours() === 0))
  } finally {
    if (before === undefined) delete process.env.TZ
    else process.env.TZ = before
  }
})
