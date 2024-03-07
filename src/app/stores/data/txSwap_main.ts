import { deepUnwrapSolidProxy } from "../../utils/txHandler/deepUnwrapSolidProxy"
import { getMessageSender } from "../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../utils/webworker/type"
import { TxSwapOptions } from "./txSwap_core"

export function txSwap(txOptions: TxSwapOptions) {
  return getMessageSender(workerCommands["txSwap start"]).post(deepUnwrapSolidProxy(txOptions))
}
