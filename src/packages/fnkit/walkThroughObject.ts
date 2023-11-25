import { isObject, isObjectLike } from '@edsolater/fnkit'

/**
 * only walk through string enumtable object key (not symbol)
 */
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
    Object.keys(obj).forEach((key) => {
      console.log('walk', obj, key)
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

/**
 * if  path is not reachable, this will create a new literal object. see example for detail
 * @param obj
 * @param path
 * @param value
 * @returns
 * @example
 * const obj = {a:{b:{c:1}}}
 * setByPath(obj,['a','b','c'],2) // obj.a.b.c === 2
 * setByPath(obj,['a','newKey','d'],2) // obj --> {a: {b: {c: 1}, newKey: {d: 2}}}
 */
export function setByPath(obj: object, path: (keyof any)[], value: any): boolean {
  if (path.length === 0) return false
  if (path.length === 1) {
    const key = path[0]
    return Reflect.set(obj, key, value)
  } else {
    try {
      recursiveSet(obj, path, value)
      return true
    } catch {
      return false
    }
  }
}

/** even not reachable will be ok
 * used in {@link setByPath}
 */
function recursiveSet(obj: object, path: (keyof any)[], value: any) {
  if (!isObjectLike(obj)) return
  if (path.length === 0) return
  if (path.length === 1) return Reflect.set(obj, path[0], value)
  const [currentKey, ...restPath] = path
  if (currentKey in obj) {
    recursiveSet(Reflect.get(obj, currentKey), restPath, value)
  } else {
    Reflect.set(obj, currentKey, recursiveSet({}, restPath, value))
  }
}

export function hasByPath(obj: object, path: (keyof any)[]): boolean {
  const lastKey = path.pop()
  if (!lastKey) return false
  const targetObj = getByPath(obj, path)
  if (!isObjectLike(targetObj)) return false
  return Reflect.has(targetObj, lastKey)
}
