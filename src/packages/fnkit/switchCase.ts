import { isArray, isFunction, isMap } from '@edsolater/fnkit'

export function switchCase<T extends keyof any, R>(key: T, rules: Partial<Record<T, R>>): R | undefined
export function switchCase<T, R>(key: T, rules: Partial<Map<T, R>>): R | undefined
export function switchCase<T, R>(key: T, rules: [matchCase: T | ((key: T) => boolean), returnValue: R][]): R | undefined
export function switchCase<T, R>(
  key: T,
  rules:
    | [matchCase: T | ((key: T) => boolean), returnValue: R][]
    | Partial<Map<T, R>>
    | Partial<Record<T & keyof any, R>>
): R | undefined {
  const switchRules = isArray(rules) ? rules : isMap(rules) ? rules.entries() : Object.entries(rules)
  for (const [matchCase, returnValue] of switchRules) {
    if (isFunction(matchCase) ? matchCase(key) : key === matchCase) return returnValue as R
  }
  return undefined
}
