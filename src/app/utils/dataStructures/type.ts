
export type Mint = string /* just special in string content */
export type PublicKey = string /* just special in string content */

// plain object for easier structure clone
export type Percent = Numberish | number

// plain object for easier structure clone
export type BN = Fraction | bigint

export type Price = Fraction

// this structure is not mathematics elegant
export interface Decimal {
  fraction: Numberish
  decimal: number
}

export interface Fraction {
  numerator: bigint
  denominator: bigint
}

export type Numberish = number | string | bigint | Fraction
