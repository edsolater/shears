import { createTask } from '../../../../packages/conveyor/smartStore/task'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { shuck_clmmInfos, shuck_isClmmJsonInfoLoading, shuck_rpc } from '../store'
import type { ClmmInfo } from '../types/clmm'

type QueryParams = { force?: boolean; rpcUrl: string }
type ReceiveData = Record<string, ClmmInfo>

export function loadClmmInfos() {
  const port = getMessagePort<ReceiveData, QueryParams>('fetch raydium clmm info')
  createTask(
    [shuck_rpc],
    () => {
      const url = shuck_rpc()?.url
      if (!url) return
      console.log('[main] start loading clmm infos')
      shuck_isClmmJsonInfoLoading.set(true)
      port.postMessage({ force: false, rpcUrl: url })
      port.receiveMessage((infos) => {
        console.log('[main] get clmm infos ', infos)
        shuck_isClmmJsonInfoLoading.set(false)
        shuck_clmmInfos.set(infos)
      })
    },
    { visiable: true },
  )
}
