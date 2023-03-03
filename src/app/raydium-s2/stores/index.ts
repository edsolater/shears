import { changeFnReturnValue, mergeFunction } from '@edsolater/fnkit'
import { createGlobalStore } from '@edsolater/pivkit'
import { defaultFarmsStore, FarmsStore, initAllFarms } from './farms/store'
import { defaultPairsStore, initAllPairs, PairsStore } from './pairs/store'
import { defaultTokenStore, initAllTokens, TokenStore } from './tokens/store'

const mergedDefaultStore = changeFnReturnValue(
  mergeFunction(defaultFarmsStore, defaultPairsStore as any, defaultTokenStore),
  (returnList) => returnList.reduce((acc, item) => ({ ...acc, ...item }), {})
)
type MergedStore = TokenStore & PairsStore & FarmsStore
export const useDataStore = createGlobalStore<MergedStore>(mergedDefaultStore, {
  onFirstAccess: [initAllTokens, initAllPairs, initAllFarms]
})
