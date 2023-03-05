import { appApiUrls } from '../common/utils/config'
import { QueryCallback, queryWebWorker } from '../common/webworker/worker_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './type'

export function queryFarmJson(cb: QueryCallback<FarmPoolJsonInfo[]>) {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}
