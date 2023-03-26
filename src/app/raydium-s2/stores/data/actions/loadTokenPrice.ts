import { Store } from '../../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { DataStore } from '../store'
import { Token, TokenListStore } from '../tokenListType'
import { FetchRaydiumTokenPriceOptions, TokenPriceWorkerData } from '../tokenPriceType'

export function loadTokenPrice(store: Store<DataStore>, tokens: Token[]) {
  store.set({ isTokenLoading: true })
  getTokenPriceInfo(tokens, (workerResult) => {
    store.set({ isTokenLoading: false, prices: workerResult.prices })
  })
}

const getTokenPriceInfo = (tokens: TokenListStore['allTokens'], cb: WebworkerSubscribeCallback<TokenPriceWorkerData>) =>
  subscribeWebWorker<TokenPriceWorkerData, FetchRaydiumTokenPriceOptions>(
    {
      description: 'get raydium token prices',
      payload: {
        url: appApiUrls.price,
        tokens
      }
    },
    cb
  )