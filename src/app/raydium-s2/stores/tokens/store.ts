import { createGlobalStore, createStoreDefaultState } from '../../../../packages/pivkit'
import { initAllTokens } from './initAllTokens'
import { Token } from '../../types/atoms/type'

// 💡 maybe atom-like not store will be easier to compose

export type TokenStore = {
  tokenListState: 'before-init' | 'loaded'
  isTokenLoading: boolean
  allTokens: Map<string, Token>
}

export const defaultTokenStore = createStoreDefaultState<TokenStore>(() => ({
  tokenListState: 'before-init',
  isTokenLoading: false,
  allTokens: new Map()
}))

export const [useTokenStore, rawTokenStore] = createGlobalStore<TokenStore>(defaultTokenStore, {
  onInit: [initAllTokens]
})
