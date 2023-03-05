import { appApiUrls } from '../common/utils/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../common/webworker/mainThread_receiver'
import { FetchPairsOptions, JsonPairItemInfo } from './type'

export function getPairJson(cb: WebworkerSubscribeCallback<JsonPairItemInfo[]>) {
  return subscribeWebWorker<JsonPairItemInfo[], FetchPairsOptions>(
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
