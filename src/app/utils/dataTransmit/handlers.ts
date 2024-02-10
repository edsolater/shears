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

export function decode(
  data: unknown,
  options?: {
    /** decode should true */
    mutate?: boolean
  },
): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canDecode?.(data)) {
      return rule.decode?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return (options?.mutate ? mutMap : map)(data, (v) => decode(v)) // FIXME: immuteable will cause performance issue

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
): unknown {
  const valueMap = new Map<keyof any, any>()

  return new Proxy(
    {},
    {
      get(_target, key, receiver) {
        if (valueMap.has(key)) return valueMap.get(key)
        if (!(key in obj)) return undefined
        const originalValue = Reflect.get(obj, key, receiver)
        const newV = configFn({ key, value: originalValue })
        valueMap.set(key, newV)
        return newV
      },
    },
  )
}
