import { createOnFirstAccessCallback, createOnStoreInitCallback } from '../../../../packages/pivkit'
import { TokenStore } from './store'
import { getTokenJsonInfo } from './mainThread'

export const initAllTokens = createOnStoreInitCallback<TokenStore>(
  async ({ setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    getTokenJsonInfo((allTokens) => {
      setTokenListState('loaded')
      setIsTokenLoading(false)
      allTokens?.tokens && setAllTokens(allTokens.tokens)
    })
  }
)
