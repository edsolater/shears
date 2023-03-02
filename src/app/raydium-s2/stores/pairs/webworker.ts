import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FetchPairsOptions } from './types/type'
import { fetchPairJsonInfo } from './utils/fetchPairJsonInfos'

export function registInWorker() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', (data) => fetchPairJsonInfo(data))
}
