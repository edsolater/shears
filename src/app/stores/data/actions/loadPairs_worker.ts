import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchPairJsonInfo } from '../utils/fetchPairJson'

export function loadPairs_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium pairs info')
  console.info('loadPairs_worker')
  receiver.subscribe(() => {
    fetchPairJsonInfo().then(sender.query)
  })
}
