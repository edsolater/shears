import { createStoreDefaultState, createGlobalStore } from '../../../../packages/pivkit'
import { initFarmJson, initFarmSDK } from './initAllFarms'
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

export const [useFarmStore] = createGlobalStore<FarmsStore>(defaultFarmsStore, { onInit: [initFarmJson, initFarmSDK], })
