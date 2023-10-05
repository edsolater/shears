import { isArray } from '@edsolater/fnkit'
import { InnerTransaction } from '@raydium-io/raydium-sdk'
import { Transaction } from '@solana/web3.js'
import { objectMerge } from '../../../packages/fnkit'
import { TxHandlerOptions, TxHandlerOption, MultiTxsOption, TransactionQueue, TransactionCollector } from './txHandler'

/**
 * collector's aim: use `.add` method to load innerTransactions
 */
export function innerTxCollector(
  additionOptions?: Pick<TxHandlerOptions, 'additionalMultiOptionCallback' | 'additionalSingleOptionCallback'>,
) {
  const singleTxOptions = [] as TxHandlerOption[]
  const multiTxOption = {} as MultiTxsOption
  const innerTransactions = [] as (Transaction | InnerTransaction)[]
  const { additionalSingleOptionCallback, additionalMultiOptionCallback } = additionOptions ?? {}

  /**
   * mutable
   */
  const addSingle = (transaction: Transaction | InnerTransaction, options?: TxHandlerOption) => {
    innerTransactions.push(transaction)
    singleTxOptions.push(objectMerge(options ?? {}, additionalSingleOptionCallback ?? {}))
  }

  /**
   * mutable
   */
  const addQueue = (transactionQueue: TransactionQueue, options?: MultiTxsOption) => {
    transactionQueue.forEach((transaction) => {
      const [singelTransation, singelOption] = Array.isArray(transaction) ? transaction : ([transaction] as const)
      addSingle(singelTransation, singelOption)
    })
    Object.assign(multiTxOption, objectMerge(options ?? {}, additionalMultiOptionCallback ?? {}))
  }

  /**
   * {@link addSingle} + {@link addQueue}
   */
  const add: TransactionCollector['add'] = (transactions, option) => {
    const isQueue = isArray(transactions)
    if (isQueue) {
      const injectedTransactions: TransactionQueue = transactions.map((t) =>
        isArray(t) ? [t[0], { ...option, ...t[1] }] : [t, option],
      )
      addQueue(injectedTransactions, option)
    } else {
      addSingle(transactions, option)
    }
  }

  const transactionCollector: TransactionCollector = { add }
  return {
    transactionCollector,
    collected: { collectedTransactions: innerTransactions, singleTxOptions, multiTxOption },
  }
}
