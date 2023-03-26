import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, FetchFarmsSYNInfoPayloads } from './farmType'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYN } from './utils/composeFarmSYN'
import { FetchPairsOptions } from './pairsType'
import { fetchPairJsonInfo } from './utils/fetchPairJson'

export function registInWorker() {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ resolve }) =>
    fetchFarmJsonInfo().then(resolve)
  )

  registMessageReceiver<FetchFarmsSYNInfoPayloads>(
    'get raydium farms syn infos',
    async ({ payload, resolve, onClean }) => {
      const { abort, resultSubscribable } = composeFarmSYN(payload)
      resultSubscribable.subscribe(resolve)
      onClean(abort)
    }
  )

  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', ({ payload, resolve }) =>
    fetchPairJsonInfo().then(resolve)
  )
}
