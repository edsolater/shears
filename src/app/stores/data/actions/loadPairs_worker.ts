import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchPairJsonInfo } from '../utils/fetchPairJson'

export function loadPairs_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium pairs info')
  console.info('loadPairs_worker')
  receiver.subscribe(() => {
    console.log('[worker] start fetch pairs info')
    fetchPairJsonInfo().then(sender.query)
  })
}
