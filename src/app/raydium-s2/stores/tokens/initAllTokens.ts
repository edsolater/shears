import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenStore } from './store'
import { queryTokenJsonInfo } from './mainThread'

export const initAllTokens = createOnFirstAccessCallback<TokenStore>(
  'allTokens',
  async ({ setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    queryTokenJsonInfo((allTokens) => {
      setTokenListState('loaded')
      setIsTokenLoading(false)
      allTokens?.tokens && setAllTokens(allTokens.tokens)
    })
  }
)
