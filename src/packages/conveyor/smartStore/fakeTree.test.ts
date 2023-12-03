import { expect, test } from 'vitest'
import { createFakeTree } from './fakeTree'
import { createLeaf } from './createLeaf'

test('basic usage', () => {
  const { rawObj, tree } = createFakeTree(
    { a: 1, b: { c: 2 } },
    {
      createNewNode: (rawValue) => createLeaf(rawValue),
      injectValueToExistNode: (leaf, val) => leaf.set(val),
    },
  )
  expect(rawObj).toEqual({ a: 1, b: { c: 2 } })
  expect(tree.a()()).toEqual(1)
})
