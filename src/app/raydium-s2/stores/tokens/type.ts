export type TokenMessageData = {
  tokens: Map<string, Token>
  blacklist: string[]
}

export type FetchRaydiumTokenOptions = {
  url: string
  force?: boolean
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
