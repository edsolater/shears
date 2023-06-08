import { isFunction } from '@edsolater/fnkit'
import { Setter, Signal, SignalOptions, createSignal } from 'solid-js'
import { createLazySignal } from './createLazySignal'

type AtomPlugin<T> = (accessor: () => T, setter: Setter<T>) => Record<string, any> // <-- will merge to atoms

type StoreAtomOptions<T> = SignalOptions<T> & {
  onFirstAccess?: (getCurrentValue: () => T | undefined, setNew: Setter<T>) => void
  /** default value when lazy is true */
  lazyDefaultValue?: T
  plugins?: AtomPlugin<T>[] // TODO: imply it !!!
}

export type StoreAtomAccessor<T> = Signal<T>[0]
export type StoreAtomSetter<T> = Signal<T>[1]

type StoreAtomFn<T> = {
  val: StoreAtomAccessor<T>
  set: StoreAtomSetter<T>
}

export type StoreAtom<T> = {
  (): StoreAtomFn<T>
  val: Signal<T>
  set(patcher: T | ((prev: T) => T)): void
}
/**
 * @param value if it's function, it will be called only when first access. ()
 */
export function createStoreAtom<T>(value?: T | (() => T), options?: StoreAtomOptions<T>): StoreAtom<T> {
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

  function atom() {
    return { val: wrappedGetter, set: setter } as StoreAtomFn<T>
  }
  Object.defineProperty(atom, 'val', {
    get: wrappedGetter,
    set: setter,
  })
  atom.set = setter
  return atom as unknown as StoreAtom<T>
}
