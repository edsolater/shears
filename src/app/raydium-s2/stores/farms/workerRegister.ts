import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, FetchFarmsSYNInfoPayloads } from './type'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYNInfo } from './utils/composeFarmSYNInfo'

export function registInWorker() {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ payload, resolve }) =>
    fetchFarmJsonInfo(payload).then(resolve)
  )

  registMessageReceiver<FetchFarmsSYNInfoPayloads>(
    'get raydium farms syn infos',
    async ({ payload, resolve, onCleanUp }) => {
      const { abort, result: farmSYNInfos } = composeFarmSYNInfo(payload)
      farmSYNInfos.then(resolve)
      onCleanUp(abort)
    }
  )
}
