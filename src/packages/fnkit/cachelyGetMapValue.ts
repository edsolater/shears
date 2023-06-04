// TODO: move to fnkit

export type GetMapKey<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never
// TODO: move to fnkit
export type GetMapValue<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never
/** basic util function
 * @todo move to fnkit
 */

export function cachelyGetMapValue<T extends Map<any, any>>(
  cacheMap: T,
  key: GetMapKey<T>,
  createIfNotInCacheMap: () => GetMapValue<T>,
): GetMapValue<T> {
  if (!cacheMap.has(key)) {
    const newValue = createIfNotInCacheMap()
    cacheMap.set(key, newValue)
  }
  return cacheMap.get(key)!
}
