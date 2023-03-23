import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { FarmJSON, FarmSYNInfo } from './type'
import { onAccessFarmSYNInfos } from './storeActions/onAccessFarmSYNInfos'
import { onAccessFarmJsonInfos } from './storeActions/onAccessFarmJsonInfos'
import { IndexAccessList } from '../../../../packages/fnkit/customizedClasses/IndexAccessMap'

export type FarmStore = {
  readonly farmJsonInfos: IndexAccessList<FarmJSON, 'id'> | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmInfos: IndexAccessList<FarmSYNInfo, 'id'> | undefined
  readonly isFarmInfosLoading: boolean
}

const defaultFarmStore = createStoreDefault<FarmStore>(() => ({
  isFarmJsonLoading: false,
  isFarmInfosLoading: false
}))

export const [useFarmStore] = createGlobalStore<FarmStore>(defaultFarmStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos]
})
