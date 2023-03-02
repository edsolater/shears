import { ShakeNever } from '@edsolater/fnkit'
import { SetStoreFunction } from 'solid-js/store'

export type Store<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : () => T[K]
} & {
  [K in keyof T as `set${Capitalize<K & string>}`]: T[K] extends (...args: any[]) => any
    ? never
    : K extends `set${string}`
    ? never
    : (dispatcher: ((newValue: T[K], prevValue?: T[K]) => T[K]) | T[K]) => T[K]
} & {
  setStore: SetStoreFunction<T>
}

// callback in createContextStore
export type OnFirstAccessCallback<T extends Record<string, any>, K extends keyof T> = (
  value: T[K],
  store: Store<T>
) => void

// callback in createContextStore
export type OnChangeCallback<T extends Record<string, any>, K extends keyof T> = (
  value: T[K],
  prevValue: T[K] | undefined,
  store: Store<T>
) => void
