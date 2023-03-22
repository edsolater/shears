import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { FarmJSON, FarmSYNInfo } from './type'
import { onAccessFarmSYNInfos } from './storeActions/onAccessFarmSYNInfos'
import { onAccessFarmJsonInfos } from './storeActions/onAccessFarmJsonInfos'

export type FarmStore = {
  readonly farmJsonInfos: Map<FarmJSON['id'], FarmJSON> | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmInfos: Map<FarmSYNInfo['id'], FarmSYNInfo> | undefined
  readonly isFarmInfosLoading: boolean
}

const defaultFarmStore = createStoreDefault<FarmStore>(() => ({
  isFarmJsonLoading: false,
  isFarmInfosLoading: false
}))

export const [useFarmStore] = createGlobalStore<FarmStore>(defaultFarmStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos]
})
