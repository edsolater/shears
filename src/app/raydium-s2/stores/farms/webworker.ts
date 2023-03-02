import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FetchFarmsOptions } from './types/type'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'

export function registInWorker() {
  registMessageReceiver<FetchFarmsOptions>('fetch raydium farms info', (data) => fetchFarmJsonInfo(data))
}
