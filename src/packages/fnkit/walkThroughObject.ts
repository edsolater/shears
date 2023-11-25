import { isObject, isObjectLike } from '@edsolater/fnkit'

export function walkThroughObject(
  obj: object,
  each: (info: {
    currentKey: keyof any
    /* path include self */
    keyPaths: (keyof any)[]
    /* path execpt self */
    parentPath: (keyof any)[]
    value: any
  }) => void,
) {
  function walk(obj: object, keyPaths: (keyof any)[] = []) {
    Reflect.ownKeys(obj).forEach((key) => {
      const value = Reflect.get(obj, key)
      if (isObject(value)) {
        walk(value, keyPaths.concat(key))
      } else {
        each({ keyPaths: keyPaths.concat(key), parentPath: keyPaths, value, currentKey: key })
      }
    })
  }
  walk(obj)
}

/**
 *
 * return first non-objectlike value
 * @param obj must be a objectlike value
 * @param path ['a','b','c']
 * @returns obj?.a?.b?.c
 */
export function getByPath(obj: object, path: (keyof any)[]): any {
  let current = obj
  for (const pathItem of path) {
    current = Reflect.get(current, pathItem)
    if (!isObjectLike(current)) break
  }
  return current
}

export function setByPath(obj: object, path: (keyof any)[], value: any): boolean {
  const lastKey = path.pop()
  if (!lastKey) return false
  const targetObj = getByPath(obj, path)
  if (!isObjectLike(targetObj)) return false
  return Reflect.set(targetObj, lastKey, value)
}

export function hasByPath(obj: object, path: (keyof any)[]): boolean {
  const lastKey = path.pop()
  if (!lastKey) return false
  const targetObj = getByPath(obj, path)
  if (!isObjectLike(targetObj)) return false
  return Reflect.has(targetObj, lastKey)
}
