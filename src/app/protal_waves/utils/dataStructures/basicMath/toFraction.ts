import { isObjectLiteral } from '@edsolater/fnkit'
import { Fraction, Numberish } from '../type'

/**
 * @example
 * toFraction(0.34) //=> { numerator: '34', denominator: '100'}
 * toFraction('0.34') //=> { numerator: '34', denominator: '100'}
 */
export function toFraction(n: undefined): undefined
export function toFraction(n: Numberish): Fraction
export function toFraction(n: Numberish | undefined): Fraction | undefined
export function toFraction(n: Numberish | undefined): Fraction | undefined {
  if (isFraction(n)) return n
  const s = String(n)
  const [, sign = '', int = '', dec = '', expN] = s.match(/(-?)(\d*)\.?(\d*)(?:e(-?\d+))?/) ?? []
  if (expN) {
    // have scientific notion part
    const nexpN = Number(expN)
    const flatedStringN = offsetDecimalDot(`${sign}${int}.${dec}`, nexpN)
    return toFraction(flatedStringN)
  } else {
    const denominator = '1' + '0'.repeat(dec.length) // TODO:should test it
    const numerator = sign + (int === '0' ? '' : int) + dec || '0' // TODO:should test it
    return { denominator: BigInt(denominator), numerator: BigInt(numerator) }
  }
}

export function isFraction(n: unknown): n is Fraction {
  return isObjectLiteral(n) && 'numerator' in n && 'denominator' in n
}

/** offset:  negative is more padding start zero */
function offsetDecimalDot(s: string, offset: number) {
  const [, sign = '', int = '', dec = ''] = s.replace(',', '').match(/(-?)(\d*)\.?(\d*)(?:e(-?\d+))?/) ?? []
  const oldDecLength = dec.length
  const newDecLength = oldDecLength - offset
  if (newDecLength > int.length + dec.length) {
    return `${sign}0.${(int + dec).padStart(newDecLength, '0')}`
  } else {
    return `${sign}${(int + dec).slice(0, -newDecLength)}.${(int + dec).slice(-newDecLength)}`
  }
}
