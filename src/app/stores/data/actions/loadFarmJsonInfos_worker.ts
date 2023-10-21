import type { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchFarmJsonInfo } from '../utils/fetchFarmJson'

export function loadFarmJsonInfos_worker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort(workerCommands['fetch raydium farms info'])
  console.log('loadTokens_worker')
  receiver.subscribe((options) => {
    fetchFarmJsonInfo().then(sender.query)
  })
}
