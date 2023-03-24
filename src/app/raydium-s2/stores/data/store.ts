import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/onAccessFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/onAccessFarmSYNInfos'
import { onAccessPairsInfos } from './actions/onAccessPairsInfos'
import { FarmStore } from './farmType'
import { PairsStore } from './pairsType'

export type DataStore = FarmStore & PairsStore
const defaultStore = createStoreDefault<DataStore>(() => ({}))
export const [useDataStore] = createGlobalStore<DataStore>(defaultStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos, onAccessPairsInfos]
})
