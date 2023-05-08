import { ReplaceType, isArray, isObjectLiteral, isPrimitive, map } from '@edsolater/fnkit'
import { isSDKToken, parseSDKToken } from '../dataStructures/Token'
import toPubString, { isPublicKey } from '../dataStructures/Publickey'
import { isSDKTokenAmount, parseSDKTokenAmount } from '../dataStructures/TokenAmount'
import { isSDKBN, parseSDKBN } from '../dataStructures/BN'
import { isSDKFraction, parseSDKFraction } from '../dataStructures/Fraction'
import { isSDKPrice, parseSDKPrice } from '../dataStructures/Price'
import { isSDKDecimal, parseSDKDecimal } from '../dataStructures/Decimal'
import { CurrencyAmount, TokenAmount as _TokenAmount } from '@raydium-io/raydium-sdk'
import { TokenAmount } from '../dataStructures/TokenAmount'

/**
 *
 * @param sdkRawData input raw sdk data
 */
export function flatSDKReturnedInfo<T>(sdkRawData: T): ReplaceType<T, CurrencyAmount | _TokenAmount, TokenAmount> {
  if (isPrimitive(sdkRawData)) {
    return sdkRawData as any
  } else if (isArray(sdkRawData)) {
    return sdkRawData.map(flatSDKReturnedInfo) as any
  } else if (isSDKTokenAmount(sdkRawData)) {
    return parseSDKTokenAmount(sdkRawData) as any
  } else if (isSDKToken(sdkRawData)) {
    return parseSDKToken(sdkRawData) as any
  } else if (isPublicKey(sdkRawData)) {
    return toPubString(sdkRawData) as any
  } else if (isSDKBN(sdkRawData)) {
    return parseSDKBN(sdkRawData) as any
  } else if (isSDKDecimal(sdkRawData)) {
    return parseSDKDecimal(sdkRawData) as any
  } else if (isSDKPrice(sdkRawData)) {
    return parseSDKPrice(sdkRawData) as any
  } else if (isSDKFraction(sdkRawData)) {
    return parseSDKFraction(sdkRawData) as any
  } else if (isObjectLiteral(sdkRawData)) {
    return map(sdkRawData, (v) => flatSDKReturnedInfo(v)) as any
  }

  return sdkRawData as any
}
