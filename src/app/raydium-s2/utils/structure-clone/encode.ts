import { isArray, isObject, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { addAllRuleAction } from './rules'
import { EncodedObject } from './type'

export const encodeRules: EncodeRule[] = []

let haveLoaded = false

function loadAllRulesIfNeeded() {
  if (!haveLoaded) {
    haveLoaded = true
    addAllRuleAction()
  }
}

export function encode(data: unknown): any {
  loadAllRulesIfNeeded()

  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => encode(v))
  if (isObject(data)) return encodeObject(data)

  return data
}

function encodeObject(data: object): any {
  const encodeRule = isObject(data) ? encodeRules.find((rule) => rule.isTargetInstance?.(data)) : undefined
  if (!encodeRule) return data
  return encodeRule.encodeFn?.(data as any /* force */, encode)
}

export interface EncodeRule {
  isTargetInstance?: (data: object) => boolean | undefined
  encodeFn?: (rawData: any, encodeObject: (innerValue: unknown) => any) => EncodedObject<any> | any /* can transport */
}
