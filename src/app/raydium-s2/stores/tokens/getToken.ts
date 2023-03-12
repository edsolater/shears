import { rawTokenStore } from './store'

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  return rawTokenStore.allTokens.get(mint ?? '')
}
