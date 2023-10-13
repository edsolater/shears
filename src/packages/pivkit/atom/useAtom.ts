import { mergeObjects } from '@edsolater/fnkit'
import { createEffect, createSignal, onCleanup } from 'solid-js'
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

export type AtomHook<T> = {
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
  const defaultValue = atom.value()

  const [value, setValue] = createSignal(defaultValue)

  createEffect(() => {
    const subscription = atom.subscribe(setValue)
    onCleanup(subscription.unsubscribe)
  })
  function wrappedSetter(...args: Parameters<typeof atom.set>) {
    atom.setCount.set((n) => n + 1)
    return atom.set(...args)
  }
  function wrappedGetter() {
    atom.accessCount.set((n) => n + 1)
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
