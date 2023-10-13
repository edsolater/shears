import { createSubscribable, isFunction, mergeObjects, shrinkFn, type Subscribable } from '@edsolater/fnkit'
import { batch, createEffect, createSignal, onCleanup } from 'solid-js'
import { useAtomHistory, type AtomHook_AtomHistory, type CreateAtomOptions_AtomHistory } from './features/atomHistory'
import {
  createAtom_onAccess,
  createAtom_onChange,
  createAtom_onFirstAccess,
  useAtom_onAccessCallback,
  useAtom_onChangeCallback,
  useAtom_onFirstAccessCallback,
  type Atom_OnAccess,
  type Atom_OnChange,
  type Atom_OnFirstAccess,
  type AtomCallbackInfo,
  type AtomHook_OnAccess,
  type AtomHook_OnChange,
  type AtomHook_OnFirstAccess,
  type CreateAtomOptions_OnAccess,
  type CreateAtomOptions_OnChange,
  type CreateAtomOptions_OnFirstAccess,
} from './features/registerCallbacks'
import { createStore } from 'solid-js/store'
import { createProxiedStore } from '../hooks'

type AtomPlugin<T> = (get: () => T, set: (dispatcher: T | ((prev: T) => T)) => void) => Record<string, any> // <-- will merge to atoms

type CreateAtomOptions<T> = {
  /** default value when lazy is true */
  lazyDefaultValue?: T
  plugins?: AtomPlugin<T>[] // TODO: imply it !!!
} & CreateAtomOptions_AtomHistory<T> &
  CreateAtomOptions_OnFirstAccess<T> &
  CreateAtomOptions_OnAccess<T> &
  CreateAtomOptions_OnChange<T>

/** handle state */
export type Atom<T = any> = Subscribable<T> & {
  value: () => T
  set: (value: T | ((prev: T) => T)) => void
  /** for inner */
  subscribable: Subscribable<T>

  /** for inner */
  accessCountSubscribable: Subscribable<number>
  /** for inner */
  setAccessCount: (value: number | ((prev: number) => number)) => void
  /** for inner */
  setCountSubscribable: Subscribable<number>
  /** for inner */
  setSetCount: (value: number | ((prev: number) => number)) => void
} & Atom_OnFirstAccess<T> &
  Atom_OnAccess<T> &
  Atom_OnChange<T>

export type CreateAtomFeaturePayloads<T> = {
  createAtomOption: CreateAtomOptions<T> | undefined
  atomValue: Subscribable<T>
  accessCount: Subscribable<number>
  setCount: Subscribable<number>
  callbackBasicInfo: AtomCallbackInfo<T>
}

/**
 * small piece of store state of an app \
 * usually in mainthread
 * @param value if it's function, it will be called only when first access. ()
 */
export function createAtom<T>(): Atom<T | undefined>
export function createAtom<T>(value: T | (() => T), options?: CreateAtomOptions<T>): Atom<T>
export function createAtom<T>(value?: T | (() => T), options?: CreateAtomOptions<T>): Atom {
  // -------- basic state --------
  const [atomValue, setAtomValue] = createSubscribable(shrinkFn(value) as T)
  const [accessCount, setAccessCount] = createSubscribable(0)
  const [setCount, setSetCount] = createSubscribable(0)

  // -------- callbacks --------
  const featurePayloads: CreateAtomFeaturePayloads<T> = {
    createAtomOption: options,
    atomValue: atomValue,
    accessCount: accessCount,
    setCount: setCount,
    callbackBasicInfo: { value: atomValue.value, set: setAtomValue },
  }
  const basicAtomInfo = {
    atomValueSubscribable: atomValue,
    value: atomValue.value,
    set: setAtomValue,
    accessCountSubscribable: accessCount,
    setAccessCount,
    setCountSubscribable: setCount,
    setSetCount,
  }
  const onFirstAccessProps = createAtom_onFirstAccess(featurePayloads)
  const onAccessProps = createAtom_onAccess(featurePayloads)
  const onChangeProps = createAtom_onChange(featurePayloads)
  return mergeObjects(basicAtomInfo, onFirstAccessProps, onAccessProps, onChangeProps)
}

type AtomHook<T> = {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
} & AtomHook_AtomHistory<T> &
  AtomHook_OnFirstAccess<T> &
  AtomHook_OnAccess<T> &
  AtomHook_OnChange<T>

/**
 * @param atom atom
 * @returns
 */
export function useAtom<T>(atom: Atom<T>): AtomHook<T> {
  const defaultValue = atom.subscribable.value()

  const [value, setValue] = createSignal(defaultValue)

  createEffect(() => {
    const subscription = atom.subscribable.subscribe(setValue)
    onCleanup(subscription.unsubscribe)
  })
  function wrappedSetter(...args: Parameters<typeof atom.set>) {
    atom.setSetCount((n) => n + 1)
    return atom.set(...args)
  }
  function wrappedGetter() {
    atom.setAccessCount((n) => n + 1)
    return value()
  }
  const onFirstAccessCallback = useAtom_onFirstAccessCallback(atom)
  const onAccessCallback = useAtom_onAccessCallback(atom)
  const onChangeCallback = useAtom_onChangeCallback(atom)
  const featureReturn = useAtomHistory(atom)
  return mergeObjects(
    { get: wrappedGetter, set: wrappedSetter },
    featureReturn,
    onFirstAccessCallback,
    onAccessCallback,
    onChangeCallback,
  )
}

export function useStoreAtom<T>(atom: Atom<T>): AtomHook<T> {
  const defaultValue = atom.subscribable.value() ?? {}

  const [value, setValue] = createStore(defaultValue)

  createEffect(() => {
    const subscription = atom.subscribable.subscribe(setValue)
    onCleanup(subscription.unsubscribe)
  })
  function wrappedSetter(...args: Parameters<typeof atom.set>) {
    atom.setSetCount((n) => n + 1)
    return atom.set(...args)
  }
  function wrappedGetter() {
    atom.setAccessCount((n) => n + 1)
    return value()
  }
  const onFirstAccessCallback = useAtom_onFirstAccessCallback(atom)
  const onAccessCallback = useAtom_onAccessCallback(atom)
  const onChangeCallback = useAtom_onChangeCallback(atom)
  const featureReturn = useAtomHistory(atom)
  return mergeObjects(
    { get: wrappedGetter, set: wrappedSetter },
    featureReturn,
    onFirstAccessCallback,
    onAccessCallback,
    onChangeCallback,
  )
}

function createAtomStore<T extends object>(atom: Atom<T>) {
  const [proxiedStore, rawStore] = createProxiedStore(() => atom.value() ?? {})
  function set(value: () => T) {
    proxiedStore.set(() => value())
  }
  atom.subscribable.subscribe((s) => {
    proxiedStore.set(() => s)
  })

  return [proxiedStore, set]
}
