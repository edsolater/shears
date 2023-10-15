import { AnyFn, MayArray, flap } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'

type OnStoreInitCallback<T extends Record<string, any>> = (payload: {
  store: T
  setStore: SmartSetStore<T>
  onCleanUp: (registeredCallback: () => void) => void
}) => void

export type CreateSmartStoreOptions_OnStoreInit<T extends Record<string, any>> = {
  onStoreInit?: MayArray<OnStoreInitCallback<T>>
}

export type StoreCallbackRegisterer_OnStoreInit<T extends Record<string, any>> = {
  onStoreInit: (cb: OnStoreInitCallback<T>) => { remove(): void }
}

export function createSmartStore_onStoreInit<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnStoreInit<T>,
) {
  const registeredCallbacks = new Set<OnStoreInitCallback<T>>(flap(options?.onStoreInit ?? []))
  const registeredCleanFns = new Map<OnStoreInitCallback<T>, () => void>()

  function invoke(store: T, setStore: SmartSetStore<T>) {
    registeredCallbacks.forEach((cb) => {
      const prevCleanFn = registeredCleanFns.get(cb)
      prevCleanFn?.()
      registeredCleanFns.delete(cb)
      const onCleanUp = (cleanFn: AnyFn) => {
        registeredCleanFns.set(cb, cleanFn)
      }
      cb({
        store,
        setStore,
        onCleanUp: onCleanUp,
      })
    })
  }
  function addListener(cb: OnStoreInitCallback<T>) {
    registeredCallbacks.add(cb as OnStoreInitCallback<T>)
    return {
      remove() {
        registeredCallbacks.delete(cb)
      },
    }
  }
  return { invoke, addListener }
}
