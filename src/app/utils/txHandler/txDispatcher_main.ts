import type { TxClmmPositionIncreaseParams } from "../../stores/data/txClmmPositionIncrease"
import type { TxSwapOptions } from "../../stores/data/txSwap"
import { getMessageSender } from "../webworker/loadWorker_main"

export function txDispatcher(name: "swap", params: TxSwapOptions): void
export function txDispatcher(name: "clmm position increase", params: TxClmmPositionIncreaseParams): void
export function txDispatcher(name: string, params: any): void {
  getMessageSender("tx start").post({ name, txParams: params })
}
