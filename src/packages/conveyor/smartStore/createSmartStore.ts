import { isFunction, shrinkFn } from '@edsolater/fnkit'
import { Accessor, untrack } from 'solid-js'
import { wrapToDeep } from '../../fnkit/wrapToDeep'
import { createTaskAtom } from '../taskAtom/taskAtom'
import { createStoreSetter } from './utils/setStoreByObject'

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
  const store = getBranchFromPure(shrinkFn(defaultValue))
  const accessCountStore: accessCountStore = {}
  const setCountStore: setCountStore = {}

  // 🍻🍻🍻🍻🍻🍻🍻🍻🍻🍻
  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): void {
    const prevStore = untrack(() => rawStore)
    const newStorePieces = isFunction(dispatch) ? dispatch(prevStore) : dispatch
    if (!newStorePieces) return // no need to update store with the same value
    Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
      setCountStore[propertyName] = (setCountStore[propertyName] ?? 0) + 1
      // @ts-ignore
      const prevValue = prevStore[propertyName]
      if (prevValue !== newValue) {
        invokeOnChanges(propertyName, newValue, prevValue, store, setStore)
      }
    })
    rawSetStore(createStoreSetter(newStorePieces))
  }

  return {
    store: store,
    setStore: setStore,
    accessCountStore,
    setCountStore,
  }
}

export type Branch<T> = any /*  too difficult to type, not very necessay */

export function getBranchFromPure<T>(pure: T): Branch<T> {
  return wrapToDeep(pure, (leaf) => createTaskAtom(leaf))
}
