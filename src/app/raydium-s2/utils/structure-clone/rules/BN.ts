import BN from 'bn.js'
import { wrapToLazyObject } from '../../../../../packages/fnkit/wrapToLazyObject'
import { addTransportRule } from '../addTransportRule'
import { createEncodedObject } from '../createEncodedObject'
import { EncodedObject } from '../type'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof BN,
    encodeFn: (rawData: typeof BN) => createEncodedObject('BN', String(rawData)),

    name: 'BN',
    decodeFn: (encodedData: EncodedObject<string>): BN => wrapToLazyObject(() => new BN(encodedData._info))
  })
