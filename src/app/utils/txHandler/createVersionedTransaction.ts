import { isObject } from "@edsolater/fnkit"
import { InnerTransaction, PublicKeyish, TxVersion as _TxVersion, buildTransaction } from "@raydium-io/raydium-sdk"
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js"
import { toPub } from "../dataStructures/Publickey"
import { UITxVersion } from "./txHandler"

export async function buildTransactionsFromSDKInnerTransactions({
  connection,
  owner,
  txVersion,
  transactions,
}: {
  connection: Connection
  owner: PublicKeyish
  txVersion: UITxVersion
  transactions: InnerTransaction[]
}): Promise<(Transaction | VersionedTransaction)[]> {
  const spawnedTransactions = await buildTransaction({
    connection,
    payer: toPub(owner),
    innerTransactions: transactions,
    makeTxVersion: getSDKTxVersion(txVersion),
  })
  return spawnedTransactions
}

/** from customized value to SDK specific value */
export function getSDKTxVersion(input: UITxVersion): _TxVersion {
  return input === "V0" ? _TxVersion.V0 : _TxVersion.LEGACY
}

export function isInnerTransaction(x: any): x is InnerTransaction {
  return isObject(x) && "instructions" in x && "instructionTypes" in x
}
