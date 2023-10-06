import type { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchFarmJsonInfo } from '../utils/fetchFarmJson'

export function loadFarmJsonInfos_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium farms info')
  console.log('loadTokens_worker')
  receiver.subscribe((options) => {
    fetchFarmJsonInfo().then(sender.query)
  })
}

/** hook */
function useFeature_loadFarmJsonInfos(){
  
}