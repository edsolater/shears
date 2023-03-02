import { createGlobalHook } from '../createGlobalHook'
import { createProxiedStore } from './core'
import { OnChangeCallback, OnFirstAccessCallback, Store } from './type'

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue?: T,
  options?: {
    onFirstAccess?: { propertyName: keyof T; cb: OnFirstAccessCallback<T, any> }[]
    onChange?: { propertyName: keyof T; cb: OnChangeCallback<T, keyof T> }[]
  }
): () => Store<T> {
  const proxiedStore = createProxiedStore(defaultValue, options)
  const useStore = createGlobalHook(() => proxiedStore)
  return useStore
}
