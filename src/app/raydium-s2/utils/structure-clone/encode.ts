import { isArray, isObject, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { PublicKey } from '@solana/web3.js'
import toPubString from '../../stores/common/utils/pub'
import { createEncodedObject } from './createEncodedObject'
import { EncodedObject } from './type'

export function encode(data: unknown): any {
  if (isPrimitive(data)) return data
  if (isObjectLiteral(data) || isArray(data)) {
    return map(data, (v) => (isObject(v) ? encodeClasses(v) : v))
  }
  return data
}

function encodeClasses(data: object): any {
  const encodeRule = isObject(data) ? encodeClassRule.find((rule) => data instanceof rule.class) : undefined
  if (!encodeRule) return encode(data)
  return encodeRule.encodeFn(data as any /* force */)
}

export const encodeClassRule: EncodeRuleItem[] = [
  { class: PublicKey, encodeFn: (rawData: PublicKey) => createEncodedObject('PublicKey', toPubString(rawData)) }
]

export type EncodeRuleItem = {
  class: { new (...args: any[]): any }
  encodeFn: (rawData: any) => EncodedObject<any>
}
