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
  return isEncodedPublicKey(data) ? decodePublicky(data) : decode(data)
}

function isEncodedPublicKey(data: any): data is EncodedObject<string> {
  return isObject(data) && data._type === 'Publickey'
}
function decodePublicky(data: EncodedObject<string>): PublicKey {
  return toPub(data._info)
}
