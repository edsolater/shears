import { MayPromise, isObject, produce, mergeFunction, shrinkToValue, assert } from '@edsolater/fnkit'
import { InnerTransaction, PublicKeyish, TxVersion as _TxVersion } from '@raydium-io/raydium-sdk'
import {
  Connection,
  Context,
  Keypair,
  PublicKey,
  SignatureResult,
  Transaction,
  TransactionError,
  VersionedTransaction
} from '@solana/web3.js'
import { WalletStore } from '../../stores/wallet/store'
import { buildTransactionsFromSDKInnerTransactions } from './createVersionedTransaction'
import { sendTransactionCore } from './sendTransactionCore'
import { subscribeTx } from './subscribeTx'
import { innerTxCollector } from './innerTxCollector'

type TxVersion = 'V0' | 'LEGACY'
//#region ------------------- basic info -------------------
export type TxInfo = {
  txid: string
  transaction: Transaction | VersionedTransaction
}

export type MultiTxExtraInfo = {
  isMulti: boolean
  /** only used in multi mode */
  transactions: (Transaction | VersionedTransaction)[]
  /** only used in multi mode */
  passedMultiTxid: string[]
  /** only used in multi mode */
  currentIndex: number // in multi transactions
  /** only used in multi mode */
  multiTransactionLength: number // in transactions
}
//#endregion

//#region ------------------- lifeTime info -------------------
export type TxSuccessInfo = {
  signatureResult: SignatureResult
  context: Context
} & (TxInfo & MultiTxExtraInfo)

export type TxSentSuccessInfo = TxInfo & MultiTxExtraInfo

export type TxFinalBatchSuccessInfo = {
  allSuccess: true
  txids: string[]
}

export type TxErrorInfo = {
  signatureResult: SignatureResult
  context: Context
  error?: TransactionError
} & (TxInfo & MultiTxExtraInfo)

export type TxSentErrorInfo = {
  err: unknown
}

export type TxFinalInfo =
  | ({
      type: 'success'
    } & TxSuccessInfo)
  | ({
      type: 'error'
    } & TxErrorInfo)

export type TxFinalBatchErrorInfo = {
  allSuccess: false
  errorAt: number
  txids: string[] // before absort
}

//#endregion

export type TxFn = () => MayPromise<TransactionQueue | Transaction | InnerTransaction>

//#region ------------------- callbacks -------------------
type TxSuccessCallback = (info: TxSuccessInfo) => void
type TxErrorCallback = (info: TxErrorInfo) => void
type TxFinallyCallback = (info: TxFinalInfo) => void
type TxSentSuccessCallback = (info: TxSentSuccessInfo) => void
type TxSentErrorCallback = (info: TxSentErrorInfo) => void
type TxSentFinallyCallback = () => void

type AllSuccessCallback = (info: { txids: string[] }) => void
type AnyErrorCallback = (info: { txids: string[] /* error at last txids */ }) => void

type TxKeypairDetective = {
  ownerKeypair: Keypair
  payerKeypair?: Keypair
}

//#endregion

export type TxHandlerOption = {
  /** @deprecated no need!!!. It's not pure */
  txHistoryInfo?: unknown
  /** if provided, error notification should respect this config
   * @deprecated no need!!!. It's not pure
   */
  txErrorNotificationDescription?: string | ((error: Error) => string)

  /**
   * for multi-mode
   *
   * will send this transaction even prev has error
   *
   * (will ignore in first tx)
   *
   * @default 'success' when sendMode is 'queue'
   * @default 'finally' when sendMode is 'queue(all-settle)'
   */
  continueWhenPreviousTx?: 'success' | 'error' | 'finally'

  /** send multi same recentBlockhash tx will only send first one */
  cacheTransaction?: boolean
} & SingleTxCallbacks

export type SingleTxCallbacks = {
  onTxSuccess?: TxSuccessCallback
  onTxError?: TxErrorCallback
  onTxFinally?: TxFinallyCallback
  onTxSentSuccess?: TxSentSuccessCallback
  onTxSentError?: TxSentErrorCallback
  onTxSentFinally?: TxSentFinallyCallback
}

export type MultiTxsOption = {
  /**
   * send next when prev is complete (default)
   * send all at once
   */
  sendMode?:
    | 'queue'
    | 'queue(all-settle)'
    | 'parallel(dangerous-without-order)' /* couldn't promise tx's order */
    | 'parallel(batch-transactions)' /* it will in order */
} & MultiTxCallbacks

export type MultiTxCallbacks = {
  onTxAllSuccess?: AllSuccessCallback
  onTxAnyError?: AnyErrorCallback
}

export type TransactionQueue = (
  | [tx: InnerTransaction | Transaction, singleTxOptions?: TxHandlerOption]
  | InnerTransaction
  | Transaction
)[]

export type TransactionCollector = {
  add(transaction: TransactionQueue | Transaction | InnerTransaction, options?: TxHandlerOption & MultiTxsOption): void
}

// TODO: should also export addTxSuccessListener() and addTxErrorListener() and addTxFinallyListener()
export type TxResponseInfos = {
  allSuccess: boolean
  txids: string[]
  // errorAt?: number // only if `allSuccess` is false
  // txList: (TxSuccessInfo | TxErrorInfo)[]
}

export type TxHandlerOptions = {
  additionalSingleOptionCallback?: SingleTxCallbacks
  additionalMultiOptionCallback?: MultiTxCallbacks
} & MultiTxCallbacks &
  MultiTxsOption

type SignAllTransactionsFunction = <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>

export type SendTransactionPayload = {
  signAllTransactions: SignAllTransactionsFunction
  owner: PublicKeyish
  connection: Connection
  txVersion: TxVersion
  // only if have been shadow open
  signerkeyPair?: TxKeypairDetective
}

export function isTransaction(x: any): x is Transaction {
  return x instanceof Transaction
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
  return isObject(transaction) && 'version' in transaction
}

/**
 * **DUTY:**
 *
 * 1. provide tools for a tx action
 *
 * 2. auto handle txError and txSuccess
 *
 * 3. hanle appSetting ---- isApprovePanelShown
 *
 */
export async function txHandler(
  payload: {
    connection: Connection
    owner: PublicKeyish
    txVersion: TxVersion
    signAllTransactions: SignAllTransactionsFunction
  },
  txFn: TxFn,
  options?: TxHandlerOptions
): Promise<TxResponseInfos> {
  const {
    transactionCollector,
    collected: { innerTransactions, singleTxOptions, multiTxOption }
  } = innerTxCollector(options)
  try {
    assert(payload.connection, 'provided connection not working')
    assert(payload.owner, 'wallet not connected')
    const userLoadedTransactionQueue = await txFn()
    transactionCollector.add(userLoadedTransactionQueue)
    const finalInfos = await dealWithMultiTxOptions({
      transactions: innerTransactions,
      singleOptions: singleTxOptions,
      multiOption: multiTxOption,
      payload
    })

    return finalInfos
  } catch (error) {
    return {
      allSuccess: false,
      txids: []
    }
  }
}

/**
 * duty:
 * 1. signAllTransactions
 * 2. record tx to recentTxHistory
 *
 * so this fn will record txids
 */
async function dealWithMultiTxOptions({
  transactions,
  singleOptions,
  multiOption,
  payload
}: {
  transactions: (Transaction | InnerTransaction)[]
  singleOptions: TxHandlerOption[]
  multiOption: MultiTxsOption
  payload: SendTransactionPayload
}): Promise<TxResponseInfos> {
  return new Promise((resolve, reject) =>
    (async () => {
      const txids = [] as string[]
      const successTxids = [] as typeof txids
      const pushSuccessTxid = (txid: string) => {
        successTxids.push(txid)
        if (successTxids.length === transactions.length) {
          multiOption.onTxAllSuccess?.({ txids })
          resolve({ allSuccess: true, txids })
        }
      }
      const parseMultiOptionsInSingleOptions = produce(singleOptions, (options) => {
        options.forEach((option) => {
          option.onTxSentSuccess = mergeFunction(
            (({ txid }) => {
              txids.push(txid)
            }) as TxSentSuccessCallback,
            option.onTxSentSuccess
          )
          option.onTxError = mergeFunction(
            (() => {
              multiOption.onTxAnyError?.({ txids })
              resolve({ allSuccess: false, txids })
            }) as TxErrorCallback,
            option.onTxError
          )
          option.onTxSuccess = mergeFunction(
            (({ txid }) => {
              pushSuccessTxid(txid)
            }) as TxSuccessCallback,
            option.onTxSuccess
          )
        })
      })

      try {
        const builded = transactions.every(isInnerTransaction)
          ? await buildTransactionsFromSDKInnerTransactions({
              connection: payload.connection,
              wallet: payload.owner,
              txVersion: payload.txVersion,
              transactions
            })
          : (transactions as Transaction[])

        try {
          // eslint-disable-next-line no-console
          console.info(
            'tx transactions: ',
            builded,
            toHumanReadable(builded),
            builded.map((i) =>
              i
                .serialize({
                  requireAllSignatures: false,
                  verifySignatures: false
                })
                .toString('base64')
            )
          )
        } catch {
          console.warn('tx log error')
        }
        const noNeedSignAgain = payload.signerkeyPair?.ownerKeypair
        // const allSignedTransactions = await options.payload.signAllTransactions(options.transactions)
        const allSignedTransactions = await (noNeedSignAgain // if have signer detected, no need signAllTransactions
          ? builded
          : payload.signAllTransactions(builded))

        // pop tx notification
        const { mutatedSingleOptions } = recordTxNotification({
          transactions: allSignedTransactions,
          singleOptions: parseMultiOptionsInSingleOptions,
          multiOption
        })

        const combinedTxFn = composeWithDifferentSendMode({
          transactions: allSignedTransactions,
          sendMode: multiOption.sendMode,
          singleOptions: mutatedSingleOptions,
          payload
        })
        combinedTxFn()
      } catch (err) {
        reject(err)
      }
    })()
  )
}

function recordTxNotification({
  transactions,
  singleOptions,
  multiOption
}: {
  transactions: (Transaction | VersionedTransaction)[]
  singleOptions: TxHandlerOption[]
  multiOption: MultiTxsOption
}): { mutatedSingleOptions: TxHandlerOption[] } {
  // log Tx Notification
  const txInfos = singleOptions.map(({ txHistoryInfo, ...restSingleOptions }, idx) => ({
    transaction: transactions[idx],
    historyInfo: txHistoryInfo,
    ...restSingleOptions
  })) as TxNotificationItemInfo['txInfos']
  const txLoggerController = useNotification.getState().logTxid({ txInfos })
  const mutated1 = produce(singleOptions, (options) => {
    options.forEach((option) => {
      option.onTxSentSuccess = mergeFunction(
        (({ txid, transaction }) => {
          txLoggerController.changeItemInfo?.({ txid, state: 'processing' }, { transaction })
        }) as TxSentSuccessCallback,
        option.onTxSentSuccess
      )
      option.onTxError = mergeFunction(
        (({ txid, transaction, error }) => {
          txLoggerController.changeItemInfo?.({ txid, state: 'error', error }, { transaction })
          const txIndex = transactions.indexOf(transaction)
          if (txIndex < 0) return
          transactions.slice(txIndex + 1).forEach((transaction) => {
            txLoggerController.changeItemInfo?.({ state: 'aborted' }, { transaction })
          })
        }) as TxErrorCallback,
        option.onTxError
      )
      option.onTxSuccess = mergeFunction(
        (({ txid, transaction }) => {
          txLoggerController.changeItemInfo?.({ txid, state: 'success' }, { transaction })
        }) as TxSuccessCallback,
        option.onTxSuccess
      )
    })
  })

  // record tx singleOption

  const mutated2 = produce(mutated1, (options) => {
    options.forEach((option) => {
      const { ...restInfo } = option.txHistoryInfo ?? {}
      option.onTxFinally = mergeFunction(
        (({ txid, type, passedMultiTxid, isMulti }) => {
          useTxHistory.getState().addHistoryItem({
            status: type === 'error' ? 'fail' : type,
            txid,
            time: Date.now(),
            isMulti,
            relativeTxids: passedMultiTxid,
            ...restInfo
          })
        }) as TxFinallyCallback,
        option.onTxFinally
      )
    })
  })

  return { mutatedSingleOptions: mutated2 }
}

function composeWithDifferentSendMode({
  transactions,
  sendMode,
  singleOptions,
  payload
}: {
  transactions: (Transaction | VersionedTransaction)[]
  sendMode: MultiTxsOption['sendMode']
  singleOptions: TxHandlerOption[]
  payload: SendTransactionPayload
}): () => void {
  const wholeTxidInfo: Omit<MultiTxExtraInfo, 'currentIndex'> = {
    isMulti: transactions.length > 1,
    passedMultiTxid: Array.from({ length: transactions.length }),
    multiTransactionLength: transactions.length,
    transactions
  }
  if (sendMode === 'parallel(dangerous-without-order)' || sendMode === 'parallel(batch-transactions)') {
    const parallelled = () => {
      transactions.forEach((tx, idx) =>
        dealWithSingleTxOptions({
          transaction: tx,
          wholeTxidInfo,
          payload,
          isBatched: sendMode === 'parallel(batch-transactions)',
          singleOption: singleOptions[idx]
        })
      )
    }
    return parallelled
  } else {
    const queued = transactions.reduceRight(
      ({ fn, method }, tx, idx) => {
        const singleOption = singleOptions[idx]
        return {
          fn: () =>
            dealWithSingleTxOptions({
              transaction: tx,
              wholeTxidInfo,
              payload,
              singleOption: produce(singleOption, (draft) => {
                if (method === 'finally') {
                  draft.onTxFinally = mergeFunction(fn, draft.onTxFinally)
                } else if (method === 'error') {
                  draft.onTxError = mergeFunction(fn, draft.onTxError)
                } else if (method === 'success') {
                  draft.onTxSuccess = mergeFunction(fn, draft.onTxSuccess)
                }
              })
            }),
          method: singleOption.continueWhenPreviousTx ?? (sendMode === 'queue(all-settle)' ? 'finally' : 'success')
        }
      },
      { fn: () => {}, method: 'success' }
    )
    return queued.fn
  }
}

/**
 * duty:
 * 1. provide txid and txCallback collectors for a tx action
 * 2. record tx to recentTxHistory
 *
 * it will subscribe txid
 *
 */
async function dealWithSingleTxOptions({
  transaction,
  wholeTxidInfo,
  singleOption,
  payload,
  isBatched
}: {
  transaction: Transaction | VersionedTransaction
  wholeTxidInfo: Omit<MultiTxExtraInfo, 'currentIndex'>
  singleOption?: TxHandlerOption
  payload: SendTransactionPayload
  isBatched?: boolean
}) {
  const currentIndex = wholeTxidInfo.transactions.indexOf(transaction)
  const extraTxidInfo: MultiTxExtraInfo = {
    ...wholeTxidInfo,
    currentIndex
  }
  try {
    const txid = await sendTransactionCore({
      transaction,
      payload,
      batchOptions: isBatched ? { allSignedTransactions: wholeTxidInfo.transactions } : undefined,
      cache: Boolean(singleOption?.cacheTransaction)
    })
    assert(txid, 'something went wrong in sending transaction')
    singleOption?.onTxSentSuccess?.({ transaction, txid, ...extraTxidInfo })
    wholeTxidInfo.passedMultiTxid[currentIndex] = txid //! 💩 bad method! it's mutate method!
    subscribeTx({
      txid,
      transaction,
      extraTxidInfo,
      callbacks: {
        onTxSuccess(callbackParams) {
          singleOption?.onTxSuccess?.({ ...callbackParams, ...extraTxidInfo })
        },
        onTxError(callbackParams) {
          console.error('tx error: ', callbackParams.error)
          singleOption?.onTxError?.({ ...callbackParams, ...extraTxidInfo })
        },
        onTxFinally(callbackParams) {
          singleOption?.onTxFinally?.({
            ...callbackParams,
            ...extraTxidInfo
          })
        }
      }
    })
  } catch (err) {
    console.error('fail to send tx: ', err)
    singleOption?.onTxSentError?.({ err, ...extraTxidInfo })
  } finally {
    singleOption?.onTxSentFinally?.()
  }
}
