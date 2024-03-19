import { InnerTransactions } from "./txHandler"
import type { Connection } from "@solana/web3.js"
import { handleTx } from "./txHandler"

/** use {@link handleTxFromShortcut} to handleTx easier */
export type TransactionShortcut = InnerTransactions & { connection: Connection; owner: string }

/**
 * handle {@link TransactionShortcut}
 */
export function handleTxFromShortcut(txShortcut: TransactionShortcut) {
  return handleTx({ connection: txShortcut.connection, owner: txShortcut.owner }, () => txShortcut)
} /** use {@link handleTxFromShortcut} to handleTx easier */

export function handleMultiTxShortcuts(txShortcuts: TransactionShortcut[]) {
  if (!txShortcuts.length) return
  return handleTx({ connection: txShortcuts[0].connection, owner: txShortcuts[0].owner }, () => txShortcuts.flat())
}
