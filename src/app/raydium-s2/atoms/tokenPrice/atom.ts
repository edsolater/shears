import { Numberish } from '@edsolater/fnkit'
import { createEffect, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import {
  Token} from '../tokenList/type'
import { FetchRaydiumTokenPriceOptions, TokenPriceWorkerData } from "./type"
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { TokenListAtom, useTokenListAtom } from '../tokenList/atom'

/**
 * token related type is in
 * {@link Token}
 */

export const useTokenPriceAtom = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [prices, setPrices] = createSignal<Map<string, Numberish>>(new Map())

  const tokenListAtom = useTokenListAtom()

  createEffect(() => {
    if (tokenListAtom.allTokens.size > 0) {
      setIsLoading(true)
      getTokenPriceInfo(tokenListAtom.allTokens, (workerResult) => {
        setIsLoading(false)
        workerResult?.prices && setPrices(workerResult.prices)
      })
    }
  })

  // atom
  const atom: TokenPriceAtom = {
    get prices() {
      return prices()
    },
    get isLoading() {
      return isLoading()
    }
  }
  return atom
})

type TokenPriceAtom = {
  isLoading: boolean
  prices: Map<string, Numberish>
}

const getTokenPriceInfo = (tokens: TokenListAtom['allTokens'], cb: WebworkerSubscribeCallback<TokenPriceWorkerData>) =>
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
