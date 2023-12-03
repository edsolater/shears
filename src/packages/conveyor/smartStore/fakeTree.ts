import { MayFn, cloneObject, isFunction, isObjectLike, shrinkFn } from '@edsolater/fnkit'
import { InfiniteObjNode, createTreeableInfinityNode, loadInfiniteObjNode } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'
import { mergeObjects } from './mergeObjects'

type FakeTree<T> = T extends object ? { [K in keyof T]-?: FakeTree<T[K]> } : () => T

/**
 * get value should via `aaa.xxx()`
 *
 * just a InfiniteObj with leaf, inside unknow what is leaf's content
 */
export function createFakeTree<O extends object, Tree extends object = O>(
  rawObject: O,
  options?: {
    createNewLeaf?: (rawValue: any) => any
    injectValueToExistLeaf?: (loadedNode: any, rawValue: any) => void
  },
) {
  const rawObj = cloneObject(rawObject)
  const infinityTreeRoot = createTreeableInfinityNode(undefined, undefined, rawObj)
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
      const infinityNode = getByPath(infinityTreeRoot, keyPaths)
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

  /** {@link infinityTreeRoot} use `xxx.yyy()` to get value, but {@link treeRoot} can acess value just by `yyy.xxx`  */
  function getTreeRoot(infinityTree) {
    return new Proxy(infinityTree, {
      get(target, p, receiver) {
        const infinityNode = Reflect.get(target, p, receiver)
        console.log('p: ', p)
        console.log('target: ', target)
        const value = infinityNode()
        console.log('value: ', value)
        const deepNode = getTreeRoot(infinityNode)

        const mergedValue = mergeObjects(deepNode, value)
        console.log('mergedValue: ', mergedValue)
        console.log('deepNode: ', typeof mergedValue, typeof deepNode, typeof value)
        return isObjectLike(value) ? mergeObjects(deepNode, value) : value
      },
    })
  }
  console.log('infinityTreeRoot: ', infinityTreeRoot())

  const treeRoot = getTreeRoot(infinityTreeRoot) as Tree
  return { rawObj, set, treeRoot, infinityTreeRoot }
}
