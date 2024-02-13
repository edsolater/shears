import { createEffect } from 'solid-js'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore, store, storeData } from '../store'
import type { JsonClmmInfo } from '../types/clmm'

type QueryParams = { force?: boolean; rpcUrl: string }
type ReceiveData = Record<string, JsonClmmInfo>

export function loadClmmInfos() {
  const port = getMessagePort<ReceiveData, QueryParams>(workerCommands['fetch raydium clmm infos'])
  // const rpcUrl = 'https://rpc.asdf1234.win' // TODO: should subscribable
  const rpcUrl = () => storeData.rpc?.url // TODO: should subscribable
  createEffect(() => {
    const url = rpcUrl()
    console.log('url: ', url)
    if (!url) return
    console.log('[main] start loading clmm infos')
    setStore({ isClmmJsonInfoLoading: true })
    port.postMessage({ force: false, rpcUrl: url })
    port.receiveMessage((jsonInfos) => {
      setStore({ isClmmJsonInfoLoading: false, clmmJsonInfos: jsonInfos })
    })
  })
}
