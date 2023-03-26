import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/onAccessFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/onAccessFarmSYNInfos'
import { onAccessPairsInfos } from './actions/onAccessPairsInfos'
import { onAccessTokens } from './actions/onAccessTokens'
import { onAccessTokensPrice } from './actions/onAccessTokensPrice'
import { FarmStore } from './farmType'
import { PairsStore } from './pairsType'
import { TokenListStore } from './tokenListType'
import { TokenPriceStore } from './tokenPriceType'

export type DataStore = FarmStore & PairsStore & TokenListStore & TokenPriceStore
const defaultStore = createStoreDefault<DataStore>(() => ({}))
export const [useDataStore] = createGlobalStore<DataStore>(defaultStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos, onAccessPairsInfos, onAccessTokens, onAccessTokensPrice]
})
