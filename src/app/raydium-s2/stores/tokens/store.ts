import { createGlobalStore, createStoreDefaultState } from '../../../../packages/pivkit'
import { initAllTokens } from './initAllTokens'
import { Token } from './type'

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

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string) {
  return rawTokenStore.allTokens.get(mint)
}
