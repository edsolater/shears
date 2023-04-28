import { Currency, Token as _Token, ZERO } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

export interface Token {
  mint: string
  decimals: number

  symbol?: string
  name?: string
  extensions?: {
    coingeckoId?: string
  }
  is: 'raydium-official' | 'raydium-unofficial' | 'raydium-unnamed' | 'raydium-blacklist'
  userAdded?: boolean // only if token is added by user
  icon?: string
  hasFreeze?: boolean
}

const WSOLMint = new PublicKey('So11111111111111111111111111111111111111112')
const SOLDecimals = 9
export const SDKToken_WSOL = new _Token(WSOLMint, SOLDecimals, 'WSOL', 'wrapped solana')
export const SDKToken_SOL = new Currency(SOLDecimals, 'SOL', 'solana')
const SOL_BASE_BALANCE = '0.05'

/** transaction for SDK: unWrap may QuantumSOL to Token or Currency */
export function deUIToken(token: Token): _Token | Currency {
  throw 'not imply yet'

  // if (isQuantumSOL(token)) {
  //   return token.collapseTo === 'wsol' ? WSOL : SOL
  // }
  // return token
}
