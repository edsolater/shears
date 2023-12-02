import { MayFn, cloneObject, shrinkFn } from '@edsolater/fnkit'
import { InfiniteObjNode, createTreeableInfinityNode, loadInfiniteObjNode } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'

type FakeTree<T> = T extends object ? { [K in keyof T]-?: FakeTree<T[K]> } : InfiniteObjNode<T>
type FakeTreeLeaf = object

/** just a InfiniteObj with leaf ,inside unknow what is leaf's content*/
export function createFakeTree<O extends object, Tree = any>(
  rawObject: O,
  options: {
    createNewLeaf: (rawValue: any) => any
    injectValueToExistLeaf: (loadedNode: any, rawValue: any) => void
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
    walkThroughObject(inputObject, ({ keyPaths, parentPath, currentKey, value, canDeepWalk, needDeepWalk }) => {
      // console.log('keyPaths: ', keyPaths)
      // set raw
      setByPath(rawObj, keyPaths, value)

      // set tree
      const treeNode = getByPath(treeRoot, keyPaths)
      // console.log('root: ', treeRoot, keyPaths)
      // console.log('treeNode: ', treeNode)
      /** bug is already prent node already have node on it , so fail to set deep value on it. So 层序遍历 userInputSubTree, 及时切断不合时宜的 set deep value。 吗？🤔   */
      const rawValue = getByPath(rawObj, keyPaths)
      const infinityNode = getByPath(treeRoot, keyPaths)
      loadInfiniteObjNode(infinityNode, (v) =>
        v ? options.injectValueToExistLeaf(treeNode, value) : options.createNewLeaf(rawValue),
      )
    })
  }

  function get<T>(selector: (r: Tree) => T): T {
    // @ts-expect-error no need to check
    return (selector(treeRoot) as any)() as T
  }

  if (rawObj) {
    set(rawObj)
  }
  return { rawObj, set, get }
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
