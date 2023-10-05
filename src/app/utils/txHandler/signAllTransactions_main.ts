import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { useWalletAdapter } from '../../stores/wallet/store'
import { getMessageReceiver } from '../webworker/genMessageReceiver'
import { getMessageSender } from '../webworker/genMessageSender'
import { sdkworker } from '../webworker/loadWorkerFromMainThread'
import { MayPromise } from '@edsolater/fnkit'

export function signAllTransactionReceiver(towrardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>) {
  const receiver = getMessageReceiver(towrardsTarget, 'sign transaction in main thread')
  const sender = getMessageSender(towrardsTarget, 'sign transaction in main thread')
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
