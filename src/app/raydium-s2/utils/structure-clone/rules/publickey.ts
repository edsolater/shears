import { PublicKey } from '@solana/web3.js'
import { wrapToLazyObject } from '../../../../../packages/fnkit/wrapToLazyObject'
import toPubString, { toPub } from '../../common/pub'
import { addTransportRule } from '../addTransportRule'
import { createEncodedObject } from '../createEncodedObject'
import { EncodedObject } from '../type'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof PublicKey,
    encodeFn: (rawData: PublicKey) => createEncodedObject('PublicKey', toPubString(rawData)),

    name: 'PublicKey',
    decodeFn: (encodedData: EncodedObject<string>): PublicKey => wrapToLazyObject(() => toPub(encodedData._info))
  })
