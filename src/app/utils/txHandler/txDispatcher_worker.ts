import { createSubscribable, type MayPromise } from "@edsolater/fnkit"
import { txClmmPositionIncrease } from "../../stores/data/txClmmPositionIncrease"
import { txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import type { TxHandlerEventCenter } from "./txHandler"
import type { TxDispatcherParams, TxResponse } from "./txDispatcher_main"
import { txClmmPositionDecrease } from "../../stores/data/txClmmPositionDecrease"

export async function txDispatcher_worker(transformers: PortUtils<TxDispatcherParams, TxResponse>) {
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
    }
    //🏷️ switchCase has type-error
    // switchCase(config.name, {
    //   swap: () => txSwap(config.txParams),
    //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
    // })
  })
}
