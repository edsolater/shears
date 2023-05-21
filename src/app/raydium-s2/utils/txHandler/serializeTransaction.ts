import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { isVersionedTransaction } from './txHandler'

const txSerializeCache = new Map<string, Buffer | Uint8Array>()
// show serialize before send tx (by raw connection)

export function serializeTransaction(transaction: Transaction | VersionedTransaction, options?: { cache?: boolean }) {
  const key = isVersionedTransaction(transaction) ? transaction.message.recentBlockhash : transaction.recentBlockhash
  if (key && txSerializeCache.has(key)) {
    return txSerializeCache.get(key)!
  } else {
    const serialized = transaction.serialize()
    if (key && options?.cache) txSerializeCache.set(key, serialized)
    return serialized
  }
}
