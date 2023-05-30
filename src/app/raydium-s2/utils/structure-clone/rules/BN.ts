import { getType } from '@edsolater/fnkit'
import BN from 'bn.js'
import { toBigint, toDecodedBN } from '../../dataStructures/BN'
import { addTransportRule } from '../addTransportRule'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof BN || (getType(data) as string) === 'BN',
    encodeFn: (rawData: BN) => toBigint(toDecodedBN(rawData)),
    // name: 'BN',
    // decodeFn: (encodedData: EncodedObject<string>): BN => wrapToLazyObject(() => new BN(encodedData._info))
  })
