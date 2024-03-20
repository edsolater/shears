import { createEventCenter, flapDeep, isArray, isString, shakeUndefinedItem } from "@edsolater/fnkit"
import { getMessagePort } from "../webworker/loadWorker_main"
import type { TxErrorInfo, TxHandlerEventCenter, TxSendErrorInfo, TxSendSuccessInfo, TxSuccessInfo } from "./txHandler"
import { TxClmmPositionDecreaseConfig } from "../../stores/data/txClmmPositionDecrease"
import { TxClmmPositionIncreaseConfig } from "../../stores/data/txClmmPositionIncrease"
import { TxSwapConfig } from "../../stores/data/txSwap"

export type TxResponse =
  | { name: string; status: "txSuccess"; payload: TxSuccessInfo }
  | { name: string; status: "txError"; payload: TxErrorInfo }
  | { name: string; status: "sendSuccess"; payload: TxSendSuccessInfo }
  | { name: string; status: "sendError"; payload: TxSendErrorInfo }

export type TxBuilderSingleConfig = TxSwapConfig | TxClmmPositionIncreaseConfig | TxClmmPositionDecreaseConfig
export type TxBuilderMultiConfig = ["tx multi configs", TxBuilderSingleConfig[]]
export type TxBuilderConfig = TxBuilderSingleConfig | TxBuilderMultiConfig

export function launchTx(...args: TxBuilderConfig): TxHandlerEventCenter {
  const [inputName, txParams] = args
  const { receiver, sender } = getMessagePort<TxResponse>("tx start")
  sender.post([inputName, txParams])
  const txEventCenter = createEventCenter() // TODO: should destory it? 🤔
  receiver.subscribe(({ name: txName, status, payload }) => {
    if (txName === inputName) txEventCenter.emit(status, [payload] as any)
  })
  return txEventCenter
}

export function invokeTxConfig(...configs: undefined[]): undefined
export function invokeTxConfig(...configs: TxBuilderSingleConfig[]): TxHandlerEventCenter
export function invokeTxConfig(...configs: (TxBuilderSingleConfig | undefined)[]): TxHandlerEventCenter | undefined
export function invokeTxConfig(...configs: (TxBuilderSingleConfig | undefined)[]): TxHandlerEventCenter | undefined {
  if (!configs.length) return undefined
  const validConfigs = shakeUndefinedItem(configs) as unknown as TxBuilderSingleConfig[]
  if (!validConfigs.length) return undefined
  if (validConfigs.length === 1) {
    const [txCommandName, txParams] = configs
    //@ts-expect-error no need to check type
    return launchTx(txCommandName, txParams)
  } else {
    return launchTx("tx multi configs", validConfigs)
  }
}

function isTxConfig(config: any): config is TxBuilderSingleConfig {
  return isArray(config) && config.length <= 2 && isString(config[0])
}
