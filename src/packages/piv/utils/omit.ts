import { flap } from '@edsolater/fnkit'

/**
 * like normal omit , but it won't access it's original properties (achieve this by Object defineProperties)
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[] | K): Omit<T, K> {
  const newObj = Object.create(Object.getPrototypeOf(obj))
  const parsedKeys = Object.keys(obj).filter((originalKey) => !flap(keys).includes(originalKey as any))
  parsedKeys.forEach((key) => {
    Object.defineProperty(newObj, key, Object.getOwnPropertyDescriptor(obj, key)!)
  })
  return newObj
}
