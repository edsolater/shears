export const stringNumberRegex = /(?<sign>-?)(?<int>\d*)\.?(?<dec>\d*)/

/**
 *
 * @example
 * shakeUnnecessaryZero('-00033.33000000') //=> '-33.33'
 * shakeUnnecessaryZero('-00033.000000') //=> '-33'
 * shakeUnnecessaryZero('000.00000') //=> '0'
 * shakeUnnecessaryZero('000') //=> '0'
 * shakeUnnecessaryZero('.000') //=> '0'
 * shakeUnnecessaryZero('00.313000') //=> '0.313'
 */
export function shakeUnnecessaryZero(s: string): string {
  const { sign, int, dec } = s.match(stringNumberRegex)?.groups ?? {}
  let cleanedDecimalPart = dec
  while (cleanedDecimalPart.endsWith('0')) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, cleanedDecimalPart.length - 1)
  }
  let cleanedIntPart = int
  while (cleanedIntPart.startsWith('0')) {
    cleanedIntPart = cleanedIntPart.slice(1)
  }

  if (cleanedIntPart && cleanedDecimalPart) return `${sign}${cleanedIntPart}.${cleanedDecimalPart}`
  if (!cleanedIntPart && cleanedDecimalPart) return `${sign}0.${cleanedDecimalPart}`
  if (cleanedIntPart && !cleanedDecimalPart) return `${sign}${cleanedIntPart}`
  // condition: !cleanedIntPart && !cleanedDecimalPart
  return '0'
}

/**
 * @example
 * padZeroR('30', 3) //=> '30000'
 */
function padZeroR(str: string, count: number): string {
  return str + Array(count).fill('0').join('')
}
/**
 * @example
 * padZeroL('30', 3) //=> '00030'
 */
function padZeroL(str: string, count: number): string {
  return Array(count).fill('0').join('') + str
}

/**
 *
 * @example
 * shiftDecimal('3.14', 1) //=> '31.4'
 * shiftDecimal('3.14', 2) //=> '314'
 * shiftDecimal('3.14', 4) //=> '31400'
 * shiftDecimal('3.14', -2) //=> '0.0314'
 * shiftDecimal('3.14', 0) //=> '3.14'
 */
export function shiftDecimal(str: string, count: number) {
  const { sign, int: rawInt, dec: rawDec } = str.match(stringNumberRegex)?.groups ?? {}
  const int = padZeroL(rawInt, Math.abs(count))
  const dec = padZeroR(rawDec, Math.abs(count))
  if (count > 0) {
    const intPart = int + dec.slice(0, count)
    const decPart = dec.slice(count)
    return shakeUnnecessaryZero(`${sign}${intPart}.${decPart}`)
  } else if (count < 0) {
    const intPart = int.slice(0, count)
    const decPart = int.slice(count) + dec
    return shakeUnnecessaryZero(`${sign}${intPart}.${decPart}`)
  } else {
    return shakeUnnecessaryZero(`${sign}${int}.${dec}`)
  }
}
// console.log('shiftDecimal("3.14", 1): ', shiftDecimal('3.14', 1))
// console.log('shiftDecimal("3.14", 2): ', shiftDecimal('3.14', 2))
// console.log('shiftDecimal("3.14", 4): ', shiftDecimal('3.14', 4))
// console.log('shiftDecimal("3.14", -2): ', shiftDecimal('3.14', -2))
// console.log('shiftDecimal("3.14", 0): ', shiftDecimal('3.14', 0))
