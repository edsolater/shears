import { createEffect, onCleanup } from 'solid-js'
import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { appRpcUrl } from '../../../utils/common/config'
import {
  subscribeWebWorker_Drepcated,
  WebworkerSubscribeCallback,
} from '../../../utils/webworker/loadWorkerInMainThread'
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
  getFarmSYNInfosFromWorker(owner, (allFarmSYNInfos) => {
    store.set({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
  })
  return { abort() {} }
}

function getFarmSYNInfosFromWorker(
  owner: WalletStore['owner'],
  cb: WebworkerSubscribeCallback<DataStore['farmInfos']>,
) {
  subscribeWebWorker_Drepcated<DataStore['farmInfos'], CalculateSwapRouteInfosParams>(
    {
      command: 'get raydium farms syn infos',
      payload: {
        owner: owner,
        rpcUrl: appRpcUrl,
      },
    },
    cb,
  )
}
