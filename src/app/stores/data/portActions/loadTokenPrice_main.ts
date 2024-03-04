import { count, toList } from '@edsolater/fnkit'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import { appApiUrls } from '../../../utils/common/config'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { setStore, shuck_isTokenPricesLoading, shuck_tokenPrices, shuck_tokens } from '../store'
import type { TokenPricesMap } from '../utils/fetchTokenPrices'
import type { Token } from '../../../utils/dataStructures/Token'

export function loadTokenPrice() {
  shuck_tokens.subscribe((tokens) => {
    const hasAnyToken = count(tokens) > 0
    console.log('tokens: ', tokens)
    if (!hasAnyToken) return
    shuck_isTokenPricesLoading.set(true)
    setStore({ isTokenPriceLoading: true })
    const { sender, receiver } = getMessagePort<{ prices: TokenPricesMap }, { url: string; tokens: Token[] }>(
      'get raydium token prices',
    )
    console.log('[main] query token prices')
    sender.post({
      url: appApiUrls.price,
      tokens: toList(tokens),
    })
    receiver.subscribe(({ prices }) => {
      shuck_isTokenPricesLoading.set(false)
      shuck_tokenPrices.set(prices)
    })
  })
}
