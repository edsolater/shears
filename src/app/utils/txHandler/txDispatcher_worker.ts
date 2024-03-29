import { createSubscribable, isArray, type MayPromise, type Subscribable } from "@edsolater/fnkit"
import {
  createTxClmmPositionDecreaseTransactionModule,
  txClmmPositionDecrease,
} from "../../stores/data/txClmmPositionDecrease"
import {
  createTxClmmPositionIncreaseTransactionModule,
  txClmmPositionIncrease,
} from "../../stores/data/txClmmPositionIncrease"
import { createTxSwapTransactionModule, txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import { handleMultiTxModules, type TransactionModule } from "./handleTxFromShortcut"
import type { TxBuilderConfigs, TxResponse } from "./txDispatcher_main"
import type { TxHandlerEventCenter } from "./txHandler"

type TxSubscribable = Subscribable<
  | {
      name: string
      txEventCenter: MayPromise<TxHandlerEventCenter | undefined>
    }
  | undefined
>

export async function txDispatcher_worker(transformers: PortUtils<TxBuilderConfigs, TxResponse>) {
  const port = transformers.getMessagePort("tx start")
  function buildThreadBridgeOfTxEventCenter(txSubscribable: TxSubscribable, destory: () => void) {
    txSubscribable.subscribe(({ name, txEventCenter }) => {
      Promise.resolve(txEventCenter).then((txEventCenter) => {
        txEventCenter?.listenWhateverEvent((eventName, [payload]) => {
          // @ts-expect-error no need to check type
          port.postMessage({ subscribableId: txSubscribable.id, name, status: eventName, payload })
          // when done clean the subscribabled callbacks
          if (eventName === "txAllDone") {
            txSubscribable.destroy()
            txEventCenter.clear()
            destory()
          }
        })
      })
    })
  }

  port.receiveMessage((builderConfigs) => {
    const messageId = builderConfigs.messageId
    const txSubscribable = getTxSubscribableFromId(messageId, buildThreadBridgeOfTxEventCenter)

    if (!isArray(builderConfigs.config)) {
      const { name, params: txParams } = builderConfigs.config
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
      }
    } else {
      // "complicated tx multi configs"
      const txModules = [] as MayPromise<TransactionModule>[]
      console.log("[worker txDispatcher] complicated tx multi configs: ", builderConfigs)
      for (const config of builderConfigs.config) {
        const { name, params: txParams } = config
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
      console.log("[🐛worker txDispatcher] complicated tx multi configs txModules: ", txModules)
      const txEventCenter = Promise.all(txModules).then((txModules) =>
        handleMultiTxModules(txModules, { sendMode: "parallel" }),
      )
      txSubscribable.set({ name: "complicated tx multi configs", txEventCenter })
    }
  })
  //🏷️ switchCase has type-error
  // switchCase(config.name, {
  //   swap: () => txSwap(config.txParams),
  //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
  // })
}

const cachedTxSubscribables = new Map<number, TxSubscribable>()

function getTxSubscribableFromId(
  subscribableId: number,
  onCreate: (s: TxSubscribable, destory: () => void) => void,
): TxSubscribable {
  if (!cachedTxSubscribables.has(subscribableId)) {
    const txSubscribable = createSubscribable() as TxSubscribable
    onCreate(txSubscribable, () => cachedTxSubscribables.delete(subscribableId))
    cachedTxSubscribables.set(subscribableId, txSubscribable)
    return txSubscribable
  } else {
    return cachedTxSubscribables.get(subscribableId)!
  }
}
