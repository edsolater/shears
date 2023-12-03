import { MayFn, cloneObject, shrinkFn } from '@edsolater/fnkit'
import { InfiniteObjNode, createTreeableInfinityNode, loadInfiniteObjNode } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'

type FakeTree<T> = T extends object ? { [K in keyof T]-?: FakeTree<T[K]> } : InfiniteObjNode<T>

/** just a InfiniteObj with leaf, inside unknow what is leaf's content 
 * get value should `aaa.xxx()`
*/
export function createFakeTree<O extends object, Tree = any>(
  rawObject: O,
  options?: {
    createNewLeaf?: (rawValue: any) => any
    injectValueToExistLeaf?: (loadedNode: any, rawValue: any) => void
  },
) {
  const rawObj = cloneObject(rawObject)
  const treeRoot = createTreeableInfinityNode() as FakeTree<Tree>
  /**
   * sync
   * change by this will also change the original object
   */
  function set(dispatcher: MayFn<Partial<O>, [old: O]>) {
    const inputObject = shrinkFn(dispatcher, [rawObj]) as Partial<O> // TODO: type of `shringFn` is wrong
    walkThroughObject(inputObject, ({ keyPaths, value }) => {
      // set raw
      setByPath(rawObj, keyPaths, value)

      // set tree
      const rawValue = getByPath(rawObj, keyPaths)
      const infinityNode = getByPath(treeRoot, keyPaths)
      loadInfiniteObjNode(infinityNode, (nodeValue) =>
        nodeValue
          ? options?.injectValueToExistLeaf
            ? (options?.injectValueToExistLeaf?.(nodeValue, value), nodeValue)
            : value
          : options?.createNewLeaf
            ? options?.createNewLeaf?.(rawValue)
            : rawValue,
      )
    })
  }

  if (rawObj) {
    set(rawObj)
  }
  return { rawObj, set, treeRoot }
}
