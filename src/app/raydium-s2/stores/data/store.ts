import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/onAccessFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/onAccessFarmSYNInfos'
import { FarmStore } from './farmType'

export type DataStore = FarmStore

const defaultFarmStore = createStoreDefault<DataStore>(() => ({}))

export const [useFarmStore] = createGlobalStore<DataStore>(defaultFarmStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos]
})
