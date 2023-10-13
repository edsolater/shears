import { createSubscribable, mergeObjects, shrinkFn, type Subscribable } from '@edsolater/fnkit'
import { type CreateAtomOptions_AtomHistory } from './features/atomHistory'
import {
  createAtom_onAccess,
  createAtom_onChange,
  createAtom_onFirstAccess,
  type Atom_OnAccess,
  type Atom_OnChange,
  type Atom_OnFirstAccess,
  type AtomCallbackInfo,
  type CreateAtomOptions_OnAccess,
  type CreateAtomOptions_OnChange,
  type CreateAtomOptions_OnFirstAccess,
} from './features/registerCallbacks'

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
  /** for inner */
  accessCount: Subscribable<number>
  /** for inner */
  setCount: Subscribable<number>
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
  const atomValue = createSubscribable(shrinkFn(value) as T)
  const accessCount = createSubscribable(0)
  const setCount = createSubscribable(0)

  // -------- callbacks --------
  const featurePayloads: CreateAtomFeaturePayloads<T> = {
    createAtomOption: options,
    atomValue: atomValue,
    accessCount: accessCount,
    setCount: setCount,
    callbackBasicInfo: { atomValue },
  }
  const basicAtomInfo = mergeObjects(atomValue, {
    accessCount,
    setCount,
  })
  const onFirstAccessProps = createAtom_onFirstAccess(featurePayloads)
  const onAccessProps = createAtom_onAccess(featurePayloads)
  const onChangeProps = createAtom_onChange(featurePayloads)
  return mergeObjects(basicAtomInfo, onFirstAccessProps, onAccessProps, onChangeProps)
}
