import { Numberish } from '@edsolater/fnkit'
import { TokenListStore } from './tokenList'
import { Token } from '../../../utils/dataStructures/Token'

export interface TokenPriceWorkerData {
  prices: TokenPriceStore['prices']
}
/** in fact, it has both raydium price and coingecko price */

export interface FetchRaydiumTokenPriceOptions {
  url: string
  tokens: TokenListStore['allTokens']
}

export interface TokenPriceStore {
  isTokenPriceLoading?: boolean
  prices?: { mint: string; price: Numberish }[]
}
