import { appApiUrls } from '../common/utils/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../common/webworker/mainThread_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './type'

export function getFarmJson(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  return subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}
