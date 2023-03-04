import { createOnFirstAccessCallback, createStoreDefaultState } from '@edsolater/pivkit'
import { batch } from 'solid-js'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './type'

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

export const initAllFarms = createOnFirstAccessCallback<FarmsStore>(
  'allFarmJsonInfos',
  async ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos, isFarmsLoading }) => {
    setIsFarmsLoading(true)
    setIsFarmsLoading(false)
    setIsFarmsLoading(true)
    setIsFarmsLoading(false)
    setIsFarmsLoading(true)
    setIsFarmsLoading(false)
    setIsFarmsLoading(true)
    const allFarmJsonInfos = await queryFarmInfo()
    setFarmsState('loaded')
    setIsFarmsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  }
)

function queryFarmInfo() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { url: appApiUrls.farmInfo })
}
