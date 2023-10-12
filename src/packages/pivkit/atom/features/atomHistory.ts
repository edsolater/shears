import { Atom } from '..'

export type CreateAtomOptions_AtomHistory<T> = {
  // TODO: imply it!!!
  atomHistoryOptions?: {
    /** max length of the history array */
    maxLength?: number
  }
}

export type AtomHook_AtomHistory<T> = {
  /** only can used if set atomHistory options when create */
  atomHistory?: () => AtomHistory<T>[]
}

type AtomHistory<T> = {
  value: T
  time: number // (s)
}

export function useAtomHistory<T>(atom: Atom<T>): AtomHook_AtomHistory<T> {
  return {
    atomHistory: () => [],
  }
}
