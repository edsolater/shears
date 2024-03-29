import type { InnerTransaction as SDKInnerTransaction } from "@raydium-io/raydium-sdk"
import { VersionedTransaction } from "@solana/web3.js"
import { getMessagePort } from "../webworker/loadWorker_worker"
import { composeSDKInnerTransactions } from "./createVersionedTransaction"
import type { TxHandlerPayload } from "./txHandler"
import type { ID } from "@edsolater/fnkit"

export type UnsignedTransactionInfo = {
  id: ID
  txs: Uint8Array[]
}
export type SignTransactionErrorInfo = {
  id: ID
  errorReason: string
}
export type SignTransactionSuccessInfo = {
  id: ID
  signedTxs: Uint8Array[]
}

let signId = 0
function getSignTransactionId(): ID {
  return signId++
}
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
  const port = getMessagePort("transform transaction")
  // send transaction form worker to main thread
  return new Promise((resolve, reject) => {
    const signId = getSignTransactionId()
    console.log("[worker] send transactions to main thread", buildedTransactions)
    port.postMessage({
      id: signId,
      txs: buildedTransactions.map((tx) => tx.serialize()),
    } as UnsignedTransactionInfo)
    port.receiveMessage((signedTransactions: SignTransactionSuccessInfo | SignTransactionErrorInfo) => {
      if (signedTransactions.id !== signId) return
      if ("signedTxs" in signedTransactions) {
        const decoded = signedTransactions.signedTxs.map((transaction) => VersionedTransaction.deserialize(transaction))
        resolve(decoded)
      } else {
        reject(signedTransactions.errorReason)
      }
    })
  })
}
