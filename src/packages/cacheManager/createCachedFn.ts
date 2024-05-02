import { isPromise, shrinkFn, type AnyFn, type MayPromise } from "@edsolater/fnkit"
import { createIDBStoreManager } from "./storageManagers"
import { toStringKey, type ToStringKeyOptions } from "./toStringKey"

export function createCachedFn<F extends AnyFn>(
  fn: F,
  options: {
    dbName: string
    dbStoreName?: string | ((...params: Parameters<F>) => string)
    dbVersion?: number

    /** if set this, it will not get key by {@link toStringKey}  */
    toCacheKey?: (...params: Parameters<F>) => string | number

    /** only useful if not set option:toCacheKey */
    toStringKeyOptions?: ToStringKeyOptions

    /** turn object(with methods) to structuredClonable object  */
    toDBValue?(value: ReturnType<F>): any | Promise<any>

    /** reverse version of {@link structuredClonify} */
    fromDBValue?(value: any): ReturnType<F>
  },
) {
  // to faster set cache in memory
  const fastMemoryCache = new Map<string | number, MayPromise<ReturnType<F>>>()

  return async function cachedFn(...params: Parameters<F>) {
    const storeManager = createIDBStoreManager({
      dbName: options.dbName,
      storeName: shrinkFn(options.dbStoreName, params),
      version: options.dbVersion,
      onStoreLoaded: !fastMemoryCache.size
        ? async (store) => {
            store.forEach((value, key) => {
              const memoryStorableValue = (options.fromDBValue?.(value) ?? value) as any
              fastMemoryCache.set(key as string | number, memoryStorableValue)
            })
          }
        : undefined,
    })
    const paramsKey = options.toCacheKey?.(...params) ?? toStringKey(params, options.toStringKeyOptions)
    if (fastMemoryCache.has(paramsKey)) {
      return fastMemoryCache.get(paramsKey)
    } else {
      const { promise, resolve, reject } = Promise.withResolvers()
      fastMemoryCache.set(paramsKey, promise as any)
      if (await storeManager.has(paramsKey)) {
        const dbValue = storeManager.get(paramsKey) as Promise<ReturnType<F>>
        const value = options.fromDBValue ? options.fromDBValue(dbValue) : dbValue
        fastMemoryCache.set(paramsKey, value as any)
        resolve(value)
      } else {
        try {
          const result = fn(...params)
          const dbValue = options.toDBValue?.(result) ?? result
          fastMemoryCache.set(paramsKey, result)
          if (isPromise(dbValue)) {
            dbValue.then((value) => storeManager.set(paramsKey, value))
          } else {
            storeManager.set(paramsKey, dbValue)
          }
          resolve(result)
        } catch (e) {
          reject(e)
        }
      }
      return promise
    }
  }
}
