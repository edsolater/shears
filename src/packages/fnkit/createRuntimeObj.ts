import { isFunction } from '@edsolater/fnkit'

// TODO: @edsolater/fnkit aready have this
type Promisify<T> = T extends Promise<any> ? T : Promise<T>
type GetAfterRunObj<T extends object> = { [K in keyof T]: T[K] extends () => infer R ? Promisify<R> : Promisify<T[K]> }

const clearMap = (resultMap: Map<any, any>) => resultMap.clear()
// register clean up function
const mapClearRegistry = new FinalizationRegistry(clearMap)
/**
 * only run when value is accessed
 * @example
 * const obj = createRuntimeObj({
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
function createRuntimeObj<T extends object>(objWithRule: T): GetAfterRunObj<T> {
  const resultObject = new Map()
  const parsedObj = new Proxy(objWithRule, {
    get(target, p, receiver) {
      if (p === Symbol.dispose) return () => clearMap(resultObject)
      if (resultObject.has(p)) return resultObject.get(p)
      const value = Reflect.get(target, p, receiver)
      const determinedValue = Promise.resolve(isFunction(value) ? value() : value)
      resultObject.set(p, determinedValue)
      return determinedValue
    },
  }) as GetAfterRunObj<T>
  mapClearRegistry.register(parsedObj, resultObject)
  return parsedObj
}

const obj = createRuntimeObj({
  a: 1,
  b: () => {
    console.log('hello')
    return 2
  },
  c: () => {
    console.log('hi')
    return 3
  },
})

obj.b.then(console.log) // 'hello', 2
