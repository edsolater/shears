import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchPairJsonInfo } from '../utils/fetchPairJson'

export function loadPairsInWorker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort('fetch raydium pairs info')
  console.info('loadPairs_worker')
  receiver.subscribe(() => {
    console.log('[worker] start fetch pairs info')
    fetchPairJsonInfo().then(sender.post)
  })
}
