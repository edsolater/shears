import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { useWalletStore } from '../wallet/store'
import { loadFarmJsonInfos } from './methods/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './methods/loadFarmSYNInfos'
import { FarmJSONInfo, FarmSDKInfo } from './type'

export type FarmStore = {
  $setters: {
    setIsFarmJsonLoading: Setter<boolean>
    setFarmJsonInfos: Setter<FarmJSONInfo[] | undefined>// should format to JS Map
    setIsFarmSYNInfosLoading: Setter<boolean>
    setFarmSYNInfos: Setter<FarmSDKInfo[] | undefined>// should format to JS Map
  }
  readonly farmJsonInfos: FarmJSONInfo[] | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmSYNInfos: FarmSDKInfo[] | undefined
  readonly isFarmSYNInfosLoading: boolean
  refetchJsonInfos(): void
  refetchFarmSYNInfos(): void
}

export const useFarmStore = createCachedGlobalHook(() => {
  const [isFarmJsonLoading, setIsFarmJsonLoading] = createSignal(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmJSONInfo[]>()
  const [isFarmSYNInfosLoading, setIsFarmSYNInfosLoading] = createSignal(false)
  const [farmSYNInfos, setFarmSYNInfos] = createSignal<FarmSDKInfo[]>()

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
