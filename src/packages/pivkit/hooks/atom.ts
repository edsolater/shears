import { Subscription, isArray, isFunction } from '@edsolater/fnkit'
import {
  Accessor,
  Setter,
  SignalOptions,
  createEffect,
  createSignal,
  on,
  untrack,
  onCleanup as solidOnCleanup,
} from 'solid-js'
import { createLazySignal } from './createLazySignal'
import { createStore } from 'solid-js/store'

type AtomPlugin<T> = (accessor: () => T, setter: Setter<T>) => Record<string, any> // <-- will merge to atoms

type AtomCallbackInfo<T> = { get(): T; set: T | ((prev: T) => T) }

type AtomOnFirstAccessCallback<T> = (info: AtomCallbackInfo<T>) => void
type AtomOnAccessCallback<T> = (info: AtomCallbackInfo<T> & { accessCount(): number }) => void
type AtomOnChangeCallback<T> = (
  info: AtomCallbackInfo<T> & { prev(): T | undefined; onCleanup(cb: () => void): void },
) => void

type CreateAtomOptions<T> = {
  /**
   * @default 'solid-signal'
   */
  state: 'solid-store' /* createStore */ | 'solid-signal' /* createSignal */

  signalOptions?: SignalOptions<T>

  /** default value when lazy is true */
  lazyDefaultValue?: T
  plugins?: AtomPlugin<T>[] // TODO: imply it !!!

  /** if true, the atom 's value will be record in a array */
  // TODO: imply it!!!
  atomHistoryOptions?: {
    /** max length of the history array */
    maxLength?: number
  }

  onFirstAccess?: AtomOnFirstAccessCallback<T>
  onAccess?: AtomOnAccessCallback<T>
  onChange?: AtomOnChangeCallback<T>
}

/** handle state */
export type Atom<T = any> = {
  getAccessor: Accessor<T>
  set: Setter<T>
  get: T
  onFirstAccess(callback: AtomOnFirstAccessCallback<T>): Subscription
  onAccess(callback: AtomOnAccessCallback<T>): Subscription
  onChange(callback: AtomOnChangeCallback<T>): Subscription
}

/**
 * small piece of store state of an app \
 * usually in mainthread
 * @param value if it's function, it will be called only when first access. ()
 */
export function createAtom<T>(): Atom<T | undefined>
export function createAtom<T>(value: T | (() => T), options?: CreateAtomOptions<T>): Atom<T>
export function createAtom<T>(value?: T | (() => T), options?: CreateAtomOptions<T>): Atom {
  // -------- callbacks --------
  const onFirstAccessCallbacks = new Set<AtomOnFirstAccessCallback<T> | undefined>([options?.onFirstAccess])
  const onChangeCallbacks = new Set<AtomOnChangeCallback<T> | undefined>([options?.onChange])
  const onAccessCallbacks = new Set<AtomOnAccessCallback<T> | undefined>([options?.onAccess])

  // get basic getter and setter
  // -------- basic state --------
  const shouldLazyLoad = isFunction(value)
  const createStoreSignal = () =>
    (shouldLazyLoad
      ? createLazySignal(value, options?.lazyDefaultValue)
      : createStore<T & object>(value as any, options?.signalOptions)) as [getter: Accessor<T>, setter: Setter<T>]
  const createNormalSignalSignal = () =>
    (shouldLazyLoad
      ? createLazySignal(value, options?.lazyDefaultValue)
      : createSignal<T>(value as any, options?.signalOptions)) as [getter: Accessor<T>, setter: Setter<T>]

  const createInnerStateSignal = () =>
    options?.state === 'solid-store' ? createStoreSignal() : createNormalSignalSignal()
  const [accessor, setter] = createInnerStateSignal()

  const [accessCount, setAccessCount] = createSignal(0)

  // -------- [method] wrappedGetter --------
  const callbackInfo = { get: accessor, set: setter }

  /**
   * wrapped getter that can hand onAccess and onFirstAccess callback
   * @param args
   * @returns
   */
  function wrappedGetter(...args) {
    setAccessCount((n) => n + 1)

    // handle  'onChange' callback
    onAccessCallbacks.forEach((cb) => cb?.({ ...callbackInfo, accessCount }))
    if (untrack(accessCount) === 1) {
      // handle  'onChange' callback
      onFirstAccessCallbacks.forEach((cb) => cb?.(callbackInfo))
    }
    // @ts-ignore no need to check
    return accessor(...args)
  }

  // -------- [method] wrappedSetter --------
  const [setCount, setSetCount] = createSignal(0)
  const wrappedSetter = ((...args: Parameters<typeof setter>) => {
    setSetCount((n) => n + 1)
    setter(...args)
  }) as typeof setter

  createEffect(
    on(accessor, (_currentValue, prevValue) => {
      // handle  'onChange' callback
      onChangeCallbacks.forEach((cb) => cb?.({ ...callbackInfo, prev: () => prevValue, onCleanup: solidOnCleanup }))
    }),
  )

  // -------- [method] subscribeOnFirstAccessCallback --------
  function subscribeOnFirstAccessCallback(callback: AtomOnFirstAccessCallback<T>) {
    onFirstAccessCallbacks.add(callback)
    return {
      unsubscribe() {
        onFirstAccessCallbacks.delete(callback)
      },
    }
  }

  // -------- [method] subscribeOnAccessCallback --------
  function subscribeOnAccessCallback(callback: AtomOnAccessCallback<T>) {
    onAccessCallbacks.add(callback)
    return {
      unsubscribe() {
        onAccessCallbacks.delete(callback)
      },
    }
  }

  // -------- [method] subscribeOnChangeCallback --------
  function subscribeOnChangeCallback(callback: AtomOnChangeCallback<T>) {
    onChangeCallbacks.add(callback)
    return {
      unsubscribe() {
        onChangeCallbacks.delete(callback)
      },
    }
  }

  return {
    getAccessor: wrappedGetter,
    //@ts-ignore no need to check
    set: wrappedSetter,
    get() {
      return untrack(accessor)
    },
    onFirstAccess: subscribeOnFirstAccessCallback,
    onAccess: subscribeOnAccessCallback,
    onChange: subscribeOnChangeCallback,
  }
}

type AtomHook<T> = {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
  /** only can used if set atomHistory options when create */
  atomHistory?: () => AtomHistory<T>[]
}

type AtomHistory<T> = {
  value: T
  time: number // (s)
}
/**
 * for readablity
 * @param atom atom
 * @returns
 */
export function useAtom<T>(atom: Atom<T>): AtomHook<T> {
  const { getAccessor, set } = atom
  return { get: getAccessor, set: set }
}

function createSignalLikeStore<T>(value?: T, storeOptions?: any) {
  const [get, set] = createStore(value, storeOptions)
  const create
  return { get, set }
}
