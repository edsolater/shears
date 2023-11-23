/**
 * FackTree
 * - for outside, it seems like a tree. but actually it is a proxy, inside, it's composed by node list and leaf rules and a proxy root node
 * - property will created only when use, by input node rules
 */
type SymbolsCenter = {
  readonly TreeNodeValue: unique symbol
}

const s = Symbol('TreeNodeValue')

const TODO = typeof s
type FackTreeNode<T> = {
  [s]: any
}

type FakeTreeInner<T> = {
  root: T // proxy entry:
  nodes: Map<string, any>
  rule: (keyPath: keyof any[]) => any
}

function createFakeTree() {
  function recursivelyCreateTree(currentKeyPath: (keyof any)[] = []) {
    const fakeTree = new Proxy(
      {},
      {
        get(target, key) {
          return recursivelyCreateTree(key)
        },
      },
    )
    return fakeTree
  }

  const fakeTree = recursivelyCreateTree()
  return fakeTree
}
