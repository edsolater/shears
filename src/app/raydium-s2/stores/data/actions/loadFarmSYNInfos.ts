import { createEffect, onCleanup } from 'solid-js'
import { createOnFirstAccess, Store } from '../../../../../packages/pivkit'
import { appRpcEndpointUrl } from '../../../utils/common/config'
import { subscribeWebWorker_Drepcated, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { useWalletStore, WalletStore } from '../../wallet/store'
import { DataStore } from '../store'
import { CalculateSwapRouteInfosParams } from '../types/farm'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<DataStore>(['farmInfos'], (store) => {
  createEffect(() => {
    const walletStore = useWalletStore()
    const { abort } = loadFarmSYNInfos({ owner: walletStore.owner, store })
    onCleanup(() => {
      abort?.()
    })
  })
})

export function loadFarmSYNInfos({ owner, store }: { owner: string | undefined; store: Store<DataStore> }): {
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
  cb: WebworkerSubscribeCallback<DataStore['farmInfos']>,
) {
  const { abort } = subscribeWebWorker_Drepcated<DataStore['farmInfos'], CalculateSwapRouteInfosParams>(
    {
      description: 'get raydium farms syn infos',
      payload: {
        owner: owner,
        rpcUrl: appRpcEndpointUrl,
      },
    },
    cb,
  )
  return { abort }
}
