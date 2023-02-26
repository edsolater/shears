import { createContextStore, createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenJson } from 'test-raydium-sdk-v2'
import { getSDKTokens } from '../$worker/worker_receiver'

type TokenStore = {
  hasInited: boolean
  isLoading: boolean
  allTokens: TokenJson[]
}

const defaultTokenStore = { hasInited: false, isLoading: false, allTokens: [] } as TokenStore

const initAllTokens = createOnFirstAccessCallback<TokenStore, 'allTokens'>(
  'allTokens',
  async (_, { setIsLoading, setHasInited, setAllTokens }) => {
    setIsLoading(true)
    const allTokens = await getSDKTokens()
    setHasInited(true)
    setIsLoading(false)
    setAllTokens(allTokens)
  }
)

export const [Provider, useSDKToken] = createContextStore(defaultTokenStore, { onFirstAccess: [initAllTokens] })
