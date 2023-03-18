import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, FetchFarmsSYNInfoPayloads } from './type'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYN } from './utils/composeFarmSYN'

export function registInWorker() {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ payload, resolve }) =>
    fetchFarmJsonInfo(payload).then(resolve)
  )

  registMessageReceiver<FetchFarmsSYNInfoPayloads>(
    'get raydium farms syn infos',
    async ({ payload, resolve, onCleanUp }) => {
      const { abort, resultSubscribable } = composeFarmSYN(payload)
      resultSubscribable.subscribe((value) => {
        console.log('value: ', value)
        resolve(value)
      })
      onCleanUp(abort)
    }
  )
}
