import { DeMayArray, DeMayFn, MayArray, MayFn, flap, shakeFalsy, shrinkFn } from '@edsolater/fnkit'

export type ElementAccessors = MayFn<MayArray<MayFn<HTMLElement | null | undefined>>>
export type GetElementsFromElementAccessors<T extends ElementAccessors> = NonNullable<DeMayFn<DeMayArray<DeMayFn<T>>>>

export function getElementsFromAccessors(refs: ElementAccessors): HTMLElement[] {
  const deRef = <T>(n: T) => shrinkFn(n)
  return shakeFalsy(flap(deRef(refs)).map(deRef))
}
