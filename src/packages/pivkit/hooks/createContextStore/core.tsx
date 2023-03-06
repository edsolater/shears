import { AnyFn, isFunction, isString, uncapitalize } from '@edsolater/fnkit'
import { createStore } from 'solid-js/store'
import { asyncInvoke } from './utils/asyncInvoke'
import { DefaultStoreValue, OnChangeCallback, OnFirstAccessCallback, Store } from './type'

function toCallbackMap<F extends AnyFn>(pairs: { propertyName: string | number | symbol; cb: F }[] = []) {
  const map = new Map<keyof any, F[] | undefined>()
  pairs.forEach(({ propertyName, cb }) => {
    if (!isString(propertyName)) throw new Error('propertyName must be string')
    const callbacks = map.get(propertyName) ?? []
    callbacks.push(cb)
    map.set(propertyName, callbacks)
  })
  return map
}

export type CreateProxiedStoreCallbacks<T extends Record<string, any>> = {
  onInit?: { cb: (store: Store<T>) => void }[]
  onPropertyFirstAccess?: {
    propertyName: keyof T
    cb: OnFirstAccessCallback<T>
  }[]
  onChange?: {
    propertyName: keyof T
    cb: OnChangeCallback<T>
  }[]
}

/** CORE */
export function createProxiedStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>
): [
  proxiedStore: Store<T>,
  rawStore: T,
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void }
] {
  const onFirstAccessCallbackMap = new Map(toCallbackMap(options?.onPropertyFirstAccess))
  const onChangeCallbackMap = new Map(toCallbackMap(options?.onChange))
  const onChangeCleanFnMap = new Map<AnyFn, () => void>()

  function invokeOnInitGets(propertyName: string, value: any, store: Store<T>) {
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
        if (p === 'setStore') return setRawStore

        const targetType = isString(p) && p.startsWith('set') ? 'setter' : 'getter(methods)'

        if (targetType === 'setter') {
          const propertyName = uncapitalize((p as string).slice('set'.length))
          return (dispatch: ((newValue: unknown, prevValue?: unknown) => unknown) | unknown) =>
            asyncInvoke(
              () => {
                const prevValue = Reflect.get(rawStore, propertyName, receiver)
                const newValue = isFunction(dispatch) ? dispatch(prevValue) : dispatch
                if (prevValue === newValue) return // no need to update store with the same value
                invokeOnChanges(propertyName, newValue, prevValue, proxiedStore)
                setRawStore({ [propertyName]: newValue })
                return newValue
              },
              {
                key: propertyName
              }
            )
        }

        if (targetType === 'getter(methods)') {
          return (...args) => {
            const propertyName = p as string
            const newValue = Reflect.get(rawStore, propertyName, receiver)
            invokeOnInitGets(propertyName, newValue, proxiedStore)
            return isFunction(newValue) ? newValue(...args) : newValue
          }
        }
      }
    }
  ) as Store<T>
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
