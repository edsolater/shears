import { getType, hasProperty, toBigint } from '@edsolater/fnkit'
import BN from 'bn.js'
import { TransmitRule } from './type'
import { toDecodedBN } from '../dataStructures/BN'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import toPubString from '../dataStructures/Publickey'

const BNRule: TransmitRule = {
  canEncode: (data) => data instanceof BN || (getType(data) as string) === 'BN',
  encodeFn: (rawData: BN) => toBigint(toDecodedBN(rawData)),
}

const PublickeyRule: TransmitRule = {
  canEncode: (data) => data instanceof PublicKey || (getType(data) as string) === 'PublicKey',
  encodeFn: (rawData: PublicKey) => toPubString(rawData),
}

const VersionedTransactionRule: TransmitRule = {
  canEncode: (data) => data instanceof VersionedTransaction || (getType(data) as string) === 'VersionedTransaction',
  encodeFn: (rawData: VersionedTransaction) => {
    console.log('rawData: ', rawData)
    function encodeTransaction(transaction: VersionedTransaction) {
      return transaction.serialize() // TEMP: Dev
    }
    return { _type: 'encoded VersionedTransaction', _info: encodeTransaction(rawData) }
  },
  canDecode: (data) => hasProperty(data, ['_type', '_info']) && data._type === 'encoded VersionedTransaction',
  decodeFn: (rawData: { _type: string; _info: Buffer }) => VersionedTransaction.from(Buffer.from(rawData._info)),
}
export const rules = [VersionedTransactionRule, BNRule, PublickeyRule]
