import { count, toArray } from '@edsolater/fnkit'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import { appApiUrls } from '../../../utils/common/config'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore, shuck_tokens } from '../store'

export function loadTokenPrice() {
  const allTokens = useShuckValue(shuck_tokens)
  const hasAnyToken = count(allTokens()) > 0
  if (!hasAnyToken) return
  setStore({ isTokenPriceLoading: true })
  const { sender, receiver } = getMessagePort(workerCommands['get raydium token prices'])
  sender.post({
    url: appApiUrls.price,
    tokens: toArray(allTokens()),
  })
  receiver.subscribe((workerResult) => {
    setStore({ isTokenPriceLoading: false, prices: workerResult.prices })
  })
}
