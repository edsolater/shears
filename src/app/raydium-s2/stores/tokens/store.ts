import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import { initAllTokens } from './initAllTokens'
import { Token } from './type'

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

export const useTokenStore = createGlobalStore<TokenStore>(defaultTokenStore, { onFirstAccess: [initAllTokens] })
