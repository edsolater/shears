import { mergeObjects } from '@edsolater/fnkit'
import { createEffect, onCleanup } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createProxiedStore } from '../hooks'
import type { Atom } from './createAtom'
import { useAtomHistory, type AtomHook_AtomHistory } from './features/atomHistory'
import {
  useAtom_onAccessCallback,
  useAtom_onChangeCallback,
  useAtom_onFirstAccessCallback,
  type AtomHook_OnAccess,
  type AtomHook_OnChange,
  type AtomHook_OnFirstAccess,
} from './features/registerCallbacks'

export type StoreAtomHook<T> = {
  store: T
  set: (value: T | ((prev: T) => T)) => void
} & AtomHook_AtomHistory<T> &
  AtomHook_OnFirstAccess<T> &
  AtomHook_OnAccess<T> &
  AtomHook_OnChange<T>

export function useStoreAtom<T extends object>(atom: Atom<T>): StoreAtomHook<T> {
  const defaultValue = atom.value()

  const [store, rudelySetStore] = createStore(defaultValue)

  /** make change properties of store is smooth  */
  const smartlySetStore = (newStore: T) => {
    // TODO imply it!!
    return rudelySetStore(newStore)
  }
  createEffect(() => {
    const subscription = atom.subscribe((v) => smartlySetStore(v))
    onCleanup(subscription.unsubscribe)
  })
  function wrappedSetter(...args: Parameters<typeof atom.set>) {
    atom.setCount.set((n) => n + 1)
    return atom.set(...args)
  }
  // build proxy, so can record accCount
  const proxiedStore = new Proxy(store, {
    get(target, p, receiver) {
      atom.accessCount.set((n) => n + 1)
      return Reflect.get(target, p, receiver)
    },
  })
  const onFirstAccessCallback = useAtom_onFirstAccessCallback(atom)
  const onAccessCallback = useAtom_onAccessCallback(atom)
  const onChangeCallback = useAtom_onChangeCallback(atom)
  const featureReturn = useAtomHistory(atom)
  return mergeObjects(
    {
      store: proxiedStore,
      set: wrappedSetter,
    },
    featureReturn,
    onFirstAccessCallback,
    onAccessCallback,
    onChangeCallback,
  )
}
function createAtomStore<T extends number>(atom: Atom<T>) {
  const [proxiedStore, rawStore] = createProxiedStore(() => atom.value() ?? {})
  function set(value: () => T) {
    proxiedStore.set(() => value())
  }
  atom.subscribe((s) => {})

  return [proxiedStore, set]
}
