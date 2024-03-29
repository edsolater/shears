import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { VersionedTransaction } from "@solana/web3.js"
import { shuck_walletAdapter } from "../../stores/data/store"
import { getMessagePort } from "../webworker/loadWorker_main"
import type {
  SignTransactionErrorInfo,
  SignTransactionSuccessInfo,
  UnsignedTransactionInfo,
} from "./signAllTransactions_worker"

export function createSignTransactionPortInMainThread() {
  const { sender, receiver } = getMessagePort<
    UnsignedTransactionInfo,
    SignTransactionSuccessInfo | SignTransactionErrorInfo
  >("transform transaction")
  receiver.subscribe(({ txs: transactions, id }) => {
    const decodedTransactions = transactions.map((transaction) => VersionedTransaction.deserialize(transaction))
    console.log("[main] receive transactions from worker", transactions, decodedTransactions)
    const signedTransactions = signTrancations(decodedTransactions)
    signedTransactions
      ?.then((signedTrancation) => {
        sender.post({ id, signedTxs: signedTrancation.map((tx) => tx.serialize()) })
      })
      .catch((error) => {
        console.log("[main] sign failed", error)
        sender.post({ id, errorReason: "main thread sign failed" })
      })
  })
}

function signTrancations(transactions: VersionedTransaction[]) {
  const adapter = shuck_walletAdapter()
  const signCore = adapter?.signAllTransactions.bind(adapter) as
    | PhantomWalletAdapter["signAllTransactions"]
    | SolflareWalletAdapter["signAllTransactions"]
    | LedgerWalletAdapter["signAllTransactions"]
    // | TrustWalletAdapter['signAllTransactions'] // trust is not support versioned transaction yet
    | undefined
  return signCore?.(transactions)
}
