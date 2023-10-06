import { registMessageReceiver } from '../../../utils/webworker/loadWorker_worker'
import { FetchPairsOptions } from '../types/pairs'
import { fetchPairJsonInfo } from '../utils/fetchPairJson'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'

export function loadPairs_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium pairs info')
  console.info('loadPairs_worker')
  receiver.subscribe(() => {
    fetchPairJsonInfo().then(sender.query)
  })
  // registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', ({ payload, resolve }) =>
  //   fetchPairJsonInfo().then(resolve),
  // )
}
