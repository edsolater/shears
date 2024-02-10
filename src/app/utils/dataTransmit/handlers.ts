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
