import { appApiUrls, appRpcEndpointUrl } from '../common/utils/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../common/webworker/mainThread_receiver'
import { onWalletPropertyChange } from '../wallet/store'
import { FarmPoolJsonInfo, FetchFarmsJsonPayloads, FetchFarmsSDKInfoPayloads } from './type'

export function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  return subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsJsonPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}

export function getFarmSDKInfosFromWorker(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  onWalletPropertyChange('owner', (owner) => {
    if (!owner) return
    const { abort } = subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsSDKInfoPayloads>(
      {
        description: 'parse raydium farms info sdk list',
        payload: { owner: owner, rpcUrl: appRpcEndpointUrl }
      },
      cb
    )
    return abort
  })
}
