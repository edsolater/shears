import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { FarmPoolJsonInfo } from 'test-raydium-sdk-v2'
import { urlConfigs } from '../common/utils/config'
import { queryWebWorker } from '../../webworker/worker_receiver'
import { FetchFarmsOptions } from './types/type'

export type FarmsStore = {
  farmsState: 'before-init' | 'loaded'
  isFarmsLoading: boolean
  allFarmJsonInfos: FarmPoolJsonInfo[]
}

export const defaultFarmsStore: FarmsStore = { farmsState: 'before-init', isFarmsLoading: false, allFarmJsonInfos: [] }

export const initAllFarms = createOnFirstAccessCallback<FarmsStore, 'allFarmJsonInfos'>(
  'allFarmJsonInfos',
  async (_, { setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos, setStore }) => {
    setIsFarmsLoading(true)
    const allFarmJsonInfos = await queryFarmInfo()
    console.log('allFarmJsonInfos: ', allFarmJsonInfos)
    setFarmsState('loaded')
    setIsFarmsLoading(false)
    setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  }
)
function queryFarmInfo() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { apiUrl: urlConfigs.FARMS })
}
