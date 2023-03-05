import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import { initAllFarms } from './initAllFarms'
import { FarmPoolJsonInfo } from './type'

export type FarmsStore = {
  isFarmJsonsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
}

export const defaultFarmsStore = createStoreDefaultState<FarmsStore>(() => ({
  isFarmJsonsLoading: false,
  allFarmJsonInfos: []
}))

export const useFarmStore = createGlobalStore<FarmsStore>(defaultFarmsStore, { onInit: [initAllFarms] })
