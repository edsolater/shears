import { MayFn, cloneObject, forEach, mergeObjectsWithConfigs, shrinkFn } from '@edsolater/fnkit'
import { createInfiniteObj } from '../../fnkit/createInfiniteObj'
import { assignObject } from '../../fnkit/assignObject'

type FakeTree<T> = T

export function createFakeTree<O extends object>(leafRule?: (rawValue: O) => any, rawObject?: O) {
  const o = cloneObject(rawObject ?? ({} as O))
  const cachedLeaf = new Map<any, any>()
  const rootEntry = createInfiniteObj() as FakeTree<O>

  function get(path: (root: O) => any) {
    const rawValue = path(rootEntry)
    if (cachedLeaf.has(rawValue)) cachedLeaf.get(rawValue)
    return getMapValue(cachedLeaf, rawValue, (raw) => leafRule?.(raw) ?? raw)
  }

  /**
   * sync
   * change by this will also change the original object
   */
  function set(dispatcher: MayFn<Partial<O>, [old: FakeTree<O>]>) {
    const newTree = shrinkFn(dispatcher, [o]) as Partial<O> // TODO: type of `shringFn` is wrong
    // TODO: currently just shallow travel 
    forEachObjectEntries(newTree, ([key, value]) => {
      assignObject(o, { [key]: value })
    })
  }
  return { o, rootEntry, set, get }
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
