import type { InnerTransaction as SDKInnerTransaction } from "@raydium-io/raydium-sdk"
import { Keypair, VersionedTransaction } from "@solana/web3.js"
import { getMessagePort } from "../webworker/loadWorker_worker"
import { composeSDKInnerTransactions } from "./createVersionedTransaction"
import type { TxHandlerPayload } from "./txHandler"
import type { ID } from "@edsolater/fnkit"
import { reportLog } from "../../stores/data/utils/logger"

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

  if (payload.privateKey) {
    return signWithPrivateKey({ txs: buildedTransactions, privateKey: payload.privateKey })
  } else {
    const port = getMessagePort("transform transaction")
    // send transaction form worker to main thread
    return new Promise((resolve, reject) => {
      const signId = getSignTransactionId()
      reportLog("[⚙️worker] send transactions to main thread", buildedTransactions)
      port.postMessage({
        id: signId,
        txs: buildedTransactions.map((tx) => tx.serialize()),
      } as UnsignedTransactionInfo)
      port.receiveMessage((signedTransactions: SignTransactionSuccessInfo | SignTransactionErrorInfo) => {
        if (signedTransactions.id !== signId) return
        if ("signedTxs" in signedTransactions) {
          const decoded = signedTransactions.signedTxs.map((transaction) =>
            VersionedTransaction.deserialize(transaction),
          )
          resolve(decoded)
        } else {
          reject(signedTransactions.errorReason)
        }
      })
    })
  }
}

// FIXME: error here
async function signWithPrivateKey(payload: { txs: VersionedTransaction[]; privateKey: string }) {
  const privateKeyU8 = new Uint8Array(Buffer.from(payload.privateKey, "base64"))
  const keypair = Keypair.fromSecretKey(privateKeyU8)
  for (const tx of payload.txs) {
    tx.sign([keypair])
  }
  return payload.txs
}
