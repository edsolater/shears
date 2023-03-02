import { createContextStore } from '@edsolater/pivkit'
import { defaultFarmsStore, FarmsStore, initAllFarms } from './farms/store'
import { defaultPairsStore, initAllPairs, PairsStore } from './pairs/store'
import { defaultTokenStore, initAllTokens, TokenStore } from './tokens/store'

const mergedDefaultStore = { ...defaultTokenStore, ...defaultPairsStore, ...defaultFarmsStore }
type MergedStore = TokenStore & PairsStore & FarmsStore
export const [DataStoreProvider, useDataStore] = createContextStore<MergedStore>(mergedDefaultStore, {
  onFirstAccess: [initAllTokens, initAllPairs, initAllFarms]
})
