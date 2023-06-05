import { getType, toBigint } from '@edsolater/fnkit'
import BN from 'bn.js'
import { TransmitRule } from './type'
import { toDecodedBN } from '../dataStructures/BN'
import { PublicKey } from '@solana/web3.js'
import toPubString from '../dataStructures/Publickey'

export const BNRule: TransmitRule = {
  canEncode: (data) => data instanceof BN || (getType(data) as string) === 'BN',
  encodeFn: (rawData: BN) => toBigint(toDecodedBN(rawData)),
}

export const PublickeyRule: TransmitRule = {
  canEncode: (data) => data instanceof PublicKey || (getType(data) as string) === 'PublicKey',
  encodeFn: (rawData: PublicKey) => toPubString(rawData),
}

export const rules = [BNRule, PublickeyRule]