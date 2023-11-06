import { AnyFn, isArray, isFunction, isMap, shrinkFn } from '@edsolater/fnkit'

/**
 *
 * @deprecated already in fnkit
 */
export function switchCase<T extends keyof any, R>(
  key: T,
  rules: Partial<Record<T, R | ((key: T) => R)>> /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules: Partial<
    Map<Exclude<T, AnyFn> | ((key: T) => boolean), R | ((key: T) => R)>
  > /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules: [
    matchCase: Exclude<T, AnyFn> | ((key: T) => boolean),
    returnValue: R | ((key: T) => R),
  ][] /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules:
    | [matchCase: Exclude<T, AnyFn> | ((key: T) => boolean), returnValue: R | ((key: T) => R)][]
    | Partial<Map<T, R>>
    | Partial<Record<T & keyof any, R>>,
  /** only invoked if none matched */
  getDefaultValue?: R | ((key: T) => R),
): R | undefined {
  const switchRules = isArray(rules) ? rules : isMap(rules) ? rules.entries() : Object.entries(rules)
  for (const [matchCase, returnValue] of switchRules) {
    if (isFunction(matchCase) ? matchCase(key) : key === matchCase) return shrinkFn(returnValue, [key]) as R
  }
  return shrinkFn(getDefaultValue, [key])
}
