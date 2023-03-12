import { appApiUrls } from '../common/utils/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { FetchRaydiumTokenListOptions, TokenWorkerData } from '../../types/atoms/type'

export function getTokenJsonInfo(cb: WebworkerSubscribeCallback<TokenWorkerData>) {
  return subscribeWebWorker<TokenWorkerData, FetchRaydiumTokenListOptions>(
    {
      description: 'fetch raydium supported tokens',
      payload: {
        url: appApiUrls.tokenInfo
      }
    },
    cb
  )
}
