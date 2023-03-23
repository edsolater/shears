import { SetStoreFunction } from 'solid-js/store'

export type Store<T extends Record<string, any>> = T & {
  _setStore: SetStoreFunction<T>
  // 💡 like zustand's set
  set: (dispatcher: ((store: T) => Partial<T>) | Partial<T>) => Promise<Store<T>>
}

export type DefaultStoreValue<T extends Record<string, any>> = (
  /** only work in property method */
  store: Store<T>
) => Partial<T>

// callback in createContextStore
export type OnFirstAccessCallback<T extends Record<string, any>> = (store: Store<T>) => void

export type OnStoreInitCallback<T extends Record<string, any>> = (store: Store<T>) => void

// callback in createContextStore
export type OnChangeCallback<T extends Record<string, any>, K extends keyof T = keyof T> = (
  value: T[K],
  prevValue: T[K] | undefined,
  store: Store<T>
) => void | (() => void) /* clean function */
