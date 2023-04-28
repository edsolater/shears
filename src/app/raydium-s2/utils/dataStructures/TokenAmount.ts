import { Numberish } from '@edsolater/fnkit'
import { CurrencyAmount, TokenAmount } from '@raydium-io/raydium-sdk'
import { Token } from './Token'

export function deUITokenAmount(tokenAmount: TokenAmount): TokenAmount | CurrencyAmount {
  // if (isQuantumSOLAmount(tokenAmount)) {
  //   if (tokenAmount.token.collapseTo === 'wsol') {
  //     return new TokenAmount(WSOL, tokenAmount.wsolBalance ?? ZERO) // which means error appears
  //   } else {
  //     return new CurrencyAmount(SOL, tokenAmount.solBalance ?? ZERO) // which means error appears
  //   }
  // }
  // return tokenAmount
  throw 'not imply yet'
}

export function toTokenAmount(token: Token, amount: Numberish, options?: { alreadyDecimaled?: boolean }): TokenAmount {
  // if (isQuantumSOLAmount(tokenAmount)) {
  //   if (tokenAmount.token.collapseTo === 'wsol') {
  //     return new TokenAmount(WSOL, tokenAmount.wsolBalance ?? ZERO) // which means error appears
  //   } else {
  //     return new CurrencyAmount(SOL, tokenAmount.solBalance ?? ZERO) // which means error appears
  //   }
  // }
  // return tokenAmount
  throw 'not imply yet'
}
