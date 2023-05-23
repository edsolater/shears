import { Numberish } from '../type'
import { sub } from './operations'
import { toFraction } from './toFraction'

export function lt(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  const fa = toFraction(a)
  const fb = toFraction(b)
  const subResult = sub(fa, fb)
  const isNegative =
    (subResult.numerator < 0 && subResult.denominator > 0) || (subResult.numerator > 0 && subResult.denominator < 0)
  return isNegative
}

export function gt(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  const fa = toFraction(a)
  const fb = toFraction(b)
  const subResult = sub(fa, fb)
  const isPositive =
    (subResult.numerator > 0 && subResult.denominator > 0) || (subResult.numerator < 0 && subResult.denominator < 0)
  return isPositive
}

export function eq(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  const fa = toFraction(a)
  const fb = toFraction(b)
  const subResult = sub(fa, fb)
  const isZero = subResult.numerator === 0n
  return isZero
}

export function lte(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  return eq(a, b) || lt(a, b)
}

export function gte(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  return eq(a, b) || gt(a, b)
}

export function neq(a: Numberish | undefined, b: Numberish | undefined): boolean {
  return !eq(a, b)
}

export function isPositive(a: Numberish | undefined): boolean {
  if (a == null) return false
  return gt(a, 0)
}

export function isNegative(a: Numberish | undefined): boolean {
  if (a == null) return false
  return lt(a, 0)
}

export function isZero(a: Numberish | undefined): boolean {
  if (a == null) return false
  return eq(a, 0)
}
