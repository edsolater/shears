import { createCachedGlobalHook } from '../createGlobalHook'
import { createProxiedStore, CreateProxiedStoreCallbacks } from './createProxiedStore'
import { DefaultStoreValue, OnChangeCallback, Store } from './type'

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>
): [
  useStore: () => Store<T>,
  // don't use if possible, data in store is reactive
  rawStore: T,
  // don't use if possible, data in store is reactive
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void },
] {
  const [proxiedStore, rawStore, onPropertyChange] = createProxiedStore(defaultValue, options)
  const useStore = createCachedGlobalHook(() => proxiedStore)
  return [useStore, rawStore, onPropertyChange]
}
