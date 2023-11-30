import { MayFn, cloneObject, shrinkFn } from '@edsolater/fnkit'
import { createInfiniteObj, isFakeTreeEmptyLeaf } from '../../fnkit/createInfiniteObj'
import { getByPath, setByPath, walkThroughObject } from '../../fnkit/walkThroughObject'

type FakeTree<T> = T
type FakeTreeLeaf = object

/** just a InfiniteObj with leaf ,inside unknow what is leaf's content*/
export function createFakeTree<O extends object, Leaf extends FakeTreeLeaf = object>(
  rawObject: O,
  options: { createLeaf: (rawValue: any) => Leaf; injectValueToLeaf: (loadedNode: Leaf, rawValue: any) => void },
) {
  const rawObj = cloneObject(rawObject)
  const treeRoot = createInfiniteObj() as FakeTree<O>
  /**
   * sync
   * change by this will also change the original object
   */
  function set(dispatcher: MayFn<Partial<O>, [old: O]>) {
    const userInputSubTree = shrinkFn(dispatcher, [rawObj]) as Partial<O> // TODO: type of `shringFn` is wrong
    walkThroughObject(userInputSubTree, ({ keyPaths, parentPath, currentKey, value }) => {
      
      console.log('keyPaths: ', keyPaths)
      // set raw
      setByPath(rawObj, keyPaths, value)
      
      // set tree
      const treeNode = getByPath(treeRoot, keyPaths)
      console.log('root: ', treeRoot, keyPaths);
      console.log('treeNode: ', treeNode)
      /** bug is already prent node already have node on it , so fail to set deep value on it. So 层序遍历 userInputSubTree, 及时切断不合时宜的 set deep value。 吗？🤔   */
      if (isFakeTreeEmptyLeaf(treeNode)) {
        const rawValue = getByPath(rawObj, keyPaths)
        setByPath(treeRoot, keyPaths, options.createLeaf(rawValue))
      } else {
        options.injectValueToLeaf(treeNode, value)
      }
    })
  }

  if (rawObj){
    set(rawObj)
  }
  return { rawObj, treeRoot, set }
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
