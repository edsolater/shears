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
export function parseSDKDecimal(n: undefined): undefined
export function parseSDKDecimal(n: Decimal): Fraction
export function parseSDKDecimal(n: Decimal | undefined): Fraction | undefined 
export function parseSDKDecimal(n: Decimal | undefined): Fraction | undefined {
  if (n == null) return n
  return toFraction(n.toString())
}
