import { EventCenter, MayPromise, assert, createEventCenter, emptyFn, isObject, mergeFunction } from '@edsolater/fnkit'
import { InnerTransaction, PublicKeyish } from '@raydium-io/raydium-sdk'
import {
  Connection,
  Context,
  SignatureResult,
  Transaction,
  TransactionError,
  VersionedTransaction,
} from '@solana/web3.js'
import { produce } from 'immer'
import { innerTxCollector } from './innerTxCollector'
import { sendTransactionCore } from './sendTransactionCore'
import { signAllTransactions } from './signAllTransactions'
import { subscribeTx } from './subscribeTx'

export type TxVersion = 'V0' | 'LEGACY'
//#region ------------------- basic info -------------------
export interface TxInfo {
  txid: string
  transaction: Transaction | VersionedTransaction
}

export interface MultiTxExtraInfo {
  isMulti: boolean
  /** only used in multi mode */
  transactions: (Transaction | VersionedTransaction)[]
  /** only used in multi mode */
  passedMultiTxids: string[]
  /** only used in multi mode */
  currentIndex: number // in multi transactions
  /** only used in multi mode */
  multiTransactionLength: number // in transactions
}
//#endregion

//#region ------------------- lifeTime info -------------------
export interface TxSuccessInfo extends TxInfo, MultiTxExtraInfo {
  signatureResult: SignatureResult
  context: Context
}
export interface TxSentSuccessInfo extends TxInfo, MultiTxExtraInfo {}
export interface TxFinalBatchSuccessInfo {
  allSuccess: true
  txids: string[]
}
export interface TxErrorInfo extends TxInfo, MultiTxExtraInfo {
  signatureResult: SignatureResult
  context: Context
  error?: TransactionError
}
export interface TxSentErrorInfo extends Omit<TxInfo, 'txid'>, Omit<MultiTxExtraInfo, 'passedMultiTxids'> {
  err: unknown
}
export type TxFinalInfo =
  | ({
      type: 'success'
    } & TxSuccessInfo)
  | ({
      type: 'error'
    } & TxErrorInfo)
export interface TxFinalBatchErrorInfo {
  allSuccess: false
  errorAt: number
  txids: string[] // before absort
}

//#endregion

export type TxFn = (utils: {
  eventCenter: TxHandlerEventCenter
}) => MayPromise<TransactionQueue | Transaction | InnerTransaction>

//#region ------------------- callbacks -------------------
type TxSuccessCallback = (info: TxSuccessInfo) => void
type TxErrorCallback = (info: TxErrorInfo) => void
type TxFinallyCallback = (info: TxFinalInfo) => void

type TxSentSuccessCallback = (info: TxSentSuccessInfo) => void
type TxSentErrorCallback = (info: TxSentErrorInfo) => void
type TxSentFinallyCallback = () => void

type TxBeforeSendErrorCallback = (err: unknown) => void

type AllSuccessCallback = (info: { txids: string[] }) => void
type AnyErrorCallback = (info: { txids: string[] /* error at last txids */ }) => void

//#endregion

export interface TxHandlerOption extends SingleTxCallbacks {
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
}

export interface SingleTxCallbacks {
  onTxSuccess?: TxSuccessCallback
  onTxError?: TxErrorCallback
  onTxFinally?: TxFinallyCallback
  onTxSentSuccess?: TxSentSuccessCallback
  onTxSentError?: TxSentErrorCallback
  onTxSentFinally?: TxSentFinallyCallback
}

export interface MultiTxsOption extends MultiTxCallbacks {
  /**
   * send next when prev is complete (default)
   * send all at once
   */
  sendMode?:
    | 'queue'
    | 'queue(all-settle)'
    | 'parallel(dangerous-without-order)' /* couldn't promise tx's order */
    | 'parallel(batch-transactions)' /* it will in order */
}

export interface MultiTxCallbacks {
  onTxAllSuccess?: AllSuccessCallback
  onTxAnyError?: AnyErrorCallback
}

export type TransactionQueue = (
  | [tx: InnerTransaction | Transaction, singleTxOptions?: TxHandlerOption]
  | InnerTransaction
  | Transaction
)[]

export interface TransactionCollector {
  add(transaction: TransactionQueue | Transaction | InnerTransaction, options?: TxHandlerOption & MultiTxsOption): void
}

// TODO: should also export addTxSuccessListener() and addTxErrorListener() and addTxFinallyListener()
export interface TxResponseInfos {
  allSuccess: boolean
  txids: string[]
  error: unknown
  // errorAt?: number // only if `allSuccess` is false
  // txList: (TxSuccessInfo | TxErrorInfo)[]
}

export interface TxHandlerOptions extends MultiTxCallbacks, MultiTxsOption {
  additionalSingleOptionCallback?: SingleTxCallbacks
  additionalMultiOptionCallback?: MultiTxCallbacks
}

type SignAllTransactionsFunction = <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>

export interface TxHandlerPayload {
  connection: Connection
  owner: PublicKeyish
  txVersion: TxVersion
  signAllTransactions: SignAllTransactionsFunction
}

export interface TxHandlerEventCenter
  extends EventCenter<{
    txSuccess: TxSuccessCallback
    txError: TxErrorCallback
    // readonly txFinally: TxFinallyCallback // can on but can't emit
    sendSuccess: TxSentSuccessCallback
    sendError: TxSentErrorCallback
    beforeSendError: TxBeforeSendErrorCallback
    // readonly sendFinally: TxSentFinallyCallback // can on but can't emit
    txAllSuccess: AllSuccessCallback
    txAnyError: AnyErrorCallback
  }> {}

export function isTransaction(x: any): x is Transaction {
  return x instanceof Transaction
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction {
  return isObject(transaction) && 'version' in transaction
}

/**
 *  function for sending transaction
 */
export function txHandler(payload: TxHandlerPayload, txFn: TxFn, options?: TxHandlerOptions): TxHandlerEventCenter {
  const {
    transactionCollector,
    collected: { collectedTransactions, singleTxOptions, multiTxOption },
  } = innerTxCollector(options)

  const eventCenter = createEventCenter() as unknown as TxHandlerEventCenter

  ;(async () => {
    assert(payload.connection, 'provided connection not working')
    assert(payload.owner, 'wallet not connected')
    const userLoadedTransactionQueue = await txFn({ eventCenter })
    transactionCollector.add(userLoadedTransactionQueue)

    const parsedSignleTxOptions = makeMultiOptionIntoSignalOptions({
      transactions: collectedTransactions,
      singleOptions: singleTxOptions,
      multiOption: multiTxOption,
    })

    eventCenter.on('txSuccess', (info: TxSuccessInfo) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxSuccess?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxFinally?.({ ...info, type: 'success' })
    })
    eventCenter.on('txError', (info: TxErrorInfo) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxError?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxFinally?.({ ...info, type: 'error' })
    })
    eventCenter.on('sendSuccess', (info) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxSentSuccess?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxSentFinally?.()
    })
    eventCenter.on('sendError', (info) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxSentError?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxSentFinally?.()
    })
    eventCenter.on('txAllSuccess', (info) => {
      multiTxOption?.onTxAllSuccess?.(info)
    })
    eventCenter.on('txAnyError', (info) => {
      multiTxOption?.onTxAnyError?.(info)
    })
    // FIXME: where is onTxAllSuccess?

    const allSignedTransactions = await signAllTransactions({
      transactions: collectedTransactions,
      payload,
    })

    // load send tx function
    const senderFn = composeTransactionSenderWithDifferentSendMode({
      transactions: allSignedTransactions,
      sendMode: multiTxOption.sendMode,
      singleOptions: parsedSignleTxOptions,
      payload,
      callbacks: {
        onSentError: (info) => {
          eventCenter.emit('sendError', [info])
        },
        onSentSuccess(info) {
          eventCenter.emit('sendSuccess', [info])
        },
        onTxError(info) {
          eventCenter.emit('txError', [info])
        },
        onTxSuccess(info) {
          eventCenter.emit('txSuccess', [info])
        },
      },
    })

    // send tx
    senderFn()
  })().catch((error) => {
    eventCenter.emit('beforeSendError', [{ err: error }])
  })
  return eventCenter
}

/**
 * duty:
 * 1. signAllTransactions
 * 2. record tx to recentTxHistory
 *
 * so this fn will record txids
 */
function makeMultiOptionIntoSignalOptions({
  transactions,
  singleOptions,
  multiOption,
}: {
  transactions: (Transaction | InnerTransaction)[]
  singleOptions: TxHandlerOption[]
  multiOption: MultiTxsOption
}): TxHandlerOption[] {
  const txids = [] as string[]
  const successTxids = [] as typeof txids
  const pushSuccessTxid = (txid: string) => {
    successTxids.push(txid)
    if (successTxids.length === transactions.length) {
      multiOption.onTxAllSuccess?.({ txids })
    }
  }

  const parseMultiOptionsIntoSingleOptions = produce({ ...singleOptions }, (options) => {
    options.forEach((option) => {
      option.onTxSentSuccess = mergeFunction(
        (({ txid }) => {
          txids.push(txid)
        }) as TxSentSuccessCallback,
        option.onTxSentSuccess ?? (() => {}),
      )
      option.onTxError = mergeFunction(
        (() => {
          multiOption.onTxAnyError?.({ txids })
        }) as TxErrorCallback,
        option.onTxError ?? (() => {}),
      )
      option.onTxSuccess = mergeFunction(
        (({ txid }) => {
          pushSuccessTxid(txid)
        }) as TxSuccessCallback,
        option.onTxSuccess ?? (() => {}),
      )
    })
  })
  return parseMultiOptionsIntoSingleOptions
}

function composeTransactionSenderWithDifferentSendMode({
  transactions,
  sendMode,
  singleOptions,
  payload,
  callbacks,
}: {
  transactions: (Transaction | VersionedTransaction)[]
  sendMode: MultiTxsOption['sendMode']
  singleOptions: TxHandlerOption[]
  payload: TxHandlerPayload
  callbacks: {
    onTxSuccess?: TxSuccessCallback
    onTxError?: TxErrorCallback
    onSentSuccess?: TxSentSuccessCallback
    onSentError?: TxSentErrorCallback
  }
}): () => void {
  const wholeTxidInfo: Omit<MultiTxExtraInfo, 'currentIndex'> = {
    isMulti: transactions.length > 1,
    passedMultiTxids: Array.from({ length: transactions.length }),
    multiTransactionLength: transactions.length,
    transactions,
  }
  if (sendMode === 'parallel(dangerous-without-order)' || sendMode === 'parallel(batch-transactions)') {
    const parallelled = () => {
      transactions.forEach((tx, idx) =>
        sendOneTransactionWithOptions({
          transaction: tx,
          wholeTxidInfo,
          payload,
          isBatched: sendMode === 'parallel(batch-transactions)',
          singleOption: singleOptions[idx],
          callbacks,
        }),
      )
    }
    return parallelled
  } else {
    const queued = transactions.reduceRight(
      ({ fn, method }, tx, idx) => {
        const singleOption = singleOptions[idx]
        return {
          fn: () =>
            sendOneTransactionWithOptions({
              transaction: tx,
              wholeTxidInfo,
              payload,
              singleOption,
              callbacks: {
                ...callbacks,
                onTxSuccess: mergeFunction(fn, callbacks?.onTxSuccess ?? emptyFn),
                onTxError: mergeFunction(fn, callbacks?.onTxError ?? emptyFn),
              },
            }),
          method: singleOption.continueWhenPreviousTx ?? (sendMode === 'queue(all-settle)' ? 'finally' : 'success'),
        }
      },
      { fn: () => {}, method: 'success' },
    )
    return queued.fn
  }
}

/**
 * it will subscribe txid
 */
async function sendOneTransactionWithOptions({
  transaction,
  wholeTxidInfo,
  singleOption,
  callbacks,
  payload,
  isBatched,
}: {
  transaction: Transaction | VersionedTransaction
  wholeTxidInfo: Omit<MultiTxExtraInfo, 'currentIndex'>
  singleOption?: TxHandlerOption
  callbacks?: {
    onTxSuccess?: TxSuccessCallback
    onTxError?: TxErrorCallback
    onSentSuccess?: TxSentSuccessCallback
    onSentError?: TxSentErrorCallback
  }
  payload: TxHandlerPayload
  isBatched?: boolean
}) {
  const currentIndex = wholeTxidInfo.transactions.indexOf(transaction)
  const extraTxidInfo: MultiTxExtraInfo = {
    ...wholeTxidInfo,
    currentIndex,
  }
  try {
    const txid = await sendTransactionCore({
      transaction,
      payload,
      batchOptions: isBatched ? { allSignedTransactions: wholeTxidInfo.transactions } : undefined,
      cache: Boolean(singleOption?.cacheTransaction),
    })
    assert(txid, 'something went wrong in sending transaction, getted txid empty')
    callbacks?.onSentSuccess?.({ transaction, txid, ...extraTxidInfo })

    wholeTxidInfo.passedMultiTxids[currentIndex] = txid //! 💩 bad method! it's mutate method!
    const txEventCenter = subscribeTx({
      txid,
      transaction,
      extraTxidInfo,
      connection: payload.connection,
    })

    // re-emit tx event
    txEventCenter.on('txSuccess', (info) => {
      callbacks?.onTxSuccess?.({ ...info, ...extraTxidInfo })
    })
    txEventCenter.on('txError', (info) => {
      callbacks?.onTxError?.({ ...info, ...extraTxidInfo })
    })
  } catch (err) {
    callbacks?.onSentError?.({ err, transaction, ...extraTxidInfo })
  }
}
