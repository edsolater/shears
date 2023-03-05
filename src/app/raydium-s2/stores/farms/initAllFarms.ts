import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { queryFarmJson } from './mainThread'
import { FarmsStore } from './store'

export const initAllFarms = createOnFirstAccessCallback<FarmsStore>(
  'allFarmJsonInfos',
  async ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos }) => {
    setIsFarmsLoading(true)
    queryFarmJson((allFarmJsonInfos) => {
      setFarmsState('loaded')
      setIsFarmsLoading(false)
      allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8))
    })
  }
)
