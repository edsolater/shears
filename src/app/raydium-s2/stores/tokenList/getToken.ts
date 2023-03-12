import { useTokenListStore } from './store'

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  return useTokenListStore().allTokens.get(mint ?? '')
}
