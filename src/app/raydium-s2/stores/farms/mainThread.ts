import { appApiUrls } from '../common/utils/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../common/webworker/mainThread_receiver'
import { FarmPoolJsonInfo, FetchFarmsOptions } from './type'

export function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  return subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}

export function getFarmSDKInfoListFromWorker(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  return subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>(
    {
      description: 'parse raydium farms info sdk list',
      payload: { url: appApiUrls.farmInfo } // TODO <-- get owner info here
    },
    cb
  )
}
