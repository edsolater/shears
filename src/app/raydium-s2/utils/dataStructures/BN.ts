import OriginalBN from 'bn.js'
import { toBigint } from './basicMath/format'
import { Fraction, Numberish } from './type'

// plain object for easier structure clone
export type BN = Fraction

export function toOriginalBN(n: Numberish): OriginalBN {
  return new OriginalBN(String(toBigint(n)))
}

export function toDecodedBN(n: OriginalBN): BN {
  return { numerator: BigInt(n.toString()), denominator: BigInt(1) }
}
