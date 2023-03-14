import { Fraction, Numberish } from '../type'
import { toFraction } from './toFraction'

export function mul(a: Numberish, b: Numberish): Fraction
export function mul(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined
export function mul(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined {
  if (a == null || b == null) return undefined
  const fa = toFraction(a)
  const fb = toFraction(b)
  return { numerator: fa.numerator * fb.numerator, denominator: fa.denominator * fb.denominator }
}

export function div(a: Numberish, b: Numberish): Fraction
export function div(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined
export function div(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined {
  if (a == null || b == null) return undefined
  const fa = toFraction(a)
  const fb = toFraction(b)
  return { numerator: fa.numerator * fb.denominator, denominator: fa.denominator * fb.numerator }
}
export const divide = div

export function add(a: Numberish, b: Numberish): Fraction
export function add(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined
export function add(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined {
  if (a == null || b == null) return undefined
  const fa = toFraction(a)
  const fb = toFraction(b)
  return {
    numerator: fa.numerator * fb.denominator + fb.numerator * fa.denominator,
    denominator: fa.denominator * fb.denominator
  }
}

export function sub(a: Numberish, b: Numberish): Fraction
export function sub(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined
export function sub(a: Numberish | undefined, b: Numberish | undefined): Fraction | undefined {
  if (a == null || b == null) return undefined
  const fa = toFraction(a)
  const fb = toFraction(b)
  return {
    numerator: fa.numerator * fb.denominator - fb.numerator * fa.denominator,
    denominator: fa.denominator * fb.denominator
  }
}

export function pow(a: Numberish, b: number | bigint): Fraction
export function pow(a: Numberish | undefined, b: number | bigint | undefined): Fraction | undefined
export function pow(a: Numberish | undefined, b: number | bigint | undefined): Fraction | undefined {
  if (a == null || b == null) return undefined
  const fa = toFraction(a)
  return { numerator: fa.numerator ** BigInt(b), denominator: fa.denominator ** BigInt(b) }
}
