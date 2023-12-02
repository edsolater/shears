import { expect, test } from 'vitest'
import { createFakeTree } from './fakeTree'
import { createLeaf } from './createLeaf'

test('basic usage', () => {
  const { rawObj, treeRoot, set } = createFakeTree({a:1, b:{c:2}}, {
    createNewLeaf: (rawValue) => createLeaf(rawValue),
    injectValueToExistLeaf: (leaf, val) => leaf.set(val),
  })
  expect(rawObj).toEqual({a:1, b:{c:2}})
  expect(treeRoot.a()).toEqual(1)
})
