import { createContextStore } from '@edsolater/pivkit'
import { defaultPairsStore, initAllPairs, PairsStore } from './store_pairs'
import { defaultTokenStore, initAllTokens, TokenStore } from './store_tokens'

const mergedDefaultStore = { ...defaultTokenStore, ...defaultPairsStore }
type MergedStore = TokenStore & PairsStore
export const [DataStoreProvider, useDataStore] = createContextStore<MergedStore>(mergedDefaultStore, {
  onFirstAccess: [initAllTokens, initAllPairs]
})
