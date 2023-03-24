import { AnyFn, flapDeep, isFunction, isString, MayArray, MayDeepArray } from '@edsolater/fnkit'
import { createStore, reconcile } from 'solid-js/store'
import { asyncInvoke } from './utils/asyncInvoke'
import { DefaultStoreValue, OnChangeCallback, OnFirstAccessCallback, Store } from './type'
import { batch } from 'solid-js'

function toCallbackMap<F extends AnyFn>(
  pairs: MayDeepArray<{ propertyName: MayArray<string | number | symbol>; cb: F }> | undefined
) {
  const map = new Map<keyof any, F[] | undefined>()
  function recordCallback(propertyName: string | number | symbol, cb: F) {
    const p = String(propertyName)
    const callbacks = map.get(p) ?? []
    callbacks.push(cb)
    map.set(p, callbacks)
  }
  if (!pairs) return map
  flapDeep(pairs).forEach(({ propertyName, cb }) => {
    if (Array.isArray(propertyName)) {
      propertyName.forEach((p) => recordCallback(p, cb))
    } else {
      recordCallback(propertyName, cb)
    }
  })
  return map
}

export type CreateProxiedStoreCallbacks<T extends Record<string, any>> = {
  onInit?: { cb: (store: Store<T>) => void }[]
  onFirstAccess?: MayDeepArray<{
    propertyName: MayArray<keyof T>
    cb: OnFirstAccessCallback<T>
  }>
  onChange?: MayDeepArray<{
    propertyName: MayArray<keyof T>
    cb: OnChangeCallback<T>
  }>
}

/** CORE, please client createContextStore or createGlobalStore */
export function createProxiedStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>
): [
  proxiedStore: Store<T>,
  rawStore: T,
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void }
] {
  const onFirstAccessCallbackMap = new Map(toCallbackMap(options?.onFirstAccess))
  const onChangeCallbackMap = new Map(toCallbackMap(options?.onChange))
  const onChangeCleanFnMap = new Map<AnyFn, () => void>()

  function invokeOnFirstAccess(propertyName: string, value: any, store: Store<T>) {
    if (onFirstAccessCallbackMap.has(propertyName)) {
      const callbacks = onFirstAccessCallbackMap.get(propertyName)
      onFirstAccessCallbackMap.delete(propertyName) // it's init, so sould delete eventually
      callbacks?.forEach((cb) => {
        Promise.resolve().then(() => cb(store)) // invoke in microtask to speed up
      })
    }
  }
  function invokeOnChanges(propertyName: string, newValue: any, prevValue: any, store: Store<T>) {
    onChangeCallbackMap.get(propertyName)?.forEach((cb) => {
      const prevCleanFn = onChangeCleanFnMap.get(cb)
      if (prevCleanFn) prevCleanFn()
      const cleanFn = cb(newValue, prevValue, store)
      if (cleanFn) onChangeCleanFnMap.set(cb, cleanFn)
    })
  }

  const proxiedStore = new Proxy(
    {},
    {
      // result contain keys info
      get: (_, p, receiver) => {
        if (p === '_setStore') return setRawStore

        const targetType = p === 'set' ? 'setter' : 'getter(methods)'

        if (targetType === 'setter') {
          return (dispatch: ((prevValue?: unknown) => unknown) | unknown) =>
            asyncInvoke(
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
                    // @ts-ignore
                    const prevValue = prevStore[propertyName]
                    if (newValue !== prevValue) {
                      // @ts-ignore
                      setRawStore(propertyName, reconcile(newValue))
                    }
                  })
                })
                return proxiedStore
              },
              {
                key: 'setStore'
              }
            )
        }

        if (targetType === 'getter(methods)') {
          const propertyName = p as string
          const value = Reflect.get(rawStore, propertyName, receiver)
          invokeOnFirstAccess(propertyName, value, proxiedStore)
          return value
        }
      }
    }
  ) as Store<T>

  // 🚧 use solid system to hold reactive system
  const [rawStore, setRawStore] = createStore(defaultValue?.(proxiedStore))

  // invoke onStoreInit callbacks
  options?.onInit?.forEach(({ cb }) => cb(proxiedStore))

  function addOnChange<K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) {
    const callbacks = onChangeCallbackMap.get(key) ?? []
    callbacks.push(cb as OnChangeCallback<T>)
    onChangeCallbackMap.set(key, callbacks)
    return {
      abort() {
        const callbacks = onChangeCallbackMap.get(key) ?? []
        onChangeCallbackMap.set(
          key,
          callbacks.filter((callback) => callback !== cb)
        )
      }
    }
  }
  return [proxiedStore, rawStore as T, addOnChange]
}
