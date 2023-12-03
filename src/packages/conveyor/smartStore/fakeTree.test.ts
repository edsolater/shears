import { expect, test } from 'vitest'
import { createFakeTree } from './fakeTree'
import { createShuck } from './createShuck'

test('basic usage', () => {
  const { rawObj, tree } = createFakeTree(
    { a: 1, b: { c: 2 } },
    {
      createLeaf: (rawValue) => createShuck(rawValue),
      injectValueToExistLeaf: (leaf, val) => leaf.set(val),
    },
  )
  expect(rawObj).toEqual({ a: 1, b: { c: 2 } })
  expect(tree.a()()).toEqual(1)
})
