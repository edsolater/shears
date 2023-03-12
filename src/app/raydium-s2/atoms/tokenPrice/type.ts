import { Numberish } from '@edsolater/fnkit'
import { Token } from '../tokenList/type'

export type TokenPriceWorkerData = {
  prices: Map<string, Numberish>
}
/** in fact, it has both raydium price and coingecko price */

export type FetchRaydiumTokenPriceOptions = {
  url: string
  tokens: Map<string, Token>
}
