import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, FetchFarmsSYNInfoPayloads } from './type'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { getFarmSYNInfo } from './utils/getFarmSYNInfo'

export function registInWorker() {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ payload, resolve }) =>
    fetchFarmJsonInfo(payload).then((infos) => resolve([...infos.values()]))
  )

  registMessageReceiver<FetchFarmsSYNInfoPayloads>(
    'get raydium farms syn infos',
    async ({ payload: { rpcUrl, owner, farmApiUrl }, resolve, onCleanUp }) => {
      const { abort, result: farmSYNInfos } = getFarmSYNInfo({
        owner,
        rpcUrl,
        farmApiUrl
      })
      farmSYNInfos.then(resolve)
      onCleanUp(abort)
    }
  )
}
