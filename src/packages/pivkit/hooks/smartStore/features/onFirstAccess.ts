import { MayArray } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'
import { createCallbacksStoreWithKeys } from '../utils/createCallbackStore'

type OnFirstAccessCallback<T extends Record<string, any>, K extends keyof T = any> = (payload: {
  value: T[K]
  store: T
  setStore: SmartSetStore<T>
}) => void | (() => void) /* clean function */
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
  const keyedCallbackStore = createCallbacksStoreWithKeys<keyof T, OnFirstAccessCallback<T>>({
    initCallbacks: options?.onFirstAccess,
  })

  function invoke(propertyName: keyof T, newValue: any, store: T, setStore: SmartSetStore<T>) {
    return keyedCallbackStore.invoke(propertyName)({ value: newValue, store, setStore })
  }
  function addListener<K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) {
    return keyedCallbackStore.addListener(key)(cb)
  }
  return { invoke, addListener }
}
