import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { useWalletAdapter } from '../../stores/wallet/store'
import { getMessageReceiver } from '../webworker/getMessage_receiver'
import { getMessageSender } from '../webworker/getMessage_sender'
import { sdkworker } from '../webworker/loadWorkerFromMainThread'

export function signAllTransactionReceiver() {
  const receiver = getMessageReceiver(sdkworker, 'sign transaction in main thread')
  const sender = getMessageSender(sdkworker, 'sign transaction in main thread')
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
