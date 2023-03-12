import { Numberish } from '@edsolater/fnkit'

// -------- Token --------
export type TokenWorkerData = {
  tokens: Map<string, Token>
  blacklist: string[]
}

export type FetchRaydiumTokenListOptions = {
  url: string
  force?: boolean
}

// -------- Token Price --------
export type TokenPriceWorkerData = {
  prices: Map<string, Numberish>
}

/** in fact, it has both raydium price and coingecko price */
export type FetchRaydiumTokenPriceOptions = {
  url: string
  tokens: Map<string, Token>
}

export interface RaydiumTokenListJsonFile {
  official: Token[]
  unOfficial: Token[]
  unNamed: Token[]
  blacklist: string[]
}

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
