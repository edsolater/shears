import { createGlobalHook } from '../createGlobalHook'
import { createProxiedStore, CreateProxiedStoreCallbacks } from './core'
import { DefaultStoreValue, OnChangeCallback, OnFirstAccessCallback, Store } from './type'

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>
): () => Store<T> {
  const proxiedStore = createProxiedStore(defaultValue, options)
  const useStore = createGlobalHook(() => proxiedStore)
  return useStore
}
