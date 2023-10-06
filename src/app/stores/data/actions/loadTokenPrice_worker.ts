import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchTokenPrices } from '../utils/fetchTokenPrices'

export function loadTokenPrice_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('get raydium token prices')
  console.log('get raydium token prices')
  receiver.subscribe((options) => {
    fetchTokenPrices(options.tokens, options.url).then((res) => sender.query({ prices: res }))
  })
}
