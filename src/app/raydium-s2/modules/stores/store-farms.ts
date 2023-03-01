import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { FarmPoolJsonInfo } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../webworker/worker_receiver'
import { FetchFarmsOptions } from './store-farms_type'

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
    const allFarmJsonInfos = await fetchFarmInfoInMainThread()
    console.log('allFarmJsonInfos: ', allFarmJsonInfos)
    setFarmsState('loaded')
    setIsFarmsLoading(false)
    setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
    let count = 0
    const clonedAllAPIFarms = structuredClone(allFarmJsonInfos)
    setInterval(() => {
      const newFarms = clonedAllAPIFarms.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      setStore('allFarmJsonInfos', reconcile(newFarms))
      count++
    }, 1000)
  }
)
function fetchFarmInfoInMainThread() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { force: false })
}
