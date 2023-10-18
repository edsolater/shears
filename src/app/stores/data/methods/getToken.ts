import { WeakerMap } from '@edsolater/fnkit'
import { Token } from '../../../utils/dataStructures/Token'
import { storeData } from '../dataStore'

const mintWeakerMap = new Map<string, Token>()

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  const storeTokens = storeData.tokens
  if (mintWeakerMap.size !== storeTokens?.length) {
    mintWeakerMap.clear()
    storeTokens?.forEach((token) => {
      mintWeakerMap.set(token.mint, token)
    })
  }
  return mintWeakerMap.get(mint ?? '')
}
