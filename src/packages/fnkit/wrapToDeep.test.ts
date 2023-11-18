import { expect, test } from 'vitest'
import { wrapLeafNodes } from './wrapToDeep'

test('`wrapToDeep()` basic usage ', () => {
  const raw = { a: 1, b: { c: 2 } }
  const result = wrapLeafNodes(raw, (leaf) => 2 * leaf)
  expect(result.a).toBe(2)
  expect(result.b.c).toBe(4)
})
