import { createEffect, onCleanup } from 'solid-js'
import { Store, createOnFirstAccess } from '../../../../packages/pivkit'
import { appRpcUrl } from '../../../utils/common/config'
import {
  getMessageReceiver,
  getMessageSender
} from '../../../utils/webworker/loadWorker_main'
import { WalletStore, useWalletStore } from '../../wallet/store'
import { DataStore } from '../store'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<DataStore>(['farmInfos'], (store) => {
  createEffect(() => {
    const walletStore = useWalletStore()
    const { unsubscribe } = loadFarmSYNInfos({ owner: walletStore.owner, store })
    onCleanup(() => {
      unsubscribe?.()
    })
  })
})

export function loadFarmSYNInfos({ owner, store }: { owner: string | undefined; store: Store<DataStore> }): {
  unsubscribe?(): void
} {
  store.set({ isFarmInfosLoading: true })
  const { unsubscribe } = getFarmSYNInfosFromWorker(owner).subscribe((allFarmSYNInfos) => {
    store.set({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
  })
  return { unsubscribe }
}

function getFarmSYNInfosFromWorker(owner: WalletStore['owner']) {
  const sender = getMessageSender('get raydium farms syn infos')
  sender.query({
    owner: owner,
    rpcUrl: appRpcUrl,
  })

  const receiver = getMessageReceiver('get raydium farms syn infos')
  return receiver
}
