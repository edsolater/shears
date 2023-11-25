import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { unwrapWrappedLeaves, wrapLeaves } from '../../fnkit/wrapLeaves'
import { Leaf, createLeaf } from './createLeaf'
import { createFakeTree } from './fakeTree'

export type SmartSetStore<T extends object> = (dispatch: MayFn<Partial<T>, [prevStore?: T]>) => void

export type Branch<T> = {
  [K in keyof T]: T[K] extends object ? Branch<T[K]> : T[K] extends Leaf<any> ? T[K] : Leaf<T[K]>
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
 */
export function createBranchStore<T extends object>(defaultValue: T | Accessor<T>): BranchStore<T> {
  const rawDefaultValue = shrinkFn(defaultValue) as T
  // branch hold data
  const { rawObj, root, set } = createFakeTree(rawDefaultValue, {
    leaf:(rawValue)=> createLeaf(rawValue),
    injectValueToLeaf: (val, leaf) => leaf.set(val),
  })

  return {
    rawObj,
    store: root as Branch<T>,
    setStore: set,
  }
}
