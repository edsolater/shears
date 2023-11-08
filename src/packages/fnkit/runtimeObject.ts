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
    alwaysRun?: (keyof T)[]
  },
): T {
  const resultObject = new Map()
  const parsedObj = new Proxy(objWithRule, {
    get(target, p, receiver) {
      if (p === Symbol.dispose) return () => clearMap(resultObject)
      if (!options?.alwaysRun?.includes(p as any) && resultObject.has(p)) return resultObject.get(p)
      const value = Reflect.get(target, p, receiver)
      const determinedValue = shrinkFn(value)
      if (!options?.alwaysRun?.includes(p as any)) resultObject.set(p, determinedValue)
      return determinedValue
    },
  }) as T
  mapClearRegistry.register(parsedObj, resultObject)
  return parsedObj
}
