import { AnyFn, MayArray, flap } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'

export type OnChangeCallback<T extends Record<string, any>, K extends keyof T = keyof T> = (payload: {
  value: T[K]
  prevValue: T[K] | undefined
  store: T
  setStore: SmartSetStore<T>
  onCleanUp: (registeredCallback: () => void) => void
}) => void /* clean function */

export type CreateSmartStoreOptions_OnPropertyChange<T extends Record<string, any>> = {
  onPropertyChange?: {
    [K in keyof T]?: MayArray<OnChangeCallback<T, K>>
  }
}
export type StoreCallbackRegisterer_OnPropertyChange<T extends Record<string, any>> = {
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { remove(): void }
}

export function createSmartStore_onPropertyChange<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnPropertyChange<T>,
) {
  const registeredCallbacks = new Map<keyof T, OnChangeCallback<T, keyof T>[]>(
    Object.entries(options?.onPropertyChange ?? {}).map(([propertyName, callbacks]) => [propertyName, flap(callbacks)]),
  )
  const registeredCleanFn = new Map<OnChangeCallback<T, keyof T>, () => void>()

  function invoke(propertyName: string, newValue: any, prevValue: any, store: T, setStore: SmartSetStore<T>) {
    registeredCallbacks.get(propertyName)?.forEach((cb) => {
      const prevCleanFn = registeredCleanFn.get(cb)
      prevCleanFn?.()
      registeredCleanFn.delete(cb)
      const onCleanUp = (cleanFn: AnyFn) => {
        registeredCleanFn.set(cb, cleanFn)
      }
      cb({
        value: newValue,
        prevValue,
        store,
        setStore,
        onCleanUp: onCleanUp,
      })
    })
  }
  function addListener<K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) {
    const callbacks = registeredCallbacks.get(key) ?? []
    callbacks.push(cb as OnChangeCallback<T>)
    registeredCallbacks.set(key, callbacks)
    return {
      remove() {
        const callbacks = registeredCallbacks.get(key) ?? []
        registeredCallbacks.set(
          key,
          callbacks.filter((callback) => callback !== cb),
        )
      },
    }
  }
  return { invoke, addListener }
}

