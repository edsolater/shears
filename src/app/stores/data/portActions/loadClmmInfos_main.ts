import { createTask, registerTask } from '../../../../packages/conveyor/smartStore/task'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { rpc, setStore } from '../store'
import type { ClmmJsonInfo } from '../types/clmm'

type QueryParams = { force?: boolean; rpcUrl: string }
type ReceiveData = Record<string, ClmmJsonInfo>

export function loadClmmInfos() {
  const port = getMessagePort<ReceiveData, QueryParams>(workerCommands['fetch raydium clmm infos'])

  registerTask([rpc], () => {
    const url = rpc()?.url
    if (!url) return
    console.log('[main] start loading clmm infos')
    setStore({ isClmmJsonInfoLoading: true })
    port.postMessage({ force: false, rpcUrl: url })
    port.receiveMessage((jsonInfos) => {
      console.log('[main] get jsonInfos: ', jsonInfos)
      setStore({ isClmmJsonInfoLoading: false, clmmJsonInfos: jsonInfos })
    })
  })
}
