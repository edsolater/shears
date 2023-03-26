import { Numberish } from '@edsolater/fnkit'
import { Token, TokenListStore } from './tokenList'

export type TokenPriceWorkerData = {
  prices: TokenPriceStore['prices']
}
/** in fact, it has both raydium price and coingecko price */

export type FetchRaydiumTokenPriceOptions = {
  url: string
  tokens: TokenListStore['allTokens']
}

export type TokenPriceStore = {
  isTokenPriceLoading?: boolean
  prices?: {mint:string, price:Numberish}[]
}