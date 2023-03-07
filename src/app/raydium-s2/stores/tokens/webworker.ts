import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { fetchTokenJsonFile, handleRaydiumTokenJsonFile } from './fetchTokenJson'
import { FetchRaydiumTokenOptions } from './type'

export function registInWorker() {
  registMessageReceiver<FetchRaydiumTokenOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) => {
      // TODO: currently only mainnet raydium token list was supported
      return fetchTokenJsonFile(options)
        .then((res) => res && handleRaydiumTokenJsonFile(res))
        .then((res) => resolve(res))
    }
  )
}
