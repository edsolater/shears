import { expect, test } from 'vitest'
import { createShuck, isShuck } from './createShuck'
import { createFakeTree } from './fakeTree'
import { isInfinityNode } from '../../fnkit/createInfinityObj'
import { isObject } from '@edsolater/fnkit'

type OriginalObj = {
  a: number
  b: {
    c: number
  }
  dynamicSet?: { say?: string; hello?: string }
}

test('basic usage', () => {
  const { rawObj, tree, set } = createFakeTree<OriginalObj>(
    { a: 1, b: { c: 2 } },
    {
      createLeaf: (rawValue) => createShuck(rawValue),
      injectValueToExistLeaf: (leaf, val) => leaf.set((p) => (isObject(val) && isObject(p) ? { ...p, ...val } : val)),
    },
  )
  expect(rawObj, 'rawObj will not change').toEqual({ a: 1, b: { c: 2 } })

  // node situation
  expect(isInfinityNode(tree.a)).toBe(true)
  expect(isShuck(tree.a())).toBe(true)
  expect(tree.a()()).toBe(1)

  // dynamicly create node
  set({ dynamicSet: { hello: 'world' } })
  expect(tree.dynamicSet()()).toEqual({ hello: 'world' })
  set({ dynamicSet: { say: 'hello' } })
  expect(tree.dynamicSet()()).toEqual({ hello: 'world', say: 'hello' })
  expect(tree.dynamicSet.hello()()).toBe('world')
})
