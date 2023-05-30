import { InnerTransaction } from '@raydium-io/raydium-sdk'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
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

  const allSignedTransactions = await payload.signAllTransactions(buildedTransactions)
  return allSignedTransactions
}
