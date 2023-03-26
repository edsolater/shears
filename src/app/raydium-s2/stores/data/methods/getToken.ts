import { WeakerMap } from '@edsolater/fnkit'
import { useDataStore } from '../store'
import { Token } from '../tokenListType'

const mintWeakerMap = new WeakerMap<string, Token>()
/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  const storeTokens = useDataStore().allTokens
  if (mintWeakerMap.size !== storeTokens?.length) {
    mintWeakerMap.clear()
    storeTokens?.forEach((token) => {
      mintWeakerMap.set(token.mint, token)
    })
  }
  return mintWeakerMap.get(mint ?? '')
}
