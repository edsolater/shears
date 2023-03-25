import { listToJSMap } from '@edsolater/fnkit'
import { FetchRaydiumTokenPriceOptions } from "./type"
import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { fetchTokenPrices } from './utils/fetchTokenPrices'

export function registInWorker() {
  registMessageReceiver<FetchRaydiumTokenPriceOptions>(
    'get raydium token prices',
    async ({ payload: options, resolve }) =>
      fetchTokenPrices(options.tokens, options.url).then((res) => resolve({ prices: res }))
  )
}

