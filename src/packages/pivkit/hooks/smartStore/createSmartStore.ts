import { isFunction, isNullish, isObject, isPrimitive, type AnyObj, type MayArray } from '@edsolater/fnkit'
import { batch } from 'solid-js'
import { createStore, produce, unwrap, type SetStoreFunction } from 'solid-js/store'
import { asyncInvoke } from '../createContextStore/utils/asyncInvoke'
import {
  CreateSmartStoreOptions_OnPropertyChange,
  StoreCallbackRegisterer_OnPropertyChange,
  createSmartStore_onPropertyChange,
} from './features/onPropertyChange'
import {
  CreateSmartStoreOptions_OnStoreInit,
  StoreCallbackRegisterer_OnStoreInit,
  createSmartStore_onStoreInit,
} from './features/onStoreInit'
import {
  CreateSmartStoreOptions_OnFirstAccess,
  StoreCallbackRegisterer_OnFirstAccess,
  createSmartStore_onFirstAccess,
} from './features/onFirstAccess'

export type CreateSmartStoreOptions_BasicOptions<T extends Record<string, any>> = {}
export type CreateSmartStoreOptions<T extends Record<string, any>> = CreateSmartStoreOptions_BasicOptions<T> &
  CreateSmartStoreOptions_OnPropertyChange<T> &
  CreateSmartStoreOptions_OnFirstAccess<T> &
  CreateSmartStoreOptions_OnStoreInit<T>

export type SmartSetStore<T extends Record<string, any>> = (
  dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>,
) => Promise<T>

export type SmartStore<T extends Record<string, any>> = {
  store: T
  unwrappedStore: T
  setStore: SmartSetStore<T>

  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawStore: T
  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawSetStore: SetStoreFunction<T>
} & StoreCallbackRegisterer_OnPropertyChange<T> &
  StoreCallbackRegisterer_OnStoreInit<T> &
  StoreCallbackRegisterer_OnFirstAccess<T>

/** CORE, please client createContextStore or createGlobalStore\
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange
 * - object has merge to original store, not cover original store
 *
 */
export function createSmartStore<T extends Record<string, any>>(
  defaultValue: T,
  options?: CreateSmartStoreOptions<T>,
): SmartStore<T> {
  const [rawStore, rawSetStore] = createStore<T>(defaultValue)
  let accessCount: Record<string | symbol, number> = {}
  let setCount: Record<string | symbol, number> = {}

  // -------- features --------
  const { invoke: invokeOnChanges, addListener: addListenerPropertyChange } =
    createSmartStore_onPropertyChange<T>(options)
  const { invoke: invokeOnStoreInit, addListener: addListenerStoreInit } = createSmartStore_onStoreInit<T>(options)
  const { invoke: invokeOnFirstAccess, addListener: addListenerFirstAccess } =
    createSmartStore_onFirstAccess<T>(options)

  const store = new Proxy(
    {},
    {
      // result contain keys info
      get: (_, p, receiver) => {
        accessCount[p] = (accessCount[p] ?? 0) + 1
        if (accessCount[p] === 1) {
          invokeOnFirstAccess(p as string, rawStore[p as string], rawStore, setStore)
        }
        const propertyName = p as string
        const value = Reflect.get(rawStore, propertyName, receiver)
        return value
      },
    },
  ) as T

  const unwrappedStore = new Proxy(store, {
    get(target, p, receiver) {
      const pureStore = unwrap(target)
      return Reflect.get(pureStore, p, receiver)
    },
  })

  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): Promise<T> {
    return asyncInvoke(
      () => {
        const prevStore = rawStore
        const newStorePieces = isFunction(dispatch) ? dispatch(unwrap(rawStore)) : dispatch
        if (!newStorePieces) return store // no need to update store with the same value
        Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
          setCount[propertyName] = (setCount[propertyName] ?? 0) + 1
          // @ts-ignore
          const prevValue = prevStore[propertyName]
          if (prevValue !== newValue) {
            invokeOnChanges(propertyName, newValue, prevValue, store, setStore)
          }
        })
        batch(() => {
          Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
            rawSetStore(
              produce((draft: AnyObj) => {
                draft[propertyName] = assignToNewValue(draft[propertyName], newValue)
              }),
            )
          })
        })
        return store
      },
      { taskName: 'setSmartStore' },
    )
  }

  invokeOnStoreInit(store, setStore)

  return {
    store: store,
    unwrappedStore: unwrappedStore,
    setStore: setStore,
    onStoreInit: addListenerStoreInit,
    onPropertyChange: addListenerPropertyChange,
    onFirstAccess: addListenerFirstAccess,

    _rawStore: rawStore as T,
    _rawSetStore: rawSetStore,
  }
}

/**
 * use old object's reference
 * @param oldValue may be mutated
 * @param newValue provide new values
 */
function assignToNewValue(oldValue: unknown, newValue: unknown): unknown {
  if (isNullish(oldValue) || isPrimitive(oldValue)) return newValue
  if (isFunction(oldValue) && isFunction(newValue)) return newValue
  if (isObject(oldValue) && isObject(newValue)) {
    const newMutatedObj = mutateTwoObj(oldValue, newValue, assignToNewValue)
    return newMutatedObj
  }
  return newValue
}

function mutateTwoObj(
  oldObj: Record<keyof any, unknown>,
  newObj: Record<keyof any, unknown>,
  mutateFn?: (oldItem: unknown, newItem: unknown) => unknown,
): Record<keyof any, unknown> {
  const result = oldObj
  Object.entries(newObj).forEach(([key, newValue]) => {
    const oldValue = oldObj[key]
    const mutatedValue = mutateFn ? mutateFn(oldValue, newValue) : newValue
    result[key] = mutatedValue
  })
  return result
}
