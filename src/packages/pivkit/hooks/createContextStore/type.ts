import { AnyFn, ShakeNever } from '@edsolater/fnkit'
import { SetStoreFunction } from 'solid-js/store'

type StoreAccessor<T> = () => T
type StoreSetter<T> = (dispatcher: ((prevValue?: T) => T) | T) => T

export type Store<T extends Record<string, any>> =
  T & //   [K in keyof T as `set${Capitalize<K & string>}`]-?: T[K] extends AnyFn // ShakeNever<{
  //     ? never
  //     : K extends `set${string}`
  //     ? never
  //     : StoreSetter<T[K]>
  // }> &
  {
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
