import { createSignal } from 'solid-js'
import { createGlobalHook } from '../../../packages/pivkit'
import { appApiUrls } from '../stores/common/utils/config'
import { FetchRaydiumTokenListOptions, Token, TokenWorkerData } from '../types/atoms/type'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../utils/webworker/mainThread_receiver'


/**
 * token related type is in
 * {@link Token} 
 */

export const useTokenListAtom = createGlobalHook(() => {
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

  // atom
  const atom: TokenListAtom = {
    get allTokens() {
      return allTokens()
    },
    get isLoading() {
      return isLoading()
    }
  }
  return atom
})

export type TokenListAtom = {
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
