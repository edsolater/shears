/**
 * FackTree
 * - for outside, it seems like a tree. but actually it is a proxy, inside, it's composed by node list and leaf rules and a proxy root node
 * - property will created only when use, by input node rules
 *
 */
type SymbolsCenter = {
  readonly TreeNodeValue: unique symbol
}

const value = Symbol('TreeNodeValue')
const path = Symbol('TreeNodePath')
type UserAttachedValue = any

type FakeNode<T> = T /* So can path travel */ & {
  /** path from root to this deep value  */
  [path]?: (keyof any)[]
  [value]?: any
}

type FakeTree<T> = T

export function createFakeTree<O extends object>(): FakeTree<O> {
  const rootEntry = recursivelyCreateInfiniteTree()

  // 🤔 seems no need to have setter and getter?
  return rootEntry
}

const currentPathFromRoot = Symbol('currentPathFromRoot')

function recursivelyCreateInfiniteTree(
  currentKeyPath: (keyof any)[] = [],
  attachedValueMap = new Map<(keyof any)[], UserAttachedValue>(), //TODO: should be a shallow compareable Map,
) {
  const pathCollector = new Proxy(
    { [currentPathFromRoot]: currentKeyPath },
    {
      set(target, key, value) {
        attachedValueMap.set(target[currentPathFromRoot].concat(key), value)
        return true
      },
      get(target, key) {
        const valueIsAlreadyInCache = attachedValueMap.has(target[currentPathFromRoot].concat(key))
        if (valueIsAlreadyInCache) return attachedValueMap.get(target[currentPathFromRoot].concat(key))
        return recursivelyCreateInfiniteTree(target[currentPathFromRoot].concat(key), attachedValueMap)
      },
    },
  )
  return pathCollector
}
