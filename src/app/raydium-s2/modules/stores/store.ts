import { createContextStore } from '@edsolater/pivkit'
import { defaultPairsStore, initAllPairs, PairsStore } from './store-pairs'
import { defaultTokenStore, initAllTokens, TokenStore } from './store-tokens'

const mergedDefaultStore = { ...defaultTokenStore, ...defaultPairsStore }
type MergedStore = TokenStore & PairsStore
export const [DataStoreProvider, useDataStore] = createContextStore<MergedStore>(mergedDefaultStore, {
  onFirstAccess: [initAllTokens, initAllPairs]
})
