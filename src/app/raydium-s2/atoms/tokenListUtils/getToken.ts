import { useTokenListAtom } from '../tokenListAtom'

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  return useTokenListAtom().allTokens.get(mint ?? '')
}
