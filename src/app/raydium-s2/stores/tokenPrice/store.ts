import { Numberish } from '@edsolater/fnkit'
import { createEffect, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import { Token, TokenListStore } from '../data/tokenListType'
import { FetchRaydiumTokenPriceOptions, TokenPriceWorkerData } from './type'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { useDataStore } from '../data/store'

export type TokenPriceStore = {
  isLoading: boolean
  prices: Map<string, Numberish>
}

/**
 * token related type is in
 * {@link Token}
 */

export const useTokenPriceStore = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [prices, setPrices] = createSignal<Map<string, Numberish>>(new Map())

  const tokenListStore = useDataStore()

  createEffect(() => {
    if (tokenListStore.allTokens && tokenListStore.allTokens.length > 0) {
      setIsLoading(true)
      getTokenPriceInfo(tokenListStore.allTokens, (workerResult) => {
        setIsLoading(false)
        workerResult?.prices && setPrices(workerResult.prices)
      })
    }
  })

  // store
  const store: TokenPriceStore = {
    get prices() {
      return prices()
    },
    get isLoading() {
      return isLoading()
    }
  }
  return store
})

const getTokenPriceInfo = (tokens: TokenListStore['allTokens'], cb: WebworkerSubscribeCallback<TokenPriceWorkerData>) =>
  subscribeWebWorker<TokenPriceWorkerData, FetchRaydiumTokenPriceOptions>(
    {
      description: 'get raydium token prices',
      payload: {
        url: appApiUrls.price,
        tokens
      }
    },
    cb
  )
