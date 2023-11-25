import { MayFn, cloneObject, shrinkFn } from '@edsolater/fnkit'
import { createInfiniteObj, isInfiniteObjNodeUnloaded } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'

type FakeTree<T> = T
type FakeTreeLeaf = object

/** just a InfiniteObj with leaf ,inside unknow what is leaf's content*/
export function createFakeTree<O extends object, L extends FakeTreeLeaf = object>(
  rawObject: O,
  options: { leaf: (rawValue: any) => L; injectValueToLeaf: (loadedNode: L, rawValue: any) => void },
) {
  const rawObj = cloneObject(rawObject)
  const root = createInfiniteObj() as FakeTree<O>
  /**
   * sync
   * change by this will also change the original object
   */
  function set(dispatcher: MayFn<Partial<O>, [old: O]>) {
    console.log('🧪 ')
    const newRawTree = shrinkFn(dispatcher, [rawObj]) as Partial<O> // TODO: type of `shringFn` is wrong
    console.log('newRawTree: ', { ...newRawTree })
    walkThroughObject(newRawTree, ({ keyPaths, parentPath, currentKey, value }) => {
      console.log('value: ', value)
      console.log('currentKey: ', currentKey)
      console.log('value22: ', keyPaths, value)
      const treeNode = getByPath(root, keyPaths)
      // set raw
      setByPath(rawObj, keyPaths, value)

      // set tree
      if (isInfiniteObjNodeUnloaded(treeNode)) {
        console.log('treeNode: ', treeNode)
        getByPath(root, parentPath)[currentKey] = options.leaf(getByPath(rawObj, keyPaths))
      } else {
        console.log('treeNode: ', treeNode)
        options.injectValueToLeaf(treeNode, value)
      }
    })
  }
  return { rawObj, root, set }
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
