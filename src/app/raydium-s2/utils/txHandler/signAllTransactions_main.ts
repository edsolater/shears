import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { useWalletAdapter } from '../../stores/wallet/store'
import { getMessageReceiver } from '../webworker/getMessageReceiver'
import { getMessageSender } from '../webworker/getMessageSender'
import { sdkworker } from '../webworker/mainThread_receiver'

export function signAllTransactionReceiver() {
  const receiver = getMessageReceiver(sdkworker, 'sign transaction in main thread')
  const sender = getMessageSender(sdkworker, 'sign transaction in main thread')
  receiver.subscribe((transactions) => {
    console.log('[main thread] receive transactions: ', transactions)
    const signedTransactions = signTrancations(transactions)
    console.log('signedTransactions: ', signedTransactions)
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
