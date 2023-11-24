import { expect, test } from 'vitest'
import { createFakeTree } from './fakeTree'

test('basic usage', () => {
  const obj = createFakeTree<any>()
  obj.a.b = 3
  expect(obj.a.b).toBe(3)

  const targetValue = {}
  obj.b.d.e = targetValue
  expect(obj.b.d.e).toBe(targetValue)
})
