import type { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { registMessageReceiver } from '../../../utils/webworker/loadWorker_worker'
import type { FetchFarmsJSONPayloads } from '../types/farm'
import { fetchFarmJsonInfo } from '../utils/fetchFarmJson'

export function loadFarmJsonInfos_worker(transformers: MessagePortTransformers) {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ resolve }) =>
    fetchFarmJsonInfo().then(resolve),
  )
}
