import { isArray, isIterable, isMap, isNumber, isSet, isUndefined } from '@edsolater/fnkit'

export type Itemsable<T> = Map<any, T> | Set<T> | T[] | Record<keyof any, T> | IterableIterator<T> | undefined
/** accept all may iterable data type */
export function toArray<T>(i: Itemsable<T>) {
  if (isUndefined(i)) return []
  if (isMap(i)) return Array.from(i.values())
  if (isIterable(i)) return Array.from(i)
  return Object.values(i)
}

export function toMap<T>(i: Itemsable<T>, key?: (item: T) => any) {
  if (isUndefined(i)) return new Map()
  if (isMap(i)) return i
  if (isArray(i)) return new Map(i.map((item) => [key?.(item) ?? item, item]))
  if (isSet(i)) return new Map([...i.values()].map((item) => [key?.(item) ?? item, item]))
  if (isIterable(i)) {
    const newMap = new Map()
    for (const item of i) {
      newMap.set(key?.(item) ?? item, item)
    }
    return newMap
  }
  return new Map(Object.entries(i))
}

export function toRecord<T>(i: Itemsable<T>, key: (item: T, key: unknown) => any) {
  if (isUndefined(i)) return {}
  if (isMap(i)) {
    const result = {} as Record<keyof any, T>
    for (const [k, v] of i.entries()) {
      result[key(v, k)] = v
    }
    return result
  }
  if (isArray(i)) {
    const result = {} as Record<keyof any, T>
    for (const [k, v] of i.entries()) {
      result[key(v, k)] = v
    }
    return result
  }
  if (isSet(i)) {
    const result = {} as Record<keyof any, T>
    let index = 0
    for (const item of i.values()) {
      result[key(item, index++)] = item
    }
    return result
  }
  if (isIterable(i)) {
    const result = {} as Record<keyof any, T>
    let index = 0
    for (const item of i) {
      result[key(item, index++)] = item
    }
    return result
  }
  return i
}

export function getSize(i: Itemsable<any>) {
  if (isUndefined(i)) return 0
  if (isMap(i) || isSet(i)) return i.size
  if (isArray(i)) return i.length
  if (isIterable(i)) {
    let count = 0
    for (const _ of i) {
      count++
    }
    return count
  }
  return Object.keys(i).length
}

/**
 * get value of Itemsable, regardless of order
 */
export function getByKey(i: Itemsable<any>, key: string | number) {
  if (isUndefined(i)) return undefined
  if (isMap(i)) return i.get(key)
  if (isArray(i) && isNumber(key)) return i[key]
  if (isSet(i) && isNumber(key)) return [...i.values()][key]
  if (isIterable(i) && isNumber(key)) {
    let index = 0
    for (const item of i) {
      if (index === key) return item
      index++
    }
  }
  return i[key]
}

/**
 * get first value of Itemsable
 */
export function getByIndex(i: Itemsable<any>, order: number) {
  if (isUndefined(i)) return undefined
  const key = isUndefined(i) || isArray(i) || isSet(i) || isIterable(i) ? order : Object.keys(i)[order]
  return getByKey(i, key)
}
