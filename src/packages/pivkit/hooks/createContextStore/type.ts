import { AnyFn, ShakeNever } from '@edsolater/fnkit'
import { SetStoreFunction } from 'solid-js/store'

type StoreAccessor<T> = () => T
type StoreSetter<T> = (dispatcher: ((newValue: T, prevValue?: T) => T) | T) => Promise<T>

export type Store<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends AnyFn ? T[K] : StoreAccessor<T[K]>
} &
  ShakeNever<
    {
      [K in keyof T as `set${Capitalize<K & string>}`]-?: T[K] extends AnyFn
        ? never
        : K extends `set${string}`
        ? never
        : StoreSetter<T[K]>
    }
  > & {
    setStore: SetStoreFunction<T>
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
