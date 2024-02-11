import { createEffect } from 'solid-js'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore, store } from '../store'
import type { APIClmmInfo } from '../types/clmm'

 type QueryParams = { force?: boolean; rpcUrl: string }
 type ReceiveData = Record<string, APIClmmInfo>

export function loadClmmInfos() {
  const port = getMessagePort<ReceiveData, QueryParams>(workerCommands['fetch raydium clmm infos'])
  createEffect(() => {
    const rpcUrl = store.rpc?.url
    if (rpcUrl) {
      console.log('[main] start loading Clmm infos')
      setStore({ isClmmJsonInfoLoading: true })
      port.sender.query({ force: false, rpcUrl })
      port.receiver.subscribe((jsonInfos) => {
        setStore({ isClmmJsonInfoLoading: false, clmmJsonInfos: jsonInfos })
      })
    }
  })
}
