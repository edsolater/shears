import { DeMayArray, DeMayFn, MayArray, MayFn, flap, shakeFalsy, shrinkFn } from '@edsolater/fnkit'

export type ElementRefs = MayFn<MayArray<MayFn<HTMLElement | null | undefined>>>
export type GetElementsFromElementRefs<T extends ElementRefs> = NonNullable<DeMayFn<DeMayArray<DeMayFn<T>>>>

export function getElementsFromRefs(refs: ElementRefs): HTMLElement[] {
  const deRef = <T>(n: T) => shrinkFn(n)
  return shakeFalsy(flap(deRef(refs)).map(deRef))
}
