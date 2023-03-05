import { AnyFn } from '@edsolater/fnkit'
import { appApiUrls } from '../common/utils/config'
import { QueryCallback, queryWebWorker } from '../common/webworker/mainThread_receiver'
import { FetchRaydiumTokenOptions, TokenMessageData } from './type'

export function queryTokenJsonInfo(cb: QueryCallback<TokenMessageData>) {
  return queryWebWorker<TokenMessageData, FetchRaydiumTokenOptions>({
    description: 'fetch raydium supported tokens',
    payload: {
      url: appApiUrls.tokenInfo
    }
  }, cb)
}
