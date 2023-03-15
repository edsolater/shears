import { appApiUrls, appRpcEndpointUrl } from '../../../utils/common/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { WalletStore } from '../../wallet/store'
import { useFarmStore } from '../store'
import { FarmSDKInfo, FetchFarmsSYNInfoPayloads } from '../type'

export function loadFarmSYNInfos(owner: string | undefined): { abort?(): void } {
  useFarmStore().$setters.setIsFarmSYNInfosLoading(true)
  const subscription = getFarmSYNInfosFromWorker(owner, (allFarmSYNInfos) => {
    useFarmStore().$setters.setIsFarmSYNInfosLoading(false)
    allFarmSYNInfos && useFarmStore().$setters.setFarmSYNInfos(allFarmSYNInfos)
  })
  return { abort: subscription?.abort }
}

function getFarmSYNInfosFromWorker(owner: WalletStore['owner'], cb: WebworkerSubscribeCallback<FarmSDKInfo[]>) {
  if (!owner) return
  const { abort } = subscribeWebWorker<FarmSDKInfo[], FetchFarmsSYNInfoPayloads>(
    {
      description: 'get raydium farms syn infos',
      payload: { owner: owner, rpcUrl: appRpcEndpointUrl, farmApiUrl: appApiUrls.farmInfo }
    },
    cb
  )
  return { abort }
}
