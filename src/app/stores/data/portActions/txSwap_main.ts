import { deepUnwrapSolidProxy } from "../../../utils/txHandler/deepUnwrapSolidProxy"
import { getMessageSender } from "../../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../../utils/webworker/type"
import { TxSwapOptions } from "../utils/txSwap"

export function txSwap_main(txOptions: TxSwapOptions) {
  return getMessageSender(workerCommands["txSwap start"]).post(deepUnwrapSolidProxy(txOptions))
}
