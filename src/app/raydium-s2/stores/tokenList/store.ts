import { createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import { FetchRaydiumTokenListOptions, Token, TokenWorkerData } from './type'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'


/**
 * token related type is in
 * {@link Token} 
 */

export const useTokenListStore = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [allTokens, setAllTokens] = createSignal<Map<string, Token>>(new Map())

  // init data
  function loadData() {
    setIsLoading(true)
    getTokenJsonInfo((allTokens) => {
      setIsLoading(false)
      allTokens?.tokens && setAllTokens(allTokens.tokens)
    })
  }

  loadData()

  // store
  const store: TokenListStore = {
    get allTokens() {
      return allTokens()
    },
    get isLoading() {
      return isLoading()
    }
  }
  return store
})

export type TokenListStore = {
  isLoading: boolean
  allTokens: Map<string, Token>
}

const getTokenJsonInfo = (cb: WebworkerSubscribeCallback<TokenWorkerData>) =>
  subscribeWebWorker<TokenWorkerData, FetchRaydiumTokenListOptions>(
    {
      description: 'fetch raydium supported tokens',
      payload: {
        url: appApiUrls.tokenInfo
      }
    },
    cb
  )
