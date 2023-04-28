import { Numberish } from '@edsolater/fnkit'
import { TokenListStore } from './tokenList'
import { Token } from "../../../utils/dataStructures/Token"

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