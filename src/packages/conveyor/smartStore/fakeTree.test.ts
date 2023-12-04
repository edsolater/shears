import { expect, test } from 'vitest'
import { createShuck } from './createShuck'
import { createFakeTree } from './fakeTree'

test('basic usage', () => {
  const { rawObj, tree } = createFakeTree(
    { a: 1, b: { c: 2 } },
    {
      createLeaf: (rawValue) => createShuck(rawValue),
      injectValueToExistLeaf: (leaf, val) => leaf.set(val),
    },
  )
  expect(rawObj, 'rawObj will not change').toEqual({ a: 1, b: { c: 2 } })
  expect(tree.a()()).toBe(1)
})
