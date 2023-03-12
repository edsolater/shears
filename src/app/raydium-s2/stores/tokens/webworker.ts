import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { fetchTokenJsonFile, handleRaydiumTokenJsonFile } from './fetchTokenJson'
import { FetchRaydiumTokenListOptions } from '../../types/atoms/type'

export function registInWorker() {
  registMessageReceiver<FetchRaydiumTokenListOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) => {
      // TODO: currently only mainnet raydium token list was supported
      return fetchTokenJsonFile(options)
        .then((res) => res && handleRaydiumTokenJsonFile(res))
        .then((res) => resolve(res))
    }
  )
}
