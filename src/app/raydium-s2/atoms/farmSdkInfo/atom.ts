import { createEffect, createSignal, onCleanup } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appRpcEndpointUrl } from '../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { FetchFarmsSDKInfoPayloads, SdkParsedFarmInfo } from '../farmJson/type'
import { useWalletAtom, WalletStore } from '../wallet/atom'

export const useFarmSdkInfoAtom = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const walletAtom = useWalletAtom()
  const [farmSdkInfoInfos, setFarmSdkInfoInfos] = createSignal<SdkParsedFarmInfo[]>([])

  function loadData() {
    setIsLoading(true)
    const subscription = getFarmSDKInfosFromWorker(walletAtom.owner, (allFarmSDKInfos) => {
      setIsLoading(false)
      allFarmSDKInfos && setFarmSdkInfoInfos(allFarmSDKInfos)
    })
    if (subscription?.abort) onCleanup(subscription.abort)
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

export function getFarmSDKInfosFromWorker(
  owner: WalletStore['owner'],
  cb: WebworkerSubscribeCallback<SdkParsedFarmInfo[]>
) {
  if (!owner) return
  const { abort } = subscribeWebWorker<SdkParsedFarmInfo[], FetchFarmsSDKInfoPayloads>(
    {
      description: 'parse raydium farms info sdk list',
      payload: { owner: owner, rpcUrl: appRpcEndpointUrl }
    },
    cb
  )
  return { abort }
}
