import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import { initAllFarms } from './initAllFarms'
import { FarmPoolJsonInfo } from './type'

export type FarmsStore = {
  farmsState: 'before-init' | 'loaded'
  isFarmsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
}

export const defaultFarmsStore = createStoreDefaultState<FarmsStore>(() => ({
  farmsState: 'before-init',
  isFarmsLoading: false,
  allFarmJsonInfos: []
}))

export const useFarmStore = createGlobalStore<FarmsStore>(defaultFarmsStore, { onInit: [initAllFarms] })
