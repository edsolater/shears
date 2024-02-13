import { InnerTransaction } from '@raydium-io/raydium-sdk'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { getMessageReceiver, getMessageSender } from '../webworker/loadWorker_worker'
import { buildTransactionsFromSDKInnerTransactions, isInnerTransaction } from './createVersionedTransaction'
import { TxHandlerPayload } from './txHandler'

export async function signAllTransactions({
  transactions,
  payload,
}: {
  transactions: (Transaction | InnerTransaction)[]
  payload: TxHandlerPayload
}): Promise<(Transaction | VersionedTransaction)[]> {
  const buildedTransactions = transactions.every(isInnerTransaction)
    ? await buildTransactionsFromSDKInnerTransactions({
        connection: payload.connection,
        owner: payload.owner,
        txVersion: payload.txVersion,
        transactions,
      })
    : (transactions as Transaction[])

  const allSignedTransactions = await signAllTransactionsFromWorker(buildedTransactions) // sign transactions
  return allSignedTransactions
}

function signAllTransactionsFromWorker(
  transactions: (Transaction | VersionedTransaction)[],
): Promise<(Transaction | VersionedTransaction)[]> {
  const receiver = getMessageReceiver('sign transaction in main thread')
  const sender = getMessageSender('sign transaction in main thread')
  // send transaction form worker to main thread
  return new Promise((resolve, reject) => {
    sender.post(transactions)
    receiver.subscribe((signedTransactions) => {
      resolve(signedTransactions)
    })
  })
}
