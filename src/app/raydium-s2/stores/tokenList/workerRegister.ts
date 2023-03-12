import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { fetchTokenJsonFile } from './utils/fetchTokenJson'
import { FetchRaydiumTokenListOptions } from './type'

export function registInWorker() {
  registMessageReceiver<FetchRaydiumTokenListOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) =>
      /* TODO: currently only mainnet raydium token list was supported*/ fetchTokenJsonFile(options).then((res) =>
        resolve(res)
      )
  )
}
