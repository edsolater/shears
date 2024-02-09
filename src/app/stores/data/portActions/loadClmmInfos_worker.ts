import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchPairJsonInfo } from '../utils/fetchPairJson'

export function loadClmmInfos_worker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort('fetch raydium Clmm info')
  console.info('loadClmmInfos_worker')
  receiver.subscribe(() => {
    console.log('[worker] start fetch pairs info')
    fetchPairJsonInfo().then(sender.query)
  })
}
