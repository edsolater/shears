import { createSubscribable, type MayPromise } from "@edsolater/fnkit"
import { txClmmPositionIncrease } from "../../stores/data/txClmmPositionIncrease"
import { txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import type { TxHandlerEventCenter } from "./txHandler"
import type { TxResponse } from "./txDispatcher_main"

export async function txDispatcher_worker(
  transformers: PortUtils<{ name: string; txParams: any /* too difficult to type details */ }, TxResponse>,
) {
  const { receiver, sender } = transformers.getMessagePort("tx start")
  const txSubscribable = createSubscribable<{ name: string; txEventCenter: MayPromise<TxHandlerEventCenter> }>()
  // 🤔 whether should destory after tx is end?
  txSubscribable.subscribe(({ name, txEventCenter }) => {
    Promise.resolve(txEventCenter).then((txEventCenter) => {
      txEventCenter.onAnyEvent((eventName, [payload]) => {
        // @ts-expect-error no need to check type
        sender.post({ name, status: eventName, payload })
      })
    })
  })
  receiver.subscribe((config) => {
    console.log("[worker] config: ", config)
    switch (config.name) {
      case "swap": {
        const txEventCenter = txSwap(config.txParams)
        txSubscribable.set({ name: config.name, txEventCenter })
        break
      }
      case "clmm position increase": {
        const txEventCenter = txClmmPositionIncrease(config.txParams)
        txSubscribable.set({ name: config.name, txEventCenter })
        break
      }
    }
    //🏷️ switchCase has type-error
    // switchCase(config.name, {
    //   swap: () => txSwap(config.txParams),
    //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
    // })
  })
}

