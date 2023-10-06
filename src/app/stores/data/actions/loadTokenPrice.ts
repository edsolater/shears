import { createEffect } from 'solid-js'
import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { Token } from '../../../utils/dataStructures/Token'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { DataStore } from '../store'
import { TokenListStore } from '../types/tokenList'

export const onAccessTokensPrice = createOnFirstAccess<DataStore>(['prices'], (store) => {
  createEffect(() => {
    const tokens = store.allTokens
    if (tokens?.length) {
      loadTokenPrice(store, tokens)
    }
  })
})

export function loadTokenPrice(store: Store<DataStore>, tokens: Token[]) {
  store.set({ isTokenLoading: true })
  getTokenPriceInfoFromWorker(tokens).subscribe((workerResult) => {
    store.set({ isTokenLoading: false, prices: workerResult.prices })
  })
}

const getTokenPriceInfoFromWorker = (tokens: TokenListStore['allTokens']) => {
  const sender = getMessageSender('get raydium token prices')
  sender.query({
    url: appApiUrls.price,
    tokens,
  })
  const receiver = getMessageReceiver('get raydium token prices')
  return receiver
}
