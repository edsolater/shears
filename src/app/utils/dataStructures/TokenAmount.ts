import {
  CurrencyAmount as SDK_CurrencyAmount,
  Token as SDK_Token,
  TokenAmount as SDK_TokenAmount,
} from '@raydium-io/raydium-sdk'
import { parseSDKBN, toBN } from './BN'
import { SDK_CURRENCY_SOL, TOKEN_SOL, Token, parseSDKToken } from './Token'
import { mul } from './basicMath/operations'
import { Numberish } from './type'
import { div } from './basicMath/operations'
import { ReplaceType } from '@edsolater/fnkit'

export interface TokenAmount {
  token: Token
  /** value that is amount */
  amount: Amount
}

/**
 * amount is not decimaled
 */
export type Amount = Numberish

export function deUITokenAmount(tokenAmount: TokenAmount): SDK_TokenAmount | SDK_CurrencyAmount {
  const isSol = tokenAmount.token.is === 'sol'
  if (isSol) {
    const token = SDK_CURRENCY_SOL
    return new SDK_CurrencyAmount(token, toBN(mul(tokenAmount.amount, 10 ** token.decimals))) // which means error appears
  } else {
    const token = new SDK_Token(
      tokenAmount.token.programId,
      tokenAmount.token.mint,
      tokenAmount.token.decimals,
      tokenAmount.token.symbol,
      tokenAmount.token.name,
    )
    return new SDK_TokenAmount(token, toBN(mul(tokenAmount.amount, 10 ** token.decimals))) // which means error appears
  }
}

export function toTokenAmount(token: Token, amount: Numberish, options?: { amountIsRawBN?: boolean }): TokenAmount {
  return { token, amount: options?.amountIsRawBN ? div(amount, 10 ** token.decimals) : amount }
}

export function isSDKTokenAmount(amount: unknown): amount is SDK_TokenAmount | SDK_CurrencyAmount {
  return amount instanceof SDK_TokenAmount || amount instanceof SDK_CurrencyAmount
}

export type FlatSDKTokenAmount<T> = ReplaceType<T, SDK_CurrencyAmount | SDK_TokenAmount, TokenAmount>

/**
 * SDK tokenAmount → UI prefer transformable object literal tokenAmount
 */
export function parseSDKTokenAmount(tokenAmount: SDK_CurrencyAmount | SDK_TokenAmount): TokenAmount {
  if (isSDKCurrencyAmount(tokenAmount)) {
    return { token: TOKEN_SOL, amount: div(parseSDKBN(tokenAmount.raw), 10 ** TOKEN_SOL.decimals) }
  } else {
    const ta = tokenAmount as SDK_TokenAmount
    return {
      token: parseSDKToken(ta.token),
      amount: div(parseSDKBN(ta.raw), 10 ** ta.token.decimals),
    }
  }
}

function isSDKCurrencyAmount(amount: unknown): amount is SDK_CurrencyAmount {
  return amount instanceof SDK_CurrencyAmount
}
