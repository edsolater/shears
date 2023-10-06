import { isFunction } from '@edsolater/fnkit'
import { Accessor, Setter, Signal, SignalOptions, createEffect, createMemo, createSignal } from 'solid-js'
import { createLazySignal } from './createLazySignal'

type AtomPlugin<T> = (accessor: () => T, setter: Setter<T>) => Record<string, any> // <-- will merge to atoms

type AtomOptions<T> = SignalOptions<T> & {
  onFirstAccess?: (getCurrentValue: () => T | undefined, setNew: Setter<T>) => void
  /** default value when lazy is true */
  lazyDefaultValue?: T
  plugins?: AtomPlugin<T>[] // TODO: imply it !!!
}

/** handle state */
export type Atom<T = any> = {
  accessor: Accessor<T>
  setter: Setter<T>
  /** default is zero */
  accessCount: Accessor<number>
}

/**
 * small piece of store state of an app
 * @param value if it's function, it will be called only when first access. ()
 */
export function createAtom<T>(): Atom<T | undefined>
export function createAtom<T>(value: T | (() => T), options?: AtomOptions<T>): Atom<T>
export function createAtom<T>(value?: T | (() => T), options?: AtomOptions<T>): Atom {
  // get basic getter and setter
  const shouldLazyLoad = isFunction(value)
  const [getter, setter] = (() =>
    shouldLazyLoad
      ? createLazySignal(value, options?.lazyDefaultValue)
      : value == null
      ? createSignal<T>()
      : createSignal<T>(value, options))()

  const [accessCount, setAccessCount] = createSignal(0)
  const wrappedGetter = () => {
    setAccessCount((n) => n + 1)
    return getter()
  }

  return { accessor: wrappedGetter, setter: setter, accessCount }
}

/**
 * for readablity
 * @param atom atom
 * @returns
 */
export function useAtom<T>(atom: Atom<T>) {
  const { accessor, setter, accessCount } = atom
  return { get: accessor, set: setter }
}

/**
 * create effect like
 * @param atom
 * @param cb
 * @returns
 */
export function createAccessAtomEffect(atom: Atom, cb: (info: { accessCount: number }) => void) {
  return createEffect(() => {
    cb({ accessCount: atom.accessCount() })
  })
}

export function createFirstAccessAtomEffect(atom: Atom, cb: () => void) {
  const hasFirstAccessed = createMemo(() => atom.accessCount() === 1)
  return createEffect(() => {
    if (hasFirstAccessed()) cb()
  })
}
