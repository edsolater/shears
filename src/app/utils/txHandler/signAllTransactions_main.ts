import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { useWalletAdapter } from '../../stores/wallet/store'
import { getMessagePort } from '../webworker/loadWorker_main'
import { workerCommands } from '../webworker/type'

export function createSignTransactionPortInMainThread() {
  const { sender, receiver } = getMessagePort(workerCommands['sign transaction in main thread'])
  receiver.subscribe((transactions) => {
    const signedTransactions = signTrancations(transactions)
    signedTransactions?.then((signedTrancation) => {
      sender.query(signedTrancation)
    })
  })
}

function signTrancations(transactions: (Transaction | VersionedTransaction)[]) {
  const core = useWalletAdapter()
  return (
    core()?.signAllTransactions as
      | PhantomWalletAdapter['signAllTransactions']
      | SolflareWalletAdapter['signAllTransactions']
      | LedgerWalletAdapter['signAllTransactions']
      // | TrustWalletAdapter['signAllTransactions'] // trust is not support versioned transaction yet
      | undefined
  )?.(transactions)
}
