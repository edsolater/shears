import { createMemo, createSignal, Setter } from 'solid-js'
import { useDataStore } from '../stores/data/store'
import { FarmJSON } from '../stores/data/types/farm'
import { find } from '@edsolater/fnkit'
import { createCachedGlobalHook } from '../../packages/pivkit'

export interface FarmPageStates {
  // setters
  setDetailViewFarmId: Setter<string | undefined>

  readonly detailViewFarmId: string | undefined
  readonly detailViewFarmJsonInfo: FarmJSON | undefined
}

export const useFarmPageStates = createCachedGlobalHook(() => {
  const farmDataStore = useDataStore()
  const [detailViewFarmId, setDetailViewFarmId] = createSignal<string>()
  const detailViewFarmJsonInfo = createMemo(() =>
    find(farmDataStore.farmJsonInfos, (info) => info.id === detailViewFarmId()),
  )
  const states: FarmPageStates = {
    // setters
    setDetailViewFarmId,
    get detailViewFarmId() {
      return detailViewFarmId()
    },
    get detailViewFarmJsonInfo() {
      return detailViewFarmJsonInfo()
    },
  }
  return states
})
