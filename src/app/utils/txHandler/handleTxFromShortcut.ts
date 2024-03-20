import { InnerTransactions, type MultiTxsOption } from "./txHandler"
import type { Connection } from "@solana/web3.js"
import { handleTx } from "./txHandler"

/** use {@link handleTxShortcut} to handleTx easier */
export type TransactionModule = InnerTransactions & { connection: Connection; owner: string }

/**
 * handle {@link TransactionModule}
 */
export function handleTxShortcut(txShortcut: TransactionModule) {
  return handleTx({ connection: txShortcut.connection, owner: txShortcut.owner }, () => txShortcut)
} /** use {@link handleTxFromShortcut} to handleTx easier */

export function handleMultiTxShortcuts(txShortcuts: TransactionModule[], options?: MultiTxsOption) {
  if (!txShortcuts.length) return
  return handleTx(
    { connection: txShortcuts[0].connection, owner: txShortcuts[0].owner },
    () => txShortcuts.flat(),
    options,
  )
}
