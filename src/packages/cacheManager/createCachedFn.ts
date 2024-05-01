import { isPromise, type AnyFn } from "@edsolater/fnkit"
import { createIDBStoreManager } from "./storageManagers"
import { toStringKey } from "./toStringKey"

export function createCachedFn<F extends AnyFn>(
  fn: F,
  options: {
    dbName: string
    dbStoreName?: string
    dbVersion?: number
    /** turn object(with methods) to structuredClonable object  */
    toDBValue?(value: ReturnType<F>): any | Promise<any>
    /** reverse version of {@link structuredClonify} */
    fromDBValue?(value: any): ReturnType<F>
  },
) {
  // to faster set cache in memory
  const fastMemoryCache = new Map<string | number, ReturnType<F>>()

  const storeManager = createIDBStoreManager({
    dbName: options.dbName,
    storeName: options.dbStoreName,
    version: options.dbVersion,
    onStoreLoaded: async (store) => {
      store.forEach((value, key) => {
        const memoryStorableValue = (options.fromDBValue?.(value) ?? value) as any
        fastMemoryCache.set(key as string | number, memoryStorableValue)
      })
    },
  })

  return async function cachedFn(...params: Parameters<F>) {
    const paramsKey = toStringKey(params)
    if (fastMemoryCache.has(paramsKey)) {
    } else if (await storeManager.has(paramsKey)) {
      const dbValue = storeManager.get(paramsKey)
      return options.fromDBValue?.(dbValue) ?? dbValue
    } else {
      const result = fn(...params)
      const dbValue = options.toDBValue?.(result) ?? result
      fastMemoryCache.set(paramsKey, result)
      if (isPromise(dbValue)) {
        dbValue.then((value) => storeManager.set(paramsKey, value))
      } else {
        storeManager.set(paramsKey, dbValue)
      }
      return result
    }
  }
}
