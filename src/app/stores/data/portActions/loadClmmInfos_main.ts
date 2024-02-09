import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { useMessagePort } from '../../../utils/webworker/messagePort'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore } from '../store'
import type { ClmmJSON } from '../types/clmm'

type QueryParams = { force?: boolean }
type ReceiveData = ClmmJSON[]

export function loadClmmInfos() {
  const { startQuery } = useMessagePort<QueryParams, ReceiveData>({
    port: getMessagePort(workerCommands['fetch raydium Clmm info']),
    onBeforeSend() {
      console.log('[main] start loading Clmm infos')
      setStore({ isClmmJsonInfoLoading: true })
    },
    onReceive(jsonInfos) {
      setStore({ isClmmJsonInfoLoading: false, clmmJsonInfos: jsonInfos })
    },
  })
  startQuery({ force: false })
}
