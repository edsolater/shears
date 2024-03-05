import { isArray, isNumber } from "@edsolater/fnkit"

/**
 *  can hold both array and object
 */
interface Collection<T> {
  get(n: number): T | undefined
  get(key: keyof any): T | undefined
  delete(n: number): void
  delete(key: keyof any): void
  add(value: T, getKey: (i: T, idx: number) => keyof any): void
  set(key: keyof any, value: T): void

  size: number

  /** Iterator */
  [Symbol.iterator](): IterableIterator<T>

  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[keyof any, T]>

  /**
   * Returns an iterable of keys in the array
   */
  keys(): IterableIterator<keyof any>

  /**
   * Returns an iterable of values in the array
   */
  values(): IterableIterator<T>

  map<U>(mapFn: (v: T, key: keyof any, index: number) => U): Collection<U>
  mapEntry<U>(mapFn: (v: T, key: keyof any, index: number) => [key: keyof any, U]): Collection<U>
  filter(filterFn: (v: T, key: keyof any, index: number) => boolean): Collection<T>
}

export function createCollection<T>(): Collection<T>
export function createCollection<T>(fromObj: Record<keyof any, T>): Collection<T>
export function createCollection<T>(fromArr: T[], getKey: (i: T, idx: number) => keyof any): Collection<T>
export function createCollection<T>(
  from?: Record<keyof any, T> | T[],
  getKey?: (i: T, idx: number) => keyof any,
): Collection<T> {
  const innerIdxKeyMap = new Map<number, keyof any>()
  const innerKeyIndexMap = new Map<keyof any, number>()
  const innerKeyValueMap = new Map<keyof any, T>()
  if (from) {
    for (const [idx, [key, value]] of Object.entries(from).entries()) {
      const calculatedKey = getKey ? getKey(value, idx) : key
      innerIdxKeyMap.set(idx, calculatedKey)
      innerKeyValueMap.set(calculatedKey, value)
    }
  }

  function* traverse() {
    for (const [key, index] of innerKeyIndexMap) {
      const v = innerKeyValueMap.get(key)!
      yield [v, key, index] as const
    }
  }
  function mapEntry<U>(
    // return undefined means delete it
    mapFn: (v: T, key: keyof any, index: number) => [key: keyof any, U] | undefined,
  ): Collection<U> {
    const newCollection = createCollection<U>()
    for (const [v, k, idx] of traverse()) {
      const newPair = mapFn(v, k, idx)
      if (newPair) {
        const [key, value] = newPair
        newCollection.set(key, value)
      }
    }
    return newCollection
  }

  const collection: Collection<T> = {
    get(key: keyof any | number) {
      const k = isNumber(key) ? innerIdxKeyMap.get(key) : key
      if (k == null) return undefined
      return innerKeyValueMap.get(k)
    },
    delete(key: keyof any | number) {
      const k = isNumber(key) ? innerIdxKeyMap.get(key) : key
      if (k == null) return undefined
      innerKeyIndexMap.delete(k)
      innerKeyValueMap.delete(k)

      const idx = isNumber(key) ? key : innerKeyIndexMap.get(key)
      if (idx == null) return undefined
      innerIdxKeyMap.delete(idx)
    },

    add(value, getKey) {
      const idx = innerIdxKeyMap.size
      const k = getKey(value, idx)
      innerKeyIndexMap.set(k, idx)
      innerKeyValueMap.set(k, value)
      innerIdxKeyMap.set(idx, k)
    },
    set(key: keyof any, value: T) {
      const k = key
      const idx = innerIdxKeyMap.size
      innerKeyIndexMap.set(k, idx)
      innerKeyValueMap.set(k, value)
      innerIdxKeyMap.set(idx, k)
    },

    get size() {
      return innerIdxKeyMap.size
    },
    *[Symbol.iterator]() {
      for (const [v, k, idx] of traverse()) {
        yield v
      }
    },
    *entries() {
      for (const [v, k, idx] of traverse()) {
        yield [k, v]
      }
    },
    *keys() {
      for (const [v, k, idx] of traverse()) {
        yield k
      }
    },
    *values() {
      for (const [v, k, idx] of traverse()) {
        yield v
      }
    },
    map(mapFn) {
      return mapEntry((v, k, idx) => [k, mapFn(v, k, idx)])
    },
    mapEntry,
    filter(filterFn) {
      return mapEntry((v, k, idx) => (filterFn(v, k, idx) ? [k, v] : undefined))
    },
  }
  return collection
}
