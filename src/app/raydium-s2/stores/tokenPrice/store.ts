import { Numberish } from '@edsolater/fnkit'
import { createEffect, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import {
  Token} from '../tokenList/type'
import { FetchRaydiumTokenPriceOptions, TokenPriceWorkerData } from "./type"
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { TokenListStore, useTokenListStore } from '../tokenList/store'

/**
 * token related type is in
 * {@link Token}
 */

export const useTokenPriceStore = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [prices, setPrices] = createSignal<Map<string, Numberish>>(new Map())

  const tokenListStore = useTokenListStore()

  createEffect(() => {
    if (tokenListStore.allTokens.size > 0) {
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

type TokenPriceStore = {
  isLoading: boolean
  prices: Map<string, Numberish>
}

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
