import { DeMayArray, DeMayFn, MayArray, MayFn } from '@edsolater/fnkit'

export type ElementAccessors = MayArray<MayFn<HTMLElement | null | undefined>>
export type GetElementsFromElementAccessors<T extends ElementAccessors> = NonNullable<DeMayArray<DeMayFn<T>>>

export function getElementsFromAccessors(refs: ElementAccessors): HTMLElement[] {
  return (Array.isArray(refs) ? refs : [refs])
    .map((ref) => (typeof ref === 'function' ? ref() : ref))
    .filter(Boolean) as HTMLElement[]
}
