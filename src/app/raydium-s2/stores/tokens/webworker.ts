import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { fetchTokenJsonFile, handleRaydiumTokenJsonFile } from './utils/fetchTokenJsonInfo'
import { FetchRaydiumTokenOptions } from './type'

export function registInWorker() {
  registMessageReceiver<FetchRaydiumTokenOptions>('fetch raydium supported tokens', async (options) => {
    // TODO: currently only mainnet raydium token list was supported
    return fetchTokenJsonFile(options).then((res) => res && handleRaydiumTokenJsonFile(res))
  })
}
