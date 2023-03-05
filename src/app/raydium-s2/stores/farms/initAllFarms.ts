import { createOnFirstAccessCallback, createOnStoreInitCallback } from '@edsolater/pivkit'
import { getFarmJsonFromWorker } from './mainThread'
import { FarmsStore } from './store'

const initFarmJson = createOnStoreInitCallback<FarmsStore>(({ setIsFarmJsonsLoading, setAllFarmJsonInfos }) => {
  setIsFarmJsonsLoading(true)
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    setIsFarmJsonsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  })
})
const initFarmSDK = createOnStoreInitCallback<FarmsStore>(({ setIsFarmJsonsLoading, setAllFarmJsonInfos }) => {
  setIsFarmJsonsLoading(true)
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    setIsFarmJsonsLoading(false)
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
  })
})
export const initAllFarms = initFarmJson
