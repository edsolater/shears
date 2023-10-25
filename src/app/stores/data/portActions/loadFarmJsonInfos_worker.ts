import type { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchFarmJsonInfo } from '../utils/fetchFarmJson'

export function loadFarmJsonInfos_worker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort(workerCommands['fetch raydium farms info'])
  console.log('[worker] registered load farm port')
  receiver.subscribe((options) => {
    console.log('[worker] start loading farms')
    fetchFarmJsonInfo().then(sender.query)
  })
}