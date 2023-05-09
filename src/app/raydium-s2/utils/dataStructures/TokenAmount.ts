import { CurrencyAmount, Token as _Token, TokenAmount as _TokenAmount } from '@raydium-io/raydium-sdk'
import { parseSDKBN, toBN } from './BN'
import { SDK_CURRENCY_SOL, TOKEN_SOL, Token, parseSDKToken } from './Token'
import { mul } from './basicMath/operations'
import { Numberish } from './type'
import { div } from './basicMath/operations'
import { ReplaceType } from '@edsolater/fnkit'

export type TokenAmount = {
  token: Token
  /** value that is amount */
  amount: Numberish
}

export function deUITokenAmount(tokenAmount: TokenAmount): _TokenAmount | CurrencyAmount {
  const isSol = tokenAmount.token.is === 'sol'
  if (isSol) {
    const token = SDK_CURRENCY_SOL
    return new CurrencyAmount(token, toBN(mul(tokenAmount.amount, 10 ** token.decimals))) // which means error appears
  } else {
    const token = new _Token(
      tokenAmount.token.mint,
      tokenAmount.token.decimals,
      tokenAmount.token.symbol,
      tokenAmount.token.name
    )
    return new _TokenAmount(token, toBN(mul(tokenAmount.amount, 10 ** token.decimals))) // which means error appears
  }
}

export function toTokenAmount(token: Token, amount: Numberish, options?: { amountIsRawBN?: boolean }): TokenAmount {
  return { token, amount: options?.amountIsRawBN ? div(amount, 10 ** token.decimals) : amount }
}

export function isSDKTokenAmount(amount: unknown): amount is _TokenAmount | CurrencyAmount {
  return amount instanceof _TokenAmount || amount instanceof CurrencyAmount
}

export type FlatSDKTokenAmount<T> = ReplaceType<T, CurrencyAmount | _TokenAmount, TokenAmount>

/**
 * SDK tokenAmount → UI prefer transformable object literal tokenAmount
 */
export function parseSDKTokenAmount(tokenAmount: CurrencyAmount | _TokenAmount): TokenAmount {
  if (isSDKCurrencyAmount(tokenAmount)) {
    return { token: TOKEN_SOL, amount: div(parseSDKBN(tokenAmount.raw), 10 ** TOKEN_SOL.decimals) }
  } else {
    const ta = tokenAmount as _TokenAmount
    return {
      token: parseSDKToken(ta.token),
      amount: div(parseSDKBN(ta.raw), 10 ** ta.token.decimals)
    }
  }
}

function isSDKCurrencyAmount(amount: unknown): amount is CurrencyAmount {
  return amount instanceof CurrencyAmount
}
