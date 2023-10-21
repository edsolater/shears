import { createEffect, onCleanup } from 'solid-js'
import { appRpcUrl } from '../../../utils/common/config'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { useWalletStore } from '../../wallet/store'
import { setStore } from '../dataStore'
import { ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos } from '../utils/composeFarmSYN'

/**
 * will change state
 */
export function loadFarmSYNInfos() {
  const walletStore = useWalletStore()
  const owner = walletStore.owner
  setStore({ isFarmInfosLoading: true })
  createEffect(() => {
    const { sender, receiver } = getMessagePort<ComposedFarmSYNInfos, ComposeFarmSYNInfoQuery>(
      workerCommands['get raydium farms syn infos'],
    )
    sender.query({ owner: owner, rpcUrl: appRpcUrl })
    const { unsubscribe } = receiver.subscribe((allFarmSYNInfos) => {
      setStore({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
    })
    onCleanup(unsubscribe)
  })
}
