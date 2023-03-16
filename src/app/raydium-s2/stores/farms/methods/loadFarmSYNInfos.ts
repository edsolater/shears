import { appApiUrls, appRpcEndpointUrl } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { WalletStore } from '../../wallet/store'
import { FarmStore, useFarmStore } from '../store'
import { FetchFarmsSYNInfoPayloads } from '../type'

export function loadFarmSYNInfos(owner: string | undefined): { abort?(): void } {
  useFarmStore().$setters.setIsFarmSYNInfosLoading(true)
  const subscription = getFarmSYNInfosFromWorker(owner, (allFarmSYNInfos) => {
    useFarmStore().$setters.setIsFarmSYNInfosLoading(false)
    allFarmSYNInfos && useFarmStore().$setters.setFarmSYNInfos(allFarmSYNInfos)
  })
  return { abort: subscription?.abort }
}

function getFarmSYNInfosFromWorker(
  owner: WalletStore['owner'],
  cb: WebworkerSubscribeCallback<FarmStore['farmSYNInfos']>
) {
  if (!owner) return
  const { abort } = subscribeWebWorker<FarmStore['farmSYNInfos'], FetchFarmsSYNInfoPayloads>(
    {
      description: 'get raydium farms syn infos',
      payload: {
        owner: owner,
        rpcUrl: appRpcEndpointUrl,
        farmApiUrl: appApiUrls.farmInfo,
        liquidityUrl: appApiUrls.poolInfo
      }
    },
    cb
  )
  return { abort }
}
