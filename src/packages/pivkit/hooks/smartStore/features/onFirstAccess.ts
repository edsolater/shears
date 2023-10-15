import { AnyFn, MayArray, flap } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'

type OnFirstAccessCallback<T extends Record<string, any>, K extends keyof T = keyof T> = (payload: {
  value: T[K]
  store: T
  setStore: SmartSetStore<T>
  onCleanUp: (registeredCallback: () => void) => void
}) => void /* clean function */

export type CreateSmartStoreOptions_OnFirstAccess<T extends Record<string, any>> = {
  onFirstAccess?: {
    [K in keyof T]?: MayArray<OnFirstAccessCallback<T, K>>
  }
}
export type StoreCallbackRegisterer_OnFirstAccess<T extends Record<string, any>> = {
  onFirstAccess: <K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) => { remove(): void }
}

export function createSmartStore_onFirstAccess<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnFirstAccess<T>,
) {
  const registeredCallbacks = new Map<keyof T, OnFirstAccessCallback<T, keyof T>[]>(
    Object.entries(options?.onFirstAccess ?? {}).map(([propertyName, callbacks]) => [propertyName, flap(callbacks)]),
  )
  const registeredCleanFn = new Map<OnFirstAccessCallback<T, keyof T>, () => void>()

  function invoke(propertyName: keyof T, newValue: any, store: T, setStore: SmartSetStore<T>) {
    registeredCallbacks.get(propertyName)?.forEach((cb) => {
      const prevCleanFn = registeredCleanFn.get(cb)
      prevCleanFn?.()
      registeredCleanFn.delete(cb)
      const onCleanUp = (cleanFn: AnyFn) => {
        registeredCleanFn.set(cb, cleanFn)
      }
      cb({
        value: newValue,
        store,
        setStore,
        onCleanUp: onCleanUp,
      })
    })
  }
  function addListener<K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) {
    const callbacks = registeredCallbacks.get(key) ?? []
    callbacks.push(cb as OnFirstAccessCallback<T>)
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
