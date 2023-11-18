import { expect, test } from 'vitest'
import { wrapObjLeaves } from './wrapObjectLeaves'

test(`\`${wrapObjLeaves.name}\` basic usage `, () => {
  const raw = { a: 1, b: { c: 2 } }
  const result = wrapObjLeaves(raw, (leaf) => 2 * leaf)
  expect(result.a).toBe(2)
  expect(result.b.c).toBe(4)
  // should not mutate raw
  expect(result).not.toBe(raw)
})
