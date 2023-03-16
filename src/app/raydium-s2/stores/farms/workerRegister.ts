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
    async ({ payload: { rpcUrl, owner, farmApiUrl, liquidityUrl }, resolve, onCleanUp }) => {
      const { abort, result: farmSYNInfos } = composeFarmSYNInfo({
        owner,
        rpcUrl,
        farmApiUrl,
        liquidityUrl
      })
      farmSYNInfos.then(resolve)
      onCleanUp(abort)
    }
  )
}
