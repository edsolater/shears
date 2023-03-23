import { isArray, isObject, isObjectLiteral, map } from '@edsolater/fnkit'
import { addAllRuleAction } from './rules'
import { EncodedObject } from './type'

export const decodeRules: DecodeRule[] = []

let haveLoaded = false
function loadAllRulesIfNeeded() {
  if (!haveLoaded) {
    haveLoaded = true
    addAllRuleAction()
  }
}

export function decode(data: unknown): any {
  loadAllRulesIfNeeded()

  if (isEncodedObject(data)) return decodeObject(data)
  if (isObjectLiteral(data) || isArray(data)) return map(data, (v) => decode(v))

  return data
}

function decodeObject(data: object): any {
  console.log('data: ', data)
  const targetRule = isEncodedObject(data) ? decodeRules.find((rule) => rule.name === data._type) : undefined
  if (!targetRule) return data
  return targetRule.decodeFn?.(data as EncodedObject<any> /* force */)
}

function isEncodedObject(data: any): data is EncodedObject<any> {
  return isObject(data) && '_type' in data && '_info' in data
}

export type DecodeRule = {
  name?: string
  decodeFn?: (encodedData: EncodedObject<any>) => any
}
