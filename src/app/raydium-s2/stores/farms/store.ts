import { createOnFirstAccessCallback, createStoreDefaultState } from '@edsolater/pivkit'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './types/type'

export type FarmsStore = {
  farmsState: 'before-init' | 'loaded'
  isFarmsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
  change(): void
}

export const defaultFarmsStore = createStoreDefaultState<FarmsStore>(({ farmsState }) => ({
  farmsState: 'before-init',
  isFarmsLoading: false,
  allFarmJsonInfos: [],
  change() {
    console.log('1: ', 1)
    console.log('farmsState: ', farmsState())
  }
}))

export const initAllFarms = createOnFirstAccessCallback<FarmsStore>(
  'allFarmJsonInfos',
  async ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos, change }) => {
    setIsFarmsLoading(true)
    const allFarmJsonInfos = await queryFarmInfo()
    change()
    setFarmsState('loaded')
    setIsFarmsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  }
)

function queryFarmInfo() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { url: appApiUrls.farmInfo })
}
