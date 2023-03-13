import { createEffect, createSignal, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import { FetchRaydiumTokenListOptions, Token, TokenWorkerData } from './type'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { loadTokens } from './methods/loadTokens'
import { getToken } from './methods/getToken'

export type TokenListStore = {
  // for extract method
  $setters: {
    setIsLoading: Setter<boolean>
    setAllTokens: Setter<Map<string, Token>>
  }
  isLoading: boolean
  allTokens: Map<string, Token>
  getToken(mint: string | undefined): Token | undefined
}
/**
 * token related type is in
 * {@link Token}
 */
export const useTokenListStore = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [allTokens, setAllTokens] = createSignal<TokenListStore['allTokens']>(new Map())

  createEffect(loadTokens)

  // store
  const store: TokenListStore = {
    $setters: {
      setIsLoading,
      setAllTokens
    },
    get allTokens() {
      return allTokens()
    },
    getToken,
    get isLoading() {
      return isLoading()
    }
  }
  return store
})

export const getTokenJsonInfo = (cb: WebworkerSubscribeCallback<TokenWorkerData>) =>
  subscribeWebWorker<TokenWorkerData, FetchRaydiumTokenListOptions>(
    {
      description: 'fetch raydium supported tokens',
      payload: {
        url: appApiUrls.tokenInfo
      }
    },
    cb
  )
