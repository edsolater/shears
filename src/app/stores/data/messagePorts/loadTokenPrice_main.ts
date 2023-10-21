import { appApiUrls } from '../../../utils/common/config'
import { toArray } from '../../../utils/dataTransmit/getItems'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore, storeData } from '../store'

export function loadTokenPrice() {
  const allTokens = storeData.tokens
  const hasAnyToken = Boolean(allTokens?.size)
  if (!hasAnyToken) return
  setStore({ isTokenPriceLoading: true })
  const { sender, receiver } = getMessagePort(workerCommands['get raydium token prices'])
  sender.query({
    url: appApiUrls.price,
    tokens: toArray(allTokens),
  })
  receiver.subscribe((workerResult) => {
    setStore({ isTokenPriceLoading: false, prices: workerResult.prices })
  })
}

