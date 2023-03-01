import { createContextStore } from '@edsolater/pivkit'
import { defaultFarmsStore, FarmsStore, initAllFarms } from './store-farms'
import { defaultPairsStore, initAllPairs, PairsStore } from './store-pairs'
import { defaultTokenStore, initAllTokens, TokenStore } from './store-tokens'

const mergedDefaultStore = { ...defaultTokenStore, ...defaultPairsStore, ...defaultFarmsStore }
type MergedStore = TokenStore & PairsStore & FarmsStore
export const [DataStoreProvider, useDataStore] = createContextStore<MergedStore>(mergedDefaultStore, {
  onFirstAccess: [initAllTokens, initAllPairs, initAllFarms]
})
