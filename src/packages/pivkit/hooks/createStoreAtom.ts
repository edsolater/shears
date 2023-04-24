import { isFunction } from '@edsolater/fnkit'
import { Setter, Signal, SignalOptions, createSignal } from 'solid-js'
import { createLazySignal } from './createLazySignal'

type StoreAtomOptions<T> = SignalOptions<T> & {
  onFirstAccess?: (getCurrentValue: () => T | undefined, setNew: Setter<T>) => void
  /** default value when lazy is true */
  lazyDefaultValue?: T
}

/**
 * @param value if it's function, it will be called only when first access. ()
 */
export function createStoreAtom<T>(): Signal<T | undefined>
export function createStoreAtom<T>(
  value: T | (() => T),
  options?: StoreAtomOptions<T>
): [getter: Signal<T>[0], setter: Signal<T>[1]]
export function createStoreAtom<T>(value?: T | (() => T), options?: StoreAtomOptions<T>): any {
  // get basic getter and setter
  const isLazy = isFunction(value)
  const [getter, setter] = (() =>
    isLazy
      ? createLazySignal(value, options?.lazyDefaultValue)
      : value == null
      ? createSignal<T>()
      : createSignal<T>(value, options))()

  // wrap getter to invoke onFirstAccess
  let haveInvokedFirstAccess = false
  const wrappedGetter = () => {
    if (haveInvokedFirstAccess === false) {
      options?.onFirstAccess?.(getter, setter as any /* no need to check */)
      haveInvokedFirstAccess = true
    }
    return getter()
  }

  return [wrappedGetter, setter]
}
