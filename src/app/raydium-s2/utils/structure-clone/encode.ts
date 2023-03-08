import { isArray, isObject, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { addAllRuleAction } from './rules'
import { EncodedObject } from './type'

export const encodeClassRule: EncodeRuleItem[] = []

let haveLoaded = false
function loadAllRulesIfNeeded() {
  if (!haveLoaded) {
    haveLoaded = true
    addAllRuleAction()
  }
}

export function encode(data: unknown): any {
  loadAllRulesIfNeeded()
  if (isPrimitive(data)) return data
  if (isObjectLiteral(data) || isArray(data)) {
    return map(data, (v) => (isObject(v) ? encodeClasses(v) : v))
  }
  return data
}

function encodeClasses(data: object): any {
  const encodeRule = isObject(data) ? encodeClassRule.find((rule) => rule.isTargetInstance?.(data)) : undefined
  if (!encodeRule) return encode(data)
  return encodeRule.encodeFn?.(data as any /* force */)
}

export type EncodeRuleItem = {
  isTargetInstance?: (data: object) => boolean | undefined
  encodeFn?: (rawData: any) => EncodedObject<any>
}