import { isObject, map } from '@edsolater/fnkit'
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
  if (!isObject(data)) return data
  const decodedData = map(data, (v) => (isObject(v) ? decodeObject(v) : v))
  return decodedData
}

function decodeObject(data: object): any {
  const targetRule = isEncodedObject(data) ? decodeRules.find((rule) => rule.name === data._type) : undefined
  if (!targetRule) return decode(data)
  return targetRule.decodeFn?.(data as EncodedObject<any> /* force */)
}

function isEncodedObject(data: any): data is EncodedObject<any> {
  return isObject(data) && '_type' in data && '_info' in data
}

export type DecodeRule = {
  name?: string
  decodeFn?: (encodedData: EncodedObject<any>) => any
}
