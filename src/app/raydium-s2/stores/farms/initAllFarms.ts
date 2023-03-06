import { createOnStoreInitCallback } from '@edsolater/pivkit'
import { getFarmJsonFromWorker, getFarmSDKInfosFromWorker } from './mainThread'
import { FarmsStore } from './store'

const initFarmJson = createOnStoreInitCallback<FarmsStore>(({ setIsFarmJsonsLoading, setAllFarmJsonInfos }) => {
  setIsFarmJsonsLoading(true)
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    setIsFarmJsonsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  })
})

const initFarmSDK = createOnStoreInitCallback<FarmsStore>(({ setIsFarmSDKsLoading, setAllFarmSDKInfos }) => {
  setIsFarmSDKsLoading(true)
  getFarmSDKInfosFromWorker((allFarmJsonInfos) => {
    setIsFarmSDKsLoading(false)
    allFarmJsonInfos && setAllFarmSDKInfos(allFarmJsonInfos.slice(0, 8))
  })
})

export const initAllFarms = [initFarmJson, initFarmSDK]