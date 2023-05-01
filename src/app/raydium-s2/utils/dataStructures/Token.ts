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
  is: 'sol' | 'raydium-official' | 'raydium-unofficial' | 'raydium-unnamed' | 'raydium-blacklist'
  userAdded?: boolean // only if token is added by user
  icon?: string
  hasFreeze?: boolean
}

export const SOLToken = {
  mint: PublicKey.default.toString(),
  decimals: 9,

  symbol: 'sol',
  name: 'solana',
  is: 'sol'
} satisfies Token

const WSOLMint = 'So11111111111111111111111111111111111111112'
export const SDK_TOKEN_WSOL = new _Token(WSOLMint, SOLToken.decimals, 'WSOL', 'wrapped solana')
export const SDK_CURRENCY_SOL = new Currency(SOLToken.decimals, 'SOL', 'solana')

/** transaction for SDK: unWrap may QuantumSOL to Token or Currency */
export function deUIToken(token: Token): _Token | Currency {
  if (token.is === 'sol') return SDK_CURRENCY_SOL
  return new _Token(token.mint, token.decimals, token.symbol, token.name)
}
