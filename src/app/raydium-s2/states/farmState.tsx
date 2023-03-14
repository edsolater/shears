import { createMemo, createSignal, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../packages/pivkit'
import { useFarmStore } from '../stores/farms/store'
import { FarmPoolJsonInfo } from '../stores/farms/type'

export type FarmPageStates = {
  // setters
  setDetailViewFarmId: Setter<string | undefined>

  readonly detailViewFarmId: string | undefined
  readonly detailViewFarmJsonInfo: FarmPoolJsonInfo | undefined
}

export const useFarmPageStates = createCachedGlobalHook(() => {
  const farmDataStore = useFarmStore()
  const [detailViewFarmId, setDetailViewFarmId] = createSignal<string>()
  const detailViewFarmJsonInfo = createMemo(() =>
    farmDataStore.farmJsonInfos?.find((info) => info.id === detailViewFarmId())
  )
  const states: FarmPageStates = {
    // setters
    setDetailViewFarmId,
    get detailViewFarmId() {
      return detailViewFarmId()
    },
    get detailViewFarmJsonInfo() {
      return detailViewFarmJsonInfo()
    }
  }
  return states
})
