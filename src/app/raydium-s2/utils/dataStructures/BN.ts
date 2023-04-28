import OriginalBN from 'bn.js'
import { toFraction } from './basicMath/toFraction'
import { Fraction, Numberish } from './type'

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