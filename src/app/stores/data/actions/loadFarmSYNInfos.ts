import { createEffect, onCleanup } from 'solid-js'
import { Store, createOnFirstAccess } from '../../../../packages/pivkit'
import { appRpcUrl } from '../../../utils/common/config'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { WalletStore, useWalletStore } from '../../wallet/store'
import { DataStore } from '../store'
import { setStore } from '../atoms'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<DataStore>(['farmInfos'], (store) => {
  createEffect(() => {
    const { unsubscribe } = loadFarmSYNInfos()
    onCleanup(() => {
      unsubscribe?.()
    })
  })
})

export function loadFarmSYNInfos(): {
  unsubscribe?(): void
} {
  const walletStore = useWalletStore()
  const owner = walletStore.owner
  setStore({ isFarmInfosLoading: true })
  const { unsubscribe } = getFarmSYNInfosFromWorker(owner).subscribe((allFarmSYNInfos) => {
    setStore({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
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
