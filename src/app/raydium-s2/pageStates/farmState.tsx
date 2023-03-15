import { createMemo, createSignal, Setter } from 'solid-js'
import find from '../../../packages/fnkit/collectionMethods/find'
import { createCachedGlobalHook } from '../../../packages/pivkit'
import { useFarmStore } from '../stores/farms/store'
import { FarmJSONInfo } from '../stores/farms/type'

export type FarmPageStates = {
  // setters
  setDetailViewFarmId: Setter<string | undefined>

  readonly detailViewFarmId: string | undefined
  readonly detailViewFarmJsonInfo: FarmJSONInfo | undefined
}

export const useFarmPageStates = createCachedGlobalHook(() => {
  const farmDataStore = useFarmStore()
  const [detailViewFarmId, setDetailViewFarmId] = createSignal<string>()
  const detailViewFarmJsonInfo = createMemo(
    () => find(farmDataStore.farmJsonInfos, (info) => info.id === detailViewFarmId())
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
