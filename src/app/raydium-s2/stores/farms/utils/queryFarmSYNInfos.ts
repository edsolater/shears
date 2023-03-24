import { Store } from '../../../../../packages/pivkit'
import { appRpcEndpointUrl } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { WalletStore } from '../../wallet/store'
import { FarmStore } from '../store'
import { FetchFarmsSYNInfoPayloads } from '../type'

export function loadFarmSYNInfos({ owner, store }: { owner: string | undefined; store: Store<FarmStore> }): {
  abort?(): void
} {
  store.set({ isFarmInfosLoading: true })
  const subscription = getFarmSYNInfosFromWorker(owner, (allFarmSYNInfos) => {
    store.set({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
  })
  return { abort: subscription?.abort }
}

function getFarmSYNInfosFromWorker(
  owner: WalletStore['owner'],
  cb: WebworkerSubscribeCallback<FarmStore['farmInfos']>
) {
  const { abort } = subscribeWebWorker<FarmStore['farmInfos'], FetchFarmsSYNInfoPayloads>(
    {
      description: 'get raydium farms syn infos',
      payload: {
        owner: owner,
        rpcUrl: appRpcEndpointUrl
      }
    },
    cb
  )
  return { abort }
}
