import { useMessagePort } from '../../../utils/webworker/messagePort'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore } from '../store'
import type { ClmmJSON } from '../types/clmm'

type QueryParams = { force?: boolean }
type ReceiveData = ClmmJSON[]

export function loadClmmInfos() {
  console.log('start')
  useMessagePort<QueryParams, ReceiveData>({
    command: workerCommands['fetch raydium Clmm info'],
    queryPayload: { force: false },
    onBeforeSend() {
      console.log('[main] start loading Clmm infos')
      setStore({ isClmmJsonInfoLoading: true })
    },
    onReceive(jsonInfos) {
      setStore({ isClmmJsonInfoLoading: false, clmmJsonInfos: jsonInfos })
    },
  })
}
