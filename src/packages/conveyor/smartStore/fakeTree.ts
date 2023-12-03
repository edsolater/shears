import { MayFn, cloneObject, shrinkFn } from '@edsolater/fnkit'
import { createTreeableInfinityNode, loadInfiniteObjNode } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'

/**
 * dynamicly generate infinity nodes when attempt to access it
 *
 * any properties can be accessed, without check if it's exist
 * 
 * get value should via `root.xxx()`
 *
 * InfiniteObj(Leaf) to store value, inside don't know leaf's content
 */
export function createFakeTree<O extends object, FakeNodeTree extends object = any>(
  defaultRawObject: O,
  options?: {
    createLeaf?: (rawValue: any) => any
    injectValueToExistLeaf?: (loadedNode: any, rawValue: any) => void
  },
) {
  const rawObj = cloneObject(defaultRawObject)
  const tree = createTreeableInfinityNode({
    getDefaultNodeValue: () => options?.createLeaf?.(undefined),
  }) as FakeNodeTree
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
      const infinityNode = getByPath(tree, keyPaths)
      loadInfiniteObjNode(infinityNode, (nodeValue) =>
        nodeValue
          ? options?.injectValueToExistLeaf
            ? (options?.injectValueToExistLeaf?.(nodeValue, value), nodeValue)
            : value
          : options?.createLeaf
            ? options?.createLeaf?.(rawValue)
            : rawValue,
      )
    })
  }

  if (rawObj) {
    set(rawObj)
  }

  // /** {@link infinityTreeRoot} use `xxx.yyy()` to get value, but {@link treeRoot} can acess value just by `yyy.xxx`  */
  // function getTreeRoot(infinityTree) {
  //   return new Proxy(infinityTree, {
  //     get(target, p, receiver) {
  //       const infinityNode = Reflect.get(target, p, receiver)
  //       const value = infinityNode()
  //       const deepNode = getTreeRoot(infinityNode)
  //       return isObjectLike(value) ? mergeObjects(deepNode, value) : value
  //     },
  //   })
  // }

  // const treeRoot = getTreeRoot(infinityTreeRoot) as FakeNodeTree
  return { rawObj, set, tree }
}
