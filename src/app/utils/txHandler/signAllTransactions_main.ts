import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { VersionedTransaction } from "@solana/web3.js"
import { shuck_walletAdapter } from "../../stores/data/store"
import { getMessagePort } from "../webworker/loadWorker_main"

export function createSignTransactionPortInMainThread() {
  const { sender, receiver } = getMessagePort<any[]>("transform transaction")
  receiver.subscribe((transactions) => {
    const decodedTransactions = transactions.map((transaction) => VersionedTransaction.deserialize(transaction))
    console.log("[main] receive transactions from worker", transactions, decodedTransactions)
    const signedTransactions = signTrancations(decodedTransactions)
    signedTransactions?.then((signedTrancation) => {
      sender.post(signedTrancation.map((tx) => tx.serialize()))
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
