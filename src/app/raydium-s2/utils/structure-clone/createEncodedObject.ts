import { EncodedObject } from './type'

export function createEncodedObject<T>(name: string, info: T): EncodedObject<T> {
  return { _type: name, _info: info }
}
