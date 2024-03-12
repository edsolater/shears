import type { TxClmmPositionIncreaseParams } from "../../stores/data/txClmmPositionIncrease"
import type { TxSwapOptions } from "../../stores/data/txSwap"
import { getMessagePort } from "../webworker/loadWorker_main"
import type { TxErrorInfo, TxSentErrorInfo, TxSentSuccessInfo, TxSuccessInfo } from "./txHandler"

export type TxResponse =
  | { name: string; status: "txSuccess"; payload: TxSuccessInfo }
  | { name: string; status: "txError"; payload: TxErrorInfo }
  | { name: string; status: "sendSuccess"; payload: TxSentSuccessInfo }
  | { name: string; status: "sendError"; payload: TxSentErrorInfo }

export function txDispatcher(name: "swap", params: TxSwapOptions): void
export function txDispatcher(name: "clmm position increase", params: TxClmmPositionIncreaseParams): void
export function txDispatcher(name: string, params: any): void {
  const { receiver, sender } = getMessagePort<TxResponse>("tx start")
  sender.post({ name, txParams: params })
  
  receiver.subscribe(({name, status, payload}) => {
    console.log("tx info: ", payload)
    // TODO: complete this,  txSubscribable.set({ name: config.name, txEventCenter })
  })
}
