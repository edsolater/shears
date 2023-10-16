import { appRpcUrl } from '../../../utils/common/config'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { WalletStore, useWalletStore } from '../../wallet/store'
import { setStore } from '../dataStore'

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
