import OriginalBN from 'bn.js'
import { toFraction } from './basicMath/toFraction'
import { Fraction, Numberish } from './type'
import { ReplaceType } from '@edsolater/fnkit'

// plain object for easier structure clone
export type BN = Fraction

export function toBN(n: Numberish): OriginalBN {
  return new OriginalBN(String(toBigint(n)))
}

export function toDecodedBN(n: OriginalBN): BN {
  return { numerator: BigInt(n.toString()), denominator: BigInt(1) }
}

/**
 * CAUTION : if original number have decimal part, it will lost
 */
export function toBigint(n: Numberish): bigint {
  const { numerator, denominator } = toFraction(n)
  return numerator / denominator
}

export type FlatSDKBN<T> = ReplaceType<T, OriginalBN, bigint>

export function parseSDKBN(n: undefined): undefined
export function parseSDKBN(n: OriginalBN): bigint
export function parseSDKBN(n: OriginalBN | undefined): bigint | undefined 
export function parseSDKBN(n: OriginalBN | undefined): bigint | undefined {
  if (n == null) return n
  return toBigint(n.toString())
}

export function isSDKBN(n: unknown): n is OriginalBN {
  return n instanceof OriginalBN
}
