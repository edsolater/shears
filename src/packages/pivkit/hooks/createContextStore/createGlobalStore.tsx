import { createGlobalHook } from '../createGlobalHook'
import { createProxiedStore, CreateProxiedStoreCallbacks } from './core'
import { DefaultStoreValue, OnChangeCallback, Store } from './type'

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: CreateProxiedStoreCallbacks<T>
): [
  useStore: () => Store<T>,
  rawStore: T,
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void }
] {
  const [proxiedStore, rawStore, onPropertyChange] = createProxiedStore(defaultValue, options)
  const useStore = createGlobalHook(() => proxiedStore)
  return [useStore, rawStore, onPropertyChange]
}