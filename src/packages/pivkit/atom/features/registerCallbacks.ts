import { createEffect, onCleanup } from 'solid-js'
import type { Atom, CreateAtomFeaturePayloads } from '../createAtom'
import { Subscribable } from '@edsolater/fnkit'

export type AtomCallbackInfo<T> = { atomValue: Subscribable<T> }
type AtomOnFirstAccessCallback<T> = (info: AtomCallbackInfo<T>) => void
type AtomOnChangeCallback<T> = (
  info: AtomCallbackInfo<T> & { prev(): T | undefined; onCleanup(cb: () => void): void },
) => void

export type CreateAtomOptions_OnFirstAccess<T> = {
  onFirstAccess?: AtomOnFirstAccessCallback<T>
}

export type CreateAtomOptions_OnChange<T> = {
  onChange?: AtomOnChangeCallback<T>
}

// -------- callback: first access --------
export const firstAccessCallbacksSymbol = Symbol('firstAccessCallbacks')
export const firstAccessAddEventSymbol = Symbol('firstAccessAddEvent')
export type Atom_OnFirstAccess<T> = {
  [firstAccessCallbacksSymbol]: Set<AtomOnFirstAccessCallback<T> | undefined>
  onFirstAccess(cb: AtomOnFirstAccessCallback<T>): {
    remove(): void
  }
}
export function createAtom_onFirstAccess<T>({
  createAtomOption,
  accessCount,
  callbackBasicInfo,
}: CreateAtomFeaturePayloads<T>): Atom_OnFirstAccess<T> {
  const onFirstAccessCallbacks = new Set<AtomOnFirstAccessCallback<T> | undefined>([createAtomOption?.onFirstAccess])
  function invokeFirstAccessCallback(info: AtomCallbackInfo<T>) {
    onFirstAccessCallbacks.forEach((cb) => cb?.(info))
  }
  accessCount.subscribe((count) => {
    if (count === 1) {
      invokeFirstAccessCallback(callbackBasicInfo)
    }
  })
  return {
    [firstAccessCallbacksSymbol]: onFirstAccessCallbacks,
    onFirstAccess(cb: AtomOnFirstAccessCallback<T>) {
      onFirstAccessCallbacks.add(cb)
      return {
        remove() {
          onFirstAccessCallbacks.delete(cb)
        },
      }
    },
  }
}
export type AtomHook_OnFirstAccess<T> = {
  onFirstAccess: (cb: AtomOnFirstAccessCallback<T>) => {
    remove(): void
  }
}
export function useAtom_onFirstAccessCallback<T>(atom: Atom<T>): AtomHook_OnFirstAccess<T> {
  let componentDestroyCleanFns: Set<() => void> = new Set()
  createEffect(() => {
    onCleanup(() => {
      componentDestroyCleanFns.forEach((fn) => fn())
      componentDestroyCleanFns.clear()
    })
  })
  return {
    onFirstAccess: (cb: AtomOnFirstAccessCallback<T>) => {
      const controller = atom.onFirstAccess(cb)
      componentDestroyCleanFns.add(controller.remove)
      return {
        remove() {
          componentDestroyCleanFns.delete(controller.remove)
          controller.remove()
        },
      }
    },
  }
}

// -------- callback: onAccess --------
export type AtomOnAccessCallback<T> = (info: AtomCallbackInfo<T> & { accessCount(): number }) => void
export type CreateAtomOptions_OnAccess<T> = {
  onAccess?: AtomOnAccessCallback<T>
}
export const accessCallbacksSymbol = Symbol('accessCallbacks')
export const accessAddEventSymbol = Symbol('accessAddEvent')
export type Atom_OnAccess<T> = {
  [accessCallbacksSymbol]: Set<AtomOnAccessCallback<T> | undefined>
  onAccess(cb: AtomOnAccessCallback<T>): {
    remove(): void
  }
}
export function createAtom_onAccess<T>({
  createAtomOption,
  accessCount,
  callbackBasicInfo,
}: CreateAtomFeaturePayloads<T>): Atom_OnAccess<T> {
  const onAccessCallbacks = new Set<AtomOnAccessCallback<T> | undefined>([createAtomOption?.onAccess])
  function invokeAccessCallback(info: AtomCallbackInfo<T>) {
    onAccessCallbacks.forEach((cb) => cb?.({ ...info, accessCount: () => accessCount.current }))
  }
  accessCount.subscribe((count) => {
    invokeAccessCallback(callbackBasicInfo)
  })
  return {
    [accessCallbacksSymbol]: onAccessCallbacks,
    onAccess(cb: AtomOnAccessCallback<T>) {
      onAccessCallbacks.add(cb)
      return {
        remove() {
          onAccessCallbacks.delete(cb)
        },
      }
    },
  }
}
export type AtomHook_OnAccess<T> = {
  onAccess: (cb: AtomOnAccessCallback<T>) => {
    remove(): void
  }
}
export function useAtom_onAccessCallback<T>(atom: Atom<T>): AtomHook_OnAccess<T> {
  let componentDestroyCleanFns: Set<() => void> = new Set()
  createEffect(() => {
    onCleanup(() => {
      componentDestroyCleanFns.forEach((fn) => fn())
      componentDestroyCleanFns.clear()
    })
  })
  return {
    onAccess: (cb: AtomOnAccessCallback<T>) => {
      const controller = atom.onAccess(cb)
      componentDestroyCleanFns.add(controller.remove)
      return {
        remove() {
          componentDestroyCleanFns.delete(controller.remove)
          controller.remove()
        },
      }
    },
  }
}

// -------- callback: onChange --------
export const changeCallbacksSymbol = Symbol('changeCallbacks')
export const changeAddEventSymbol = Symbol('changeAddEvent')
export type Atom_OnChange<T> = {
  onChange(cb: AtomOnChangeCallback<T>): {
    remove(): void
  }
  [changeCallbacksSymbol]: Set<AtomOnChangeCallback<T> | undefined>
}
export function createAtom_onChange<T>({
  createAtomOption,
  atomValue,
  callbackBasicInfo,
}: CreateAtomFeaturePayloads<T>): Atom_OnChange<T> {
  const onChangeCallbacks = new Set<AtomOnChangeCallback<T> | undefined>([createAtomOption?.onChange])
  function invokeChangeCallback(info: AtomCallbackInfo<T>) {
    onChangeCallbacks.forEach((cb) => cb?.({ ...info, prev: () => undefined, onCleanup: onCleanup })) //🤔 wired and not work right?
  }
  atomValue.subscribe((v) => {
    invokeChangeCallback(callbackBasicInfo)
  })

  return {
    [changeCallbacksSymbol]: onChangeCallbacks,
    onChange(cb: AtomOnChangeCallback<T>) {
      onChangeCallbacks.add(cb)
      return {
        remove() {
          onChangeCallbacks.delete(cb)
        },
      }
    },
  }
}

export type AtomHook_OnChange<T> = {
  onChange: (cb: AtomOnChangeCallback<T>) => {
    remove(): void
  }
}
export function useAtom_onChangeCallback<T>(atom: Atom<T>): AtomHook_OnChange<T> {
  let componentDestroyCleanFns: Set<() => void> = new Set()
  createEffect(() => {
    onCleanup(() => {
      componentDestroyCleanFns.forEach((fn) => fn())
      componentDestroyCleanFns.clear()
    })
  })
  return {
    onChange: (cb: AtomOnChangeCallback<T>) => {
      const controller = atom.onChange(cb)
      componentDestroyCleanFns.add(controller.remove)
      return {
        remove() {
          componentDestroyCleanFns.delete(controller.remove)
          controller.remove()
        },
      }
    },
  }
}
