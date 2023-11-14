import { AnyFn, Subscribable } from '@edsolater/fnkit'

type Atom<T> = {
  value: Subscribable<T>
  /** so, u can 'mute' the action  */
  isSubscribedBy?: Set<AnyFn>
  update?: (oldValue: T) => void
}

type SmartStore<T extends object> = {
  [K in keyof T]: Atom<T[K]>
}

type SmartStoreOption = {}

type SmartStoreDefaultValue = Record<keyof any, any>

/** create Store by subscribable */
export function smartStore<T extends SmartStoreDefaultValue>(defaultValue?: T, options?: SmartStoreOption) {
  const innerStore: { [K in keyof T]?: T[] } = {}
  if (defaultValue) {
    const defaultSymbolPairs = Object.getOwnPropertySymbols(defaultValue).map((key) => [key, defaultValue[key]])
    const defaultStringPairs = Object.entries(defaultValue)
    for (const [key, value] of defaultSymbolPairs.concat(defaultStringPairs)) {
    }
  }
}

/** pick store value, each 'picking' must add the action context */
function smartStoreGet<T extends object, R>(
  store: SmartStore<T>,
  pickFn: (s: SmartStore<T>) => Atom<R>,
  /** will observer the context */
  context: AnyFn,
): Atom<R> {
  const atom = pickFn(store)
  if (!atom.isSubscribedBy) atom.isSubscribedBy = new Set()
  atom.isSubscribedBy!.add(context)
  return atom
}
