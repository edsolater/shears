import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { fetchFarmJsonInfos } from './utils/fetchFarmJsonInfos'
import { FetchFarmsOptions } from './types/type'

export function registInWorker() {
  registMessageReceiver<FetchFarmsOptions>('fetch raydium farms info', (data) => fetchFarmJsonInfos(data))
}
