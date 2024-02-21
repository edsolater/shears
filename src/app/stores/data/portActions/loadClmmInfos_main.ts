import { createTask } from '../../../../packages/conveyor/smartStore/task'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { s_clmmInfos, s_isClmmJsonInfoLoading, s_rpc, setStore } from '../store'
import type { ClmmInfo } from '../types/clmm'

type QueryParams = { force?: boolean; rpcUrl: string }
type ReceiveData = Record<string, ClmmInfo>

export function loadClmmInfos() {
  const port = getMessagePort<ReceiveData, QueryParams>(workerCommands['fetch raydium clmm infos'])
  createTask(
    [s_rpc],
    () => {
      const url = s_rpc()?.url
      if (!url) return
      console.log('[main] start loading clmm infos')
      setStore({ isClmmJsonInfoLoading: true })
      s_isClmmJsonInfoLoading.set(true)
      port.postMessage({ force: false, rpcUrl: url })
      port.receiveMessage((infos) => {
        console.log('[main] get clmm infos ', infos)
        s_isClmmJsonInfoLoading.set(false)
        s_clmmInfos.set(infos)
      })
    },
    { visiable: true },
  )
}
