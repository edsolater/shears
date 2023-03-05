import { appApiUrls } from '../common/utils/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../common/webworker/mainThread_receiver'
import { FetchRaydiumTokenOptions, TokenMessageData } from './type'

export function getTokenJsonInfo(cb: WebworkerSubscribeCallback<TokenMessageData>) {
  return subscribeWebWorker<TokenMessageData, FetchRaydiumTokenOptions>({
    description: 'fetch raydium supported tokens',
    payload: {
      url: appApiUrls.tokenInfo
    }
  }, cb)
}
