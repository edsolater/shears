import { isArray, isFunction, isObject, isObjectLiteral, shrinkFn } from '@edsolater/fnkit'
import { Accessor, untrack } from 'solid-js'
import { wrapLeafNodes } from '../../fnkit/wrapToDeep'
import { createTaskAtom, isTaskAtom } from '../taskAtom/taskAtom'
import { createStoreSetter } from './utils/setStoreByObject'
import { b } from 'vitest/dist/reporters-5f784f42'

type CreateSmartStoreOptions_BasicOptions<T extends Record<string, any>> = {}
export type CreateSmartStoreOptions<T extends Record<string, any>> = CreateSmartStoreOptions_BasicOptions<T>

export type SmartSetStore<T extends Record<string, any>> = (
  dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>,
) => void

export type SmartStore<T extends Record<string, any>> = {
  store: T
  setStore: SmartSetStore<T>

  accessCountStore: accessCountStore
  setCountStore: setCountStore
}

type accessCountStore = /* Record<keyof any, Subscribable<number> | accessCountStore> */ any
type setCountStore = /* Record<keyof any, Subscribable<number> | setCountStore> */ any

/**
 * CORE, should platform-less (no solidjs or React or Vue)
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange
 * - object has merge to original store, not cover original store
 *
 */
export function createSmartStore<T extends Record<string, any>>(
  defaultValue: T | Accessor<T>,
  options?: CreateSmartStoreOptions<T>,
): SmartStore<T> {
  const pale = shrinkFn(defaultValue)
  const store = getBranchFromPure(pale)
  const accessCountStore: accessCountStore = createCountStore(pale)
  const setCountStore: setCountStore = createCountStore(pale)

  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): void {
    const newStorePieces = shrinkFn(dispatch, [pale])
    if (!newStorePieces) return // no need to update store with the same value
    Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
      setCountStore[propertyName] = (setCountStore[propertyName] ?? 0) + 1
      const prevValue = pale[propertyName]
      const branch = store[propertyName]
      if (prevValue !== newValue) {
        // invokeOnChanges(propertyName, newValue, prevValue, store, setStore)
        pale[propertyName] = newValue
        updateBranch(branch, newValue)
      }
    })
  }

  /**
   * make store's value structure same as pale
   */
  function updateBranch(branch: any, newValue: any) {
    if (isObjectLiteral(newValue)) {
      Object.entries(newValue).forEach(([propertyName, newValue]) => {
        const newBranch = branch[propertyName]
        updateBranch(newBranch, newValue)
      })
    } else if (isArray(newValue)) {
      newValue.forEach((newValue, index) => {
        const newBranch = branch[index]
        updateBranch(newBranch, newValue)
      })
    } else if (isTaskAtom(branch)) {
      const branchValue = branch()
      if (branchValue !== newValue) {
        branch.set(newValue)
      }
    }
  }

  return {
    store: store,
    setStore: setStore,
    accessCountStore,
    setCountStore,
  }
}

export type Branch<T> = any /*  too difficult to type, not very necessay */

/**
 * {a: 1, b:()=>3} => {a: TaskAtom(1), b: TaskAtom(()=>3)}
 */
function getBranchFromPure<T>(pure: T): Branch<T> {
  return wrapLeafNodes(pure, (leaf) => createTaskAtom(leaf))
}

/**
 * reverse version of getBranchFromPure
 * {a: TaskAtom(1), b: TaskAtom(()=>3)} => {a: 1, b:()=>3}
 */
function getPureFromBranch<T>(branch: Branch<T>): T {
  return wrapLeafNodes(
    branch,
    (leaf) => (isTaskAtom(leaf) ? leaf() : leaf),
    (node) => isTaskAtom(node) || (!isObjectLiteral(node) && !isArray(node)),
  )
}

function createCountStore<T>(pure: T): accessCountStore {
  return wrapLeafNodes(pure, (leaf) => createTaskAtom(0))
}
