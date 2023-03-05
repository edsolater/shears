import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenStore } from './store'
import { getTokenJsonInfo } from './mainThread'

export const initAllTokens = createOnFirstAccessCallback<TokenStore>(
  'allTokens',
  async ({ setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    getTokenJsonInfo((allTokens) => {
      setTokenListState('loaded')
      setIsTokenLoading(false)
      allTokens?.tokens && setAllTokens(allTokens.tokens)
    })
  }
)
