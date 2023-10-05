import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker_Drepcated, WebworkerSubscribeCallback } from '../../../utils/webworker/loadWorkerInMainThread'
import { DataStore } from '../store'
import { FetchRaydiumTokenListOptions } from '../types/tokenList'

export const onAccessTokens = createOnFirstAccess<DataStore>(['allTokens'], loadTokensInfos)

export function loadTokensInfos(store: Store<DataStore>) {
  store.set({ isTokenLoading: true })
  getTokenJsonInfoFromWorker((allTokens) => {
    store.set({ isTokenLoading: false, allTokens: allTokens })
  })
}

export const getTokenJsonInfoFromWorker = (cb: WebworkerSubscribeCallback<DataStore['allTokens']>) =>
  subscribeWebWorker_Drepcated<DataStore['allTokens'], FetchRaydiumTokenListOptions>(
    {
      command: 'fetch raydium supported tokens',
      payload: {
        url: appApiUrls.tokenInfo,
      },
    },
    cb,
  )
