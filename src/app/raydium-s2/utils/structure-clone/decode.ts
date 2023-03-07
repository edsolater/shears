import { isObject, map } from '@edsolater/fnkit'
import { PublicKey } from '@solana/web3.js'
import { toPub } from '../../stores/common/utils/pub'
import { EncodedObject } from './type'

export function decode(data: unknown): any {
  if (!isObject(data)) return data
  const decodedData = map(data, (v) => (isObject(v) ? decodeClasses(v) : v))
  return decodedData
}

function decodeClasses(data: object): any {
  const targetRule = isEncodedObject(data) ? decodeRules.find((rule) => rule.name === data._type) : undefined
  if (!targetRule) return decode(data)
  return targetRule.decodeFn(data as EncodedObject<any> /* force */)
}

function isEncodedObject(data: any): data is EncodedObject<any> {
  return isObject(data) && '_type' in data && '_info' in data
}

export const decodeRules: DecodeRuleItem[] = [
  { name: 'PublicKey', decodeFn: (encodedData: EncodedObject<string>) => toPub(encodedData._info) }
]

export type DecodeRuleItem = {
  name: string
  decodeFn: (encodedData: EncodedObject<any>) => any
}
