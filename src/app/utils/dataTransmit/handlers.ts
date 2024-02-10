import { isArray, isObject, isObjectLiteral, map } from '@edsolater/fnkit'
import { rules } from './rules'

export function encode(
  data: unknown,
  options?: {
    /** encode should false */
    mutate?: boolean
  },
): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canEncode?.(data)) {
      return rule.encode?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return (options?.mutate ? mutMap : map)(data, (v) => encode(v))

  // no match rule
  return data
}

export function decode(data: unknown): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canDecode?.(data)) {
      return rule.decode?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return proxyObjectWithConfigs(data, ({ key, value }) => decode(value))

  // no match rule
  return data
}

/** TODO: move to fnkit */
function mutMap(collection: object | any[], mapCallback: (v: any) => any) {
  if (isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      collection[i] = mapCallback(collection[i])
    }
  } else if (isObject(collection)) {
    for (const key in collection) {
      collection[key] = mapCallback(collection[key])
    }
  }
  return collection
}

/** TODO: move to fnkit */
export function proxyObjectWithConfigs<T extends object>(
  obj: T,
  configFn: (options: { key: string | symbol; value: any }) => any,
): object {
  const valueMap = new Map<keyof any, any>()
  const keys = new Set(Reflect.ownKeys(obj))
  return new Proxy(
    {},
    {
      get(target, key, receiver) {
        if (key in target) return target[key]
        if (valueMap.has(key)) return valueMap.get(key)
        if (!keys.has(key)) return undefined
        const originalValue = Reflect.get(obj, key, receiver)
        const newV = configFn({ key, value: originalValue })
        valueMap.set(key, newV)
        return newV
      },
      set(_target, p, newValue) {
        valueMap.set(p, newValue)
        keys.add(p)
        return true
      },
      deleteProperty(_target, p) {
        valueMap.delete(p)
        keys.delete(p)
        return true
      },
      has: (_target, key) => keys.has(key),
      getPrototypeOf: () => Object.getPrototypeOf(obj),
      ownKeys: () => Array.from(keys),
      // for Object.keys to filter
      getOwnPropertyDescriptor: (target, prop) =>
        Reflect.getOwnPropertyDescriptor(target, prop) ?? Reflect.getOwnPropertyDescriptor(obj, prop),
      defineProperty(_target, property, attributes) {
        Reflect.defineProperty(obj, property, attributes)
        Reflect.defineProperty(_target, property, attributes)
        keys.add(property)
        valueMap.delete(property) // so can re-calculate
        return true
      },
    },
  )
}
