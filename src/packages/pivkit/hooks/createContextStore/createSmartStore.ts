import {
  flap,
  isFunction,
  isNullish,
  isObject,
  isPrimitive,
  type AnyFn,
  type AnyObj,
  type MayArray,
} from '@edsolater/fnkit'
import { batch } from 'solid-js'
import { createStore, produce, unwrap, type SetStoreFunction } from 'solid-js/store'
import type { OnChangeCallback, Store } from './type'
import { asyncInvoke } from './utils/asyncInvoke'

export type CreateProxiedStoreCallbacks<T extends Record<string, any>> = {
  onInit?: MayArray<{ cb: (store: Store<T>) => void }>
  onPropertyChange?: {
    [K in keyof T]?: MayArray<OnChangeCallback<T, K>>
  }
}

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
  options?: CreateProxiedStoreCallbacks<T>,
): {
  store: T
  unwrappedStore: T
  setStore(dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>): Promise<Store<T>>
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void }

  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawStore: T
  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawSetStore: SetStoreFunction<T>
} {
  const [rawStore, rawSetStore] = createStore<T>(defaultValue)
  const inputOnChangeCallbacks = Object.entries(options?.onPropertyChange ?? {}).map(([propertyName, callbacks]) => [
    propertyName,
    flap(callbacks),
  ]) as [keyof T, OnChangeCallback<T, keyof T>[]][]
  const onChangeCallbackMap = new Map<keyof T, OnChangeCallback<T, keyof T>[]>(inputOnChangeCallbacks)
  const onChangeCleanFnMap = new Map<OnChangeCallback<T, keyof T>, () => void>()

  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): Promise<Store<T>> {
    return asyncInvoke(
      () => {
        const prevStore = rawStore
        const newStorePieces = isFunction(dispatch) ? dispatch(unwrap(rawStore)) : dispatch
        if (!newStorePieces) return store // no need to update store with the same value
        Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
          // @ts-ignore
          const prevValue = prevStore[propertyName]
          invokeOnChanges(propertyName, newValue, prevValue, store)
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
      { taskName: 'setStore' },
    )
  }

  const store = new Proxy(
    {},
    {
      // result contain keys info
      get: (_, p, receiver) => {
        const propertyName = p as string
        const value = Reflect.get(rawStore, propertyName, receiver)
        return value
      },
    },
  ) as Store<T>

  function invokeOnChanges(propertyName: string, newValue: any, prevValue: any, store: Store<T>) {
    onChangeCallbackMap.get(propertyName)?.forEach((cb) => {
      const prevCleanFn = onChangeCleanFnMap.get(cb)
      prevCleanFn?.()
      onChangeCleanFnMap.delete(cb)
      const onCleanUp = (cleanFn: AnyFn) => {
        onChangeCleanFnMap.set(cb, cleanFn)
      }
      cb({
        value: newValue,
        prevValue,
        store,
        onCleanUp: onCleanUp,
      })
    })
  }

  function addListenerPropertyChange<K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) {
    const callbacks = onChangeCallbackMap.get(key) ?? []
    callbacks.push(cb as OnChangeCallback<T>)
    onChangeCallbackMap.set(key, callbacks)
    return {
      abort() {
        const callbacks = onChangeCallbackMap.get(key) ?? []
        onChangeCallbackMap.set(
          key,
          callbacks.filter((callback) => callback !== cb),
        )
      },
    }
  }

  // invoke onStoreInit callbacks
  if (options?.onInit) {
    flap(options.onInit).forEach(({ cb }) => cb(store))
  }

  const unwrappedStore = new Proxy(store, {
    get(target, p, receiver) {
      const pureStore = unwrap(target)
      return Reflect.get(pureStore, p, receiver)
    },
  })

  return {
    store: store,
    unwrappedStore: unwrappedStore,
    setStore: setStore,
    onPropertyChange: addListenerPropertyChange,

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
