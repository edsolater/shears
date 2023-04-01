import { CRef } from '../types/piv'

export function mergeRefs<T = any>(...refs: (CRef<T> | null | undefined)[]): CRef<T> {
  return ((el) => {
    refs.filter(Boolean).forEach((ref) => ref?.(el))
  }) as CRef<T>
}
