import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenJson } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../webworker/worker_receiver'

export type TokenStore = {
  tokenListState: 'before-init' | 'loaded'
  isTokenLoading: boolean
  allTokens: TokenJson[]
}

export const defaultTokenStore = { tokenListState: 'before-init', isTokenLoading: false, allTokens: [] } as TokenStore

export const initAllTokens = createOnFirstAccessCallback<TokenStore, 'allTokens'>(
  'allTokens',
  async (_, { setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    const allTokens = await fetchTokensInMainThread()
    setTokenListState('loaded')
    setIsTokenLoading(false)
    setAllTokens(allTokens)
  }
)

function fetchTokensInMainThread() {
  return queryWebWorker<TokenJson[]>('fetch raydium supported tokens')
}
