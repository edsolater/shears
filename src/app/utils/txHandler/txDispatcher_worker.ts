import { createSubscribable, type MayPromise } from "@edsolater/fnkit"
import { txClmmPositionIncrease } from "../../stores/data/txClmmPositionIncrease"
import { txSwap } from "../../stores/data/txSwap"
import type { PortUtils } from "../webworker/createMessagePortTransforers"
import type { TxHandlerEventCenter } from "./txHandler"

export async function txDispatcher_worker(
  transformers: PortUtils<{ name: string; txParams: any /* too difficult to type details */ }>,
) {
  const { receiver, sender } = transformers.getMessagePort("tx start")
  const txSubscribable = createSubscribable<MayPromise<TxHandlerEventCenter>>()
  txSubscribable.subscribe((s) => {
    Promise.resolve(s).then((s) =>
      s.on("txSuccess", ({ txid }) => {
        sender.post({ txid })
      }),
    )
  })
  receiver.subscribe((config) => {
    console.log("[worker] config: ", config)
    switch (config.name) {
      case "swap": {
        txSubscribable.set(txSwap(config.txParams))
        break
      }
      case "clmm position increase": {
        txSubscribable.set(txClmmPositionIncrease(config.txParams))
      }
    }
    //🏷️ switchCase has type-error
    // switchCase(config.name, {
    //   swap: () => txSwap(config.txParams),
    //   "clmm position increase": () => txClmmPositionIncrease(config.txParams),
    // })
  })
}
