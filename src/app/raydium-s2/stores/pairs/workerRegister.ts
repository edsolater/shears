import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchPairsOptions } from './type'
import { fetchPairJsonInfo } from './utils/fetchPairJson'

export function registInWorker() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', ({ payload, resolve }) =>
    fetchPairJsonInfo(payload)
      .then((map) => map && [...map.values()])
      .then(resolve)
  )
}
