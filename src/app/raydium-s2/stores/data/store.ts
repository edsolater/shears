import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/onAccessFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/onAccessFarmSYNInfos'
import { onAccessPairsInfos } from './actions/onAccessPairsInfos'
import { onAccessTokens } from './actions/onAccessTokens'
import { onAccessTokensPrice } from './actions/onAccessTokensPrice'
import { FarmStore } from './types/farm'
import { PairsStore } from './types/pairs'
import { TokenListStore } from './types/tokenList'
import { TokenPriceStore } from './types/tokenPrice'

export type DataStore = FarmStore & PairsStore & TokenListStore & TokenPriceStore
const defaultStore = createStoreDefault<DataStore>(() => ({}))
export const [useDataStore] = createGlobalStore<DataStore>(defaultStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos, onAccessPairsInfos, onAccessTokens, onAccessTokensPrice]
})
