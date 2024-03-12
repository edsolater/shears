import type { Connection, VersionedTransaction } from "@solana/web3.js"

import { serializeTransaction } from "./serializeTransaction"
import type { TxHandlerPayload } from "./txHandler"

type Txid = string

const tempBatchedTransactionsQueue: {
  tx: VersionedTransaction
  txidPromise: Promise<string>
  resolveFn: (value: string) => void
}[] = []

function canBatchTransactions(connection: Connection, transaction: VersionedTransaction) {
  const isConnectionSatisfied = "_buildArgs" in connection && "_rpcBatchRequest" in connection
  const isTransactionSatisfied = "_compile" in transaction && "_serialize" in transaction
  return isConnectionSatisfied && isTransactionSatisfied
}

export async function sendTransactionCore({
  transaction,
  payload,
  batchOptions,
  cache = true,
}: {
  transaction: VersionedTransaction
  payload: TxHandlerPayload
  batchOptions?: { allSignedTransactions: VersionedTransaction[] }
  cache?: boolean
}): Promise<Txid> {
  if (batchOptions && canBatchTransactions(payload.connection, transaction)) {
    let resolveFn: any
    const newPromise = new Promise<string>((resolve) => {
      resolveFn = resolve
    })
    tempBatchedTransactionsQueue.push({ tx: transaction, txidPromise: newPromise, resolveFn })
    // once all tx load, start batch sending
    if (tempBatchedTransactionsQueue.length === batchOptions.allSignedTransactions.length) {
      const txids = await sendBatchedTransactions(
        tempBatchedTransactionsQueue.map((b) => b.tx),
        payload,
      )
      // fulfilled promise
      tempBatchedTransactionsQueue.forEach(({ resolveFn }, idx) => {
        resolveFn(txids[idx])
      })
      // clear queue
      tempBatchedTransactionsQueue.splice(0, tempBatchedTransactionsQueue.length)
    }
    return newPromise
  } else {
    return sendSingleTransaction(transaction, payload, cache)
  }
}

async function sendSingleTransaction(
  transaction: VersionedTransaction,
  payload: TxHandlerPayload,
  cache: boolean,
): Promise<Txid> {
  const tx = serializeTransaction(transaction, { cache })
  return await payload.connection.sendRawTransaction(tx, {
    skipPreflight: true,
  })
}

/** @deprecated */
async function sendBatchedTransactions(
  allSignedTransactions: VersionedTransaction[],
  payload: TxHandlerPayload,
): Promise<Txid[]> {
  const encodedTransactions = allSignedTransactions.map((i) => i.serialize().toString())

  const batch = encodedTransactions.map((keys) => {
    const args = payload.connection._buildArgs([keys], undefined, "base64")
    return { methodName: "sendTransaction", args }
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const results = (await payload.connection._rpcBatchRequest(batch)).map((ii) => ii.result.value)
  return results
}
