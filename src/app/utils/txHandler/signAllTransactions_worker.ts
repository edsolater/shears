import type { InnerTransaction as SDKInnerTransaction } from "@raydium-io/raydium-sdk"
import { VersionedTransaction } from "@solana/web3.js"
import { getMessageReceiver, getMessageSender } from "../webworker/loadWorker_worker"
import { composeSDKInnerTransactions } from "./createVersionedTransaction"
import type { TxHandlerPayload } from "./txHandler"

export async function signAllTransactions({
  transactions,
  payload,
}: {
  transactions: SDKInnerTransaction[]
  payload: TxHandlerPayload
}): Promise<VersionedTransaction[]> {
  const buildedTransactions = await composeSDKInnerTransactions({
    connection: payload.connection,
    owner: payload.owner,
    transactions,
  })
  const receiver = getMessageReceiver("transform transaction")
  const sender = getMessageSender("transform transaction")
  // send transaction form worker to main thread
  return new Promise((resolve, reject) => {
    console.log("[worker] send transactions to main thread", buildedTransactions)
    sender.post(buildedTransactions.map((tx) => tx.serialize()))
    receiver.subscribe((signedTransactions) => {
      const decoded = signedTransactions.map((transaction) => VersionedTransaction.deserialize(transaction))
      resolve(decoded)
    })
  })
}
