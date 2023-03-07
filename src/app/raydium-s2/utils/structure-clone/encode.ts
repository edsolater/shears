import { isArray, isObject, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { PublicKey } from '@solana/web3.js'
import toPubString from '../../stores/common/utils/pub'
import { EncodedObject } from './type'

export function encode(data: unknown): any {
  if (isPrimitive(data)) return data
  if (isObjectLiteral(data) || isArray(data)) {
    return map(data, (v) => (isObject(v) ? encodeClasses(v) : v))
  } else {
    return data
  }
}

function encodeClasses(data: object): any {
  return isPublicKey(data) ? encodePublicky(data) : encode(data)
}

function isPublicKey(data: any): data is PublicKey {
  return data instanceof PublicKey
}

function encodePublicky(data: PublicKey): EncodedObject<string> {
  return { _type: 'Publickey', _info: toPubString(data) }
}
