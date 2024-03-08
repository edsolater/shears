import { deepUnwrapSolidProxy } from "../../utils/txHandler/deepUnwrapSolidProxy"
import { getMessageSender } from "../../utils/webworker/loadWorker_main"
import { TxSwapOptions } from "./txSwap_core"

export function txSwap(txOptions: TxSwapOptions) {
  return getMessageSender("txSwap start").post(deepUnwrapSolidProxy(txOptions))
}
