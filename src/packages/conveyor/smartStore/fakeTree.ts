import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { createInfiniteObj } from '../../fnkit/createInfiniteObj'

type FakeTree<T> = T

export function createFakeTree<O extends object>(leafRule?: (rawValue: O) => any, fromObject?:O): FakeTree<O> {
  const cachedLeaf = new Map<any, any>()
  const rootEntry = createInfiniteObj()
  function get(path: (root: O) => any) {
    const rawValue = path(rootEntry)
    if (cachedLeaf.has(rawValue)) cachedLeaf.get(rawValue)
    getMapValue(cachedLeaf, rawValue, (raw) => leafRule?.(raw) ?? raw)
  }
  //TODO
  function set(setter: ()) {

  }
  return rootEntry
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
