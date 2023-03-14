import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { useWalletStore } from '../wallet/store'
import { loadFarmJsonInfos } from './methods/loadFarmJsonInfos'
import { loadFarmSDKInfos } from './methods/loadFarmSDKInfos'
import { FarmJSONInfo, FarmSDKInfo } from './type'

export type FarmStore = {
  $setters: {
    setIsFarmJsonLoading: Setter<boolean>
    setFarmJsonInfos: Setter<FarmJSONInfo[] | undefined>// should format to JS Map
    setIsFarmSDKInfosLoading: Setter<boolean>
    setFarmSdkInfoInfos: Setter<FarmSDKInfo[] | undefined>// should format to JS Map
  }
  readonly farmJsonInfos: FarmJSONInfo[] | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmSdkInfoInfos: FarmSDKInfo[] | undefined
  readonly isFarmSDKInfosLoading: boolean
  refetchJsonInfos(): void
  refetchFarmSDKInfos(): void
}

export const useFarmStore = createCachedGlobalHook(() => {
  const [isFarmJsonLoading, setIsFarmJsonLoading] = createSignal(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmJSONInfo[]>()
  const [isFarmSDKInfosLoading, setIsFarmSDKInfosLoading] = createSignal(false)
  const [farmSdkInfoInfos, setFarmSdkInfoInfos] = createSignal<FarmSDKInfo[]>()

  const walletStore = useWalletStore()
  createEffect(loadFarmJsonInfos)

  createEffect(() => {
    const { abort } = loadFarmSDKInfos(walletStore.owner)
    abort && onCleanup(abort)
  })
  const store: FarmStore = {
    $setters: {
      setIsFarmJsonLoading,
      setFarmJsonInfos,
      setIsFarmSDKInfosLoading,
      setFarmSdkInfoInfos
    },
    get farmJsonInfos() {
      return farmJsonInfos()
    },
    get isFarmJsonLoading() {
      return isFarmJsonLoading()
    },
    get farmSdkInfoInfos() {
      return farmSdkInfoInfos()
    },
    get isFarmSDKInfosLoading() {
      return isFarmSDKInfosLoading()
    },
    refetchJsonInfos: loadFarmJsonInfos,
    refetchFarmSDKInfos() {
      loadFarmSDKInfos(walletStore.owner)
    }
  }
  return store
})
