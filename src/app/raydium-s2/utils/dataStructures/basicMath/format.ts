import { Numberish } from '../type'
import { toFraction } from './toFraction'
import { shakeTailingZero } from './utils'

export type NumberishOption = {
  /**
   * if too much, turncate not care decimals
   * @example
   * toString('3.14897987', 2) => '3.14'
   * toString('3.14897987', 0) => '3'
   * toString('3.14897987') => '3.148979'
   * @default 4
   */
  decimalLength?: number
}

/**
 * @example
 * toString(undefined) //=> ''
 * toString(3) //=> '3'
 * toString('.3') //=> '0.3'
 * toString('8n') //=> '8'
 * toString({ numerator: 3n, denominator: 2n  }) => '1.5'
 * toString({ numerator: 42312n, denominator: 100n  }) => '423.12'
 */
export function toString(from: Numberish | undefined, options?: NumberishOption): string {
  if (from == null) return ''
  const { numerator, denominator } = toFraction(from)
  if (denominator === 1n) {
    return String(numerator)
  } else {
    const decimalPlace = options?.decimalLength ?? 4
    const DummyNumerator = numerator * 10n ** BigInt(decimalPlace)
    const DummyDenominator = denominator * 10n ** BigInt(decimalPlace)
    const DummyfinalN = String(DummyNumerator / DummyDenominator)
    const intPart = DummyfinalN.slice(0, -decimalPlace)
    const decPart = DummyfinalN.slice(-decimalPlace)
    return shakeTailingZero(`${intPart}.${decPart}`)
  }
}

/**
 * CAUTION 1: if original number have very long decimal part, it will lost
 * CAUTION 2: result MUST between MAX_SAFE_INTEGER and MIN_SAFE_INTEGER
 *
 */
export function toNumber(from: Numberish): number {
  const n = Number(toString(from))
  if (n > Number.MAX_SAFE_INTEGER) {
    console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
    return Number.MAX_SAFE_INTEGER
  }
  if (n < Number.MIN_SAFE_INTEGER) {
    console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
    return Number.MIN_SAFE_INTEGER
  }
  return n
}

export function toFixedDecimal(n: Numberish, fractionLength: number): string {
  const [, sign = '', int = '', dec = ''] = toString(n).match(/(-?)(\d*)\.?(\d*)/) ?? []
  if (!dec || dec.length < fractionLength) return toString(n)
  else return `${sign}${int}.${dec.slice(0, fractionLength)}`
}
