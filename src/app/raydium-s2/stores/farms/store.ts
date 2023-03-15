import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { useWalletStore } from '../wallet/store'
import { loadFarmJsonInfos } from './methods/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './methods/loadFarmSYNInfos'
import { FarmJSONInfo, FarmSYNInfo } from './type'

export type FarmStore = {
  readonly farmJsonInfos: Map<FarmJSONInfo['id'], FarmJSONInfo> | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmSYNInfos: Map<FarmSYNInfo['id'], FarmSYNInfo> | undefined
  readonly isFarmSYNInfosLoading: boolean
  refetchJsonInfos(): void
  refetchFarmSYNInfos(): void

  $setters: {
    setIsFarmJsonLoading: Setter<FarmStore['isFarmJsonLoading']>
    setFarmJsonInfos: Setter<FarmStore['farmJsonInfos']> // should format to JS Map
    setIsFarmSYNInfosLoading: Setter<FarmStore['isFarmSYNInfosLoading']>
    setFarmSYNInfos: Setter<FarmStore['farmSYNInfos']> // should format to JS Map
  }
}

export const useFarmStore = createCachedGlobalHook(() => {
  const [isFarmJsonLoading, setIsFarmJsonLoading] = createSignal<FarmStore['isFarmJsonLoading']>(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmStore['farmJsonInfos']>()
  const [isFarmSYNInfosLoading, setIsFarmSYNInfosLoading] = createSignal<FarmStore['isFarmSYNInfosLoading']>(false)
  const [farmSYNInfos, setFarmSYNInfos] = createSignal<FarmStore['farmSYNInfos']>()

  const walletStore = useWalletStore()
  createEffect(loadFarmJsonInfos)

  createEffect(() => {
    const { abort } = loadFarmSYNInfos(walletStore.owner)
    abort && onCleanup(abort)
  })
  const store: FarmStore = {
    $setters: {
      setIsFarmJsonLoading,
      setFarmJsonInfos,
      setIsFarmSYNInfosLoading,
      setFarmSYNInfos
    },
    get farmJsonInfos() {
      return farmJsonInfos()
    },
    get isFarmJsonLoading() {
      return isFarmJsonLoading()
    },
    get farmSYNInfos() {
      return farmSYNInfos()
    },
    get isFarmSYNInfosLoading() {
      return isFarmSYNInfosLoading()
    },
    refetchJsonInfos: loadFarmJsonInfos,
    refetchFarmSYNInfos() {
      loadFarmSYNInfos(walletStore.owner)
    }
  }
  return store
})
