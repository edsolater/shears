import { createOnFirstAccessCallback, createStoreDefaultState } from '@edsolater/pivkit'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FetchRaydiumTokenOptions, Token, TokenMessageData } from './types/type'

export type TokenStore = {
  tokenListState: 'before-init' | 'loaded'
  isTokenLoading: boolean
  allTokens: Token[]
}

export const defaultTokenStore = createStoreDefaultState<TokenStore>(() => ({
  tokenListState: 'before-init',
  isTokenLoading: false,
  allTokens: []
}))

export const initAllTokens = createOnFirstAccessCallback<TokenStore>(
  'allTokens',
  async ({ setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    const allTokens = await queryToken()
    setTokenListState('loaded')
    setIsTokenLoading(false)
    allTokens?.tokens && setAllTokens(allTokens.tokens)
  }
)

function queryToken() {
  return queryWebWorker<TokenMessageData, FetchRaydiumTokenOptions>('fetch raydium supported tokens', {
    url: appApiUrls.tokenInfo
  })
}
