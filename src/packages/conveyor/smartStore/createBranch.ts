import { isArray, isObjectLike, isObjectLiteral, shrinkFn } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { unwrapWrappedLeaves, wrapLeaves } from '../../fnkit/wrapLeaves'
import { Leaf, createLeaf, isLeaf } from './createLeaf'
import { Task } from 'vitest'

type CreateSmartStoreOptions_BasicOptions<T extends Record<string, any>> = {}
export type CreateSmartStoreOptions<T extends Record<string, any>> = CreateSmartStoreOptions_BasicOptions<T>

export type SmartSetStore<T extends Record<string, any>> = (
  dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>,
) => void

export type BranchStore<T extends Record<string, any>> = {
  store: Branch<T>
  setStore: SmartSetStore<T>

  // getFromValue: (value: any) => any
  accessCountStore: accessCountStore
  setCountStore: setCountStore
}

type accessCountStore = /* Record<keyof any, Subscribable<number> | accessCountStore> */ any
type setCountStore = /* Record<keyof any, Subscribable<number> | setCountStore> */ any

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
export function createBranchStore<T extends Record<string, any>>(defaultValue: T | Accessor<T>): BranchStore<T> {
  const rawValue = shrinkFn(defaultValue)
  // hold data
  const branchStore = branchify(rawValue)
  const accessCountStore: accessCountStore = createCountStore(rawValue)
  const setCountStore: setCountStore = createCountStore(rawValue)

  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): void {
    const newStorePieces = shrinkFn(dispatch, [rawValue])
    if (!newStorePieces) return // no need to update store with the same value
    Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
      setCountStore[propertyName] = (setCountStore[propertyName] ?? 0) + 1
      const prevValue = rawValue[propertyName]
      const branch = branchStore[propertyName]
      if (prevValue !== newValue) {
        // invokeOnChanges(propertyName, newValue, prevValue, store, setStore)
        rawValue[propertyName] = newValue
        updateBranch(branch, newValue)
      }
    })
  }

  /**
   * make store's value structure same as pale
   * travel all branch
   */
  function updateBranch(branch: any, newValue: any) {
    if (isObjectLiteral(newValue)) {
      // should go deeper
      Object.entries(newValue).forEach(([propertyName, newValue]) => {
        const newBranch = branch[propertyName]
        updateBranch(newBranch, newValue)
      })
    } else if (isArray(newValue)) {
      // should go deeper
      newValue.forEach((newValue, index) => {
        const newBranch = branch[index]
        updateBranch(newBranch, newValue)
      })
    } else if (isLeaf(branch)) {
      const branchValue = branch()
      if (branchValue !== newValue) {
        branch.set(newValue)
      }
    }
  }

  return {
    store: branchStore,
    setStore: setStore,
    accessCountStore,
    setCountStore,
  }
}

function createCountStore<T>(pure: T): accessCountStore {
  return wrapLeaves(pure, { wrap: (leaf) => createLeaf(0) })
}

// -------- branch utils --------
export type Branch<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? Branch<T[K]> : T[K] extends Leaf<any> ? T[K] : Leaf<T[K]>
}

/**
 * {a: 1, b:()=>3} => {a: Leaf(1), b: Leaf(()=>3)}
 */
export function branchify<T>(pure: T): Branch<T> {
  return wrapLeaves(pure, { wrap: (leaf) => createLeaf(leaf) })
}

/**
 * reverse version of getBranchFromPure
 * {a: Leaf(1), b: Leaf(()=>3)} => {a: 1, b:()=>3}
 */
export function debranchify<T>(branch: Branch<T>): T {
  return unwrapWrappedLeaves(branch)
}