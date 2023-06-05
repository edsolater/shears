import { isArray, isObjectLiteral, map } from '@edsolater/fnkit'
import { rules } from './TransmitRule'

export function parseTransiable(data: unknown): any {
  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => parseTransiable(v))

  // try to match rule
  for (const rule of rules) {
    if (rule.canDecode?.(data)) {
      return rule.encodeFn?.(data)
    }
  }

  // no match rule
  return data
}

export function toTransiable(data: unknown): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canEncode?.(data)) {
      return rule.encodeFn?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => toTransiable(v))

  // no match rule
  return data
}
