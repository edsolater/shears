import type { TxClmmPositionIncreaseParams } from "../../stores/data/txClmmPositionIncrease"
import type { TxSwapOptions } from "../../stores/data/txSwap"
import { getMessageSender } from "../webworker/loadWorker_main"

export type TxTransformConfig =
  | {
      name: "swap"
      txParams: TxSwapOptions // (must be cloneable)
    }
  | {
      name: "clmm position increase"
      txParams: TxClmmPositionIncreaseParams // (must be cloneable)
    }

export function txDispatcher(config: TxTransformConfig) {
  return getMessageSender("tx start").post(config)
}
