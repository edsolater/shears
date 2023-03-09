import { createOnStoreInitCallback } from '@edsolater/pivkit'
import { getFarmJsonFromWorker, getFarmSDKInfosFromWorker } from './mainThread'
import { FarmsStore } from './store'

export const initFarmJson = createOnStoreInitCallback<FarmsStore>(({ setIsFarmJsonsLoading, setAllFarmJsonInfos }) => {
  setIsFarmJsonsLoading(true)
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    setIsFarmJsonsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos)
  })
})

export const initFarmSDK = createOnStoreInitCallback<FarmsStore>(({ setIsFarmSDKsLoading, setAllFarmSDKInfos }) => {
  setIsFarmSDKsLoading(true)
  getFarmSDKInfosFromWorker((allFarmSDKInfos) => {
    setIsFarmSDKsLoading(false)
    allFarmSDKInfos && setAllFarmSDKInfos(allFarmSDKInfos)
  })
})
