import { createSubscribable, type MayPromise } from "@edsolater/fnkit"
import {
  createTxClmmPositionIncreaseTransactionModule,
  txClmmPositionIncrease,
} from "../../stores/data/txClmmPositionIncrease"
import { createTxSwapTransactionModule, txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import type { TxHandlerEventCenter } from "./txHandler"
import type { TxBuilderMultiConfig, TxBuilderSingleConfig, TxResponse } from "./txDispatcher_main"
import {
  createTxClmmPositionDecreaseTransactionModule,
  txClmmPositionDecrease,
} from "../../stores/data/txClmmPositionDecrease"
import { handleMultiTxModules, type TransactionModule } from "./handleTxFromShortcut"

export async function txDispatcher_worker(
  transformers: PortUtils<TxBuilderSingleConfig | TxBuilderMultiConfig, TxResponse>,
) {
  const { receiver, sender } = transformers.getMessagePort("tx start")
  const txSubscribable = createSubscribable<{
    name: string
    txEventCenter: MayPromise<TxHandlerEventCenter | undefined>
  }>()
  // 🤔 whether should destory after tx is end?
  txSubscribable.subscribe(({ name, txEventCenter }) => {
    Promise.resolve(txEventCenter).then((txEventCenter) => {
      txEventCenter?.listenWhateverEvent((eventName, [payload]) => {
        // @ts-expect-error no need to check type
        sender.post({ name, status: eventName, payload })
      })
    })
  })
  receiver.subscribe((configs) => {
    const [name, txParams] = configs
    console.log("[worker txDispatcher] get name: ", name, "txParams: ", txParams)
    switch (name) {
      case "swap": {
        const txEventCenter = txSwap(txParams)
        txSubscribable.set({ name, txEventCenter })
        break
      }
      case "clmm position increase": {
        const txEventCenter = txClmmPositionIncrease(txParams)
        txSubscribable.set({ name, txEventCenter })
        break
      }
      case "clmm position decrease": {
        const txEventCenter = txClmmPositionDecrease(txParams)
        txSubscribable.set({ name, txEventCenter })
        break
      }
      case "complicated tx multi configs": {
        const configs = txParams
        const txModules = [] as MayPromise<TransactionModule>[]
        console.log("[worker txDispatcher] complicated tx multi configs: ", configs)
        for (const config of configs) {
          const [name, txParams] = config
          switch (name) {
            case "clmm position increase": {
              const txModule = createTxClmmPositionIncreaseTransactionModule(txParams)
              txModules.push(txModule)
              break
            }
            case "clmm position decrease": {
              const txModule = createTxClmmPositionDecreaseTransactionModule(txParams)
              txModules.push(txModule)
              break
            }
            case "swap": {
              const txModule = createTxSwapTransactionModule(txParams)
              txModules.push(txModule)
              break
            }
          }
        }
        const txEventCenter = Promise.all(txModules).then((txModules) =>
          handleMultiTxModules(txModules, { sendMode: "parallel" }),
        )
        txSubscribable.set({ name: "complicated tx multi configs", txEventCenter })
      }
    }
    //🏷️ switchCase has type-error
    // switchCase(config.name, {
    //   swap: () => txSwap(config.txParams),
    //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
    // })
  })
}

// function buildTxFromTxBuilderConfig(configs: TxBuilderSingleConfig[], options?: {}): TxHandlerEventCenter {
//   return
// }
