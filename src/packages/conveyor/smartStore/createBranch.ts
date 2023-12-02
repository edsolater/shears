import { AnyObj, MayFn, Primitive, shrinkFn } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { Leaf, createLeaf } from './createLeaf'
import { createFakeTree } from './fakeTree'

export type SmartSetStore<T extends object> = (dispatch: MayFn<Partial<T>, [prevStore?: T]>) => void

export type Branch<T> = {
  [K in keyof T]: T[K] extends Primitive ? Leaf<T[K]> : Branch<T[K]>
}

export type BranchStore<T extends object> = {
  rawObj: T
  store: Branch<T>
  setStore: SmartSetStore<T>
}

/**
 * branch means taskSubscribable nodes
 * CORE, should platform-less (no solidjs or React or Vue)
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange
 * - object has merge to original store, not cover original store
 *
 * 
 * 💡 what if use cacheable {@link createTreeableInfinityNode}just
 * 
 * const leaf = get(s => s.a.b.c)
 * return 
 */
export function createBranchStore<T extends object>(defaultValue: T | Accessor<T>): BranchStore<T> {
  const rawDefaultValue = shrinkFn(defaultValue) as T
  // branch hold data
  const { rawObj, treeRoot, set } = createFakeTree(rawDefaultValue, {
    createNewLeaf: (rawValue) => createLeaf(rawValue),
    injectValueToExistLeaf: (leaf, val) => leaf.set(val),
  })

  return {
    rawObj,
    store: treeRoot as Branch<T>,
    setStore: set,
  }
}
