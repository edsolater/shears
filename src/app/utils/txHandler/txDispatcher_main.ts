import {
  createEventCenter,
  isArray,
  isString,
  shakeNil
} from "@edsolater/fnkit"
import { TxClmmPositionDecreaseConfig } from "../../stores/data/txClmmPositionDecrease"
import { TxClmmPositionIncreaseConfig } from "../../stores/data/txClmmPositionIncrease"
import { TxSwapConfig } from "../../stores/data/txSwap"
import { getMessagePort } from "../webworker/loadWorker_main"
import type { TxErrorInfo, TxHandlerEventCenter, TxSendErrorInfo, TxSendSuccessInfo, TxSuccessInfo } from "./txHandler"

export type TxResponse = 
  | { name: string; status: "txSuccess"; payload: TxSuccessInfo }
  | { name: string; status: "txError"; payload: TxErrorInfo }
  | { name: string; status: "txSendSuccess"; payload: TxSendSuccessInfo }
  | { name: string; status: "txSendError"; payload: TxSendErrorInfo }

export type TxBuilderSingleConfig = TxSwapConfig | TxClmmPositionIncreaseConfig | TxClmmPositionDecreaseConfig
export type TxBuilderMultiConfig = ["complicated tx multi configs", TxBuilderSingleConfig[]]
export type TxBuilderConfigs = TxBuilderSingleConfig | TxBuilderMultiConfig

export function launchTx(...args: TxBuilderConfigs): TxHandlerEventCenter {
  const [inputName, txParams] = args
  const { receiver, sender } = getMessagePort<TxResponse>("tx start")
  sender.post([inputName, txParams])
  const txEventCenter = createEventCenter() as unknown as TxHandlerEventCenter // TODO: should destory it? 🤔
  receiver.subscribe(({ name: txName, status, payload }) => {
    if (txName === inputName) txEventCenter.emit(status, [payload] as any)
  })
  return txEventCenter
}

export function invokeTxConfig(...configs: (TxBuilderSingleConfig | undefined)[]): TxHandlerEventCenter | undefined {
  if (!configs.length) return undefined
  const validConfigs = shakeNil(configs)
  if (!validConfigs.length) return undefined
  return launchTx("complicated tx multi configs", validConfigs)
}

function isTxConfig(config: any): config is TxBuilderSingleConfig {
  return isArray(config) && config.length <= 2 && isString(config[0])
}
