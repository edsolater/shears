import { isArray, isObjectLiteral, map } from '@edsolater/fnkit'
import { rules } from './rules'

export function encode(data: unknown): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canEncode?.(data)) {
      return rule.encode?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => encode(v))

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
  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => decode(v))

  // no match rule
  return data
}
