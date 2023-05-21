import { isObject } from '@edsolater/fnkit'
import { buildTransaction, InnerTransaction, TxVersion as _TxVersion, PublicKeyish } from '@raydium-io/raydium-sdk'
import { Connection, PublicKey, Signer, Transaction, VersionedTransaction } from '@solana/web3.js'
import { TxVersion } from './txHandler'
import { toPub } from '../dataStructures/Publickey'

export async function buildTransactionsFromSDKInnerTransactions({
  connection,
  owner,
  txVersion,
  transactions
}: {
  connection: Connection
  owner: PublicKeyish
  txVersion: TxVersion
  transactions: InnerTransaction[]
}): Promise<(Transaction | VersionedTransaction)[]> {
  const spawnedTransactions = await buildTransaction({
    connection,
    payer: toPub(owner),
    innerTransactions: transactions,
    txType: getSDKTxVersion(txVersion)
  })
  return spawnedTransactions
}

function getSDKTxVersion(input: TxVersion): _TxVersion {
  return input === 'V0' ? _TxVersion.V0 : _TxVersion.LEGACY
}

export function isInnerTransaction(x: any): x is InnerTransaction {
  return isObject(x) && 'instructions' in x && 'instructionTypes' in x
}
