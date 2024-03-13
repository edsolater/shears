import { createEventCenter } from "@edsolater/fnkit"
import type { TxClmmPositionIncreaseParams } from "../../stores/data/txClmmPositionIncrease"
import type { TxSwapOptions } from "../../stores/data/txSwap"
import { getMessagePort } from "../webworker/loadWorker_main"
import type { TxErrorInfo, TxHandlerEventCenter, TxSentErrorInfo, TxSentSuccessInfo, TxSuccessInfo } from "./txHandler"

export type TxResponse =
  | { name: string; status: "txSuccess"; payload: TxSuccessInfo }
  | { name: string; status: "txError"; payload: TxErrorInfo }
  | { name: string; status: "sendSuccess"; payload: TxSentSuccessInfo }
  | { name: string; status: "sendError"; payload: TxSentErrorInfo }

type TxDispatcherParams = ["swap", TxSwapOptions] | ["clmm position increase", TxClmmPositionIncreaseParams]

export function txDispatcher(...args: TxDispatcherParams): TxHandlerEventCenter {
  const [inputName, params] = args
  const { receiver, sender } = getMessagePort<TxResponse>("tx start")
  sender.post({ name: inputName, txParams: params })
  const txEventCenter = createEventCenter() // TODO: should destory it? 🤔
  receiver.subscribe(({ name: txName, status, payload }) => {
    if (txName === inputName) txEventCenter.emit(status, [payload] as any)
  })
  return txEventCenter
}
