import { createSubscribable, type MayPromise } from "@edsolater/fnkit"
import {
  createTxClmmPositionIncreaseTransactionShortcut,
  txClmmPositionIncrease,
} from "../../stores/data/txClmmPositionIncrease"
import { txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import type { TxHandlerEventCenter } from "./txHandler"
import type { TxBuilderMultiConfig, TxBuilderSingleConfig, TxResponse } from "./txDispatcher_main"
import {
  createTxClmmPositionDecreaseTransactionShortcut,
  txClmmPositionDecrease,
} from "../../stores/data/txClmmPositionDecrease"
import { handleMultiTxShortcuts, type TransactionModule } from "./handleTxFromShortcut"

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
      txEventCenter?.onAnyEvent((eventName, [payload]) => {
        // @ts-expect-error no need to check type
        sender.post({ name, status: eventName, payload })
      })
    })
  })
  receiver.subscribe((config) => {
    const [name, txParams] = config
    console.log("[worker txDispatcher] get name: ", name, "txParams: ", txParams)
    switch (name) {
      case "swap": {
        const txEventCenter = txSwap(txParams)
        txSubscribable.set({ name: name, txEventCenter })
        break
      }
      case "clmm position increase": {
        const txEventCenter = txClmmPositionIncrease(txParams)
        txSubscribable.set({ name: name, txEventCenter })
        break
      }
      case "clmm position decrease": {
        const txEventCenter = txClmmPositionDecrease(txParams)
        txSubscribable.set({ name: name, txEventCenter })
        break
      }
      case "tx multi configs": {
        const configs = txParams
        const txModules = [] as MayPromise<TransactionModule>[]
        console.log('[worker txDispatcher] tx multi configs: ', configs)
        for (const config of configs) {
          const [name, txParams] = config
          switch (name) {
            case "clmm position increase": {
              const txEventCenter = createTxClmmPositionIncreaseTransactionShortcut(txParams)
              txModules.push(txEventCenter)
              break
            }
            case "clmm position decrease": {
              const txEventCenter = createTxClmmPositionDecreaseTransactionShortcut(txParams)
              txModules.push(txEventCenter)
              break
            }
          }
        }
        const txEventCenter = Promise.all(txModules).then((txModules) => handleMultiTxShortcuts(txModules))
        txSubscribable.set({ name: "tx multi configs", txEventCenter })
      }
    }
    //🏷️ switchCase has type-error
    // switchCase(config.name, {
    //   swap: () => txSwap(config.txParams),
    //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
    // })
  })
}
