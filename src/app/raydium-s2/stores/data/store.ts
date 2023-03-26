import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/onAccessFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/onAccessFarmSYNInfos'
import { onAccessPairsInfos } from './actions/onAccessPairsInfos'
import { onAccessTokens } from './actions/onAccessTokens'
import { FarmStore } from './farmType'
import { PairsStore } from './pairsType'
import { TokenListStore } from './tokenListType'

export type DataStore = FarmStore & PairsStore & TokenListStore
const defaultStore = createStoreDefault<DataStore>(() => ({}))
export const [useDataStore] = createGlobalStore<DataStore>(defaultStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos, onAccessPairsInfos, onAccessTokens]
})
