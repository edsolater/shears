import { InnerTransaction } from '@raydium-io/raydium-sdk'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { buildTransactionsFromSDKInnerTransactions, isInnerTransaction } from './createVersionedTransaction'
import { TxHandlerPayload } from './txHandler'
import { getMessageSender } from '../webworker/genMessageSender'
import { getMessageReceiver } from '../webworker/genMessageReceiver'

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
  const sender = getMessageSender(globalThis, 'sign transaction in main thread')
  const receiver = getMessageReceiver(globalThis, 'sign transaction in main thread')
  // send transaction form worker to main thread
  return new Promise((resolve, reject) => {
    sender.query(transactions)
    receiver.subscribe((signedTransactions) => {
      resolve(signedTransactions)
    })
  })
}
