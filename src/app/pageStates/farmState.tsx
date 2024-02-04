import { createMemo, createSignal, Setter } from 'solid-js'
import { FarmJSON } from '../stores/data/types/farm'
import { find } from '@edsolater/fnkit'
import { createCachedGlobalHook } from '@edsolater/pivkit'
import { store } from '../stores/data/store'

export interface FarmPageStates {
  // setters
  setDetailViewFarmId: Setter<string | undefined>

  readonly detailViewFarmId: string | undefined
  readonly detailViewFarmJsonInfo: FarmJSON | undefined
}

export const useFarmPageStates = createCachedGlobalHook(() => {
  const farmJsonInfos = store.farmJsonInfos
  const [detailViewFarmId, setDetailViewFarmId] = createSignal<string>()
  const detailViewFarmJsonInfo = createMemo(() =>
    find(farmJsonInfos, (info) => info.id === detailViewFarmId()),
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
