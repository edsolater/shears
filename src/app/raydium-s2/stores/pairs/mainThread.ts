import { appApiUrls } from '../common/utils/config'
import { QueryCallback, queryWebWorker } from '../common/webworker/worker_receiver'
import { FetchPairsOptions, JsonPairItemInfo } from './type'

export function queryPairJson(cb: QueryCallback<JsonPairItemInfo[]>) {
  return queryWebWorker<JsonPairItemInfo[], FetchPairsOptions>(
    {
      description: 'fetch raydium pairs info',
      payload: {
        url: appApiUrls.pairs,
        force: false
      }
    },
    cb
  )
}
