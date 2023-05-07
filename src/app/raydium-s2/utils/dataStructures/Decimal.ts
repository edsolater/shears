import Decimal from 'decimal.js'
import { toFraction } from './basicMath/toFraction'
import { Fraction } from './type'

export function isSDKDecimal(n: unknown): n is Decimal {
  return n instanceof Decimal
}

/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKDecimal(n: Decimal): Fraction {
  return toFraction(n.toString())
}
