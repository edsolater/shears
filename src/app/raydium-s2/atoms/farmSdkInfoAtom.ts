import { createEffect, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../packages/pivkit'
import { appRpcEndpointUrl } from '../stores/common/utils/config'
import { FetchFarmsSDKInfoPayloads, SdkParsedFarmInfo } from './farmJson/type'
import { onWalletPropertyChange } from '../stores/wallet/store'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../utils/webworker/mainThread_receiver'

export const useFarmSdkInfoAtom = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [farmSdkInfoInfos, setFarmSdkInfoInfos] = createSignal<SdkParsedFarmInfo[]>([])
  function loadData() {
    setIsLoading(true)
    getFarmSDKInfosFromWorker((allFarmSDKInfos) => {
      setIsLoading(false)
      allFarmSDKInfos && setFarmSdkInfoInfos(allFarmSDKInfos)
    })
  }
  createEffect(loadData)
  const atom = {
    get infos() {
      return farmSdkInfoInfos()
    },
    get isLoading() {
      return isLoading()
    },
    refetch() {
      loadData()
    }
  }
  return atom
})

export function getFarmSDKInfosFromWorker(cb: WebworkerSubscribeCallback<SdkParsedFarmInfo[]>) {
  onWalletPropertyChange('owner', (owner) => {
    if (!owner) return
    const { abort } = subscribeWebWorker<SdkParsedFarmInfo[], FetchFarmsSDKInfoPayloads>(
      {
        description: 'parse raydium farms info sdk list',
        payload: { owner: owner, rpcUrl: appRpcEndpointUrl }
      },
      cb
    )
    return abort
  })
}
