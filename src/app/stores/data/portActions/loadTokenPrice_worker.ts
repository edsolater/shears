import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { fetchTokenPrices } from "../utils/fetchTokenPrices"

export function loadTokenPriceInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort("get raydium token prices")
  console.log("get raydium token prices")
  receiver.subscribe((options) => {
    fetchTokenPrices(options.tokens, options.url).then((res) => sender.post({ prices: res }))
  })
}
