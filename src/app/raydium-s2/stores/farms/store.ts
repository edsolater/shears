import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { useWalletStore } from '../wallet/store'
import { loadFarmJsonInfos } from './methods/loadFarmJsonInfos'
import { loadFarmSDKInfos } from './methods/loadFarmSDKInfos'
import { FarmPoolJsonInfo, SdkParsedFarmInfo } from './type'

export type FarmStore = {
  $setters: {
    setIsFarmJsonLoading: Setter<boolean>
    setFarmJsonInfos: Setter<FarmPoolJsonInfo[] | undefined>
    setIsFarmSDKInfosLoading: Setter<boolean>
    setFarmSdkInfoInfos: Setter<SdkParsedFarmInfo[] | undefined>
  }
  readonly farmJsonInfos: FarmPoolJsonInfo[] | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmSdkInfoInfos: SdkParsedFarmInfo[] | undefined
  readonly isFarmSDKInfosLoading: boolean
  refetchJsonInfos(): void
  refetchFarmSDKInfos(): void
}

export const useFarmStore = createCachedGlobalHook(() => {
  const [isFarmJsonLoading, setIsFarmJsonLoading] = createSignal(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmPoolJsonInfo[]>()
  const [isFarmSDKInfosLoading, setIsFarmSDKInfosLoading] = createSignal(false)
  const [farmSdkInfoInfos, setFarmSdkInfoInfos] = createSignal<SdkParsedFarmInfo[]>()

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
