import { isArray, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { isSDKToken, parseSDKToken } from '../dataStructures/Token'
import toPubString, { isPublicKey } from '../dataStructures/Publickey'

/**
 *
 * @param sdkRawData input raw sdk data
 */
export function flatSDKReturnedInfo<T>(sdkRawData: T): T {
  if (isPrimitive(sdkRawData)) {
    return sdkRawData
  } else if (isArray(sdkRawData)) {
    return sdkRawData.map(flatSDKReturnedInfo) as T
  } else if (isSDKToken(sdkRawData)) {
    return parseSDKToken(sdkRawData) as unknown as T
  } else if (isPublicKey(sdkRawData)) {
    return toPubString(sdkRawData) as unknown as T
  } else if (isObjectLiteral(sdkRawData)) {
    return map(sdkRawData, (v) => flatSDKReturnedInfo(v)) as unknown as T
  }
  return sdkRawData
}
