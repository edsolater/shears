import Decimal from 'decimal.js'
import { toFraction } from './basicMath/toFraction'
import { Fraction } from './type'
import { ReplaceType } from '@edsolater/fnkit'

export function isSDKDecimal(n: unknown): n is Decimal {
  return n instanceof Decimal
}

export type FlatSDKDecimal<T> = ReplaceType<T, Decimal, Fraction>
/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKDecimal(n: Decimal): Fraction {
  return toFraction(n.toString())
}
