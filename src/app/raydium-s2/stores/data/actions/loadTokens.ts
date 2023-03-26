import { Store } from '../../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { DataStore } from '../store'
import { FetchRaydiumTokenListOptions } from '../tokenListType'

export function loadTokensInfos(store: Store<DataStore>) {
  store.set({ isTokenLoading: true })
  getTokenJsonInfo((allTokens) => {
    store.set({ isTokenLoading: false, allTokens: allTokens })
  })
}

export const getTokenJsonInfo = (cb: WebworkerSubscribeCallback<DataStore['allTokens']>) =>
  subscribeWebWorker<DataStore['allTokens'], FetchRaydiumTokenListOptions>(
    {
      description: 'fetch raydium supported tokens',
      payload: {
        url: appApiUrls.tokenInfo
      }
    },
    cb
  )
