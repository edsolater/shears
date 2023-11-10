import { Subscribable } from '@edsolater/fnkit'

type Atom<T> = {
  value: Subscribable<T>
  /** so, u can 'mute' the action  */
  isSubscribedBy?: T[]
  updateAction?: (oldValue: T) => void
}

type SmartStore = {
  xxx: Atom<unknown>
}

type SmartStoreOption = {}

type SmartStoreDefaultValue = Record<keyof any, any>

/** create Store by subscribable */
export function smartStore<T extends SmartStoreDefaultValue>(defaultValue?: T, options?: SmartStoreOption) {
  const innerStore: { [K in keyof T]: T[] } = {}
  if (defaultValue) {
    const defaultSymbolPairs = Object.getOwnPropertySymbols(defaultValue).map((key) => [key, defaultValue[key]])
    const defaultStringPairs = Object.entries(defaultValue)
    for (const [key, value] of defaultSymbolPairs.concat(defaultStringPairs)) {
    }
  }
}
