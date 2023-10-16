import { appApiUrls } from '../../../utils/common/config'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { setStore, storeData } from '../dataStore'
import { TokenListStore } from '../types/tokenList'

export function loadTokenPrice() {
  const allTokens = storeData.tokens
  const hasAnyToken = Boolean(allTokens?.length)
  if (!hasAnyToken) return
  setStore({ isTokenPriceLoading: true })
  getTokenPriceInfoFromWorker(allTokens).subscribe((workerResult) => {
    setStore({ isTokenPriceLoading: false, prices: workerResult.prices })
  })
}

const getTokenPriceInfoFromWorker = (tokens: TokenListStore['tokens']) => {
  const sender = getMessageSender('get raydium token prices')
  sender.query({
    url: appApiUrls.price,
    tokens,
  })
  const receiver = getMessageReceiver('get raydium token prices')
  return receiver
}
