import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FetchPairsOptions } from './type'
import { fetchPairJsonInfo } from './fetchPairJson'

export function registInWorker() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', (data) => fetchPairJsonInfo(data))
}