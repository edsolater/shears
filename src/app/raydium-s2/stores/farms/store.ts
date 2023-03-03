import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './types/type'

export type FarmsStore = {
  farmsState: 'before-init' | 'loaded'
  isFarmsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
}

export const defaultFarmsStore: Partial<FarmsStore> = {
  farmsState: 'before-init',
  isFarmsLoading: false,
  allFarmJsonInfos: []
}

export const initAllFarms = createOnFirstAccessCallback<FarmsStore>(
  'allFarmJsonInfos',
  async ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos }) => {
    setIsFarmsLoading(true)
    const allFarmJsonInfos = await queryFarmInfo()
    console.log('allFarmJsonInfos: ', allFarmJsonInfos)
    setFarmsState('loaded')
    setIsFarmsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  }
)

function queryFarmInfo() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { url: appApiUrls.farmInfo })
}
