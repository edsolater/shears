import { MayFn, cloneObject, forEach, mergeObjectsWithConfigs, shrinkFn } from '@edsolater/fnkit'
import { createInfiniteObj, isInfiniteObjNodeUnloaded } from '../../fnkit/createInfiniteObj'
import { assignObject, assignObjectWithConfigs } from '../../fnkit/assignObject'
import { getByPath, walkThroughObject } from '../../fnkit/walkThroughObject'
import { isSubscribable } from '../subscribable/core'
import { createLeaf } from './createLeaf'

type FakeTree<T> = T

export function createFakeTree<O extends object>(leaf: (rawValue: O) => any, rawObject?: O) {
  const o = cloneObject(rawObject ?? ({} as O))
  const treeRoot = createInfiniteObj() as FakeTree<O>
  /**
   * sync
   * change by this will also change the original object
   */
  function set(dispatcher: MayFn<Partial<O>, [old: FakeTree<O>]>) {
    const newRawTree = shrinkFn(dispatcher, [o]) as Partial<O> // TODO: type of `shringFn` is wrong
    walkThroughObject(newRawTree, ({ keyPaths, parentPath, currentKey, value }) => {
      const path = keyPaths
      const treeNode = getByPath(treeRoot, path)
      const originalValue = getByPath(o, path)
      getByPath(treeRoot, parentPath)[currentKey] = isInfiniteObjNodeUnloaded(treeNode) ? leaf(originalValue) : value
    })
  }
  return { o, treeRoot, set }
}

/**
 * enhance map::get()
 */
function getMapValue<K, V>(map: Map<K, V>, key: K, defaultValue: MayFn<V, [key: K]>): V {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    const v = shrinkFn(defaultValue, [key])
    map.set(key, v)
    return v
  }
}
