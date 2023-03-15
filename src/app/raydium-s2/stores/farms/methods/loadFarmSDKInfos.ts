import { appRpcEndpointUrl } from '../../../utils/common/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { WalletStore } from '../../wallet/store'
import { useFarmStore } from '../store'
import { FarmSDKInfo, FetchFarmsSDKInfoPayloads } from '../type'

export function loadFarmSDKInfos(owner: string | undefined): { abort?(): void } {
  useFarmStore().$setters.setIsFarmSDKInfosLoading(true)
  const subscription = getFarmSDKInfosFromWorker(owner, (allFarmSDKInfos) => {
    useFarmStore().$setters.setIsFarmSDKInfosLoading(false)
    allFarmSDKInfos && useFarmStore().$setters.setFarmSDKInfos(allFarmSDKInfos)
  })
  return { abort: subscription?.abort }
}

function getFarmSDKInfosFromWorker(owner: WalletStore['owner'], cb: WebworkerSubscribeCallback<FarmSDKInfo[]>) {
  if (!owner) return
  const { abort } = subscribeWebWorker<FarmSDKInfo[], FetchFarmsSDKInfoPayloads>(
    {
      description: 'parse raydium farms info sdk list',
      payload: { owner: owner, rpcUrl: appRpcEndpointUrl }
    },
    cb
  )
  return { abort }
}
