import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenJson } from 'test-raydium-sdk-v2'
import { getSDKTokens } from '../$worker/worker_receiver'

type TokenStore = {
  hasInitedTokenList: boolean
  isTokenLoading: boolean
  allTokens: TokenJson[]
}

export const defaultTokenStore = { hasInitedTokenList: false, isTokenLoading: false, allTokens: [] } as TokenStore

export const initAllTokens = createOnFirstAccessCallback<TokenStore, 'allTokens'>(
  'allTokens',
  async (_, { setIsTokenLoading, setHasInitedTokenList, setAllTokens }) => {
    setIsTokenLoading(true)
    const allTokens = await getSDKTokens()
    setHasInitedTokenList(true)
    setIsTokenLoading(false)
    setAllTokens(allTokens)
  }
)
