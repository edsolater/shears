import { createOnFirstAccessCallback, createOnStoreInitCallback } from '@edsolater/pivkit'
import { getFarmJson } from './mainThread'
import { FarmsStore } from './store'

export const initAllFarms = createOnStoreInitCallback<FarmsStore>(
  ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos }) => {
    setIsFarmsLoading(true)
    getFarmJson((allFarmJsonInfos) => {
      setFarmsState('loaded')
      setIsFarmsLoading(false)
      allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
    })
  }
)
