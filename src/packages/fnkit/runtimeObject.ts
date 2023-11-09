import { shrinkFn } from '@edsolater/fnkit'

const clearMap = (resultMap: Map<any, any>) => resultMap.clear()
// register clean up function
const mapClearRegistry = new FinalizationRegistry(clearMap)
/**
 * only run when value is accessed
 * @example
 * const obj = runtimeObj({
 *   a: 1,
 *   b: () => {
 *     console.log('hello')
 *     return 2
 *   },
 *   c: () => {
 *     console.log('hi')
 *     return 3
 *   },
 * })
 *
 * obj.b.then(console.log) // 'hello', 2
 */
export function runtimeObject<T extends object>(
  objWithRule: {
    [K in keyof T]?: T[K] | (() => T[K] | undefined)
  },
  options?: {
    canCache?: (keyof T)[]
  },
): T {
  const resultObject = new Map()
  function needCache(p: keyof any) {
    return options?.canCache?.includes(p as any)
  }
  const parsedObj = new Proxy(objWithRule, {
    get(target, p, receiver) {
      if (p === Symbol.dispose) return () => clearMap(resultObject)
      if (needCache(p) && resultObject.has(p)) return resultObject.get(p)
      const value = Reflect.get(target, p, receiver)
      const determinedValue = shrinkFn(value)
      if (needCache(p)) resultObject.set(p, determinedValue)
      return determinedValue
    },
    set(target, p, newValue, receiver) {
      if (needCache(p)) resultObject.set(p, newValue) // update cache
      return Reflect.set(target, p, newValue, receiver)
    },
  }) as T
  mapClearRegistry.register(parsedObj, resultObject)
  return parsedObj
}
