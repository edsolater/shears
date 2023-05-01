import { CurrencyAmount, Token as _Token, TokenAmount as _TokenAmount } from '@raydium-io/raydium-sdk'
import { toBN } from './BN'
import { SDK_CURRENCY_SOL, Token } from './Token'
import { mul } from './basicMath/operations'
import { Numberish } from './type'

export type TokenAmount = {
  token: Token
  amount: Numberish
}

export function deUITokenAmount(tokenAmount: TokenAmount): _TokenAmount | CurrencyAmount {
  const isSol = tokenAmount.token.is === 'sol'
  if (isSol) {
    const token = SDK_CURRENCY_SOL
    return new CurrencyAmount(token, toBN(tokenAmount.amount)) // which means error appears
  } else {
    const token = new _Token(
      tokenAmount.token.mint,
      tokenAmount.token.decimals,
      tokenAmount.token.symbol,
      tokenAmount.token.name
    )
    return new _TokenAmount(token, toBN(tokenAmount.amount)) // which means error appears
  }
}

export function toTokenAmount(token: Token, amount: Numberish, options?: { alreadyDecimaled?: boolean }): TokenAmount {
  return { token, amount: options?.alreadyDecimaled ? mul(amount, 10 ** token.decimals) : amount }
}
