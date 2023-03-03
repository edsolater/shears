import { createGlobalHook } from '../createGlobalHook'
import { createProxiedStore } from './core'
import { DefaultStoreValue, OnChangeCallback, OnFirstAccessCallback, Store } from './type'

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: {
    onFirstAccess?: { propertyName: keyof T; cb: OnFirstAccessCallback<T> }[]
    onChange?: { propertyName: keyof T; cb: OnChangeCallback<T, keyof T> }[]
  }
): () => Store<T> {
  const proxiedStore = createProxiedStore(defaultValue, options)
  const useStore = createGlobalHook(() => proxiedStore)
  return useStore
}
