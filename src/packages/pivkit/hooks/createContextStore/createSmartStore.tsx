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
import { createStore, produce, type SetStoreFunction } from 'solid-js/store'
import type { DefaultStoreValue, OnChangeCallback, Store } from './type'
import { asyncInvoke } from './utils/asyncInvoke'

export type CreateProxiedStoreCallbacks<T extends Record<string, any>> = {
  onInit?: { cb: (store: Store<T>) => void }[]
  onChange?: {
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
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>,
): {
  store: Store<T>
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void }
  set(dispatch: ((prevValue?: unknown) => unknown) | unknown): Promise<Store<T>>

  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawStore: T
  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawSetStore: SetStoreFunction<object>
} {
  const [rawStore, rawSetStore] = createStore(defaultValue)
  const inputOnChangeCallbacks = Object.entries(options?.onChange ?? {}).map(([propertyName, callbacks]) => [
    propertyName,
    flap(callbacks),
  ]) as [keyof T, OnChangeCallback<T, keyof T>[]][]
  const onChangeCallbackMap = new Map<keyof T, OnChangeCallback<T, keyof T>[]>(inputOnChangeCallbacks)
  const onChangeCleanFnMap = new Map<OnChangeCallback<T, keyof T>, () => void>()

  function proxiedStoreSet(dispatch: ((prevValue?: unknown) => unknown) | unknown): Promise<Store<T>> {
    return asyncInvoke(
      () => {
        const prevStore = rawStore
        const newStore = isFunction(dispatch) ? dispatch(rawStore) : dispatch
        if (!newStore) return proxiedStore // no need to update store with the same value
        Object.entries(newStore).forEach(([propertyName, newValue]) => {
          // @ts-ignore
          const prevValue = prevStore[propertyName]
          invokeOnChanges(propertyName, newValue, prevValue, proxiedStore)
        })
        batch(() => {
          Object.entries(newStore).forEach(([propertyName, newValue]) => {
            rawSetStore(
              produce((draft: AnyObj) => {
                draft[propertyName] = assignToNewValue(draft[propertyName], newValue)
              }),
            )
          })
        })
        return proxiedStore
      },
      { taskName: 'setStore' },
    )
  }

  const proxiedStore = new Proxy(
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
  options?.onInit?.forEach(({ cb }) => cb(proxiedStore))

  return {
    store: proxiedStore,
    _rawStore: rawStore as T,
    onPropertyChange: addListenerPropertyChange,
    set: proxiedStoreSet,
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
