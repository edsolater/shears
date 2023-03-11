import { createOnStoreInitCallback } from '../../../../packages/pivkit'
import { useFarmJsonAtom } from '../../atoms/farmJsonAtom'
import { getFarmJsonFromWorker, getFarmSDKInfosFromWorker } from './mainThread'
import { FarmsStore } from './store'

/**@deprecated */
export const initFarmJson = createOnStoreInitCallback<FarmsStore>(({ setIsFarmJsonsLoading, setAllFarmJsonInfos }) => {
  setIsFarmJsonsLoading(true)
  
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    console.log(useFarmJsonAtom().infos)
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
