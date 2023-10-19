import { ReplaceType } from '@edsolater/fnkit'
import { Currency, Token as _Token } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

export interface Token {
  mint: string
  decimals: number

  symbol?: string
  name?: string
  extensions?: {
    coingeckoId?: string
  }
  is?: 'sol' | 'raydium-official' | 'raydium-unofficial' | 'raydium-unnamed' | 'raydium-blacklist'
  userAdded?: boolean // only if token is added by user
  icon?: string
  hasFreeze?: boolean
}

export const SOLToken = {
  mint: PublicKey.default.toString(),
  decimals: 9,

  symbol: 'sol',
  name: 'solana',
  is: 'sol',
} satisfies Token

const WSOLMint = 'So11111111111111111111111111111111111111112'
export const SDK_TOKEN_WSOL = new _Token(WSOLMint, SOLToken.decimals, 'WSOL', 'wrapped solana')
export const SDK_CURRENCY_SOL = new Currency(SOLToken.decimals, 'SOL', 'solana')
export const TOKEN_SOL: Token = {
  mint: PublicKey.default.toString(),
  decimals: 9,
  symbol: 'SOL',
  name: 'solana',
  is: 'sol',
}

/** only for SDK: unWrap may QuantumSOL to Token or Currency */
export function toSDKToken(token: Token): _Token | Currency {
  if (token.is === 'sol') return SDK_CURRENCY_SOL
  return new _Token(token.mint, token.decimals, token.symbol, token.name)
}

export function isSDKToken(token: unknown): token is Currency | _Token {
  return token instanceof Currency || token instanceof _Token
}

export type FlatSDKToken<T> = ReplaceType<T, Currency | _Token, Token>

/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKToken(token: Currency | _Token): Token {
  if (isSDKTokenSOL(token)) {
    return TOKEN_SOL
  } else {
    const t = token as _Token
    return {
      mint: t.mint.toString(),
      decimals: t.decimals,
      symbol: t.symbol,
      name: t.name,
    }
  }
}

function isSDKTokenSOL(token: Currency | _Token): token is typeof TOKEN_SOL {
  return token.name === 'solana' && token.symbol?.toLowerCase() === 'SOL'.toLowerCase()
}

export function isToken(token: unknown): token is Token {
  return typeof token === 'object' && token !== null && typeof (token as Token).mint === 'string'
}

/** for easier use, usually as defaut value */
export const emptyToken = {
  mint: '',
  decimals: 0,
  symbol: '--',
  name: '--',
  icon: '',
} satisfies Token

export function isEmptyToken(token: Token): boolean {
  return token.mint === ''
}
