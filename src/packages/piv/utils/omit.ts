/** 
 * like normal omit , but it won't access it's original properties (achieve this by Object defineProperties)
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const newObj = Object.create(Object.getPrototypeOf(obj))
  const parsedKeys = Object.keys(obj).filter((originalKey) => !keys.includes(originalKey as any))
  parsedKeys.forEach((key) => {
    Object.defineProperty(newObj, key, Object.getOwnPropertyDescriptor(obj, key)!)
  })
  return newObj
}

