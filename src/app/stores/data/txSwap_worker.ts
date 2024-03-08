import { PortUtils } from "../../utils/webworker/createMessagePortTransforers"
import { TxSwapOptions, txSwap_core } from "./txSwap_core"

export function txSwap_worker(transformers: PortUtils<TxSwapOptions>) {
  const { receiver, sender } = transformers.getMessagePort("txSwap start")
  receiver.subscribe((txSwapOptions) => {
    const txSubscribable = txSwap_core(txSwapOptions)
    txSubscribable.on("txSuccess", ({ txid }) => {
      console.log("success txid: ", txid)
      // send back txid to main thread
      sender.post({ txid })
    })
  })
}
