import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { useMessagePort } from '../../../utils/webworker/messagePort'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchClmmJsonInfo } from '../utils/fetchClmmJson'

export function loadClmmInfosInWorker({ getMessagePort }: MessagePortTransformers) {
  useMessagePort({
    port: getMessagePort(workerCommands['fetch raydium Clmm info']),
    onBeforeSend() {
      console.log('[worker] start loading Clmm infos')
    },
    onReceive(_, { sendBack }) {
      console.log('[worker] received Clmm infos')
      fetchClmmJsonInfo().then(sendBack)
    },
  })
}
