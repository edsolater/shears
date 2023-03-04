import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { TokenStore } from './store'
import { queryTokenJsonInfo } from "./queryTokenJson"

export const initAllTokens = createOnFirstAccessCallback<TokenStore>(
  'allTokens',
  async ({ setIsTokenLoading, setTokenListState, setAllTokens }) => {
    setIsTokenLoading(true)
    const allTokens = await queryTokenJsonInfo()
    setTokenListState('loaded')
    setIsTokenLoading(false)
    allTokens?.tokens && setAllTokens(allTokens.tokens)
  }
)
