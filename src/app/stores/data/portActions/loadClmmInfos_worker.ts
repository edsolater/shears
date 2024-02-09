import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchClmmJsonInfo } from '../utils/fetchClmmJson'

export function loadClmmInfosInWorker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort(workerCommands['fetch raydium Clmm info'])
  console.info('[worker] load CLMM API Infos')
  receiver.subscribe(() => {
    console.log('[worker] start fetch pairs info')
    fetchClmmJsonInfo().then(sender.query)
  })
}
