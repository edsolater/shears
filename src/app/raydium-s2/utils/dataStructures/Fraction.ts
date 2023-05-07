import { Fraction as _Fraction } from '@raydium-io/raydium-sdk'
import { Fraction } from './type'

export function isSDKFraction(n: unknown): n is _Fraction {
  return n instanceof _Fraction
}

/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKFraction(n: _Fraction): Fraction {
  return { numerator: BigInt(n.numerator.toString()), denominator: BigInt(n.denominator.toString()) }
}
