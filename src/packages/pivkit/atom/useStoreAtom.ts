import { mergeObjects } from '@edsolater/fnkit'
import { createEffect, onCleanup } from 'solid-js'
import { createSmartStore } from '../hooks'
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
  const { store, setStore } = createSmartStore<T>(atom.value())
  createEffect(() => {
    const subscription = atom.subscribe((v) => setStore(v))
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
