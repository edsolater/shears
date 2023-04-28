import { Token } from "./Token"

export type Mint = string /* just special in string content */
export type PublicKey = string /* just special in string content */

// plain object for easier structure clone
export type Percent = Numberish | number

// plain object for easier structure clone
export type BN = Fraction | bigint

export type Price = Fraction

// this structure is not mathematics elegant
export type Decimal = {
  fraction: Numberish
  decimal: number
}

// plain object for easier structure clone
export type TokenAmount = {
  token: Token | Mint
  decimaled: boolean
  amount: Numberish
}

export type Fraction = {
  numerator: bigint
  denominator: bigint
}
export type Numberish = number | string | bigint | Fraction
