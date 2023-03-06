import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import { initAllFarms } from './initAllFarms'
import { FarmPoolJsonInfo } from './type'

export type FarmsStore = {
  isFarmJsonsLoading: boolean
  isFarmSDKsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
  allFarmSDKInfos: unknown[]
}

export const defaultFarmsStore = createStoreDefaultState<FarmsStore>(() => ({
  isFarmJsonsLoading: false,
  isFarmSDKsLoading: false,
  allFarmJsonInfos: [],
  allFarmSDKInfos: []
}))

export const [useFarmStore] = createGlobalStore<FarmsStore>(defaultFarmsStore, { onInit: initAllFarms })
